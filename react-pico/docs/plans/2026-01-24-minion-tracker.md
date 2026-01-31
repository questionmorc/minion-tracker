# Minion Tracker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a simple Go + HTMX web app to track D&D minion stat blocks (spawn, update HP, dismiss).

**Architecture:** Server-rendered HTML with HTMX for partial page updates. SQLite for persistence. Stdlib `net/http` router (Go 1.22+ pattern matching). Templates return HTML fragments for HTMX swap targets.

**Tech Stack:** Go 1.24, `html/template` (stdlib), `net/http` (stdlib), SQLite via `modernc.org/sqlite`, HTMX 2.x (CDN), Pico CSS (CDN, classless styling).

---

### Task 1: Project Scaffold

**Files:**
- Create: `go.mod`
- Create: `main.go`

**Step 1: Initialize the Go module**

Run:
```bash
go mod init github.com/mrrc/minion-tracker
```
Expected: `go.mod` created with module path.

**Step 2: Create minimal main.go that starts a server**

Create `main.go`:
```go
package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "minion-tracker running")
	})

	log.Println("Listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
```

**Step 3: Verify it compiles and runs**

Run:
```bash
go build -o minion-tracker . && echo "BUILD OK"
```
Expected: `BUILD OK`, binary created.

**Step 4: Commit**

```bash
git add go.mod main.go
git commit -m "feat: project scaffold with minimal http server"
```

---

### Task 2: SQLite Database Layer

**Files:**
- Create: `db.go`
- Create: `models.go`

**Step 1: Add SQLite dependency**

Run:
```bash
go get modernc.org/sqlite
```
Expected: `go.mod` and `go.sum` updated.

**Step 2: Create models.go with Minion struct**

Create `models.go`:
```go
package main

// Minion represents a spawned minion's stat block.
type Minion struct {
	ID       int64
	Name     string
	HP       int
	MaxHP    int
	AC       int
	Attack   int
	Damage   string
	Notes    string
	Active   bool
}
```

**Step 3: Create db.go with schema and CRUD functions**

Create `db.go`:
```go
package main

import (
	"database/sql"
	"log"

	_ "modernc.org/sqlite"
)

var db *sql.DB

func initDB(path string) {
	var err error
	db, err = sql.Open("sqlite", path)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS minions (
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
		log.Fatal(err)
	}
}

func createMinion(m *Minion) error {
	res, err := db.Exec(
		`INSERT INTO minions (name, hp, max_hp, ac, attack, damage, notes, active)
		 VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
		m.Name, m.HP, m.MaxHP, m.AC, m.Attack, m.Damage, m.Notes,
	)
	if err != nil {
		return err
	}
	m.ID, _ = res.LastInsertId()
	return nil
}

func getMinion(id int64) (*Minion, error) {
	m := &Minion{}
	err := db.QueryRow(`SELECT id, name, hp, max_hp, ac, attack, damage, notes, active FROM minions WHERE id = ?`, id).
		Scan(&m.ID, &m.Name, &m.HP, &m.MaxHP, &m.AC, &m.Attack, &m.Damage, &m.Notes, &m.Active)
	return m, err
}

func listActiveMinions() ([]Minion, error) {
	rows, err := db.Query(`SELECT id, name, hp, max_hp, ac, attack, damage, notes, active FROM minions WHERE active = 1 ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var minions []Minion
	for rows.Next() {
		var m Minion
		if err := rows.Scan(&m.ID, &m.Name, &m.HP, &m.MaxHP, &m.AC, &m.Attack, &m.Damage, &m.Notes, &m.Active); err != nil {
			return nil, err
		}
		minions = append(minions, m)
	}
	return minions, rows.Err()
}

func updateMinion(m *Minion) error {
	_, err := db.Exec(
		`UPDATE minions SET name=?, hp=?, max_hp=?, ac=?, attack=?, damage=?, notes=?, active=? WHERE id=?`,
		m.Name, m.HP, m.MaxHP, m.AC, m.Attack, m.Damage, m.Notes, m.Active, m.ID,
	)
	return err
}

func deleteMinion(id int64) error {
	_, err := db.Exec(`UPDATE minions SET active = 0 WHERE id = ?`, id)
	return err
}
```

**Step 4: Wire initDB into main.go**

Modify `main.go` — add `initDB("minions.db")` as the first line of `main()`:
```go
func main() {
	initDB("minions.db")

	mux := http.NewServeMux()
	// ... rest unchanged
}
```

**Step 5: Verify it compiles**

Run:
```bash
go build -o minion-tracker . && echo "BUILD OK"
```
Expected: `BUILD OK`

**Step 6: Commit**

```bash
git add go.mod go.sum models.go db.go main.go
git commit -m "feat: add sqlite database layer with minion CRUD"
```

---

### Task 3: HTML Templates

**Files:**
- Create: `templates/layout.html`
- Create: `templates/minion-row.html`
- Create: `templates/minion-form.html`

**Step 1: Create templates/layout.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Minion Tracker</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
    <script src="https://unpkg.com/htmx.org@2.0.4"></script>
    <style>
        .minion-row { border: 1px solid var(--pico-muted-border-color); border-radius: 8px; padding: 1rem; margin-bottom: 0.5rem; }
        .minion-row .stats { display: flex; gap: 1rem; flex-wrap: wrap; }
        .minion-row .stat { font-size: 0.9rem; }
        .minion-row .stat strong { display: block; font-size: 0.75rem; text-transform: uppercase; color: var(--pico-muted-color); }
        .hp-low { color: var(--pico-del-color); }
    </style>
</head>
<body>
<main class="container">
    <h1>Minion Tracker</h1>

    <section id="spawn-form">
        {{template "minion-form" .}}
    </section>

    <section id="minion-list">
        {{range .Minions}}
            {{template "minion-row" .}}
        {{end}}
    </section>
</main>
</body>
</html>
```

**Step 2: Create templates/minion-row.html**

```html
{{define "minion-row"}}
<div class="minion-row" id="minion-{{.ID}}">
    <div class="stats">
        <div class="stat"><strong>Name</strong> {{.Name}}</div>
        <div class="stat{{if le .HP (div .MaxHP 2)}} hp-low{{end}}"><strong>HP</strong> {{.HP}}/{{.MaxHP}}</div>
        <div class="stat"><strong>AC</strong> {{.AC}}</div>
        <div class="stat"><strong>Atk</strong> +{{.Attack}}</div>
        <div class="stat"><strong>Dmg</strong> {{.Damage}}</div>
        {{if .Notes}}<div class="stat"><strong>Notes</strong> {{.Notes}}</div>{{end}}
    </div>
    <div style="margin-top:0.5rem; display:flex; gap:0.5rem;">
        <button class="outline secondary" style="padding:0.25rem 0.5rem; font-size:0.8rem;"
            hx-get="/minions/{{.ID}}/edit" hx-target="#minion-{{.ID}}" hx-swap="outerHTML">Edit</button>
        <button class="outline secondary" style="padding:0.25rem 0.5rem; font-size:0.8rem;"
            hx-delete="/minions/{{.ID}}" hx-target="#minion-{{.ID}}" hx-swap="outerHTML"
            hx-confirm="Dismiss this minion?">Dismiss</button>
    </div>
</div>
{{end}}
```

**Step 3: Create templates/minion-form.html**

```html
{{define "minion-form"}}
<form hx-post="/minions" hx-target="#minion-list" hx-swap="beforeend" hx-on::after-request="this.reset()">
    <fieldset role="group">
        <input name="name" placeholder="Name" required>
        <input name="hp" type="number" placeholder="HP" required style="width:5rem">
        <input name="ac" type="number" placeholder="AC" required style="width:5rem">
        <input name="attack" type="number" placeholder="Atk" required style="width:5rem">
        <input name="damage" placeholder="Damage (e.g. 1d6+3)" style="width:10rem">
    </fieldset>
    <details>
        <summary>Notes</summary>
        <textarea name="notes" placeholder="Special abilities, resistances, etc."></textarea>
    </details>
    <button type="submit">Spawn Minion</button>
</form>
{{end}}
```

**Step 4: Verify templates directory exists and files are created**

Run:
```bash
ls templates/
```
Expected: `layout.html  minion-form.html  minion-row.html`

**Step 5: Commit**

```bash
git add templates/
git commit -m "feat: add html templates for layout, minion row, and spawn form"
```

---

### Task 4: Template Rendering and Embed

**Files:**
- Modify: `main.go`

**Step 1: Add template embedding and parsing to main.go**

Add these imports and the embed directive at the top of `main.go`:
```go
package main

import (
	"embed"
	"html/template"
	"log"
	"net/http"
	"strconv"
)

//go:embed templates/*
var templateFS embed.FS

var tmpl *template.Template

func initTemplates() {
	funcMap := template.FuncMap{
		"div": func(a, b int) int { return a / b },
		"le":  func(a, b int) bool { return a <= b },
	}
	tmpl = template.Must(
		template.New("").Funcs(funcMap).ParseFS(templateFS, "templates/*.html"),
	)
}
```

**Step 2: Add initTemplates() call in main()**

```go
func main() {
	initDB("minions.db")
	initTemplates()
	// ...
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
git commit -m "feat: embed templates and add template parsing with funcmap"
```

---

### Task 5: HTTP Handlers

**Files:**
- Modify: `main.go`

**Step 1: Replace the placeholder handler with real routes**

Replace the route registration and handler in `main()` with:

```go
func main() {
	initDB("minions.db")
	initTemplates()

	mux := http.NewServeMux()
	mux.HandleFunc("GET /", handleIndex)
	mux.HandleFunc("POST /minions", handleCreate)
	mux.HandleFunc("GET /minions/{id}/edit", handleEditForm)
	mux.HandleFunc("PUT /minions/{id}", handleUpdate)
	mux.HandleFunc("DELETE /minions/{id}", handleDelete)

	log.Println("Listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}

func handleIndex(w http.ResponseWriter, r *http.Request) {
	minions, err := listActiveMinions()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	data := map[string]any{"Minions": minions}
	tmpl.ExecuteTemplate(w, "layout.html", data)
}

func handleCreate(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	hp, _ := strconv.Atoi(r.FormValue("hp"))
	ac, _ := strconv.Atoi(r.FormValue("ac"))
	atk, _ := strconv.Atoi(r.FormValue("attack"))

	m := &Minion{
		Name:   r.FormValue("name"),
		HP:     hp,
		MaxHP:  hp,
		AC:     ac,
		Attack: atk,
		Damage: r.FormValue("damage"),
		Notes:  r.FormValue("notes"),
	}
	if err := createMinion(m); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	tmpl.ExecuteTemplate(w, "minion-row", m)
}

func handleEditForm(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(r.PathValue("id"), 10, 64)
	m, err := getMinion(id)
	if err != nil {
		http.Error(w, "not found", 404)
		return
	}
	// Render inline edit form
	tmpl.ExecuteTemplate(w, "minion-edit", m)
}

func handleUpdate(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(r.PathValue("id"), 10, 64)
	r.ParseForm()
	hp, _ := strconv.Atoi(r.FormValue("hp"))
	maxHP, _ := strconv.Atoi(r.FormValue("max_hp"))
	ac, _ := strconv.Atoi(r.FormValue("ac"))
	atk, _ := strconv.Atoi(r.FormValue("attack"))

	m := &Minion{
		ID:     id,
		Name:   r.FormValue("name"),
		HP:     hp,
		MaxHP:  maxHP,
		AC:     ac,
		Attack: atk,
		Damage: r.FormValue("damage"),
		Notes:  r.FormValue("notes"),
		Active: true,
	}
	if err := updateMinion(m); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	tmpl.ExecuteTemplate(w, "minion-row", m)
}

func handleDelete(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err := deleteMinion(id); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	// Return empty — HTMX removes the element via outerHTML swap
	w.WriteHeader(200)
}
```

**Step 2: Verify it compiles**

Run:
```bash
go build -o minion-tracker . && echo "BUILD OK"
```
Expected: `BUILD OK`

**Step 3: Commit**

```bash
git add main.go
git commit -m "feat: add http handlers for CRUD operations"
```

---

### Task 6: Edit Form Template

**Files:**
- Create: `templates/minion-edit.html`

**Step 1: Create the inline edit form template**

Create `templates/minion-edit.html`:
```html
{{define "minion-edit"}}
<form class="minion-row" id="minion-{{.ID}}" hx-put="/minions/{{.ID}}" hx-target="#minion-{{.ID}}" hx-swap="outerHTML">
    <div class="stats">
        <div class="stat"><strong>Name</strong> <input name="name" value="{{.Name}}" required></div>
        <div class="stat"><strong>HP</strong> <input name="hp" type="number" value="{{.HP}}" style="width:4rem" required></div>
        <div class="stat"><strong>Max HP</strong> <input name="max_hp" type="number" value="{{.MaxHP}}" style="width:4rem" required></div>
        <div class="stat"><strong>AC</strong> <input name="ac" type="number" value="{{.AC}}" style="width:4rem" required></div>
        <div class="stat"><strong>Atk</strong> <input name="attack" type="number" value="{{.Attack}}" style="width:4rem" required></div>
        <div class="stat"><strong>Dmg</strong> <input name="damage" value="{{.Damage}}" style="width:8rem"></div>
    </div>
    <details open>
        <summary>Notes</summary>
        <textarea name="notes">{{.Notes}}</textarea>
    </details>
    <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
        <button type="submit" style="padding:0.25rem 0.75rem; font-size:0.8rem;">Save</button>
        <button type="button" class="outline secondary" style="padding:0.25rem 0.75rem; font-size:0.8rem;"
            hx-get="/minions/{{.ID}}/view" hx-target="#minion-{{.ID}}" hx-swap="outerHTML">Cancel</button>
    </div>
</form>
{{end}}
```

**Step 2: Add a GET /minions/{id}/view route for cancel button**

Add to `main.go` route registration:
```go
mux.HandleFunc("GET /minions/{id}/view", handleView)
```

Add handler:
```go
func handleView(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(r.PathValue("id"), 10, 64)
	m, err := getMinion(id)
	if err != nil {
		http.Error(w, "not found", 404)
		return
	}
	tmpl.ExecuteTemplate(w, "minion-row", m)
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
git add templates/minion-edit.html main.go
git commit -m "feat: add inline edit form template and view handler"
```

---

### Task 7: Integration Smoke Test

**Files:**
- None created; manual verification.

**Step 1: Run the server**

Run:
```bash
./minion-tracker &
sleep 1
```

**Step 2: Verify index loads**

Run:
```bash
curl -s http://localhost:8080/ | head -5
```
Expected: HTML output starting with `<!DOCTYPE html>`

**Step 3: Create a minion via POST**

Run:
```bash
curl -s -X POST http://localhost:8080/minions -d "name=Skeleton&hp=13&ac=13&attack=4&damage=1d6%2B2&notes=Undead"
```
Expected: HTML fragment with `id="minion-1"` and stat values.

**Step 4: Verify it appears in the list**

Run:
```bash
curl -s http://localhost:8080/ | grep "Skeleton"
```
Expected: Line containing "Skeleton".

**Step 5: Delete the minion**

Run:
```bash
curl -s -X DELETE http://localhost:8080/minions/1
```
Expected: Empty 200 response.

**Step 6: Stop the server and clean up**

Run:
```bash
kill %1 2>/dev/null; rm -f minion-tracker minions.db
```

**Step 7: Commit .gitignore**

Create `.gitignore`:
```
minion-tracker
minions.db
```

```bash
git add .gitignore
git commit -m "chore: add gitignore for binary and database"
```

---

## Summary

| Task | What it does |
|------|-------------|
| 1 | Project scaffold — `go.mod`, minimal `main.go` |
| 2 | SQLite DB layer — schema, Minion struct, CRUD functions |
| 3 | HTML templates — layout, minion row, spawn form |
| 4 | Template embed + parsing with FuncMap |
| 5 | HTTP handlers wiring HTMX partials to DB |
| 6 | Inline edit form + cancel/view handler |
| 7 | Integration smoke test, .gitignore |

Total: 7 tasks, ~30 steps. Each step is one action. No external dependencies beyond Go stdlib + one SQLite driver + two CDN links.
