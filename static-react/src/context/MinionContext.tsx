import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import { minionReducer } from '../reducers/minionReducer'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Minion, MinionFormData } from '../types/minion'

interface MinionContextValue {
  minions: Minion[]
  addMinion: (data: MinionFormData) => void
  updateMinion: (minion: Minion) => void
  deleteMinion: (id: string) => void
  updateHP: (id: string, delta: number) => void
}

const MinionContext = createContext<MinionContextValue | undefined>(undefined)

export function MinionProvider({ children }: { children: ReactNode }) {
  const [storedMinions, setStoredMinions] = useLocalStorage<Minion[]>('minions', [])
  const [minions, dispatch] = useReducer(minionReducer, storedMinions)

  useEffect(() => {
    setStoredMinions(minions)
  }, [minions, setStoredMinions])

  const addMinion = (data: MinionFormData) => {
    dispatch({ type: 'ADD_MINION', payload: data })
  }

  const updateMinion = (minion: Minion) => {
    dispatch({ type: 'UPDATE_MINION', payload: minion })
  }

  const deleteMinion = (id: string) => {
    dispatch({ type: 'DELETE_MINION', payload: { id } })
  }

  const updateHP = (id: string, delta: number) => {
    dispatch({ type: 'UPDATE_HP', payload: { id, delta } })
  }

  return (
    <MinionContext.Provider
      value={{ minions, addMinion, updateMinion, deleteMinion, updateHP }}
    >
      {children}
    </MinionContext.Provider>
  )
}

export function useMinions() {
  const context = useContext(MinionContext)
  if (!context) {
    throw new Error('useMinions must be used within MinionProvider')
  }
  return context
}
