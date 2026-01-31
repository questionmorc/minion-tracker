import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MinionForm } from './MinionForm'

describe('MinionForm', () => {
  it('should render all form fields', () => {
    const onSubmit = vi.fn()
    render(<MinionForm onSubmit={onSubmit} />)

    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/hp/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/ac/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/atk/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/damage/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /spawn minion/i })).toBeInTheDocument()
  })

  it('should show notes field in details element', () => {
    const onSubmit = vi.fn()
    render(<MinionForm onSubmit={onSubmit} />)

    const summary = screen.getByText(/notes/i)
    expect(summary.tagName).toBe('SUMMARY')
  })

  it('should call onSubmit with form data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<MinionForm onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText(/name/i), 'Goblin')
    await user.type(screen.getByPlaceholderText(/hp/i), '7')
    await user.type(screen.getByPlaceholderText(/ac/i), '13')
    await user.type(screen.getByPlaceholderText(/atk/i), '4')
    await user.type(screen.getByPlaceholderText(/damage/i), '1d6+2')

    await user.click(screen.getByRole('button', { name: /spawn minion/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Goblin',
      hp: 7,
      ac: 13,
      attack: 4,
      damage: '1d6+2',
      notes: '',
    })
  })

  it('should reset form after submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<MinionForm onSubmit={onSubmit} />)

    const nameInput = screen.getByPlaceholderText(/name/i) as HTMLInputElement
    await user.type(nameInput, 'Goblin')
    await user.type(screen.getByPlaceholderText(/hp/i), '7')
    await user.type(screen.getByPlaceholderText(/ac/i), '13')
    await user.type(screen.getByPlaceholderText(/atk/i), '4')

    await user.click(screen.getByRole('button', { name: /spawn minion/i }))

    expect(nameInput.value).toBe('')
  })
})
