import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders Minion Tracker heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /minion tracker/i })).toBeInTheDocument()
  })

  it('shows spawn form', () => {
    render(<App />)
    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /spawn minion/i })).toBeInTheDocument()
  })

  it('shows empty state initially', () => {
    render(<App />)
    expect(screen.getByText(/no active minions/i)).toBeInTheDocument()
  })

  it('allows spawning a minion', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText(/name/i), 'Goblin')
    await user.type(screen.getByPlaceholderText(/hp/i), '7')
    await user.type(screen.getByPlaceholderText(/ac/i), '13')
    await user.type(screen.getByPlaceholderText(/atk/i), '4')
    await user.type(screen.getByPlaceholderText(/damage/i), '1d6+2')

    await user.click(screen.getByRole('button', { name: /spawn minion/i }))

    expect(screen.getByText('Goblin')).toBeInTheDocument()
    expect(screen.queryByText(/no active minions/i)).not.toBeInTheDocument()
  })

  it('allows adjusting minion HP with custom amount', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Spawn minion
    await user.type(screen.getByPlaceholderText(/name/i), 'Goblin')
    await user.type(screen.getByPlaceholderText(/hp/i), '7')
    await user.type(screen.getByPlaceholderText(/ac/i), '13')
    await user.type(screen.getByPlaceholderText(/atk/i), '4')
    await user.click(screen.getByRole('button', { name: /spawn minion/i }))

    // Click HP to enter adjustment mode
    const hpStat = screen.getByText(/7\/7/).closest('.stat')
    await user.click(hpStat!)

    // Damage by 5
    const amountInput = screen.getByPlaceholderText(/amount/i)
    await user.clear(amountInput)
    await user.type(amountInput, '5')
    await user.click(screen.getByRole('button', { name: /dmg/i }))

    expect(screen.getByText(/2\/7/)).toBeInTheDocument()
  })

  it('allows healing minion HP', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Spawn damaged minion
    await user.type(screen.getByPlaceholderText(/name/i), 'Goblin')
    await user.type(screen.getByPlaceholderText(/hp/i), '7')
    await user.type(screen.getByPlaceholderText(/ac/i), '13')
    await user.type(screen.getByPlaceholderText(/atk/i), '4')
    await user.click(screen.getByRole('button', { name: /spawn minion/i }))

    // Damage first
    let hpStat = screen.getByText(/7\/7/).closest('.stat')
    await user.click(hpStat!)
    let amountInput = screen.getByPlaceholderText(/amount/i)
    await user.clear(amountInput)
    await user.type(amountInput, '3')
    await user.click(screen.getByRole('button', { name: /dmg/i }))

    // Then heal
    hpStat = screen.getByText(/4\/7/).closest('.stat')
    await user.click(hpStat!)
    amountInput = screen.getByPlaceholderText(/amount/i)
    await user.clear(amountInput)
    await user.type(amountInput, '2')
    await user.click(screen.getByRole('button', { name: /heal/i }))

    expect(screen.getByText(/6\/7/)).toBeInTheDocument()
  })

  it('allows dismissing a minion', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Spawn minion
    await user.type(screen.getByPlaceholderText(/name/i), 'Goblin')
    await user.type(screen.getByPlaceholderText(/hp/i), '7')
    await user.type(screen.getByPlaceholderText(/ac/i), '13')
    await user.type(screen.getByPlaceholderText(/atk/i), '4')
    await user.click(screen.getByRole('button', { name: /spawn minion/i }))

    // Dismiss minion
    await user.click(screen.getByRole('button', { name: /dismiss/i }))

    expect(screen.queryByText('Goblin')).not.toBeInTheDocument()
    expect(screen.getByText(/no active minions/i)).toBeInTheDocument()
  })

  it('shows low HP warning when HP is at or below half', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Spawn minion
    await user.type(screen.getByPlaceholderText(/name/i), 'Goblin')
    await user.type(screen.getByPlaceholderText(/hp/i), '10')
    await user.type(screen.getByPlaceholderText(/ac/i), '13')
    await user.type(screen.getByPlaceholderText(/atk/i), '4')
    await user.click(screen.getByRole('button', { name: /spawn minion/i }))

    // Damage to 5 (half HP)
    const hpStat = screen.getByText(/10\/10/).closest('.stat')
    await user.click(hpStat!)
    const amountInput = screen.getByPlaceholderText(/amount/i)
    await user.clear(amountInput)
    await user.type(amountInput, '5')
    await user.click(screen.getByRole('button', { name: /dmg/i }))

    // Close adjustment form to see HP stat
    await user.click(screen.getByRole('button', { name: /✕/i }))

    const lowHpStat = screen.getByText(/5\/10/).closest('.stat')
    expect(lowHpStat?.className).toContain('hp-low')
  })
})
