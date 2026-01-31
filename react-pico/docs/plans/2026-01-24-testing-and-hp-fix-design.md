# Testing and HP Feature Fix Design

**Date:** 2026-01-24
**Status:** Design Complete

## Overview

Two-phase approach to add comprehensive testing and fix the HP adjustment feature using Test-Driven Development.

**Phase 1:** Create comprehensive test suite for all existing functionality
**Phase 2:** Use TDD to fix broken HP adjustment and improve UX with Heal/Dmg buttons

## Current Issues

1. **No Tests** - Project has no unit or integration tests
2. **HP UI Bug** - Clicking HP stat and pressing Apply doesn't update the UI
3. **HP UX** - Current delta input (+/-) is confusing; users want separate Heal/Dmg actions

## Architecture Decisions

### Testing Framework
- **Standard library only** - Use `testing` package and `httptest` (no external dependencies)
- **In-memory SQLite** - Each test gets fresh `:memory:` database for isolation and speed
- **Tests next to source** - Follow Go convention: `main_test.go`, `db_test.go`, `helpers_test.go`

### Test Organization
```
main.go
main_test.go          # HTTP handler tests, routing tests, integration tests
db.go
db_test.go            # Database CRUD operations, bounds testing
models.go
models_test.go        # Model logic tests (if needed)
helpers_test.go       # Shared test utilities
```

### Test Utilities (helpers_test.go)
```go
func setupTestDB(t *testing.T) *sql.DB
    // Creates in-memory SQLite DB with schema
    // Returns configured DB connection

func createTestMinion(t *testing.T, db *sql.DB, m *Minion) int64
    // Inserts test minion, returns ID

func makeRequest(t *testing.T, method, path string, body io.Reader) *httptest.ResponseRecorder
    // Makes HTTP request, returns recorder for assertions

func parseTemplate(t *testing.T, name string) *template.Template
    // Helper for template testing
```

## Phase 1: Comprehensive Test Suite

### Database Layer Tests (db_test.go)

**Test Coverage:**
- `TestInitDB` - Verify schema creation with correct columns and types
- `TestCreateMinion` - Insert minion, verify ID assignment and field persistence
- `TestGetMinion` - Retrieve by ID, verify all fields match
- `TestGetMinionNotFound` - Test error handling for invalid ID
- `TestListActiveMinions` - Verify filtering (active=1) and ordering (by ID)
- `TestUpdateMinion` - Modify fields, verify persistence across all fields
- `TestDeleteMinion` - Soft delete (sets active=0), verify filtered from list
- `TestAdjustHP` - Test HP adjustment with bounds checking
  - Table-driven: test positive/negative deltas, upper bound (max_hp), lower bound (0)

**Example Test Structure:**
```go
func TestAdjustHP(t *testing.T) {
    tests := []struct {
        name      string
        startHP   int
        maxHP     int
        delta     int
        expectedHP int
    }{
        {"damage within bounds", 10, 15, -5, 5},
        {"heal within bounds", 10, 15, 3, 13},
        {"heal exceeds max", 10, 15, 100, 15},
        {"damage below zero", 5, 15, -50, 0},
    }
    // Run subtests...
}
```

### HTTP Handler Tests (main_test.go)

**Handler Tests:**
- `TestHandleIndex` - GET /, verify 200 status and template renders with minion list
- `TestHandleCreate` - POST /minions, verify 200, minion created, returns minion-row fragment
- `TestHandleEditForm` - GET /minions/{id}/edit, verify returns minion-edit template
- `TestHandleUpdate` - PUT /minions/{id}, verify updates and returns minion-row
- `TestHandleDelete` - DELETE /minions/{id}, verify 200 and soft delete
- `TestHandleView` - GET /minions/{id}/view, verify returns minion-row template
- `TestHandle404s` - Test all handlers with invalid IDs return 404

**Routing Tests:**
- `TestRouting` - Verify correct handlers registered for each route

**Template Tests:**
- `TestTemplateRendering` - Verify all templates parse without errors
- `TestTemplateFuncMap` - Verify custom functions (div, le) work correctly

**Integration Tests:**
- `TestFullCRUDWorkflow` - Create → Read → Update → Delete flow
- `TestInlineEditWorkflow` - Index → Edit → Update → View flow

### Success Criteria for Phase 1
- All existing functionality has test coverage
- Tests run with `go test ./...`
- All tests pass (green)
- Tests are isolated (order-independent)
- No external dependencies required

## Phase 2: TDD HP Feature Fix & Improvement

### New HP Adjustment Design

**Current (Broken):**
```
Click HP → [input: +/-] [Apply] [×]
```

**New (Fixed):**
```
Click HP → [input: 5] [Heal] [Dmg] [×]
```

**Changes:**
- Input field shows amount (not delta with +/-)
- Two action buttons: Heal (adds to HP), Dmg (subtracts from HP)
- Horizontal layout: `[input] [Heal] [Dmg] [×]`

### TDD Implementation Cycles

**Iteration 1: Fix Current Backend**
- **RED:** Write test for `handleHPAdjust` to verify it returns correct template and HTMX headers
- **GREEN:** Debug HTMX swap issue, fix handler to return proper response
- **REFACTOR:** Clean up handler code

**Iteration 2: Add Heal Endpoint**
- **RED:** Write test `TestHandleHeal` - POST /minions/{id}/hp/heal with amount param
- **GREEN:** Create route `POST /minions/{id}/hp/heal` and `handleHeal` handler
  - Parse amount from form
  - Call `adjustHP(id, +amount)`
  - Return minion-row template
- **REFACTOR:** Extract common logic if Heal/Dmg are similar

**Iteration 3: Add Dmg Endpoint**
- **RED:** Write test `TestHandleDmg` - POST /minions/{id}/hp/dmg with amount param
- **GREEN:** Create route `POST /minions/{id}/hp/dmg` and `handleDmg` handler
  - Parse amount from form
  - Call `adjustHP(id, -amount)`
  - Return minion-row template
- **REFACTOR:** Consider if handlers can share implementation

**Iteration 4: Update Template**
- **RED:** Write test to verify hp-adjust.html contains Heal/Dmg buttons with correct HTMX attributes
- **GREEN:** Update `templates/hp-adjust.html`:
  ```html
  {{define "hp-adjust"}}
  <div class="stat{{if le .HP (div .MaxHP 2)}} hp-low{{end}}" id="hp-stat-{{.ID}}">
      <strong>HP</strong>
      <form style="display:inline-flex; gap:0.25rem; align-items:center;">
          <input name="amount" type="number" placeholder="Amount" min="1" autofocus required
                 style="width:4rem; padding:0.25rem 0.5rem; margin:0;">
          <button type="button"
                  hx-post="/minions/{{.ID}}/hp/heal"
                  hx-include="[name='amount']"
                  hx-target="#minion-{{.ID}}"
                  hx-swap="outerHTML"
                  style="padding:0.25rem 0.5rem; font-size:0.75rem; margin:0;">
              Heal
          </button>
          <button type="button"
                  hx-post="/minions/{{.ID}}/hp/dmg"
                  hx-include="[name='amount']"
                  hx-target="#minion-{{.ID}}"
                  hx-swap="outerHTML"
                  style="padding:0.25rem 0.5rem; font-size:0.75rem; margin:0;">
              Dmg
          </button>
          <button type="button" class="outline secondary"
                  hx-get="/minions/{{.ID}}/hp/cancel"
                  hx-target="#hp-stat-{{.ID}}"
                  hx-swap="outerHTML"
                  style="padding:0.25rem 0.5rem; font-size:0.75rem; margin:0;">
              ✕
          </button>
      </form>
  </div>
  {{end}}
  ```
- **REFACTOR:** Ensure consistent styling

**Iteration 5: End-to-End Integration Test**
- **RED:** Write integration test:
  1. Create minion with HP=10, MaxHP=15
  2. GET /minions/{id}/hp/adjust (verify form appears)
  3. POST /minions/{id}/hp/heal with amount=3 (verify HP becomes 13)
  4. POST /minions/{id}/hp/dmg with amount=5 (verify HP becomes 8)
  5. Verify bounds: heal beyond max, dmg below 0
- **GREEN:** Wire up all HTMX attributes correctly, ensure UI updates
- **REFACTOR:** Clean up any duplicate code, ensure error handling

### Routes to Add
```go
mux.HandleFunc("POST /minions/{id}/hp/heal", handleHeal)
mux.HandleFunc("POST /minions/{id}/hp/dmg", handleDmg)
```

### Expected Behavior
1. Click HP stat → Form appears with amount input and Heal/Dmg buttons
2. Enter amount (e.g., "5")
3. Click Heal → HP increases by 5 (respects max_hp cap)
4. Click Dmg → HP decreases by 5 (respects 0 floor)
5. HTMX swaps entire minion-row with updated HP value
6. Click × → Cancels back to normal HP display

### Success Criteria for Phase 2
- All TDD iterations pass (tests green)
- UI updates correctly after Heal/Dmg clicks
- HP bounds enforced (0 to max_hp)
- Template uses new button layout
- No regression in existing functionality (Phase 1 tests still pass)

## Implementation Notes

### HTMX Debugging
If UI still doesn't update after fix:
- Check browser network tab for HTMX requests
- Verify response contains `id="minion-{id}"` for swap target
- Ensure `hx-swap="outerHTML"` is correct
- Check HTMX devtools extension for swap events

### Database Function Reuse
The existing `adjustHP(id int64, delta int)` function can be reused:
- `handleHeal`: calls `adjustHP(id, +amount)`
- `handleDmg`: calls `adjustHP(id, -amount)`

No database changes needed.

### Template Considerations
- Use `hx-include="[name='amount']"` to send input value with button clicks
- Buttons use `type="button"` to prevent form submission
- HTMX attributes on buttons, not form
- Consider input validation (min="1" to prevent negative amounts)

## Testing Workflow

**Running Tests:**
```bash
# Run all tests
go test ./...

# Run with verbose output
go test -v ./...

# Run specific test file
go test -v main_test.go helpers_test.go

# Run specific test
go test -v -run TestAdjustHP
```

**TDD Workflow:**
1. Write failing test (RED)
2. Run test, verify it fails
3. Write minimal code to pass (GREEN)
4. Run test, verify it passes
5. Refactor if needed (REFACTOR)
6. Run test again, verify still passes
7. Commit

## Timeline Estimate

**Phase 1:** ~30-40 test cases
- Database tests: 8 tests
- Handler tests: 8-10 tests
- Integration tests: 2-3 tests
- Template tests: 3-4 tests

**Phase 2:** 5 TDD iterations
- Each iteration: write test → implement → refactor

**Total:** Comprehensive test coverage + fixed HP feature with improved UX

## Risk Assessment

**Low Risk:**
- Using standard library (no new dependencies)
- In-memory DB is fast and reliable
- Existing functionality won't break (Phase 1 tests protect it)

**Medium Risk:**
- HTMX debugging if UI still doesn't update (mitigated by integration tests)
- Template changes might affect styling (visual testing needed)

**Mitigation:**
- Run Phase 1 tests frequently during Phase 2
- Manual UI testing alongside automated tests
- Git commits after each TDD iteration for easy rollback
