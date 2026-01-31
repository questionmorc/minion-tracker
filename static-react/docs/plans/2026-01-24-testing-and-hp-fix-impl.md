# Comprehensive Testing and HP Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add comprehensive test suite for all existing functionality, then use TDD to fix broken HP adjustment and implement new Heal/Dmg button design.

**Architecture:** Two-phase TDD approach - Phase 1 tests all existing code with in-memory SQLite, Phase 2 uses Red/Green/Refactor cycles to fix and improve HP feature with new button layout.

**Tech Stack:** Go 1.24, stdlib `testing` and `httptest`, in-memory SQLite (`:memory:`), HTMX 2.x for frontend.

---

## PHASE 1: COMPREHENSIVE TEST SUITE

### Task 1: Test Helpers Setup

**Files:**
- Create: `helpers_test.go`

**Step 1: Create helpers_test.go with setupTestDB function**

Create `helpers_test.go`:
```go
package main

import (
	"database/sql"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	_ "modernc.org/sqlite"
)

// setupTestDB creates an in-memory SQLite database with schema
func setupTestDB(t *testing.T) *sql.DB {
	t.Helper()

	testDB, err := sql.Open("sqlite", ":memory:")
	if err != nil {
		t.Fatalf("Failed to open test database: %v", err)
	}

	// Create schema
	_, err = testDB.Exec(`
		CREATE TABLE minions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			hp INTEGER NOT NULL,
			max_hp INTEGER NOT NULL,
			ac INTEGER NOT NULL,
			attack INTEGER NOT NULL,
			damage TEXT NOT NULL DEFAULT '',
			notes TEXT NOT NULL DEFAULT '',
			active INTEGER NOT NULL DEFAULT 1
		)
	`)
	if err != nil {
		t.Fatalf("Failed to create schema: %v", err)
	}

	return testDB
}

// createTestMinion inserts a test minion and returns its ID
func createTestMinion(t *testing.T, testDB *sql.DB, m *Minion) int64 {
	t.Helper()

	res, err := testDB.Exec(
		`INSERT INTO minions (name, hp, max_hp, ac, attack, damage, notes, active)
		 VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
		m.Name, m.HP, m.MaxHP, m.AC, m.Attack, m.Damage, m.Notes,
	)
	if err != nil {
		t.Fatalf("Failed to create test minion: %v", err)
	}

	id, _ := res.LastInsertId()
	return id
}

// makeRequest creates an HTTP request and returns the response recorder
func makeRequest(t *testing.T, handler http.HandlerFunc, method, path string, body io.Reader) *httptest.ResponseRecorder {
	t.Helper()

	req := httptest.NewRequest(method, path, body)
	if body != nil {
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	}

	rec := httptest.NewRecorder()
	handler(rec, req)

	return rec
}
```

**Step 2: Verify it compiles**

Run:
```bash
go test -c
```
Expected: Compiles without errors

**Step 3: Commit**

```bash
git add helpers_test.go
git commit -m "test: add test helper functions for DB and HTTP testing"
```

---

### Task 2: Database Tests - InitDB and Create

**Files:**
- Create: `db_test.go`

**Step 1: Write failing test for initDB**

Create `db_test.go`:
```go
package main

import (
	"testing"
)

func TestInitDB(t *testing.T) {
	testDB := setupTestDB(t)
	defer testDB.Close()

	// Verify table exists by querying schema
	var tableName string
	err := testDB.QueryRow("SELECT name FROM sqlite_master WHERE type='table' AND name='minions'").Scan(&tableName)
	if err != nil {
		t.Fatalf("Expected minions table to exist, got error: %v", err)
	}

	if tableName != "minions" {
		t.Errorf("Expected table name 'minions', got %q", tableName)
	}
}
```

**Step 2: Run test to verify it passes**

Run:
```bash
go test -v -run TestInitDB
```
Expected: PASS (setupTestDB already creates schema)

**Step 3: Write failing test for createMinion**

Add to `db_test.go`:
```go
func TestCreateMinion(t *testing.T) {
	testDB := setupTestDB(t)
	defer testDB.Close()

	// Temporarily replace global db
	originalDB := db
	db = testDB
	defer func() { db = originalDB }()

	m := &Minion{
		Name:   "TestGoblin",
		HP:     10,
		MaxHP:  15,
		AC:     12,
		Attack: 3,
		Damage: "1d6+1",
		Notes:  "Test notes",
	}

	err := createMinion(m)
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}

	if m.ID == 0 {
		t.Error("Expected ID to be assigned, got 0")
	}

	// Verify in database
	var count int
	err = testDB.QueryRow("SELECT COUNT(*) FROM minions WHERE id = ?", m.ID).Scan(&count)
	if err != nil {
		t.Fatalf("Query error: %v", err)
	}

	if count != 1 {
		t.Errorf("Expected 1 minion with ID %d, got %d", m.ID, count)
	}
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
go test -v -run TestCreateMinion
```
Expected: PASS

**Step 5: Commit**

```bash
git add db_test.go
git commit -m "test: add tests for initDB and createMinion"
```

---

### Task 3: Database Tests - Get and GetNotFound

**Files:**
- Modify: `db_test.go`

**Step 1: Write test for getMinion**

Add to `db_test.go`:
```go
func TestGetMinion(t *testing.T) {
	testDB := setupTestDB(t)
	defer testDB.Close()

	// Temporarily replace global db
	originalDB := db
	db = testDB
	defer func() { db = originalDB }()

	// Create test minion
	expected := &Minion{
		Name:   "TestOrc",
		HP:     20,
		MaxHP:  25,
		AC:     14,
		Attack: 5,
		Damage: "1d8+3",
		Notes:  "Fierce warrior",
	}
	id := createTestMinion(t, testDB, expected)

	// Get minion
	result, err := getMinion(id)
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}

	if result.ID != id {
		t.Errorf("Expected ID %d, got %d", id, result.ID)
	}
	if result.Name != expected.Name {
		t.Errorf("Expected Name %q, got %q", expected.Name, result.Name)
	}
	if result.HP != expected.HP {
		t.Errorf("Expected HP %d, got %d", expected.HP, result.HP)
	}
	if result.MaxHP != expected.MaxHP {
		t.Errorf("Expected MaxHP %d, got %d", expected.MaxHP, result.MaxHP)
	}
	if result.AC != expected.AC {
		t.Errorf("Expected AC %d, got %d", expected.AC, result.AC)
	}
	if result.Attack != expected.Attack {
		t.Errorf("Expected Attack %d, got %d", expected.Attack, result.Attack)
	}
	if result.Damage != expected.Damage {
		t.Errorf("Expected Damage %q, got %q", expected.Damage, result.Damage)
	}
	if result.Notes != expected.Notes {
		t.Errorf("Expected Notes %q, got %q", expected.Notes, result.Notes)
	}
}
```

**Step 2: Run test to verify it passes**

Run:
```bash
go test -v -run TestGetMinion
```
Expected: PASS

**Step 3: Write test for getMinion not found**

Add to `db_test.go`:
```go
func TestGetMinionNotFound(t *testing.T) {
	testDB := setupTestDB(t)
	defer testDB.Close()

	// Temporarily replace global db
	originalDB := db
	db = testDB
	defer func() { db = originalDB }()

	// Try to get non-existent minion
	_, err := getMinion(999)
	if err == nil {
		t.Error("Expected error for non-existent minion, got nil")
	}
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
go test -v -run TestGetMinionNotFound
```
Expected: PASS

**Step 5: Commit**

```bash
git add db_test.go
git commit -m "test: add tests for getMinion and error handling"
```

---

### Task 4: Database Tests - List, Update, Delete

**Files:**
- Modify: `db_test.go`

**Step 1: Write test for listActiveMinions**

Add to `db_test.go`:
```go
func TestListActiveMinions(t *testing.T) {
	testDB := setupTestDB(t)
	defer testDB.Close()

	// Temporarily replace global db
	originalDB := db
	db = testDB
	defer func() { db = originalDB }()

	// Create active minion
	active := &Minion{Name: "Active", HP: 10, MaxHP: 10, AC: 10, Attack: 1}
	id1 := createTestMinion(t, testDB, active)

	// Create inactive minion
	inactive := &Minion{Name: "Inactive", HP: 5, MaxHP: 5, AC: 10, Attack: 1}
	id2 := createTestMinion(t, testDB, inactive)
	testDB.Exec("UPDATE minions SET active = 0 WHERE id = ?", id2)

	// List active minions
	minions, err := listActiveMinions()
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}

	if len(minions) != 1 {
		t.Fatalf("Expected 1 active minion, got %d", len(minions))
	}

	if minions[0].ID != id1 {
		t.Errorf("Expected ID %d, got %d", id1, minions[0].ID)
	}
	if minions[0].Name != "Active" {
		t.Errorf("Expected name 'Active', got %q", minions[0].Name)
	}
}
```

**Step 2: Run test to verify it passes**

Run:
```bash
go test -v -run TestListActiveMinions
```
Expected: PASS

**Step 3: Write test for updateMinion**

Add to `db_test.go`:
```go
func TestUpdateMinion(t *testing.T) {
	testDB := setupTestDB(t)
	defer testDB.Close()

	// Temporarily replace global db
	originalDB := db
	db = testDB
	defer func() { db = originalDB }()

	// Create minion
	m := &Minion{Name: "Original", HP: 10, MaxHP: 15, AC: 10, Attack: 1, Damage: "1d6"}
	id := createTestMinion(t, testDB, m)

	// Update minion
	updated := &Minion{
		ID:     id,
		Name:   "Updated",
		HP:     12,
		MaxHP:  20,
		AC:     15,
		Attack: 3,
		Damage: "1d8+2",
		Notes:  "New notes",
		Active: true,
	}

	err := updateMinion(updated)
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}

	// Verify update
	result, _ := getMinion(id)
	if result.Name != "Updated" {
		t.Errorf("Expected name 'Updated', got %q", result.Name)
	}
	if result.HP != 12 {
		t.Errorf("Expected HP 12, got %d", result.HP)
	}
	if result.MaxHP != 20 {
		t.Errorf("Expected MaxHP 20, got %d", result.MaxHP)
	}
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
go test -v -run TestUpdateMinion
```
Expected: PASS

**Step 5: Write test for deleteMinion (soft delete)**

Add to `db_test.go`:
```go
func TestDeleteMinion(t *testing.T) {
	testDB := setupTestDB(t)
	defer testDB.Close()

	// Temporarily replace global db
	originalDB := db
	db = testDB
	defer func() { db = originalDB }()

	// Create minion
	m := &Minion{Name: "ToDelete", HP: 10, MaxHP: 10, AC: 10, Attack: 1}
	id := createTestMinion(t, testDB, m)

	// Delete minion
	err := deleteMinion(id)
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}

	// Verify not in active list
	minions, _ := listActiveMinions()
	for _, minion := range minions {
		if minion.ID == id {
			t.Error("Expected minion to be excluded from active list")
		}
	}

	// Verify still exists in DB but inactive
	var active int
	err = testDB.QueryRow("SELECT active FROM minions WHERE id = ?", id).Scan(&active)
	if err != nil {
		t.Fatalf("Minion should still exist in DB: %v", err)
	}
	if active != 0 {
		t.Errorf("Expected active=0, got %d", active)
	}
}
```

**Step 6: Run test to verify it passes**

Run:
```bash
go test -v -run TestDeleteMinion
```
Expected: PASS

**Step 7: Commit**

```bash
git add db_test.go
git commit -m "test: add tests for listActiveMinions, updateMinion, deleteMinion"
```

---

### Task 5: Database Tests - AdjustHP with Bounds

**Files:**
- Modify: `db_test.go`

**Step 1: Write table-driven test for adjustHP**

Add to `db_test.go`:
```go
func TestAdjustHP(t *testing.T) {
	tests := []struct {
		name       string
		startHP    int
		maxHP      int
		delta      int
		expectedHP int
	}{
		{"damage within bounds", 10, 15, -5, 5},
		{"heal within bounds", 10, 15, 3, 13},
		{"heal exceeds max", 10, 15, 100, 15},
		{"damage below zero", 5, 15, -50, 0},
		{"no change", 10, 15, 0, 10},
		{"heal to max exactly", 10, 15, 5, 15},
		{"damage to zero exactly", 5, 15, -5, 0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			testDB := setupTestDB(t)
			defer testDB.Close()

			// Temporarily replace global db
			originalDB := db
			db = testDB
			defer func() { db = originalDB }()

			// Create minion
			m := &Minion{Name: "Test", HP: tt.startHP, MaxHP: tt.maxHP, AC: 10, Attack: 1}
			id := createTestMinion(t, testDB, m)

			// Adjust HP
			result, err := adjustHP(id, tt.delta)
			if err != nil {
				t.Fatalf("Expected no error, got: %v", err)
			}

			if result.HP != tt.expectedHP {
				t.Errorf("Expected HP %d, got %d", tt.expectedHP, result.HP)
			}

			// Verify in database
			var dbHP int
			testDB.QueryRow("SELECT hp FROM minions WHERE id = ?", id).Scan(&dbHP)
			if dbHP != tt.expectedHP {
				t.Errorf("Expected DB HP %d, got %d", tt.expectedHP, dbHP)
			}
		})
	}
}
```

**Step 2: Run test to verify it passes**

Run:
```bash
go test -v -run TestAdjustHP
```
Expected: PASS (all 7 subtests pass)

**Step 3: Commit**

```bash
git add db_test.go
git commit -m "test: add comprehensive adjustHP bounds testing"
```

---

### Task 6: HTTP Handler Tests - Setup and Index

**Files:**
- Create: `main_test.go`

**Step 1: Write test for handleIndex**

Create `main_test.go`:
```go
package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHandleIndex(t *testing.T) {
	testDB := setupTestDB(t)
	defer testDB.Close()

	// Temporarily replace global db and templates
	originalDB := db
	db = testDB
	defer func() { db = originalDB }()

	initTemplates()

	// Create test minions
	createTestMinion(t, testDB, &Minion{Name: "Goblin", HP: 7, MaxHP: 7, AC: 13, Attack: 4})
	createTestMinion(t, testDB, &Minion{Name: "Orc", HP: 15, MaxHP: 15, AC: 12, Attack: 5})

	// Make request
	req := httptest.NewRequest("GET", "/", nil)
	rec := httptest.NewRecorder()

	handleIndex(rec, req)

	// Verify response
	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rec.Code)
	}

	body := rec.Body.String()
	if body == "" {
		t.Error("Expected non-empty response body")
	}

	// Verify minions appear in response
	if !contains(body, "Goblin") {
		t.Error("Expected response to contain 'Goblin'")
	}
	if !contains(body, "Orc") {
		t.Error("Expected response to contain 'Orc'")
	}
}

// Helper function
func contains(s, substr string) bool {
	return len(s) > 0 && len(substr) > 0 && (s == substr || len(s) >= len(substr) && (s[:len(substr)] == substr || s[len(s)-len(substr):] == substr || findSubstring(s, substr)))
}

func findSubstring(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
```

**Step 2: Run test to verify it passes**

Run:
```bash
go test -v -run TestHandleIndex
```
Expected: PASS

**Step 3: Commit**

```bash
git add main_test.go
git commit -m "test: add test for handleIndex"
```

---

### Task 7: HTTP Handler Tests - Create, Edit, Update

**Files:**
- Modify: `main_test.go`

**Step 1: Write test for handleCreate**

Add to `main_test.go`:
```go
import (
	"net/url"
	"strings"
)

func TestHandleCreate(t *testing.T) {
	testDB := setupTestDB(t)
	defer testDB.Close()

	originalDB := db
	db = testDB
	defer func() { db = originalDB }()

	initTemplates()

	// Prepare form data
	form := url.Values{}
	form.Set("name", "NewGoblin")
	form.Set("hp", "10")
	form.Set("ac", "13")
	form.Set("attack", "4")
	form.Set("damage", "1d6+2")
	form.Set("notes", "Test notes")

	req := httptest.NewRequest("POST", "/minions", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rec := httptest.NewRecorder()

	handleCreate(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rec.Code)
	}

	body := rec.Body.String()
	if !contains(body, "NewGoblin") {
		t.Error("Expected response to contain 'NewGoblin'")
	}
	if !contains(body, "minion-") {
		t.Error("Expected response to contain minion ID")
	}

	// Verify minion was created in database
	minions, _ := listActiveMinions()
	if len(minions) != 1 {
		t.Errorf("Expected 1 minion in database, got %d", len(minions))
	}
}
```

**Step 2: Run test to verify it passes**

Run:
```bash
go test -v -run TestHandleCreate
```
Expected: PASS

**Step 3: Write test for handleEditForm**

Add to `main_test.go`:
```go
func TestHandleEditForm(t *testing.T) {
	testDB := setupTestDB(t)
	defer testDB.Close()

	originalDB := db
	db = testDB
	defer func() { db = originalDB }()

	initTemplates()

	// Create minion
	id := createTestMinion(t, testDB, &Minion{Name: "EditTest", HP: 10, MaxHP: 15, AC: 12, Attack: 3})

	req := httptest.NewRequest("GET", "/minions/1/edit", nil)
	req.SetPathValue("id", "1")
	rec := httptest.NewRecorder()

	handleEditForm(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rec.Code)
	}

	body := rec.Body.String()
	if !contains(body, "EditTest") {
		t.Error("Expected response to contain 'EditTest'")
	}
	if !contains(body, "input") || !contains(body, "name") {
		t.Error("Expected response to contain form inputs")
	}

	_ = id // Use id if needed
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
go test -v -run TestHandleEditForm
```
Expected: PASS

**Step 5: Write test for handleUpdate**

Add to `main_test.go`:
```go
func TestHandleUpdate(t *testing.T) {
	testDB := setupTestDB(t)
	defer testDB.Close()

	originalDB := db
	db = testDB
	defer func() { db = originalDB }()

	initTemplates()

	// Create minion
	id := createTestMinion(t, testDB, &Minion{Name: "Original", HP: 10, MaxHP: 15, AC: 12, Attack: 3})

	// Prepare update form
	form := url.Values{}
	form.Set("name", "Updated")
	form.Set("hp", "12")
	form.Set("max_hp", "20")
	form.Set("ac", "14")
	form.Set("attack", "5")
	form.Set("damage", "1d8+3")
	form.Set("notes", "Updated notes")

	req := httptest.NewRequest("PUT", "/minions/1", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.SetPathValue("id", "1")
	rec := httptest.NewRecorder()

	handleUpdate(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rec.Code)
	}

	body := rec.Body.String()
	if !contains(body, "Updated") {
		t.Error("Expected response to contain 'Updated'")
	}

	// Verify update in database
	minion, _ := getMinion(id)
	if minion.Name != "Updated" {
		t.Errorf("Expected name 'Updated', got %q", minion.Name)
	}
	if minion.HP != 12 {
		t.Errorf("Expected HP 12, got %d", minion.HP)
	}
}
```

**Step 6: Run test to verify it passes**

Run:
```bash
go test -v -run TestHandleUpdate
```
Expected: PASS

**Step 7: Commit**

```bash
git add main_test.go
git commit -m "test: add tests for handleCreate, handleEditForm, handleUpdate"
```

---

### Task 8: HTTP Handler Tests - Delete, View, 404s

**Files:**
- Modify: `main_test.go`

**Step 1: Write test for handleDelete**

Add to `main_test.go`:
```go
func TestHandleDelete(t *testing.T) {
	testDB := setupTestDB(t)
	defer testDB.Close()

	originalDB := db
	db = testDB
	defer func() { db = originalDB }()

	initTemplates()

	// Create minion
	id := createTestMinion(t, testDB, &Minion{Name: "ToDelete", HP: 10, MaxHP: 10, AC: 10, Attack: 1})

	req := httptest.NewRequest("DELETE", "/minions/1", nil)
	req.SetPathValue("id", "1")
	rec := httptest.NewRecorder()

	handleDelete(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rec.Code)
	}

	// Verify minion is soft-deleted
	minions, _ := listActiveMinions()
	for _, m := range minions {
		if m.ID == id {
			t.Error("Expected minion to be excluded from active list")
		}
	}
}
```

**Step 2: Run test to verify it passes**

Run:
```bash
go test -v -run TestHandleDelete
```
Expected: PASS

**Step 3: Write test for handleView**

Add to `main_test.go`:
```go
func TestHandleView(t *testing.T) {
	testDB := setupTestDB(t)
	defer testDB.Close()

	originalDB := db
	db = testDB
	defer func() { db = originalDB }()

	initTemplates()

	// Create minion
	createTestMinion(t, testDB, &Minion{Name: "ViewTest", HP: 10, MaxHP: 15, AC: 12, Attack: 3})

	req := httptest.NewRequest("GET", "/minions/1/view", nil)
	req.SetPathValue("id", "1")
	rec := httptest.NewRecorder()

	handleView(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rec.Code)
	}

	body := rec.Body.String()
	if !contains(body, "ViewTest") {
		t.Error("Expected response to contain 'ViewTest'")
	}
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
go test -v -run TestHandleView
```
Expected: PASS

**Step 5: Write test for 404 handling**

Add to `main_test.go`:
```go
func TestHandle404s(t *testing.T) {
	testDB := setupTestDB(t)
	defer testDB.Close()

	originalDB := db
	db = testDB
	defer func() { db = originalDB }()

	initTemplates()

	tests := []struct {
		name    string
		handler http.HandlerFunc
		path    string
	}{
		{"EditForm 404", handleEditForm, "/minions/999/edit"},
		{"Update 404", handleUpdate, "/minions/999"},
		{"View 404", handleView, "/minions/999/view"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", tt.path, nil)
			req.SetPathValue("id", "999")
			rec := httptest.NewRecorder()

			tt.handler(rec, req)

			if rec.Code != http.StatusNotFound {
				t.Errorf("Expected status 404, got %d", rec.Code)
			}
		})
	}
}
```

**Step 6: Run test to verify it passes**

Run:
```bash
go test -v -run TestHandle404s
```
Expected: PASS

**Step 7: Commit**

```bash
git add main_test.go
git commit -m "test: add tests for handleDelete, handleView, and 404 handling"
```

---

### Task 9: Template and Integration Tests

**Files:**
- Modify: `main_test.go`

**Step 1: Write test for template rendering**

Add to `main_test.go`:
```go
func TestTemplateRendering(t *testing.T) {
	initTemplates()

	templateNames := []string{
		"layout.html",
		"minion-row",
		"minion-form",
		"minion-edit",
		"hp-adjust",
		"hp-stat",
	}

	for _, name := range templateNames {
		t.Run(name, func(t *testing.T) {
			tpl := tmpl.Lookup(name)
			if tpl == nil {
				t.Errorf("Template %q not found", name)
			}
		})
	}
}
```

**Step 2: Run test to verify it passes**

Run:
```bash
go test -v -run TestTemplateRendering
```
Expected: PASS

**Step 3: Write integration test for CRUD workflow**

Add to `main_test.go`:
```go
func TestFullCRUDWorkflow(t *testing.T) {
	testDB := setupTestDB(t)
	defer testDB.Close()

	originalDB := db
	db = testDB
	defer func() { db = originalDB }()

	initTemplates()

	// Create
	form := url.Values{}
	form.Set("name", "WorkflowTest")
	form.Set("hp", "10")
	form.Set("ac", "12")
	form.Set("attack", "3")

	req := httptest.NewRequest("POST", "/minions", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rec := httptest.NewRecorder()
	handleCreate(rec, req)

	if rec.Code != 200 {
		t.Fatalf("Create failed with status %d", rec.Code)
	}

	// Read
	minions, _ := listActiveMinions()
	if len(minions) != 1 {
		t.Fatalf("Expected 1 minion, got %d", len(minions))
	}
	id := minions[0].ID

	// Update
	updateForm := url.Values{}
	updateForm.Set("name", "Updated")
	updateForm.Set("hp", "15")
	updateForm.Set("max_hp", "15")
	updateForm.Set("ac", "14")
	updateForm.Set("attack", "5")

	req = httptest.NewRequest("PUT", "/minions/1", strings.NewReader(updateForm.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.SetPathValue("id", "1")
	rec = httptest.NewRecorder()
	handleUpdate(rec, req)

	if rec.Code != 200 {
		t.Fatalf("Update failed with status %d", rec.Code)
	}

	// Delete
	req = httptest.NewRequest("DELETE", "/minions/1", nil)
	req.SetPathValue("id", "1")
	rec = httptest.NewRecorder()
	handleDelete(rec, req)

	if rec.Code != 200 {
		t.Fatalf("Delete failed with status %d", rec.Code)
	}

	// Verify deleted
	minions, _ = listActiveMinions()
	if len(minions) != 0 {
		t.Errorf("Expected 0 active minions after delete, got %d", len(minions))
	}

	_ = id // Use id if needed
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
go test -v -run TestFullCRUDWorkflow
```
Expected: PASS

**Step 5: Run all tests**

Run:
```bash
go test -v ./...
```
Expected: All Phase 1 tests pass

**Step 6: Commit**

```bash
git add main_test.go
git commit -m "test: add template rendering and CRUD integration tests"
```

---

## PHASE 2: TDD HP FEATURE FIX

### Task 10: TDD Iteration 1 - Add Heal Endpoint (RED)

**Files:**
- Modify: `main_test.go`

**Step 1: Write failing test for handleHeal**

Add to `main_test.go`:
```go
func TestHandleHeal(t *testing.T) {
	testDB := setupTestDB(t)
	defer testDB.Close()

	originalDB := db
	db = testDB
	defer func() { db = originalDB }()

	initTemplates()

	// Create minion with HP=10, MaxHP=15
	id := createTestMinion(t, testDB, &Minion{Name: "HealTest", HP: 10, MaxHP: 15, AC: 10, Attack: 1})

	// Heal by 3
	form := url.Values{}
	form.Set("amount", "3")

	req := httptest.NewRequest("POST", "/minions/1/hp/heal", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.SetPathValue("id", "1")
	rec := httptest.NewRecorder()

	handleHeal(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rec.Code)
	}

	// Verify HP increased to 13
	minion, _ := getMinion(id)
	if minion.HP != 13 {
		t.Errorf("Expected HP 13, got %d", minion.HP)
	}

	// Verify response contains updated HP
	body := rec.Body.String()
	if !contains(body, "13/15") {
		t.Error("Expected response to contain '13/15'")
	}
}
```

**Step 2: Run test to verify it fails**

Run:
```bash
go test -v -run TestHandleHeal
```
Expected: FAIL - "undefined: handleHeal"

**Step 3: Commit**

```bash
git add main_test.go
git commit -m "test: add failing test for handleHeal endpoint (RED)"
```

---

### Task 11: TDD Iteration 1 - Add Heal Endpoint (GREEN)

**Files:**
- Modify: `main.go`

**Step 1: Add handleHeal handler**

Add after `handleHPCancel` in `main.go`:
```go
func handleHeal(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(r.PathValue("id"), 10, 64)
	r.ParseForm()
	amount, _ := strconv.Atoi(r.FormValue("amount"))

	m, err := adjustHP(id, amount)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	tmpl.ExecuteTemplate(w, "minion-row", m)
}
```

**Step 2: Add route registration**

Add after line 39 in `main.go` (after handleHPCancel route):
```go
	mux.HandleFunc("POST /minions/{id}/hp/heal", handleHeal)
```

**Step 3: Run test to verify it passes**

Run:
```bash
go test -v -run TestHandleHeal
```
Expected: PASS

**Step 4: Commit**

```bash
git add main.go
git commit -m "feat: add handleHeal endpoint for healing minions (GREEN)"
```

---

### Task 12: TDD Iteration 2 - Add Dmg Endpoint (RED)

**Files:**
- Modify: `main_test.go`

**Step 1: Write failing test for handleDmg**

Add to `main_test.go`:
```go
func TestHandleDmg(t *testing.T) {
	testDB := setupTestDB(t)
	defer testDB.Close()

	originalDB := db
	db = testDB
	defer func() { db = originalDB }()

	initTemplates()

	// Create minion with HP=10, MaxHP=15
	id := createTestMinion(t, testDB, &Minion{Name: "DmgTest", HP: 10, MaxHP: 15, AC: 10, Attack: 1})

	// Damage by 4
	form := url.Values{}
	form.Set("amount", "4")

	req := httptest.NewRequest("POST", "/minions/1/hp/dmg", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.SetPathValue("id", "1")
	rec := httptest.NewRecorder()

	handleDmg(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rec.Code)
	}

	// Verify HP decreased to 6
	minion, _ := getMinion(id)
	if minion.HP != 6 {
		t.Errorf("Expected HP 6, got %d", minion.HP)
	}

	// Verify response contains updated HP
	body := rec.Body.String()
	if !contains(body, "6/15") {
		t.Error("Expected response to contain '6/15'")
	}
}
```

**Step 2: Run test to verify it fails**

Run:
```bash
go test -v -run TestHandleDmg
```
Expected: FAIL - "undefined: handleDmg"

**Step 3: Commit**

```bash
git add main_test.go
git commit -m "test: add failing test for handleDmg endpoint (RED)"
```

---

### Task 13: TDD Iteration 2 - Add Dmg Endpoint (GREEN)

**Files:**
- Modify: `main.go`

**Step 1: Add handleDmg handler**

Add after `handleHeal` in `main.go`:
```go
func handleDmg(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(r.PathValue("id"), 10, 64)
	r.ParseForm()
	amount, _ := strconv.Atoi(r.FormValue("amount"))

	m, err := adjustHP(id, -amount)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	tmpl.ExecuteTemplate(w, "minion-row", m)
}
```

**Step 2: Add route registration**

Add after handleHeal route in `main.go`:
```go
	mux.HandleFunc("POST /minions/{id}/hp/dmg", handleDmg)
```

**Step 3: Run test to verify it passes**

Run:
```bash
go test -v -run TestHandleDmg
```
Expected: PASS

**Step 4: Commit**

```bash
git add main.go
git commit -m "feat: add handleDmg endpoint for damaging minions (GREEN)"
```

---

### Task 14: TDD Iteration 3 - Update Template (RED)

**Files:**
- Modify: `main_test.go`

**Step 1: Write test for new template structure**

Add to `main_test.go`:
```go
func TestHPAdjustTemplateStructure(t *testing.T) {
	initTemplates()

	testDB := setupTestDB(t)
	defer testDB.Close()

	originalDB := db
	db = testDB
	defer func() { db = originalDB }()

	// Create minion
	id := createTestMinion(t, testDB, &Minion{Name: "TemplateTest", HP: 10, MaxHP: 15, AC: 10, Attack: 1})

	// Get HP adjust form
	req := httptest.NewRequest("GET", "/minions/1/hp/adjust", nil)
	req.SetPathValue("id", "1")
	rec := httptest.NewRecorder()

	handleHPAdjustForm(rec, req)

	body := rec.Body.String()

	// Verify new structure
	if !contains(body, "name=\"amount\"") {
		t.Error("Expected input with name='amount'")
	}
	if !contains(body, "Heal") {
		t.Error("Expected 'Heal' button")
	}
	if !contains(body, "Dmg") {
		t.Error("Expected 'Dmg' button")
	}
	if !contains(body, "hx-post") {
		t.Error("Expected hx-post attributes")
	}
	if !contains(body, "/hp/heal") {
		t.Error("Expected /hp/heal endpoint")
	}
	if !contains(body, "/hp/dmg") {
		t.Error("Expected /hp/dmg endpoint")
	}

	_ = id // Use id if needed
}
```

**Step 2: Run test to verify it fails**

Run:
```bash
go test -v -run TestHPAdjustTemplateStructure
```
Expected: FAIL (template still has old structure with delta input)

**Step 3: Commit**

```bash
git add main_test.go
git commit -m "test: add failing test for new HP adjust template structure (RED)"
```

---

### Task 15: TDD Iteration 3 - Update Template (GREEN)

**Files:**
- Modify: `templates/hp-adjust.html`

**Step 1: Update hp-adjust.html template**

Replace content of `templates/hp-adjust.html`:
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

**Step 2: Run test to verify it passes**

Run:
```bash
go test -v -run TestHPAdjustTemplateStructure
```
Expected: PASS

**Step 3: Run all tests to ensure no regression**

Run:
```bash
go test -v ./...
```
Expected: All tests pass

**Step 4: Commit**

```bash
git add templates/hp-adjust.html
git commit -m "feat: update HP adjust template with Heal/Dmg buttons (GREEN)"
```

---

### Task 16: TDD Iteration 4 - End-to-End Integration Test

**Files:**
- Modify: `main_test.go`

**Step 1: Write comprehensive integration test**

Add to `main_test.go`:
```go
func TestHPAdjustmentWorkflow(t *testing.T) {
	testDB := setupTestDB(t)
	defer testDB.Close()

	originalDB := db
	db = testDB
	defer func() { db = originalDB }()

	initTemplates()

	// Create minion with HP=10, MaxHP=15
	id := createTestMinion(t, testDB, &Minion{Name: "WorkflowTest", HP: 10, MaxHP: 15, AC: 10, Attack: 1})

	// Test 1: Get adjustment form
	req := httptest.NewRequest("GET", "/minions/1/hp/adjust", nil)
	req.SetPathValue("id", "1")
	rec := httptest.NewRecorder()
	handleHPAdjustForm(rec, req)

	if rec.Code != 200 {
		t.Fatalf("Failed to get adjust form: status %d", rec.Code)
	}

	// Test 2: Heal by 3 (10 → 13)
	form := url.Values{}
	form.Set("amount", "3")
	req = httptest.NewRequest("POST", "/minions/1/hp/heal", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.SetPathValue("id", "1")
	rec = httptest.NewRecorder()
	handleHeal(rec, req)

	minion, _ := getMinion(id)
	if minion.HP != 13 {
		t.Errorf("After heal: expected HP 13, got %d", minion.HP)
	}

	// Test 3: Damage by 5 (13 → 8)
	form = url.Values{}
	form.Set("amount", "5")
	req = httptest.NewRequest("POST", "/minions/1/hp/dmg", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.SetPathValue("id", "1")
	rec = httptest.NewRecorder()
	handleDmg(rec, req)

	minion, _ = getMinion(id)
	if minion.HP != 8 {
		t.Errorf("After damage: expected HP 8, got %d", minion.HP)
	}

	// Test 4: Heal beyond max (8 + 100 → 15 capped)
	form = url.Values{}
	form.Set("amount", "100")
	req = httptest.NewRequest("POST", "/minions/1/hp/heal", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.SetPathValue("id", "1")
	rec = httptest.NewRecorder()
	handleHeal(rec, req)

	minion, _ = getMinion(id)
	if minion.HP != 15 {
		t.Errorf("After heal beyond max: expected HP 15 (capped), got %d", minion.HP)
	}

	// Test 5: Damage below zero (15 - 50 → 0 floored)
	form = url.Values{}
	form.Set("amount", "50")
	req = httptest.NewRequest("POST", "/minions/1/hp/dmg", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.SetPathValue("id", "1")
	rec = httptest.NewRecorder()
	handleDmg(rec, req)

	minion, _ = getMinion(id)
	if minion.HP != 0 {
		t.Errorf("After damage below zero: expected HP 0 (floored), got %d", minion.HP)
	}

	// Test 6: Cancel returns to normal HP display
	req = httptest.NewRequest("GET", "/minions/1/hp/cancel", nil)
	req.SetPathValue("id", "1")
	rec = httptest.NewRecorder()
	handleHPCancel(rec, req)

	if rec.Code != 200 {
		t.Errorf("Cancel failed: status %d", rec.Code)
	}

	body := rec.Body.String()
	if !contains(body, "hp-stat-1") {
		t.Error("Expected cancel to return hp-stat element")
	}
}
```

**Step 2: Run test to verify it passes**

Run:
```bash
go test -v -run TestHPAdjustmentWorkflow
```
Expected: PASS

**Step 3: Run all tests final verification**

Run:
```bash
go test -v ./...
```
Expected: All tests pass (Phase 1 + Phase 2)

**Step 4: Commit**

```bash
git add main_test.go
git commit -m "test: add comprehensive HP adjustment workflow integration test"
```

---

### Task 17: Cleanup - Remove Old HP Adjust Handler

**Files:**
- Modify: `main.go`

**Step 1: Identify and remove old handleHPAdjust handler**

Remove or comment out the old `handleHPAdjust` handler in `main.go` (lines ~142-153):
```go
// OLD - No longer needed, replaced by handleHeal and handleDmg
// func handleHPAdjust(w http.ResponseWriter, r *http.Request) {
// 	id, _ := strconv.ParseInt(r.PathValue("id"), 10, 64)
// 	r.ParseForm()
// 	delta, _ := strconv.Atoi(r.FormValue("delta"))
//
// 	m, err := adjustHP(id, delta)
// 	if err != nil {
// 		http.Error(w, err.Error(), 500)
// 		return
// 	}
// 	tmpl.ExecuteTemplate(w, "minion-row", m)
// }
```

**Step 2: Remove old PATCH route**

Remove the old PATCH route in `main.go` (line ~38):
```go
// OLD - Remove this line
// mux.HandleFunc("PATCH /minions/{id}/hp", handleHPAdjust)
```

**Step 3: Verify all tests still pass**

Run:
```bash
go test -v ./...
```
Expected: All tests pass

**Step 4: Commit**

```bash
git add main.go
git commit -m "refactor: remove old handleHPAdjust and PATCH route"
```

---

### Task 18: Final Verification and Manual Testing

**Files:**
- None (manual testing)

**Step 1: Build and run server**

Run:
```bash
go build -o minion-tracker . && ./minion-tracker &
sleep 1
```

**Step 2: Create test minion**

Run:
```bash
curl -s -X POST http://localhost:8080/minions \
  -d "name=ManualTest&hp=10&ac=12&attack=3&damage=1d6"
```
Expected: HTML with minion-1

**Step 3: Test heal endpoint**

Run:
```bash
curl -s -X POST http://localhost:8080/minions/1/hp/heal -d "amount=5" | grep -oP '\d+/\d+'
```
Expected: 15/10 or similar (HP increased)

**Step 4: Test dmg endpoint**

Run:
```bash
curl -s -X POST http://localhost:8080/minions/1/hp/dmg -d "amount=3" | grep -oP '\d+/\d+'
```
Expected: 12/10 or similar (HP decreased)

**Step 5: Test in browser**

1. Open http://localhost:8080
2. Click on HP stat
3. Enter amount (e.g., 5)
4. Click Heal button - verify HP increases
5. Click Dmg button - verify HP decreases
6. Click × to cancel - verify form closes

**Step 6: Stop server**

Run:
```bash
kill %1
rm -f minion-tracker minions.db
```

**Step 7: Final test run**

Run:
```bash
go test -v ./...
```
Expected: All tests pass

**Step 8: Document completion**

Create or update notes about testing approach and feature completion.

---

## Summary

| Phase | Tasks | What It Does |
|-------|-------|--------------|
| Phase 1 | Tasks 1-9 | Comprehensive test suite for all existing functionality |
| Phase 2 | Tasks 10-18 | TDD fix for HP feature with new Heal/Dmg buttons |

**Phase 1 Test Coverage:**
- helpers_test.go: Test utilities
- db_test.go: 8 database tests (CRUD + adjustHP bounds)
- main_test.go: 10+ handler tests + integration tests

**Phase 2 TDD Cycles:**
- Iteration 1: Heal endpoint (RED → GREEN)
- Iteration 2: Dmg endpoint (RED → GREEN)
- Iteration 3: Template update (RED → GREEN)
- Iteration 4: Integration test + cleanup

**Total:** 18 tasks, ~100+ test cases, complete TDD implementation of HP feature fix.

**Success Criteria:**
- ✅ All existing functionality tested
- ✅ HP adjustment UI updates correctly
- ✅ Heal/Dmg buttons working
- ✅ Bounds enforced (0 to max_hp)
- ✅ No regressions in existing features
