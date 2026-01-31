import { MinionCard } from './MinionCard'
import type { Minion } from '../types/minion'

interface MinionListProps {
  minions: Minion[]
  onUpdate: (minion: Minion) => void
  onDelete: (id: string) => void
  onHPChange: (id: string, delta: number) => void
}

export function MinionList({ minions, onUpdate, onDelete, onHPChange }: MinionListProps) {
  const activeMinions = minions.filter(m => m.active)

  if (activeMinions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--pico-muted-color)' }}>
        <p>No active minions</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Spawn a minion using the form above
        </p>
      </div>
    )
  }

  return (
    <div>
      {activeMinions.map((minion) => (
        <MinionCard
          key={minion.id}
          minion={minion}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onHPChange={onHPChange}
        />
      ))}
    </div>
  )
}
