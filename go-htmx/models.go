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
