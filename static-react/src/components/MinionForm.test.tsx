import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MinionForm } from './MinionForm'

describe('MinionForm', () => {
  it('should render all form fields', () => {
    const onSubmit = vi.fn()
    render(<MinionForm onSubmit={onSubmit} />)

    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('HP')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('AC')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Attack')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/damage \(e\.g\./i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/notes \(special/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /spawn minion/i })).toBeInTheDocument()
  })

  it('should call onSubmit with form data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<MinionForm onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText('Name'), 'Goblin')
    await user.type(screen.getByPlaceholderText('HP'), '7')
    await user.type(screen.getByPlaceholderText('AC'), '13')
    await user.type(screen.getByPlaceholderText('Attack'), '4')
    await user.type(screen.getByPlaceholderText(/damage \(e\.g\./i), '1d6+2')

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

    const nameInput = screen.getByPlaceholderText('Name') as HTMLInputElement
    await user.type(nameInput, 'Goblin')
    await user.type(screen.getByPlaceholderText('HP'), '7')
    await user.type(screen.getByPlaceholderText('AC'), '13')
    await user.type(screen.getByPlaceholderText('Attack'), '4')

    await user.click(screen.getByRole('button', { name: /spawn minion/i }))

    expect(nameInput.value).toBe('')
  })
})
