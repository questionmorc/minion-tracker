# HP Adjustment Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add click-to-edit HP adjustment that allows incrementing/decrementing health from current value via inline input form.

**Architecture:** HP stat becomes clickable, swapping to inline form with single input field for delta value (+/- adjustment). HTMX handles swap, dedicated PATCH endpoint applies delta to current HP, returns updated minion-row fragment.

**Tech Stack:** Go 1.24, `html/template`, `net/http`, HTMX 2.x, existing SQLite database (no schema changes needed).

---

### Task 1: HP Adjustment Form Template

**Files:**
- Create: `templates/hp-adjust.html`

**Step 1: Create hp-adjust.html template**

Create `templates/hp-adjust.html`:
```html
{{define "hp-adjust"}}
<div class="stat{{if le .HP (div .MaxHP 2)}} hp-low{{end}}" id="hp-stat-{{.ID}}">
    <strong>HP</strong>
    <form hx-patch="/minions/{{.ID}}/hp" hx-target="#minion-{{.ID}}" hx-swap="outerHTML" style="display:inline-flex; gap:0.25rem; align-items:center;">
        <input name="delta" type="number" placeholder="+/-" autofocus required
               style="width:4rem; padding:0.25rem 0.5rem; margin:0;"
               hx-on::after-request="this.form.reset()">
        <button type="submit" style="padding:0.25rem 0.5rem; font-size:0.75rem; margin:0;">Apply</button>
        <button type="button" class="outline secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem; margin:0;"
                hx-get="/minions/{{.ID}}/hp/cancel" hx-target="#hp-stat-{{.ID}}" hx-swap="outerHTML">✕</button>
    </form>
</div>
{{end}}
```

**Step 2: Verify file exists**

Run:
```bash
ls templates/hp-adjust.html
```
Expected: `templates/hp-adjust.html`

**Step 3: Commit**

```bash
git add templates/hp-adjust.html
git commit -m "feat: add hp adjustment inline form template"
```

---

### Task 2: Update Minion Row to Make HP Clickable

**Files:**
- Modify: `templates/minion-row.html:5`

**Step 1: Modify HP stat div to be clickable**

In `templates/minion-row.html`, replace line 5:
```html
        <div class="stat{{if le .HP (div .MaxHP 2)}} hp-low{{end}}"><strong>HP</strong> {{.HP}}/{{.MaxHP}}</div>
```

With:
```html
        <div class="stat{{if le .HP (div .MaxHP 2)}} hp-low{{end}}" id="hp-stat-{{.ID}}" style="cursor:pointer;"
             hx-get="/minions/{{.ID}}/hp/adjust" hx-target="#hp-stat-{{.ID}}" hx-swap="outerHTML">
            <strong>HP</strong> {{.HP}}/{{.MaxHP}}
        </div>
```

**Step 2: Verify template compiles**

Run:
```bash
go build -o minion-tracker . && echo "BUILD OK"
```
Expected: `BUILD OK`

**Step 3: Commit**

```bash
git add templates/minion-row.html
git commit -m "feat: make HP stat clickable to trigger adjustment form"
```

---

### Task 3: HP Adjustment Handler - Show Form

**Files:**
- Modify: `main.go:36` (add route)
- Modify: `main.go:127` (add handler after handleView)

**Step 1: Add route for showing HP adjustment form**

In `main.go`, add route after line 36:
```go
	mux.HandleFunc("GET /minions/{id}/hp/adjust", handleHPAdjustForm)
```

**Step 2: Add handleHPAdjustForm handler**

Add after `handleView` function (after line 127):
```go
func handleHPAdjustForm(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(r.PathValue("id"), 10, 64)
	m, err := getMinion(id)
	if err != nil {
		http.Error(w, "not found", 404)
		return
	}
	tmpl.ExecuteTemplate(w, "hp-adjust", m)
}
```

**Step 3: Verify it compiles**

Run:
```bash
go build -o minion-tracker . && echo "BUILD OK"
```
Expected: `BUILD OK`

**Step 4: Commit**

```bash
git add main.go
git commit -m "feat: add handler to display HP adjustment form"
```

---

### Task 4: HP Adjustment Handler - Apply Delta

**Files:**
- Modify: `main.go:37` (add route)
- Modify: `db.go:86` (add function after deleteMinion)

**Step 1: Add route for applying HP delta**

In `main.go`, add route after the previous addition (around line 37):
```go
	mux.HandleFunc("PATCH /minions/{id}/hp", handleHPAdjust)
```

**Step 2: Add adjustHP database function**

In `db.go`, add function after `deleteMinion` (after line 86):
```go
func adjustHP(id int64, delta int) (*Minion, error) {
	_, err := db.Exec(`UPDATE minions SET hp = MAX(0, MIN(hp + ?, max_hp)) WHERE id = ?`, delta, id)
	if err != nil {
		return nil, err
	}
	return getMinion(id)
}
```

**Step 3: Add handleHPAdjust handler**

In `main.go`, add handler after `handleHPAdjustForm`:
```go
func handleHPAdjust(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(r.PathValue("id"), 10, 64)
	r.ParseForm()
	delta, _ := strconv.Atoi(r.FormValue("delta"))

	m, err := adjustHP(id, delta)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	tmpl.ExecuteTemplate(w, "minion-row", m)
}
```

**Step 4: Verify it compiles**

Run:
```bash
go build -o minion-tracker . && echo "BUILD OK"
```
Expected: `BUILD OK`

**Step 5: Commit**

```bash
git add main.go db.go
git commit -m "feat: add HP delta adjustment handler with bounds checking"
```

---

### Task 5: HP Adjustment Cancel Handler

**Files:**
- Modify: `main.go:38` (add route)
- Modify: `templates/hp-stat.html` (create new template)

**Step 1: Create hp-stat.html template for normal display**

Create `templates/hp-stat.html`:
```html
{{define "hp-stat"}}
<div class="stat{{if le .HP (div .MaxHP 2)}} hp-low{{end}}" id="hp-stat-{{.ID}}" style="cursor:pointer;"
     hx-get="/minions/{{.ID}}/hp/adjust" hx-target="#hp-stat-{{.ID}}" hx-swap="outerHTML">
    <strong>HP</strong> {{.HP}}/{{.MaxHP}}
</div>
{{end}}
```

**Step 2: Add route for cancel action**

In `main.go`, add route after the previous additions (around line 38):
```go
	mux.HandleFunc("GET /minions/{id}/hp/cancel", handleHPCancel)
```

**Step 3: Add handleHPCancel handler**

In `main.go`, add handler after `handleHPAdjust`:
```go
func handleHPCancel(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(r.PathValue("id"), 10, 64)
	m, err := getMinion(id)
	if err != nil {
		http.Error(w, "not found", 404)
		return
	}
	tmpl.ExecuteTemplate(w, "hp-stat", m)
}
```

**Step 4: Verify it compiles**

Run:
```bash
go build -o minion-tracker . && echo "BUILD OK"
```
Expected: `BUILD OK`

**Step 5: Commit**

```bash
git add templates/hp-stat.html main.go
git commit -m "feat: add cancel handler to restore HP stat display"
```

---

### Task 6: Integration Test

**Files:**
- None created; manual verification.

**Step 1: Build and run the server**

Run:
```bash
go build -o minion-tracker . && ./minion-tracker &
sleep 1
```

**Step 2: Create a test minion**

Run:
```bash
curl -s -X POST http://localhost:8080/minions \
  -d "name=TestGoblin&hp=15&ac=12&attack=3&damage=1d6"
```
Expected: HTML fragment with `id="minion-1"` containing `15/15` HP.

**Step 3: Test HP adjustment form loads**

Run:
```bash
curl -s http://localhost:8080/minions/1/hp/adjust | grep -o 'name="delta"'
```
Expected: `name="delta"`

**Step 4: Test HP adjustment (damage)**

Run:
```bash
curl -s -X PATCH http://localhost:8080/minions/1/hp -d "delta=-5" | grep -oP '\d+/15'
```
Expected: `10/15`

**Step 5: Test HP adjustment (healing)**

Run:
```bash
curl -s -X PATCH http://localhost:8080/minions/1/hp -d "delta=3" | grep -oP '\d+/15'
```
Expected: `13/15`

**Step 6: Test bounds (cannot exceed max HP)**

Run:
```bash
curl -s -X PATCH http://localhost:8080/minions/1/hp -d "delta=100" | grep -oP '\d+/15'
```
Expected: `15/15`

**Step 7: Test bounds (cannot go below 0)**

Run:
```bash
curl -s -X PATCH http://localhost:8080/minions/1/hp -d "delta=-50" | grep -oP '\d+/15'
```
Expected: `0/15`

**Step 8: Test cancel endpoint**

Run:
```bash
curl -s http://localhost:8080/minions/1/hp/cancel | grep -o 'hp-stat-1'
```
Expected: `hp-stat-1`

**Step 9: Stop server and clean up**

Run:
```bash
kill %1 2>/dev/null; rm -f minion-tracker minions.db
```

**Step 10: Final build verification**

Run:
```bash
go build -o minion-tracker . && echo "BUILD OK"
```
Expected: `BUILD OK`

---

## Summary

| Task | What it does |
|------|-------------|
| 1 | Create inline HP adjustment form template with delta input |
| 2 | Make HP stat clickable in minion-row template |
| 3 | Add handler to show HP adjustment form |
| 4 | Add PATCH handler and DB function to apply HP delta with bounds |
| 5 | Add cancel handler to restore normal HP display |
| 6 | Integration test: create minion, test adjustment, bounds, cancel |

Total: 6 tasks, ~25 steps. Feature allows clicking HP to reveal +/- input, applies delta to current value, clamps to [0, MaxHP] range. No schema changes required.
