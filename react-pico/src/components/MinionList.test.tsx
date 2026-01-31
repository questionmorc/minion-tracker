import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MinionList } from './MinionList'
import type { Minion } from '../types/minion'

describe('MinionList', () => {
  const mockMinions: Minion[] = [
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
    {
      id: '3',
      name: 'Dismissed',
      hp: 5,
      maxHp: 10,
      ac: 12,
      attack: 3,
      damage: '1d4',
      notes: '',
      active: false,
    },
  ]

  it('should render all active minions', () => {
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionList minions={mockMinions} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    expect(screen.getByText('Goblin')).toBeInTheDocument()
    expect(screen.getByText('Orc')).toBeInTheDocument()
    expect(screen.queryByText('Dismissed')).not.toBeInTheDocument()
  })

  it('should show empty state when no active minions', () => {
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionList minions={[]} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    expect(screen.getByText(/no active minions/i)).toBeInTheDocument()
  })
})
