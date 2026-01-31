import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MinionCard } from './MinionCard'
import type { Minion } from '../types/minion'

describe('MinionCard', () => {
  const mockMinion: Minion = {
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

  it('should render minion stats', () => {
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionCard minion={mockMinion} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    expect(screen.getByText('Goblin')).toBeInTheDocument()
    expect(screen.getByText(/7\/7/)).toBeInTheDocument()
    expect(screen.getByText(/13/)).toBeInTheDocument()
    expect(screen.getByText(/\+4/)).toBeInTheDocument()
    expect(screen.getByText('1d6+2')).toBeInTheDocument()
    expect(screen.getByText('Sneaky')).toBeInTheDocument()
  })

  it('should show low HP warning when HP is at or below half', () => {
    const lowHpMinion = { ...mockMinion, hp: 3 }
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionCard minion={lowHpMinion} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    const hpText = screen.getByText(/3\/7/)
    expect(hpText.className).toContain('text-red-600')
  })

  it('should call onDelete when dismiss button clicked', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionCard minion={mockMinion} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    await user.click(screen.getByRole('button', { name: /dismiss/i }))

    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('should call onHPChange when heal button clicked', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionCard minion={mockMinion} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    await user.click(screen.getByRole('button', { name: /\+/i }))

    expect(onHPChange).toHaveBeenCalledWith('1', 1)
  })

  it('should call onHPChange when damage button clicked', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionCard minion={mockMinion} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    await user.click(screen.getByRole('button', { name: /-/i }))

    expect(onHPChange).toHaveBeenCalledWith('1', -1)
  })
})
