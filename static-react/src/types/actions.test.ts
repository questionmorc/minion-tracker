import { describe, it, expect } from 'vitest'
import type { MinionAction } from './actions'

describe('MinionAction types', () => {
  it('should accept ADD_MINION action', () => {
    const action: MinionAction = {
      type: 'ADD_MINION',
      payload: {
        name: 'Goblin',
        hp: 7,
        ac: 13,
        attack: 4,
        damage: '1d6+2',
        notes: '',
      },
    }

    expect(action.type).toBe('ADD_MINION')
  })

  it('should accept UPDATE_HP action', () => {
    const action: MinionAction = {
      type: 'UPDATE_HP',
      payload: { id: '1', delta: -5 },
    }

    expect(action.type).toBe('UPDATE_HP')
    expect(action.payload.delta).toBe(-5)
  })
})
