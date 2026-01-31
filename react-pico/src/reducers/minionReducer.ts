import type { Minion } from '../types/minion'
import type { MinionAction } from '../types/actions'

export function minionReducer(state: Minion[], action: MinionAction): Minion[] {
  switch (action.type) {
    case 'ADD_MINION': {
      const newMinion: Minion = {
        id: crypto.randomUUID(),
        ...action.payload,
        maxHp: action.payload.hp,
        active: true,
      }
      return [...state, newMinion]
    }
    case 'UPDATE_HP': {
      return state.map((minion) => {
        if (minion.id !== action.payload.id) return minion
        const newHp = minion.hp + action.payload.delta
        return {
          ...minion,
          hp: Math.max(0, Math.min(newHp, minion.maxHp)),
        }
      })
    }
    case 'UPDATE_MINION': {
      return state.map((minion) =>
        minion.id === action.payload.id ? action.payload : minion
      )
    }
    case 'DELETE_MINION': {
      return state.map((minion) =>
        minion.id === action.payload.id
          ? { ...minion, active: false }
          : minion
      )
    }
    case 'SET_MINIONS': {
      return action.payload
    }
    default:
      return state
  }
}
