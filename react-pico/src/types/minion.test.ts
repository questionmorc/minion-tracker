import { describe, it, expect } from 'vitest'
import type { Minion } from './minion'

describe('Minion type', () => {
  it('should accept valid minion object', () => {
    const minion: Minion = {
      id: '1',
      name: 'Goblin',
      hp: 7,
      maxHp: 7,
      ac: 13,
      attack: 4,
      damage: '1d6+2',
      notes: 'Sneaky',
      active: true,
    }

    expect(minion.id).toBe('1')
    expect(minion.name).toBe('Goblin')
    expect(minion.hp).toBe(7)
  })
})
