import { describe, it, expect } from 'vitest'
import { minionReducer } from './minionReducer'
import type { Minion } from '../types/minion'

describe('minionReducer', () => {
  it('should add a new minion', () => {
    const initialState: Minion[] = []
    const action = {
      type: 'ADD_MINION' as const,
      payload: {
        name: 'Goblin',
        hp: 7,
        ac: 13,
        attack: 4,
        damage: '1d6+2',
        notes: 'Sneaky',
      },
    }

    const newState = minionReducer(initialState, action)

    expect(newState).toHaveLength(1)
    expect(newState[0].name).toBe('Goblin')
    expect(newState[0].hp).toBe(7)
    expect(newState[0].maxHp).toBe(7)
    expect(newState[0].active).toBe(true)
    expect(newState[0].id).toBeDefined()
  })

  it('should update minion HP with bounds checking', () => {
    const initialState: Minion[] = [
      {
        id: '1',
        name: 'Goblin',
        hp: 7,
        maxHp: 7,
        ac: 13,
        attack: 4,
        damage: '1d6+2',
        notes: '',
        active: true,
      },
    ]

    const action = {
      type: 'UPDATE_HP' as const,
      payload: { id: '1', delta: -5 },
    }

    const newState = minionReducer(initialState, action)

    expect(newState[0].hp).toBe(2)
  })

  it('should not allow HP to go below 0', () => {
    const initialState: Minion[] = [
      {
        id: '1',
        name: 'Goblin',
        hp: 3,
        maxHp: 7,
        ac: 13,
        attack: 4,
        damage: '1d6+2',
        notes: '',
        active: true,
      },
    ]

    const action = {
      type: 'UPDATE_HP' as const,
      payload: { id: '1', delta: -10 },
    }

    const newState = minionReducer(initialState, action)

    expect(newState[0].hp).toBe(0)
  })

  it('should not allow HP to exceed maxHp', () => {
    const initialState: Minion[] = [
      {
        id: '1',
        name: 'Goblin',
        hp: 5,
        maxHp: 7,
        ac: 13,
        attack: 4,
        damage: '1d6+2',
        notes: '',
        active: true,
      },
    ]

    const action = {
      type: 'UPDATE_HP' as const,
      payload: { id: '1', delta: 10 },
    }

    const newState = minionReducer(initialState, action)

    expect(newState[0].hp).toBe(7)
  })

  it('should update minion data', () => {
    const initialState: Minion[] = [
      {
        id: '1',
        name: 'Goblin',
        hp: 7,
        maxHp: 7,
        ac: 13,
        attack: 4,
        damage: '1d6+2',
        notes: '',
        active: true,
      },
    ]

    const action = {
      type: 'UPDATE_MINION' as const,
      payload: {
        id: '1',
        name: 'Hobgoblin',
        hp: 10,
        maxHp: 15,
        ac: 16,
        attack: 5,
        damage: '2d6+2',
        notes: 'Leader',
        active: true,
      },
    }

    const newState = minionReducer(initialState, action)

    expect(newState[0].name).toBe('Hobgoblin')
    expect(newState[0].maxHp).toBe(15)
    expect(newState[0].ac).toBe(16)
  })

  it('should soft delete a minion', () => {
    const initialState: Minion[] = [
      {
        id: '1',
        name: 'Goblin',
        hp: 7,
        maxHp: 7,
        ac: 13,
        attack: 4,
        damage: '1d6+2',
        notes: '',
        active: true,
      },
    ]

    const action = {
      type: 'DELETE_MINION' as const,
      payload: { id: '1' },
    }

    const newState = minionReducer(initialState, action)

    expect(newState[0].active).toBe(false)
  })

  it('should set entire minion list', () => {
    const initialState: Minion[] = []
    const minions: Minion[] = [
      {
        id: '1',
        name: 'Goblin',
        hp: 7,
        maxHp: 7,
        ac: 13,
        attack: 4,
        damage: '1d6+2',
        notes: '',
        active: true,
      },
      {
        id: '2',
        name: 'Orc',
        hp: 15,
        maxHp: 15,
        ac: 13,
        attack: 5,
        damage: '1d12+3',
        notes: '',
        active: true,
      },
    ]

    const action = {
      type: 'SET_MINIONS' as const,
      payload: minions,
    }

    const newState = minionReducer(initialState, action)

    expect(newState).toHaveLength(2)
    expect(newState).toEqual(minions)
  })
})
