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
	if !result.Active {
		t.Errorf("Expected Active true, got false")
	}
}

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
	_, err := testDB.Exec("UPDATE minions SET active = 0 WHERE id = ?", id2)
	if err != nil {
		t.Fatalf("Failed to deactivate test minion: %v", err)
	}

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
	result, err := getMinion(id)
	if err != nil {
		t.Fatalf("Failed to retrieve updated minion: %v", err)
	}
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
	minions, err := listActiveMinions()
	if err != nil {
		t.Fatalf("Failed to list active minions: %v", err)
	}
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
