import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MinionProvider, useMinions } from './MinionContext'
import type { ReactNode } from 'react'

describe('MinionContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <MinionProvider>{children}</MinionProvider>
  )

  it('should start with empty minion list', () => {
    const { result } = renderHook(() => useMinions(), { wrapper })

    expect(result.current.minions).toEqual([])
  })

  it('should add a minion', () => {
    const { result } = renderHook(() => useMinions(), { wrapper })

    act(() => {
      result.current.addMinion({
        name: 'Goblin',
        hp: 7,
        ac: 13,
        attack: 4,
        damage: '1d6+2',
        notes: '',
      })
    })

    expect(result.current.minions).toHaveLength(1)
    expect(result.current.minions[0].name).toBe('Goblin')
  })

  it('should update minion HP', () => {
    const { result } = renderHook(() => useMinions(), { wrapper })

    act(() => {
      result.current.addMinion({
        name: 'Goblin',
        hp: 7,
        ac: 13,
        attack: 4,
        damage: '1d6+2',
        notes: '',
      })
    })

    const minionId = result.current.minions[0].id

    act(() => {
      result.current.updateHP(minionId, -3)
    })

    expect(result.current.minions[0].hp).toBe(4)
  })

  it('should delete a minion', () => {
    const { result } = renderHook(() => useMinions(), { wrapper })

    act(() => {
      result.current.addMinion({
        name: 'Goblin',
        hp: 7,
        ac: 13,
        attack: 4,
        damage: '1d6+2',
        notes: '',
      })
    })

    const minionId = result.current.minions[0].id

    act(() => {
      result.current.deleteMinion(minionId)
    })

    expect(result.current.minions[0].active).toBe(false)
  })
})
