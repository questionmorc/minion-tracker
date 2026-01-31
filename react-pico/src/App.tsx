import { MinionProvider, useMinions } from './context/MinionContext'
import { MinionForm } from './components/MinionForm'
import { MinionList } from './components/MinionList'

function MinionTracker() {
  const { minions, addMinion, updateMinion, deleteMinion, updateHP } = useMinions()

  return (
    <main className="container">
      <h1>Minion Tracker</h1>

      <section id="spawn-form">
        <MinionForm onSubmit={addMinion} />
      </section>

      <section id="minion-list">
        <MinionList
          minions={minions}
          onUpdate={updateMinion}
          onDelete={deleteMinion}
          onHPChange={updateHP}
        />
      </section>
    </main>
  )
}

export default function App() {
  return (
    <MinionProvider>
      <MinionTracker />
    </MinionProvider>
  )
}
