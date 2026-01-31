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
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /spawn minion/i })).toBeInTheDocument()
  })

  it('shows empty state initially', () => {
    render(<App />)
    expect(screen.getByText(/no active minions/i)).toBeInTheDocument()
  })

  it('allows spawning a minion', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('Name'), 'Goblin')
    await user.type(screen.getByPlaceholderText('HP'), '7')
    await user.type(screen.getByPlaceholderText('AC'), '13')
    await user.type(screen.getByPlaceholderText('Attack'), '4')
    await user.type(screen.getByPlaceholderText(/damage \(e\.g\./i), '1d6+2')

    await user.click(screen.getByRole('button', { name: /spawn minion/i }))

    expect(screen.getByText('Goblin')).toBeInTheDocument()
    expect(screen.queryByText(/no active minions/i)).not.toBeInTheDocument()
  })

  it('allows adjusting minion HP', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Spawn minion
    await user.type(screen.getByPlaceholderText('Name'), 'Goblin')
    await user.type(screen.getByPlaceholderText('HP'), '7')
    await user.type(screen.getByPlaceholderText('AC'), '13')
    await user.type(screen.getByPlaceholderText('Attack'), '4')
    await user.click(screen.getByRole('button', { name: /spawn minion/i }))

    // Damage minion
    const damageButton = screen.getByRole('button', { name: /-/i })
    await user.click(damageButton)

    expect(screen.getByText(/6\/7/)).toBeInTheDocument()
  })

  it('allows dismissing a minion', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Spawn minion
    await user.type(screen.getByPlaceholderText('Name'), 'Goblin')
    await user.type(screen.getByPlaceholderText('HP'), '7')
    await user.type(screen.getByPlaceholderText('AC'), '13')
    await user.type(screen.getByPlaceholderText('Attack'), '4')
    await user.click(screen.getByRole('button', { name: /spawn minion/i }))

    // Dismiss minion
    await user.click(screen.getByRole('button', { name: /dismiss/i }))

    expect(screen.queryByText('Goblin')).not.toBeInTheDocument()
    expect(screen.getByText(/no active minions/i)).toBeInTheDocument()
  })
})
