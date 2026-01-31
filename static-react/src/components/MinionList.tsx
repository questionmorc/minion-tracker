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
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No active minions</p>
        <p className="text-sm mt-2">Spawn a minion using the form above</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
