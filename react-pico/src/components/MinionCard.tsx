import { useState, useRef, useEffect } from 'react'
import type { Minion } from '../types/minion'

interface MinionCardProps {
  minion: Minion
  onUpdate: (minion: Minion) => void
  onDelete: (id: string) => void
  onHPChange: (id: string, delta: number) => void
}

export function MinionCard({ minion, onDelete, onHPChange }: MinionCardProps) {
  const [isAdjustingHP, setIsAdjustingHP] = useState(false)
  const [hpAmount, setHpAmount] = useState<number>(1)
  const amountInputRef = useRef<HTMLInputElement>(null)

  const isLowHP = minion.hp <= minion.maxHp / 2

  useEffect(() => {
    if (isAdjustingHP && amountInputRef.current) {
      amountInputRef.current.focus()
    }
  }, [isAdjustingHP])

  const handleHeal = () => {
    if (hpAmount > 0) {
      onHPChange(minion.id, hpAmount)
    }
  }

  const handleDamage = () => {
    if (hpAmount > 0) {
      onHPChange(minion.id, -hpAmount)
    }
  }

  const handleCancel = () => {
    setIsAdjustingHP(false)
    setHpAmount(1)
  }

  return (
    <div className="minion-row">
      <div className="stats">
        <div className="stat">
          <strong>Name</strong> {minion.name}
        </div>
        <div
          className={`stat ${isLowHP ? 'hp-low' : ''} ${!isAdjustingHP ? 'hp-stat' : ''}`}
          onClick={() => !isAdjustingHP && setIsAdjustingHP(true)}
        >
          <strong>HP</strong> {minion.hp}/{minion.maxHp}
          {isAdjustingHP && (
            <form className="hp-adjust-form" onSubmit={(e) => e.preventDefault()}>
              <input
                ref={amountInputRef}
                type="number"
                min="1"
                placeholder="Amount"
                value={hpAmount || ''}
                onChange={(e) => setHpAmount(parseInt(e.target.value) || 0)}
              />
              <button type="button" onClick={handleHeal}>Heal</button>
              <button type="button" onClick={handleDamage}>Dmg</button>
              <button type="button" className="outline secondary" onClick={handleCancel}>✕</button>
            </form>
          )}
        </div>
        <div className="stat">
          <strong>AC</strong> {minion.ac}
        </div>
        <div className="stat">
          <strong>Atk</strong> +{minion.attack}
        </div>
        <div className="stat">
          <strong>Dmg</strong> {minion.damage}
        </div>
        {minion.notes && (
          <div className="stat">
            <strong>Notes</strong> {minion.notes}
          </div>
        )}
      </div>
      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
        <button
          className="outline secondary"
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
          onClick={() => onDelete(minion.id)}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
