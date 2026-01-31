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

    const hpStat = screen.getByText(/3\/7/).closest('.stat')
    expect(hpStat?.className).toContain('hp-low')
  })

  it('should show HP adjustment form when HP stat clicked', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionCard minion={mockMinion} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    const hpStat = screen.getByText(/7\/7/).closest('.stat')
    await user.click(hpStat!)

    expect(screen.getByPlaceholderText(/amount/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /heal/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dmg/i })).toBeInTheDocument()
  })

  it('should call onHPChange with positive amount when Heal clicked', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionCard minion={mockMinion} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    const hpStat = screen.getByText(/7\/7/).closest('.stat')
    await user.click(hpStat!)

    const amountInput = screen.getByPlaceholderText(/amount/i)
    await user.clear(amountInput)
    await user.type(amountInput, '5')
    await user.click(screen.getByRole('button', { name: /heal/i }))

    expect(onHPChange).toHaveBeenCalledWith('1', 5)
  })

  it('should call onHPChange with negative amount when Dmg clicked', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionCard minion={mockMinion} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    const hpStat = screen.getByText(/7\/7/).closest('.stat')
    await user.click(hpStat!)

    const amountInput = screen.getByPlaceholderText(/amount/i)
    await user.clear(amountInput)
    await user.type(amountInput, '3')
    await user.click(screen.getByRole('button', { name: /dmg/i }))

    expect(onHPChange).toHaveBeenCalledWith('1', -3)
  })

  it('should hide adjustment form when cancel clicked', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionCard minion={mockMinion} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    const hpStat = screen.getByText(/7\/7/).closest('.stat')
    await user.click(hpStat!)

    expect(screen.getByPlaceholderText(/amount/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /✕/i }))

    expect(screen.queryByPlaceholderText(/amount/i)).not.toBeInTheDocument()
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
})
