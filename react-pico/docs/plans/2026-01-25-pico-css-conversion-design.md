# Pico CSS Conversion Design

## Goal

Convert the static React implementation from Tailwind CSS to Pico CSS, matching the look, feel, and layout of agent1 (Go + HTMX implementation) while maintaining React's architecture.

## Overview

This design converts the existing React + Tailwind app to use Pico CSS v2 with semantic HTML, creating visual parity with agent1 while keeping React's component architecture, state management, and localStorage persistence.

## Design Decisions

### CSS Strategy

**Remove:** Tailwind CSS completely (library, config, utility classes)

**Add:** Pico CSS v2 from CDN (same version as agent1)

**Custom CSS:** Enhanced version of agent1's custom styles with improvements:
- Hover effects on minion cards (subtle shadow)
- Hover effects on clickable HP stat
- Smooth transitions
- Better responsive behavior

### Component Restructuring

#### MinionForm
- Use `<fieldset role="group">` for horizontal input grouping
- Minimal/no classes on inputs (Pico handles styling)
- `<details>` with `<summary>Notes</summary>` for collapsible notes field
- Simple submit button with no custom classes
- Semantic HTML matching agent1 exactly

#### MinionCard
- `.minion-row` container with border, padding, margin
- `.stats` flex container for stat display
- Each stat: `<div class="stat"><strong>Label</strong> value</div>`
- **HP stat with click-to-adjust pattern:**
  - Default: Clickable HP display
  - Clicked: Shows adjustment form with input + Heal/Dmg buttons
  - Input autofocuses, user enters amount
  - "Heal" button increases HP by amount (bounded by MaxHP)
  - "Dmg" button decreases HP by amount (bounded by 0)
  - "✕" button cancels and returns to display mode
  - Stays in adjustment mode for multiple changes
- Small "outline secondary" buttons for Edit/Dismiss

#### MinionList
- Simple vertical stack (no grid)
- Maps over active minions only
- Empty state with centered text

#### App
- Pico's `.container` for main wrapper
- Simple `<h1>` heading
- `<section>` elements for form and list areas

### HP Adjustment State Management

**Component State:**
```tsx
const [isAdjustingHP, setIsAdjustingHP] = useState(false)
const amountInputRef = useRef<HTMLInputElement>(null)
```

**UI Pattern:**
1. User clicks HP stat → `setIsAdjustingHP(true)`
2. Form appears with autofocused input
3. User types amount (e.g., "5")
4. Click "Heal" → calls `onHPChange(minion.id, amount)`
5. Click "Dmg" → calls `onHPChange(minion.id, -amount)`
6. Click "✕" → `setIsAdjustingHP(false)`

**Benefits:**
- Cleaner UI when not adjusting HP
- Flexible (can adjust by any amount)
- Matches agent1's UX exactly

### CSS Organization

**File: src/index.css**
```css
@import url('https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css');

/* Custom styles for minion cards */
.minion-row {
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  transition: box-shadow 0.2s ease;
}

.minion-row:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.minion-row .stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.minion-row .stat {
  font-size: 0.9rem;
}

.minion-row .stat strong {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--pico-muted-color);
}

.hp-low {
  color: var(--pico-del-color);
}

.hp-stat {
  cursor: pointer;
  user-select: none;
}

.hp-stat:hover {
  opacity: 0.8;
}

.hp-adjust-form {
  display: inline-flex;
  gap: 0.25rem;
  align-items: center;
}

.hp-adjust-form input {
  width: 4rem;
  padding: 0.25rem 0.5rem;
  margin: 0;
}

.hp-adjust-form button {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  margin: 0;
}
```

### Testing Strategy

**Unit Tests (Vitest + React Testing Library):**
- Update existing tests to use semantic queries (not Tailwind classes)
- Add HP adjustment mode tests:
  - Click HP stat → shows adjustment form
  - Type amount → Heal increases HP by amount
  - Type amount → Dmg decreases HP by amount
  - Click ✕ → hides adjustment form
  - HP bounds checking (0 to MaxHP)

**E2E Tests (Playwright):**
- Full user flow: spawn minion, adjust HP multiple times, dismiss
- Verify localStorage persistence across page reloads
- Visual regression: compare screenshots with agent1
- Responsive behavior on different viewports

**Test Query Updates:**
```tsx
// Before (Tailwind-specific)
expect(screen.getByClassName('bg-blue-600')).toBeInTheDocument()

// After (semantic)
expect(screen.getByRole('button', { name: /spawn minion/i })).toBeInTheDocument()
```

## Architecture Preservation

**What doesn't change:**
- React + TypeScript architecture
- Context + useReducer state management
- localStorage persistence via custom hook
- Component structure (same files, just internal changes)
- All existing functionality

**What changes:**
- CSS framework (Tailwind → Pico)
- HTML structure (utility classes → semantic HTML)
- MinionCard gets local state for HP adjustment
- Test queries (class-based → semantic)

## Implementation Approach

1. Create new branch `static-react-pico` from `static-react`
2. Remove Tailwind (uninstall, remove config files)
3. Update index.css with Pico CSS import and custom styles
4. Restructure components one at a time (with TDD):
   - App → simple structure change
   - MinionForm → fieldset + details elements
   - MinionCard → HP adjustment state + semantic HTML
   - MinionList → minimal changes
5. Update all unit tests for new markup
6. Add Playwright E2E tests
7. Visual comparison with agent1 running side-by-side

## Success Criteria

- Visual parity with agent1 (same layout, colors, spacing)
- All unit tests pass with updated queries
- Playwright E2E tests verify full user flows
- localStorage persistence works identically
- No regressions in functionality
- Cleaner, more semantic HTML
