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
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="HP"
          value={formData.hp || ''}
          onChange={(e) => setFormData({ ...formData, hp: parseInt(e.target.value) || 0 })}
          required
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="AC"
          value={formData.ac || ''}
          onChange={(e) => setFormData({ ...formData, ac: parseInt(e.target.value) || 0 })}
          required
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Attack"
          value={formData.attack || ''}
          onChange={(e) => setFormData({ ...formData, attack: parseInt(e.target.value) || 0 })}
          required
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Damage (e.g. 1d6+2)"
          value={formData.damage}
          onChange={(e) => setFormData({ ...formData, damage: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
        />
      </div>
      <textarea
        placeholder="Notes (special abilities, resistances, etc.)"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        rows={2}
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
      >
        Spawn Minion
      </button>
    </form>
  )
}
