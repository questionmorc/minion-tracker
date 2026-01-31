# Pico CSS Conversion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the React + Tailwind app to use Pico CSS with semantic HTML, matching agent1's visual design while maintaining React architecture and TDD practices.

**Architecture:** Replace Tailwind CSS with Pico CSS v2 from CDN. Restructure components to use semantic HTML (fieldset, details, etc.). Add click-to-adjust HP pattern with local component state. Maintain Context + useReducer state management and localStorage persistence.

**Tech Stack:** React 18, TypeScript 5, Vite 5, Pico CSS 2, Vitest, React Testing Library, Playwright.

---

### Task 1: Remove Tailwind CSS

**Files:**
- Modify: `package.json`
- Delete: `tailwind.config.js`
- Delete: `postcss.config.js`
- Modify: `vite.config.ts`

**Step 1: Uninstall Tailwind dependencies**

Run:
```bash
npm uninstall tailwindcss @tailwindcss/postcss autoprefixer postcss
```
Expected: Dependencies removed from package.json, node_modules updated.

**Step 2: Delete Tailwind config files**

Run:
```bash
rm tailwind.config.js postcss.config.js
```
Expected: Config files deleted.

**Step 3: Verify vite.config is clean**

Run:
```bash
cat vite.config.ts
```
Expected: No Tailwind-specific plugins (just React plugin).

**Step 4: Verify build still works**

Run:
```bash
npm run build
```
Expected: Build completes (components will look unstyled, that's OK).

**Step 5: Commit**

Run:
```bash
git add .
git commit -m "chore: remove tailwind css dependencies and config"
```

---

### Task 2: Add Pico CSS and Custom Styles

**Files:**
- Modify: `src/index.css`
- Modify: `index.html`

**Step 1: Replace index.css content**

Modify `src/index.css`:
```css
@import url('https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css');

/* Custom styles for minion cards */
.minion-row {
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  transition: box-shadow 0.2s ease;
}

.minion-row:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.minion-row .stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.minion-row .stat {
  font-size: 0.9rem;
}

.minion-row .stat strong {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--pico-muted-color);
}

.hp-low {
  color: var(--pico-del-color);
}

.hp-stat {
  cursor: pointer;
  user-select: none;
}

.hp-stat:hover {
  opacity: 0.8;
}

.hp-adjust-form {
  display: inline-flex;
  gap: 0.25rem;
  align-items: center;
}

.hp-adjust-form input {
  width: 4rem;
  padding: 0.25rem 0.5rem;
  margin: 0;
}

.hp-adjust-form button {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  margin: 0;
}
```

**Step 2: Verify dev server shows Pico styles**

Run:
```bash
npm run dev
```
Expected: Dev server starts, Pico CSS loads (basic styling visible).
Open browser to verify, then stop server with Ctrl+C.

**Step 3: Commit**

Run:
```bash
git add src/index.css
git commit -m "feat: add pico css and custom styles"
```

---

### Task 3: Restructure App Component

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

**Step 1: Update App.test.tsx for semantic queries**

Modify `src/App.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders Minion Tracker heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /minion tracker/i })).toBeInTheDocument()
  })

  it('shows spawn form', () => {
    render(<App />)
    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /spawn minion/i })).toBeInTheDocument()
  })

  it('shows empty state initially', () => {
    render(<App />)
    expect(screen.getByText(/no active minions/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run tests to verify they still pass**

Run:
```bash
npm run test:run
```
Expected: Tests pass (queries are already semantic).

**Step 3: Update App.tsx to use Pico container**

Modify `src/App.tsx`:
```tsx
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
```

**Step 4: Run tests to verify they pass**

Run:
```bash
npm run test:run
```
Expected: All tests pass.

**Step 5: Verify in browser**

Run:
```bash
npm run dev
```
Expected: Basic Pico layout visible.
Stop server with Ctrl+C.

**Step 6: Commit**

Run:
```bash
git add src/App.tsx src/App.test.tsx
git commit -m "refactor: simplify app component for pico css"
```

---

### Task 4: Restructure MinionForm Component

**Files:**
- Modify: `src/components/MinionForm.tsx`
- Modify: `src/components/MinionForm.test.tsx`

**Step 1: Update MinionForm.test.tsx**

Modify `src/components/MinionForm.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MinionForm } from './MinionForm'

describe('MinionForm', () => {
  it('should render all form fields', () => {
    const onSubmit = vi.fn()
    render(<MinionForm onSubmit={onSubmit} />)

    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/hp/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/ac/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/atk/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/damage/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /spawn minion/i })).toBeInTheDocument()
  })

  it('should show notes field in details element', () => {
    const onSubmit = vi.fn()
    render(<MinionForm onSubmit={onSubmit} />)

    const summary = screen.getByText(/notes/i)
    expect(summary.tagName).toBe('SUMMARY')
  })

  it('should call onSubmit with form data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<MinionForm onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText(/name/i), 'Goblin')
    await user.type(screen.getByPlaceholderText(/hp/i), '7')
    await user.type(screen.getByPlaceholderText(/ac/i), '13')
    await user.type(screen.getByPlaceholderText(/atk/i), '4')
    await user.type(screen.getByPlaceholderText(/damage/i), '1d6+2')

    await user.click(screen.getByRole('button', { name: /spawn minion/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Goblin',
      hp: 7,
      ac: 13,
      attack: 4,
      damage: '1d6+2',
      notes: '',
    })
  })

  it('should reset form after submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<MinionForm onSubmit={onSubmit} />)

    const nameInput = screen.getByPlaceholderText(/name/i) as HTMLInputElement
    await user.type(nameInput, 'Goblin')
    await user.click(screen.getByRole('button', { name: /spawn minion/i }))

    expect(nameInput.value).toBe('')
  })
})
```

**Step 2: Run tests to verify they fail**

Run:
```bash
npm run test:run
```
Expected: FAIL - Tests for details/summary and placeholder changes fail.

**Step 3: Restructure MinionForm component**

Modify `src/components/MinionForm.tsx`:
```tsx
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
```

**Step 4: Run tests to verify they pass**

Run:
```bash
npm run test:run
```
Expected: All tests pass.

**Step 5: Verify in browser**

Run:
```bash
npm run dev
```
Expected: Form displays with Pico styling, horizontal fieldset layout, collapsible notes.
Stop server with Ctrl+C.

**Step 6: Commit**

Run:
```bash
git add src/components/MinionForm.tsx src/components/MinionForm.test.tsx
git commit -m "refactor: restructure minion form with semantic html"
```

---

### Task 5: Add HP Adjustment State to MinionCard

**Files:**
- Modify: `src/components/MinionCard.tsx`
- Modify: `src/components/MinionCard.test.tsx`

**Step 1: Write failing tests for HP adjustment**

Modify `src/components/MinionCard.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MinionCard } from './MinionCard'
import type { Minion } from '../types/minion'

describe('MinionCard', () => {
  const mockMinion: Minion = {
    id: '1',
    name: 'Goblin',
    hp: 7,
    maxHp: 7,
    ac: 13,
    attack: 4,
    damage: '1d6+2',
    notes: 'Sneaky',
    active: true,
  }

  it('should render minion stats', () => {
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionCard minion={mockMinion} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    expect(screen.getByText('Goblin')).toBeInTheDocument()
    expect(screen.getByText(/7\/7/)).toBeInTheDocument()
    expect(screen.getByText(/13/)).toBeInTheDocument()
    expect(screen.getByText(/\+4/)).toBeInTheDocument()
    expect(screen.getByText('1d6+2')).toBeInTheDocument()
    expect(screen.getByText('Sneaky')).toBeInTheDocument()
  })

  it('should show low HP warning when HP is at or below half', () => {
    const lowHpMinion = { ...mockMinion, hp: 3 }
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionCard minion={lowHpMinion} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    const hpStat = screen.getByText(/3\/7/).closest('.stat')
    expect(hpStat?.className).toContain('hp-low')
  })

  it('should show HP adjustment form when HP stat clicked', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionCard minion={mockMinion} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    const hpStat = screen.getByText(/7\/7/).closest('.stat')
    await user.click(hpStat!)

    expect(screen.getByPlaceholderText(/amount/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /heal/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dmg/i })).toBeInTheDocument()
  })

  it('should call onHPChange with positive amount when Heal clicked', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionCard minion={mockMinion} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    const hpStat = screen.getByText(/7\/7/).closest('.stat')
    await user.click(hpStat!)

    const amountInput = screen.getByPlaceholderText(/amount/i)
    await user.type(amountInput, '5')
    await user.click(screen.getByRole('button', { name: /heal/i }))

    expect(onHPChange).toHaveBeenCalledWith('1', 5)
  })

  it('should call onHPChange with negative amount when Dmg clicked', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionCard minion={mockMinion} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    const hpStat = screen.getByText(/7\/7/).closest('.stat')
    await user.click(hpStat!)

    const amountInput = screen.getByPlaceholderText(/amount/i)
    await user.type(amountInput, '3')
    await user.click(screen.getByRole('button', { name: /dmg/i }))

    expect(onHPChange).toHaveBeenCalledWith('1', -3)
  })

  it('should hide adjustment form when cancel clicked', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionCard minion={mockMinion} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    const hpStat = screen.getByText(/7\/7/).closest('.stat')
    await user.click(hpStat!)

    expect(screen.getByPlaceholderText(/amount/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /✕/i }))

    expect(screen.queryByPlaceholderText(/amount/i)).not.toBeInTheDocument()
  })

  it('should call onDelete when dismiss button clicked', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionCard minion={mockMinion} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    await user.click(screen.getByRole('button', { name: /dismiss/i }))

    expect(onDelete).toHaveBeenCalledWith('1')
  })
})
```

**Step 2: Run tests to verify they fail**

Run:
```bash
npm run test:run
```
Expected: FAIL - HP adjustment tests fail.

**Step 3: Implement MinionCard with HP adjustment**

Modify `src/components/MinionCard.tsx`:
```tsx
import { useState, useRef, useEffect } from 'react'
import type { Minion } from '../types/minion'

interface MinionCardProps {
  minion: Minion
  onUpdate: (minion: Minion) => void
  onDelete: (id: string) => void
  onHPChange: (id: string, delta: number) => void
}

export function MinionCard({ minion, onUpdate, onDelete, onHPChange }: MinionCardProps) {
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
        {isAdjustingHP ? (
          <div className="stat">
            <strong>HP</strong>
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
          </div>
        ) : (
          <div
            className={`stat hp-stat ${isLowHP ? 'hp-low' : ''}`}
            onClick={() => setIsAdjustingHP(true)}
          >
            <strong>HP</strong> {minion.hp}/{minion.maxHp}
          </div>
        )}
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
```

**Step 4: Run tests to verify they pass**

Run:
```bash
npm run test:run
```
Expected: All tests pass.

**Step 5: Verify in browser**

Run:
```bash
npm run dev
```
Expected: Can spawn minions, click HP to adjust, heal/damage works, cancel works.
Stop server with Ctrl+C.

**Step 6: Commit**

Run:
```bash
git add src/components/MinionCard.tsx src/components/MinionCard.test.tsx
git commit -m "feat: add hp adjustment state with click-to-adjust pattern"
```

---

### Task 6: Restructure MinionList Component

**Files:**
- Modify: `src/components/MinionList.tsx`
- Modify: `src/components/MinionList.test.tsx`

**Step 1: Update MinionList.test.tsx**

Modify `src/components/MinionList.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MinionList } from './MinionList'
import type { Minion } from '../types/minion'

describe('MinionList', () => {
  const mockMinions: Minion[] = [
    {
      id: '1',
      name: 'Goblin',
      hp: 7,
      maxHp: 7,
      ac: 13,
      attack: 4,
      damage: '1d6+2',
      notes: '',
      active: true,
    },
    {
      id: '2',
      name: 'Orc',
      hp: 15,
      maxHp: 15,
      ac: 13,
      attack: 5,
      damage: '1d12+3',
      notes: '',
      active: true,
    },
    {
      id: '3',
      name: 'Dismissed',
      hp: 5,
      maxHp: 10,
      ac: 12,
      attack: 3,
      damage: '1d4',
      notes: '',
      active: false,
    },
  ]

  it('should render all active minions', () => {
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionList minions={mockMinions} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    expect(screen.getByText('Goblin')).toBeInTheDocument()
    expect(screen.getByText('Orc')).toBeInTheDocument()
    expect(screen.queryByText('Dismissed')).not.toBeInTheDocument()
  })

  it('should show empty state when no active minions', () => {
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionList minions={[]} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    expect(screen.getByText(/no active minions/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run tests to verify they pass**

Run:
```bash
npm run test:run
```
Expected: Tests pass (no changes needed to test file).

**Step 3: Simplify MinionList component**

Modify `src/components/MinionList.tsx`:
```tsx
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
```

**Step 4: Run tests to verify they pass**

Run:
```bash
npm run test:run
```
Expected: All tests pass.

**Step 5: Verify in browser**

Run:
```bash
npm run dev
```
Expected: Minions display in vertical stack, empty state works.
Stop server with Ctrl+C.

**Step 6: Commit**

Run:
```bash
git add src/components/MinionList.tsx src/components/MinionList.test.tsx
git commit -m "refactor: simplify minion list layout"
```

---

### Task 7: Update App Integration Tests

**Files:**
- Modify: `src/App.test.tsx`

**Step 1: Add comprehensive integration tests**

Modify `src/App.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders Minion Tracker heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /minion tracker/i })).toBeInTheDocument()
  })

  it('shows spawn form', () => {
    render(<App />)
    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /spawn minion/i })).toBeInTheDocument()
  })

  it('shows empty state initially', () => {
    render(<App />)
    expect(screen.getByText(/no active minions/i)).toBeInTheDocument()
  })

  it('allows spawning a minion', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText(/name/i), 'Goblin')
    await user.type(screen.getByPlaceholderText(/hp/i), '7')
    await user.type(screen.getByPlaceholderText(/ac/i), '13')
    await user.type(screen.getByPlaceholderText(/atk/i), '4')
    await user.type(screen.getByPlaceholderText(/damage/i), '1d6+2')

    await user.click(screen.getByRole('button', { name: /spawn minion/i }))

    expect(screen.getByText('Goblin')).toBeInTheDocument()
    expect(screen.queryByText(/no active minions/i)).not.toBeInTheDocument()
  })

  it('allows adjusting minion HP with custom amount', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Spawn minion
    await user.type(screen.getByPlaceholderText(/name/i), 'Goblin')
    await user.type(screen.getByPlaceholderText(/hp/i), '7')
    await user.type(screen.getByPlaceholderText(/ac/i), '13')
    await user.type(screen.getByPlaceholderText(/atk/i), '4')
    await user.click(screen.getByRole('button', { name: /spawn minion/i }))

    // Click HP to enter adjustment mode
    const hpStat = screen.getByText(/7\/7/).closest('.stat')
    await user.click(hpStat!)

    // Damage by 5
    const amountInput = screen.getByPlaceholderText(/amount/i)
    await user.clear(amountInput)
    await user.type(amountInput, '5')
    await user.click(screen.getByRole('button', { name: /dmg/i }))

    expect(screen.getByText(/2\/7/)).toBeInTheDocument()
  })

  it('allows healing minion HP', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Spawn damaged minion
    await user.type(screen.getByPlaceholderText(/name/i), 'Goblin')
    await user.type(screen.getByPlaceholderText(/hp/i), '7')
    await user.type(screen.getByPlaceholderText(/ac/i), '13')
    await user.type(screen.getByPlaceholderText(/atk/i), '4')
    await user.click(screen.getByRole('button', { name: /spawn minion/i }))

    // Damage first
    let hpStat = screen.getByText(/7\/7/).closest('.stat')
    await user.click(hpStat!)
    let amountInput = screen.getByPlaceholderText(/amount/i)
    await user.clear(amountInput)
    await user.type(amountInput, '3')
    await user.click(screen.getByRole('button', { name: /dmg/i }))

    // Then heal
    hpStat = screen.getByText(/4\/7/).closest('.stat')
    await user.click(hpStat!)
    amountInput = screen.getByPlaceholderText(/amount/i)
    await user.clear(amountInput)
    await user.type(amountInput, '2')
    await user.click(screen.getByRole('button', { name: /heal/i }))

    expect(screen.getByText(/6\/7/)).toBeInTheDocument()
  })

  it('allows dismissing a minion', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Spawn minion
    await user.type(screen.getByPlaceholderText(/name/i), 'Goblin')
    await user.type(screen.getByPlaceholderText(/hp/i), '7')
    await user.type(screen.getByPlaceholderText(/ac/i), '13')
    await user.type(screen.getByPlaceholderText(/atk/i), '4')
    await user.click(screen.getByRole('button', { name: /spawn minion/i }))

    // Dismiss minion
    await user.click(screen.getByRole('button', { name: /dismiss/i }))

    expect(screen.queryByText('Goblin')).not.toBeInTheDocument()
    expect(screen.getByText(/no active minions/i)).toBeInTheDocument()
  })

  it('shows low HP warning when HP is at or below half', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Spawn minion
    await user.type(screen.getByPlaceholderText(/name/i), 'Goblin')
    await user.type(screen.getByPlaceholderText(/hp/i), '10')
    await user.type(screen.getByPlaceholderText(/ac/i), '13')
    await user.type(screen.getByPlaceholderText(/atk/i), '4')
    await user.click(screen.getByRole('button', { name: /spawn minion/i }))

    // Damage to 5 (half HP)
    const hpStat = screen.getByText(/10\/10/).closest('.stat')
    await user.click(hpStat!)
    const amountInput = screen.getByPlaceholderText(/amount/i)
    await user.clear(amountInput)
    await user.type(amountInput, '5')
    await user.click(screen.getByRole('button', { name: /dmg/i }))

    // Close adjustment form to see HP stat
    await user.click(screen.getByRole('button', { name: /✕/i }))

    const lowHpStat = screen.getByText(/5\/10/).closest('.stat')
    expect(lowHpStat?.className).toContain('hp-low')
  })
})
```

**Step 2: Run tests to verify they pass**

Run:
```bash
npm run test:run
```
Expected: All tests pass.

**Step 3: Commit**

Run:
```bash
git add src/App.test.tsx
git commit -m "test: add comprehensive integration tests for hp adjustment"
```

---

### Task 8: Install and Configure Playwright

**Files:**
- Modify: `package.json`
- Create: `playwright.config.ts`
- Create: `e2e/minion-tracker.spec.ts`

**Step 1: Install Playwright**

Run:
```bash
npm install -D @playwright/test
npx playwright install
```
Expected: Playwright installed, browsers downloaded.

**Step 2: Add Playwright scripts to package.json**

Modify `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

**Step 3: Create Playwright config**

Create `playwright.config.ts`:
```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

**Step 4: Commit**

Run:
```bash
git add package.json playwright.config.ts
git commit -m "test: configure playwright for e2e testing"
```

---

### Task 9: Write Playwright E2E Tests

**Files:**
- Create: `e2e/minion-tracker.spec.ts`

**Step 1: Create E2E test directory**

Run:
```bash
mkdir -p e2e
```

**Step 2: Write comprehensive E2E tests**

Create `e2e/minion-tracker.spec.ts`:
```ts
import { test, expect } from '@playwright/test'

test.describe('Minion Tracker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('should display app title and empty state', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Minion Tracker')
    await expect(page.getByText('No active minions')).toBeVisible()
  })

  test('should spawn a minion', async ({ page }) => {
    await page.getByPlaceholder('Name').fill('Goblin')
    await page.getByPlaceholder('HP').fill('7')
    await page.getByPlaceholder('AC').fill('13')
    await page.getByPlaceholder('Atk').fill('4')
    await page.getByPlaceholder(/Damage/).fill('1d6+2')

    await page.getByRole('button', { name: 'Spawn Minion' }).click()

    await expect(page.getByText('Goblin')).toBeVisible()
    await expect(page.getByText('7/7')).toBeVisible()
    await expect(page.getByText('No active minions')).not.toBeVisible()
  })

  test('should adjust HP by custom amount', async ({ page }) => {
    // Spawn minion
    await page.getByPlaceholder('Name').fill('Orc')
    await page.getByPlaceholder('HP').fill('15')
    await page.getByPlaceholder('AC').fill('13')
    await page.getByPlaceholder('Atk').fill('5')
    await page.getByRole('button', { name: 'Spawn Minion' }).click()

    // Click HP stat to enter adjustment mode
    await page.getByText('15/15').click()

    // Damage by 7
    await page.getByPlaceholder('Amount').fill('7')
    await page.getByRole('button', { name: 'Dmg' }).click()

    await expect(page.getByText('8/15')).toBeVisible()
  })

  test('should heal damaged minion', async ({ page }) => {
    // Spawn minion
    await page.getByPlaceholder('Name').fill('Goblin')
    await page.getByPlaceholder('HP').fill('10')
    await page.getByPlaceholder('AC').fill('13')
    await page.getByPlaceholder('Atk').fill('4')
    await page.getByRole('button', { name: 'Spawn Minion' }).click()

    // Damage first
    await page.getByText('10/10').click()
    await page.getByPlaceholder('Amount').fill('6')
    await page.getByRole('button', { name: 'Dmg' }).click()

    // Heal
    await page.getByText('4/10').click()
    await page.getByPlaceholder('Amount').fill('3')
    await page.getByRole('button', { name: 'Heal' }).click()

    await expect(page.getByText('7/10')).toBeVisible()
  })

  test('should show low HP warning', async ({ page }) => {
    // Spawn minion
    await page.getByPlaceholder('Name').fill('Goblin')
    await page.getByPlaceholder('HP').fill('10')
    await page.getByPlaceholder('AC').fill('13')
    await page.getByPlaceholder('Atk').fill('4')
    await page.getByRole('button', { name: 'Spawn Minion' }).click()

    // Damage to half HP
    await page.getByText('10/10').click()
    await page.getByPlaceholder('Amount').fill('5')
    await page.getByRole('button', { name: 'Dmg' }).click()
    await page.getByRole('button', { name: '✕' }).click()

    const hpStat = page.locator('.hp-low').filter({ hasText: '5/10' })
    await expect(hpStat).toBeVisible()
  })

  test('should cancel HP adjustment', async ({ page }) => {
    // Spawn minion
    await page.getByPlaceholder('Name').fill('Goblin')
    await page.getByPlaceholder('HP').fill('7')
    await page.getByPlaceholder('AC').fill('13')
    await page.getByPlaceholder('Atk').fill('4')
    await page.getByRole('button', { name: 'Spawn Minion' }).click()

    // Enter adjustment mode
    await page.getByText('7/7').click()
    await expect(page.getByPlaceholder('Amount')).toBeVisible()

    // Cancel
    await page.getByRole('button', { name: '✕' }).click()
    await expect(page.getByPlaceholder('Amount')).not.toBeVisible()
  })

  test('should dismiss a minion', async ({ page }) => {
    // Spawn minion
    await page.getByPlaceholder('Name').fill('Goblin')
    await page.getByPlaceholder('HP').fill('7')
    await page.getByPlaceholder('AC').fill('13')
    await page.getByPlaceholder('Atk').fill('4')
    await page.getByRole('button', { name: 'Spawn Minion' }).click()

    // Dismiss
    await page.getByRole('button', { name: 'Dismiss' }).click()

    await expect(page.getByText('Goblin')).not.toBeVisible()
    await expect(page.getByText('No active minions')).toBeVisible()
  })

  test('should persist minions in localStorage', async ({ page }) => {
    // Spawn minion
    await page.getByPlaceholder('Name').fill('Goblin')
    await page.getByPlaceholder('HP').fill('7')
    await page.getByPlaceholder('AC').fill('13')
    await page.getByPlaceholder('Atk').fill('4')
    await page.getByRole('button', { name: 'Spawn Minion' }).click()

    // Damage minion
    await page.getByText('7/7').click()
    await page.getByPlaceholder('Amount').fill('3')
    await page.getByRole('button', { name: 'Dmg' }).click()

    // Reload page
    await page.reload()

    // Verify persistence
    await expect(page.getByText('Goblin')).toBeVisible()
    await expect(page.getByText('4/7')).toBeVisible()
  })

  test('should use collapsible notes field', async ({ page }) => {
    const detailsElement = page.locator('details')
    await expect(detailsElement).toBeVisible()

    const summary = page.locator('summary', { hasText: 'Notes' })
    await expect(summary).toBeVisible()

    // Expand notes
    await summary.click()
    const notesTextarea = page.getByPlaceholder(/Special abilities/)
    await expect(notesTextarea).toBeVisible()

    // Add notes
    await notesTextarea.fill('Sneaky and fast')

    // Spawn with notes
    await page.getByPlaceholder('Name').fill('Goblin')
    await page.getByPlaceholder('HP').fill('7')
    await page.getByPlaceholder('AC').fill('13')
    await page.getByPlaceholder('Atk').fill('4')
    await page.getByRole('button', { name: 'Spawn Minion' }).click()

    await expect(page.getByText('Sneaky and fast')).toBeVisible()
  })

  test('should handle multiple minions', async ({ page }) => {
    // Spawn first minion
    await page.getByPlaceholder('Name').fill('Goblin')
    await page.getByPlaceholder('HP').fill('7')
    await page.getByPlaceholder('AC').fill('13')
    await page.getByPlaceholder('Atk').fill('4')
    await page.getByRole('button', { name: 'Spawn Minion' }).click()

    // Spawn second minion
    await page.getByPlaceholder('Name').fill('Orc')
    await page.getByPlaceholder('HP').fill('15')
    await page.getByPlaceholder('AC').fill('12')
    await page.getByPlaceholder('Atk').fill('5')
    await page.getByRole('button', { name: 'Spawn Minion' }).click()

    // Verify both visible
    await expect(page.getByText('Goblin')).toBeVisible()
    await expect(page.getByText('Orc')).toBeVisible()

    // Dismiss first
    const dismissButtons = page.getByRole('button', { name: 'Dismiss' })
    await dismissButtons.first().click()

    // Verify only second remains
    await expect(page.getByText('Goblin')).not.toBeVisible()
    await expect(page.getByText('Orc')).toBeVisible()
  })
})
```

**Step 3: Run Playwright tests**

Run:
```bash
npm run test:e2e
```
Expected: All E2E tests pass.

**Step 4: Commit**

Run:
```bash
git add e2e/
git commit -m "test: add comprehensive playwright e2e tests"
```

---

### Task 10: Final Testing and Verification

**Files:**
- None (verification only)

**Step 1: Run full unit test suite**

Run:
```bash
npm run test:run
```
Expected: All unit tests pass.

**Step 2: Run E2E tests**

Run:
```bash
npm run test:e2e
```
Expected: All E2E tests pass.

**Step 3: Build production**

Run:
```bash
npm run build
```
Expected: Clean build with no errors.

**Step 4: Preview production build**

Run:
```bash
npm run preview
```
Expected: App works in production mode.
Stop server with Ctrl+C.

**Step 5: Visual comparison with agent1**

Run agent1 server:
```bash
cd ../agent1
go build -o minion-tracker .
./minion-tracker &
```

Run react-pico dev server:
```bash
cd ../react-pico
npm run dev
```

Manual verification:
1. Open agent1 at localhost:8080
2. Open react-pico at localhost:5173
3. Compare visual layout, colors, spacing
4. Verify HP adjustment pattern matches
5. Verify form layout matches

Stop both servers.

**Step 6: Update README**

Modify `README.md`:
```markdown
# Minion Tracker - React + Pico CSS Implementation

A static React + TypeScript web application for tracking D&D minion stat blocks, styled with Pico CSS to match the Go + HTMX implementation's visual design.

## Features

- ✨ Spawn minions with stats (Name, HP, MaxHP, AC, Attack, Damage, Notes)
- 📊 Display list of active minions
- ❤️ Adjust HP by custom amounts (heal/damage) with bounds checking (0 to MaxHP)
- 🎨 Click-to-adjust HP pattern for clean UI
- 🎯 Visual HP warning when at or below 50%
- 🗑️ Dismiss minions (soft delete)
- 💾 Persistent storage using localStorage

## Tech Stack

- **React 18** - UI library
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool
- **Pico CSS 2** - Classless semantic styling
- **Vitest + React Testing Library** - Unit testing
- **Playwright** - E2E testing
- **localStorage API** - Data persistence

## Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run unit tests
npm test

# Run unit tests once
npm run test:run

# Run E2E tests
npm run test:e2e

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

This project follows Test-Driven Development (TDD):

- **Unit tests** - Vitest + React Testing Library
- **E2E tests** - Playwright
- Full test coverage for all components
- Tests use semantic queries (not class-based)

## Architecture

### State Management

- **Context API + useReducer** - Global state management
- **Custom localStorage hook** - Automatic persistence
- **Reducer pattern** - Predictable state updates

### Components

- `App.tsx` - Root component with Pico container
- `MinionForm.tsx` - Semantic form with fieldset and details elements
- `MinionCard.tsx` - Display minion with click-to-adjust HP
- `MinionList.tsx` - Vertical stack of active minions

### Styling

- **Pico CSS** - Classless semantic HTML styling
- **Custom CSS** - Minion card layout, HP adjustment UI, hover effects
- **Semantic HTML** - fieldset, details, proper button classes

### HP Adjustment Pattern

1. Click HP stat to enter adjustment mode
2. Input field autofocuses for entering amount
3. Click "Heal" to increase HP (bounded by MaxHP)
4. Click "Dmg" to decrease HP (bounded by 0)
5. Click "✕" to cancel and return to display mode
6. Stays in adjustment mode for multiple changes

## Deployment

Deployed to GitHub Pages via GitHub Actions:

1. Push to `static-react-pico` branch
2. GitHub Actions runs tests
3. Builds production bundle
4. Deploys to GitHub Pages

Live site: `https://[username].github.io/minion-tracker/`

## Design Parity

This implementation matches the visual design of the Go + HTMX implementation (agent1) while maintaining React's architecture. Key similarities:

- Same Pico CSS styling and custom CSS
- Identical form layout with fieldset groups
- Matching minion card layout
- Same HP adjustment pattern
- Collapsible notes field

## License

MIT
```

**Step 7: Commit README**

Run:
```bash
git add README.md
git commit -m "docs: update readme for pico css implementation"
```

**Step 8: Final commit and push**

Run:
```bash
git push -u origin static-react-pico
```
Expected: Branch pushed to remote.

---

## Summary

| Task | What it does |
|------|-------------|
| 1 | Remove Tailwind CSS dependencies and config |
| 2 | Add Pico CSS from CDN and custom styles |
| 3 | Restructure App component for Pico container |
| 4 | Restructure MinionForm with semantic HTML (fieldset, details) |
| 5 | Add HP adjustment state to MinionCard with click-to-adjust pattern |
| 6 | Simplify MinionList to vertical stack |
| 7 | Update App integration tests for HP adjustment |
| 8 | Install and configure Playwright |
| 9 | Write comprehensive E2E tests |
| 10 | Final testing, visual comparison, and documentation |

**Total:** 10 tasks following TDD throughout. Each component restructured with tests first. Playwright E2E tests verify full user flows. Visual parity with agent1 achieved.
