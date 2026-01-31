import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should initialize with default value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))

    expect(result.current[0]).toBe('default')
  })

  it('should load value from localStorage if available', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'))

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))

    expect(result.current[0]).toBe('stored-value')
  })

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('updated')
    })

    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'))
    expect(result.current[0]).toBe('updated')
  })

  it('should handle complex objects', () => {
    const initialValue = { name: 'Goblin', hp: 7 }
    const { result } = renderHook(() => useLocalStorage('test-key', initialValue))

    expect(result.current[0]).toEqual(initialValue)

    const updatedValue = { name: 'Orc', hp: 15 }
    act(() => {
      result.current[1](updatedValue)
    })

    expect(result.current[0]).toEqual(updatedValue)
    expect(JSON.parse(localStorage.getItem('test-key')!)).toEqual(updatedValue)
  })
})
