import type { Minion } from '../types/minion'

interface MinionCardProps {
  minion: Minion
  onUpdate: (minion: Minion) => void
  onDelete: (id: string) => void
  onHPChange: (id: string, delta: number) => void
}

export function MinionCard({ minion, onDelete, onHPChange }: MinionCardProps) {
  const isLowHP = minion.hp <= minion.maxHp / 2

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex flex-wrap gap-4 mb-3">
        <div className="flex-1 min-w-[120px]">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Name</div>
          <div className="text-lg font-bold text-gray-900">{minion.name}</div>
        </div>
        <div className="min-w-[80px]">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">HP</div>
          <div className={`text-lg font-bold ${isLowHP ? 'text-red-600' : 'text-gray-900'}`}>
            {minion.hp}/{minion.maxHp}
          </div>
        </div>
        <div className="min-w-[60px]">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">AC</div>
          <div className="text-lg font-bold text-gray-900">{minion.ac}</div>
        </div>
        <div className="min-w-[60px]">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Atk</div>
          <div className="text-lg font-bold text-gray-900">+{minion.attack}</div>
        </div>
        <div className="min-w-[100px]">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Dmg</div>
          <div className="text-lg font-bold text-gray-900">{minion.damage}</div>
        </div>
      </div>

      {minion.notes && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</div>
          <div className="text-sm text-gray-700">{minion.notes}</div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onHPChange(minion.id, 1)}
          className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm font-medium"
          title="Heal 1 HP"
        >
          +
        </button>
        <button
          onClick={() => onHPChange(minion.id, -1)}
          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-medium"
          title="Damage 1 HP"
        >
          -
        </button>
        <button
          onClick={() => onDelete(minion.id)}
          className="ml-auto px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
