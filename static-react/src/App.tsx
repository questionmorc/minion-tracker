import { MinionProvider, useMinions } from './context/MinionContext'
import { MinionForm } from './components/MinionForm'
import { MinionList } from './components/MinionList'

function MinionTracker() {
  const { minions, addMinion, updateMinion, deleteMinion, updateHP } = useMinions()

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Minion Tracker</h1>

        <MinionForm onSubmit={addMinion} />

        <MinionList
          minions={minions}
          onUpdate={updateMinion}
          onDelete={deleteMinion}
          onHPChange={updateHP}
        />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <MinionProvider>
      <MinionTracker />
    </MinionProvider>
  )
}
