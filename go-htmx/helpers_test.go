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

	id, err := res.LastInsertId()
	if err != nil {
		t.Fatalf("Failed to get last insert ID: %v", err)
	}
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
