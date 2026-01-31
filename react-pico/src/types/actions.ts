import type { Minion, MinionFormData } from './minion'

export type MinionAction =
  | { type: 'ADD_MINION'; payload: MinionFormData }
  | { type: 'UPDATE_MINION'; payload: Minion }
  | { type: 'DELETE_MINION'; payload: { id: string } }
  | { type: 'UPDATE_HP'; payload: { id: string; delta: number } }
  | { type: 'SET_MINIONS'; payload: Minion[] }
