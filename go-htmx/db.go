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

func adjustHP(id int64, delta int) (*Minion, error) {
	_, err := db.Exec(`UPDATE minions SET hp = MAX(0, MIN(hp + ?, max_hp)) WHERE id = ?`, delta, id)
	if err != nil {
		return nil, err
	}
	return getMinion(id)
}
