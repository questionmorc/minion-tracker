import { useState, type FormEvent } from 'react'
import type { MinionFormData } from '../types/minion'

interface MinionFormProps {
  onSubmit: (data: MinionFormData) => void
}

export function MinionForm({ onSubmit }: MinionFormProps) {
  const [formData, setFormData] = useState<MinionFormData>({
    name: '',
    hp: 0,
    ac: 0,
    attack: 0,
    damage: '',
    notes: '',
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      name: '',
      hp: 0,
      ac: 0,
      attack: 0,
      damage: '',
      notes: '',
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset role="group">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="number"
          name="hp"
          placeholder="HP"
          value={formData.hp || ''}
          onChange={(e) => setFormData({ ...formData, hp: parseInt(e.target.value) || 0 })}
          required
          style={{ width: '5rem' }}
        />
        <input
          type="number"
          name="ac"
          placeholder="AC"
          value={formData.ac || ''}
          onChange={(e) => setFormData({ ...formData, ac: parseInt(e.target.value) || 0 })}
          required
          style={{ width: '5rem' }}
        />
        <input
          type="number"
          name="attack"
          placeholder="Atk"
          value={formData.attack || ''}
          onChange={(e) => setFormData({ ...formData, attack: parseInt(e.target.value) || 0 })}
          required
          style={{ width: '5rem' }}
        />
        <input
          type="text"
          name="damage"
          placeholder="Damage (e.g. 1d6+3)"
          value={formData.damage}
          onChange={(e) => setFormData({ ...formData, damage: e.target.value })}
          style={{ width: '10rem' }}
        />
      </fieldset>
      <details>
        <summary>Notes</summary>
        <textarea
          name="notes"
          placeholder="Special abilities, resistances, etc."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </details>
      <button type="submit">Spawn Minion</button>
    </form>
  )
}
