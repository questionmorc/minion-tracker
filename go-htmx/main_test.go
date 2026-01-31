package main

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
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

// contains checks if substr is present in s
func contains(s, substr string) bool {
	return strings.Contains(s, substr)
}

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
		method  string
		path    string
	}{
		{"EditForm 404", handleEditForm, "GET", "/minions/999/edit"},
		{"Update 404", handleUpdate, "PUT", "/minions/999"},
		{"View 404", handleView, "GET", "/minions/999/view"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(tt.method, tt.path, nil)
			req.SetPathValue("id", "999")
			rec := httptest.NewRecorder()

			tt.handler(rec, req)

			if rec.Code != http.StatusNotFound {
				t.Errorf("Expected status 404, got %d", rec.Code)
			}
		})
	}
}

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
