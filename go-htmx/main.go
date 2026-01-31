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

func main() {
	initDB("minions.db")
	initTemplates()

	mux := http.NewServeMux()
	mux.HandleFunc("GET /", handleIndex)
	mux.HandleFunc("POST /minions", handleCreate)
	mux.HandleFunc("GET /minions/{id}/edit", handleEditForm)
	mux.HandleFunc("PUT /minions/{id}", handleUpdate)
	mux.HandleFunc("DELETE /minions/{id}", handleDelete)
	mux.HandleFunc("GET /minions/{id}/view", handleView)
	mux.HandleFunc("GET /minions/{id}/hp/adjust", handleHPAdjustForm)
	mux.HandleFunc("GET /minions/{id}/hp/cancel", handleHPCancel)
	mux.HandleFunc("POST /minions/{id}/hp/heal", handleHeal)
	mux.HandleFunc("POST /minions/{id}/hp/dmg", handleDmg)

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
	tmpl.ExecuteTemplate(w, "minion-edit", m)
}

func handleUpdate(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(r.PathValue("id"), 10, 64)

	// Check if minion exists
	_, err := getMinion(id)
	if err != nil {
		http.Error(w, "not found", 404)
		return
	}

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
	w.WriteHeader(200)
}

func handleView(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(r.PathValue("id"), 10, 64)
	m, err := getMinion(id)
	if err != nil {
		http.Error(w, "not found", 404)
		return
	}
	tmpl.ExecuteTemplate(w, "minion-row", m)
}

func handleHPAdjustForm(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(r.PathValue("id"), 10, 64)
	m, err := getMinion(id)
	if err != nil {
		http.Error(w, "not found", 404)
		return
	}
	tmpl.ExecuteTemplate(w, "hp-adjust", m)
}

func handleHPCancel(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(r.PathValue("id"), 10, 64)
	m, err := getMinion(id)
	if err != nil {
		http.Error(w, "not found", 404)
		return
	}
	tmpl.ExecuteTemplate(w, "hp-stat", m)
}

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
