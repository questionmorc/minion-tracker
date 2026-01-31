export interface Minion {
  id: string
  name: string
  hp: number
  maxHp: number
  ac: number
  attack: number
  damage: string
  notes: string
  active: boolean
}

export interface MinionFormData {
  name: string
  hp: number
  ac: number
  attack: number
  damage: string
  notes: string
}
