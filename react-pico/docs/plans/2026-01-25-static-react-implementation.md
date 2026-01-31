# Static React Minion Tracker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static React + TypeScript web app for tracking D&D minion stat blocks, deployable to GitHub Pages with localStorage persistence.

**Architecture:** Single-page React app using Context + useReducer for state management. Custom hook syncs state to localStorage. Vite for build tooling. TDD approach with Vitest and React Testing Library.

**Tech Stack:** React 18, TypeScript 5, Vite 5, Tailwind CSS 4, Vitest, React Testing Library, localStorage API.

---

### Task 1: Project Scaffold with Vite + React + TypeScript

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/vite-env.d.ts`
- Create: `.gitignore`

**Step 1: Initialize Vite project**

Run:
```bash
npm create vite@latest . -- --template react-ts
```
Expected: Vite scaffolds React + TypeScript project in current directory.

**Step 2: Install dependencies**

Run:
```bash
npm install
```
Expected: Dependencies installed, `node_modules` created.

**Step 3: Verify dev server works**

Run:
```bash
npm run dev
```
Expected: Dev server starts on `http://localhost:5173`, shows Vite + React page.
Stop server with Ctrl+C.

**Step 4: Clean up default files**

Run:
```bash
rm src/App.css src/index.css
```
Expected: Default CSS files removed.

**Step 5: Create minimal App component**

Modify `src/App.tsx`:
```tsx
export default function App() {
  return (
    <div>
      <h1>Minion Tracker</h1>
    </div>
  )
}
```

**Step 6: Update main.tsx**

Modify `src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Step 7: Update .gitignore**

Modify `.gitignore`:
```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

**Step 8: Verify clean build**

Run:
```bash
npm run dev
```
Expected: Server starts, shows "Minion Tracker" heading.
Stop server with Ctrl+C.

**Step 9: Commit**

Run:
```bash
git add .
git commit -m "feat: initialize vite react typescript project"
```
Expected: Clean commit with project scaffold.

---

### Task 2: Configure Vitest and React Testing Library

**Files:**
- Create: `vitest.config.ts`
- Create: `src/setupTests.ts`
- Modify: `package.json`

**Step 1: Install testing dependencies**

Run:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/ui
```
Expected: Dev dependencies installed.

**Step 2: Create vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
  },
})
```

**Step 3: Create test setup file**

Create `src/setupTests.ts`:
```ts
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})
```

**Step 4: Add test scripts to package.json**

Modify `package.json` scripts section:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run"
  }
}
```

**Step 5: Write first test for App component**

Create `src/App.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders Minion Tracker heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /minion tracker/i })).toBeInTheDocument()
  })
})
```

**Step 6: Run tests**

Run:
```bash
npm test
```
Expected: Test passes, shows "1 passed".
Press 'q' to quit watch mode.

**Step 7: Commit**

Run:
```bash
git add .
git commit -m "test: configure vitest and react testing library"
```

---

### Task 3: Install and Configure Tailwind CSS

**Files:**
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `src/index.css`
- Modify: `src/main.tsx`

**Step 1: Install Tailwind and dependencies**

Run:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
Expected: Tailwind installed, config files created.

**Step 2: Configure Tailwind content paths**

Modify `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Step 3: Create Tailwind CSS file**

Create `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 4: Import CSS in main.tsx**

Modify `src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Step 5: Test Tailwind with styled App**

Modify `src/App.tsx`:
```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Minion Tracker</h1>
      </main>
    </div>
  )
}
```

**Step 6: Verify Tailwind works**

Run:
```bash
npm run dev
```
Expected: Page shows styled heading with Tailwind classes applied.
Stop server with Ctrl+C.

**Step 7: Run tests to ensure nothing broke**

Run:
```bash
npm run test:run
```
Expected: All tests pass.

**Step 8: Commit**

Run:
```bash
git add .
git commit -m "feat: configure tailwind css"
```

---

### Task 4: Define TypeScript Types and Interfaces

**Files:**
- Create: `src/types/minion.ts`
- Create: `src/types/actions.ts`

**Step 1: Create types directory**

Run:
```bash
mkdir -p src/types
```

**Step 2: Write failing test for Minion type**

Create `src/types/minion.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import type { Minion } from './minion'

describe('Minion type', () => {
  it('should accept valid minion object', () => {
    const minion: Minion = {
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

    expect(minion.id).toBe('1')
    expect(minion.name).toBe('Goblin')
    expect(minion.hp).toBe(7)
  })
})
```

**Step 3: Run test to verify it fails**

Run:
```bash
npm run test:run
```
Expected: FAIL - "Cannot find module './minion'"

**Step 4: Create Minion type**

Create `src/types/minion.ts`:
```ts
export interface Minion {
  id: string
  name: string
  hp: number
  maxHp: number
  ac: number
  attack: number
  damage: string
  notes: string
  active: boolean
}

export interface MinionFormData {
  name: string
  hp: number
  ac: number
  attack: number
  damage: string
  notes: string
}
```

**Step 5: Run test to verify it passes**

Run:
```bash
npm run test:run
```
Expected: PASS

**Step 6: Write test for action types**

Create `src/types/actions.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import type { MinionAction } from './actions'

describe('MinionAction types', () => {
  it('should accept ADD_MINION action', () => {
    const action: MinionAction = {
      type: 'ADD_MINION',
      payload: {
        name: 'Goblin',
        hp: 7,
        ac: 13,
        attack: 4,
        damage: '1d6+2',
        notes: '',
      },
    }

    expect(action.type).toBe('ADD_MINION')
  })

  it('should accept UPDATE_HP action', () => {
    const action: MinionAction = {
      type: 'UPDATE_HP',
      payload: { id: '1', delta: -5 },
    }

    expect(action.type).toBe('UPDATE_HP')
    expect(action.payload.delta).toBe(-5)
  })
})
```

**Step 7: Run test to verify it fails**

Run:
```bash
npm run test:run
```
Expected: FAIL - "Cannot find module './actions'"

**Step 8: Create action types**

Create `src/types/actions.ts`:
```ts
import type { Minion, MinionFormData } from './minion'

export type MinionAction =
  | { type: 'ADD_MINION'; payload: MinionFormData }
  | { type: 'UPDATE_MINION'; payload: Minion }
  | { type: 'DELETE_MINION'; payload: { id: string } }
  | { type: 'UPDATE_HP'; payload: { id: string; delta: number } }
  | { type: 'SET_MINIONS'; payload: Minion[] }
```

**Step 9: Run test to verify it passes**

Run:
```bash
npm run test:run
```
Expected: All tests pass.

**Step 10: Commit**

Run:
```bash
git add src/types/
git commit -m "feat: define minion and action typescript types"
```

---

### Task 5: Implement Minion Reducer with TDD

**Files:**
- Create: `src/reducers/minionReducer.ts`
- Create: `src/reducers/minionReducer.test.ts`

**Step 1: Create reducers directory**

Run:
```bash
mkdir -p src/reducers
```

**Step 2: Write failing test for ADD_MINION**

Create `src/reducers/minionReducer.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { minionReducer } from './minionReducer'
import type { Minion } from '../types/minion'

describe('minionReducer', () => {
  it('should add a new minion', () => {
    const initialState: Minion[] = []
    const action = {
      type: 'ADD_MINION' as const,
      payload: {
        name: 'Goblin',
        hp: 7,
        ac: 13,
        attack: 4,
        damage: '1d6+2',
        notes: 'Sneaky',
      },
    }

    const newState = minionReducer(initialState, action)

    expect(newState).toHaveLength(1)
    expect(newState[0].name).toBe('Goblin')
    expect(newState[0].hp).toBe(7)
    expect(newState[0].maxHp).toBe(7)
    expect(newState[0].active).toBe(true)
    expect(newState[0].id).toBeDefined()
  })
})
```

**Step 3: Run test to verify it fails**

Run:
```bash
npm run test:run
```
Expected: FAIL - "Cannot find module './minionReducer'"

**Step 4: Create minimal reducer implementation**

Create `src/reducers/minionReducer.ts`:
```ts
import type { Minion } from '../types/minion'
import type { MinionAction } from '../types/actions'

export function minionReducer(state: Minion[], action: MinionAction): Minion[] {
  switch (action.type) {
    case 'ADD_MINION': {
      const newMinion: Minion = {
        id: crypto.randomUUID(),
        ...action.payload,
        maxHp: action.payload.hp,
        active: true,
      }
      return [...state, newMinion]
    }
    default:
      return state
  }
}
```

**Step 5: Run test to verify it passes**

Run:
```bash
npm run test:run
```
Expected: PASS

**Step 6: Write failing test for UPDATE_HP**

Add to `src/reducers/minionReducer.test.ts`:
```ts
  it('should update minion HP with bounds checking', () => {
    const initialState: Minion[] = [
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
    ]

    const action = {
      type: 'UPDATE_HP' as const,
      payload: { id: '1', delta: -5 },
    }

    const newState = minionReducer(initialState, action)

    expect(newState[0].hp).toBe(2)
  })

  it('should not allow HP to go below 0', () => {
    const initialState: Minion[] = [
      {
        id: '1',
        name: 'Goblin',
        hp: 3,
        maxHp: 7,
        ac: 13,
        attack: 4,
        damage: '1d6+2',
        notes: '',
        active: true,
      },
    ]

    const action = {
      type: 'UPDATE_HP' as const,
      payload: { id: '1', delta: -10 },
    }

    const newState = minionReducer(initialState, action)

    expect(newState[0].hp).toBe(0)
  })

  it('should not allow HP to exceed maxHp', () => {
    const initialState: Minion[] = [
      {
        id: '1',
        name: 'Goblin',
        hp: 5,
        maxHp: 7,
        ac: 13,
        attack: 4,
        damage: '1d6+2',
        notes: '',
        active: true,
      },
    ]

    const action = {
      type: 'UPDATE_HP' as const,
      payload: { id: '1', delta: 10 },
    }

    const newState = minionReducer(initialState, action)

    expect(newState[0].hp).toBe(7)
  })
```

**Step 7: Run test to verify it fails**

Run:
```bash
npm run test:run
```
Expected: FAIL - Tests for UPDATE_HP fail

**Step 8: Implement UPDATE_HP action**

Modify `src/reducers/minionReducer.ts`:
```ts
import type { Minion } from '../types/minion'
import type { MinionAction } from '../types/actions'

export function minionReducer(state: Minion[], action: MinionAction): Minion[] {
  switch (action.type) {
    case 'ADD_MINION': {
      const newMinion: Minion = {
        id: crypto.randomUUID(),
        ...action.payload,
        maxHp: action.payload.hp,
        active: true,
      }
      return [...state, newMinion]
    }
    case 'UPDATE_HP': {
      return state.map((minion) => {
        if (minion.id !== action.payload.id) return minion
        const newHp = minion.hp + action.payload.delta
        return {
          ...minion,
          hp: Math.max(0, Math.min(newHp, minion.maxHp)),
        }
      })
    }
    default:
      return state
  }
}
```

**Step 9: Run test to verify it passes**

Run:
```bash
npm run test:run
```
Expected: All tests pass.

**Step 10: Write failing test for UPDATE_MINION**

Add to `src/reducers/minionReducer.test.ts`:
```ts
  it('should update minion data', () => {
    const initialState: Minion[] = [
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
    ]

    const action = {
      type: 'UPDATE_MINION' as const,
      payload: {
        id: '1',
        name: 'Hobgoblin',
        hp: 10,
        maxHp: 15,
        ac: 16,
        attack: 5,
        damage: '2d6+2',
        notes: 'Leader',
        active: true,
      },
    }

    const newState = minionReducer(initialState, action)

    expect(newState[0].name).toBe('Hobgoblin')
    expect(newState[0].maxHp).toBe(15)
    expect(newState[0].ac).toBe(16)
  })
```

**Step 11: Run test to verify it fails**

Run:
```bash
npm run test:run
```
Expected: FAIL - UPDATE_MINION test fails

**Step 12: Implement UPDATE_MINION action**

Modify `src/reducers/minionReducer.ts`, add case:
```ts
    case 'UPDATE_MINION': {
      return state.map((minion) =>
        minion.id === action.payload.id ? action.payload : minion
      )
    }
```

**Step 13: Run test to verify it passes**

Run:
```bash
npm run test:run
```
Expected: All tests pass.

**Step 14: Write failing test for DELETE_MINION**

Add to `src/reducers/minionReducer.test.ts`:
```ts
  it('should soft delete a minion', () => {
    const initialState: Minion[] = [
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
    ]

    const action = {
      type: 'DELETE_MINION' as const,
      payload: { id: '1' },
    }

    const newState = minionReducer(initialState, action)

    expect(newState[0].active).toBe(false)
  })
```

**Step 15: Run test to verify it fails**

Run:
```bash
npm run test:run
```
Expected: FAIL - DELETE_MINION test fails

**Step 16: Implement DELETE_MINION action**

Modify `src/reducers/minionReducer.ts`, add case:
```ts
    case 'DELETE_MINION': {
      return state.map((minion) =>
        minion.id === action.payload.id
          ? { ...minion, active: false }
          : minion
      )
    }
```

**Step 17: Run test to verify it passes**

Run:
```bash
npm run test:run
```
Expected: All tests pass.

**Step 18: Write failing test for SET_MINIONS**

Add to `src/reducers/minionReducer.test.ts`:
```ts
  it('should set entire minion list', () => {
    const initialState: Minion[] = []
    const minions: Minion[] = [
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
    ]

    const action = {
      type: 'SET_MINIONS' as const,
      payload: minions,
    }

    const newState = minionReducer(initialState, action)

    expect(newState).toHaveLength(2)
    expect(newState).toEqual(minions)
  })
```

**Step 19: Run test to verify it fails**

Run:
```bash
npm run test:run
```
Expected: FAIL - SET_MINIONS test fails

**Step 20: Implement SET_MINIONS action**

Modify `src/reducers/minionReducer.ts`, add case:
```ts
    case 'SET_MINIONS': {
      return action.payload
    }
```

**Step 21: Run test to verify it passes**

Run:
```bash
npm run test:run
```
Expected: All tests pass.

**Step 22: Commit**

Run:
```bash
git add src/reducers/
git commit -m "feat: implement minion reducer with tdd"
```

---

### Task 6: Implement localStorage Hook

**Files:**
- Create: `src/hooks/useLocalStorage.ts`
- Create: `src/hooks/useLocalStorage.test.ts`

**Step 1: Create hooks directory**

Run:
```bash
mkdir -p src/hooks
```

**Step 2: Write failing test for useLocalStorage**

Create `src/hooks/useLocalStorage.test.ts`:
```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should initialize with default value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))

    expect(result.current[0]).toBe('default')
  })

  it('should load value from localStorage if available', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'))

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))

    expect(result.current[0]).toBe('stored-value')
  })

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('updated')
    })

    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'))
    expect(result.current[0]).toBe('updated')
  })

  it('should handle complex objects', () => {
    const initialValue = { name: 'Goblin', hp: 7 }
    const { result } = renderHook(() => useLocalStorage('test-key', initialValue))

    expect(result.current[0]).toEqual(initialValue)

    const updatedValue = { name: 'Orc', hp: 15 }
    act(() => {
      result.current[1](updatedValue)
    })

    expect(result.current[0]).toEqual(updatedValue)
    expect(JSON.parse(localStorage.getItem('test-key')!)).toEqual(updatedValue)
  })
})
```

**Step 3: Run test to verify it fails**

Run:
```bash
npm run test:run
```
Expected: FAIL - "Cannot find module './useLocalStorage'"

**Step 4: Implement useLocalStorage hook**

Create `src/hooks/useLocalStorage.ts`:
```ts
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error saving to localStorage:`, error)
    }
  }, [key, value])

  return [value, setValue]
}
```

**Step 5: Run test to verify it passes**

Run:
```bash
npm run test:run
```
Expected: All tests pass.

**Step 6: Commit**

Run:
```bash
git add src/hooks/
git commit -m "feat: implement localStorage hook with tdd"
```

---

### Task 7: Create Minion Context Provider

**Files:**
- Create: `src/context/MinionContext.tsx`
- Create: `src/context/MinionContext.test.tsx`

**Step 1: Create context directory**

Run:
```bash
mkdir -p src/context
```

**Step 2: Write failing test for MinionContext**

Create `src/context/MinionContext.test.tsx`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MinionProvider, useMinions } from './MinionContext'
import type { ReactNode } from 'react'

describe('MinionContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <MinionProvider>{children}</MinionProvider>
  )

  it('should start with empty minion list', () => {
    const { result } = renderHook(() => useMinions(), { wrapper })

    expect(result.current.minions).toEqual([])
  })

  it('should add a minion', () => {
    const { result } = renderHook(() => useMinions(), { wrapper })

    act(() => {
      result.current.addMinion({
        name: 'Goblin',
        hp: 7,
        ac: 13,
        attack: 4,
        damage: '1d6+2',
        notes: '',
      })
    })

    expect(result.current.minions).toHaveLength(1)
    expect(result.current.minions[0].name).toBe('Goblin')
  })

  it('should update minion HP', () => {
    const { result } = renderHook(() => useMinions(), { wrapper })

    act(() => {
      result.current.addMinion({
        name: 'Goblin',
        hp: 7,
        ac: 13,
        attack: 4,
        damage: '1d6+2',
        notes: '',
      })
    })

    const minionId = result.current.minions[0].id

    act(() => {
      result.current.updateHP(minionId, -3)
    })

    expect(result.current.minions[0].hp).toBe(4)
  })

  it('should delete a minion', () => {
    const { result } = renderHook(() => useMinions(), { wrapper })

    act(() => {
      result.current.addMinion({
        name: 'Goblin',
        hp: 7,
        ac: 13,
        attack: 4,
        damage: '1d6+2',
        notes: '',
      })
    })

    const minionId = result.current.minions[0].id

    act(() => {
      result.current.deleteMinion(minionId)
    })

    expect(result.current.minions[0].active).toBe(false)
  })
})
```

**Step 3: Run test to verify it fails**

Run:
```bash
npm run test:run
```
Expected: FAIL - "Cannot find module './MinionContext'"

**Step 4: Implement MinionContext**

Create `src/context/MinionContext.tsx`:
```tsx
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
```

**Step 5: Run test to verify it passes**

Run:
```bash
npm run test:run
```
Expected: All tests pass.

**Step 6: Commit**

Run:
```bash
git add src/context/
git commit -m "feat: create minion context provider with tdd"
```

---

### Task 8: Create MinionForm Component

**Files:**
- Create: `src/components/MinionForm.tsx`
- Create: `src/components/MinionForm.test.tsx`

**Step 1: Create components directory**

Run:
```bash
mkdir -p src/components
```

**Step 2: Write failing test for MinionForm**

Create `src/components/MinionForm.test.tsx`:
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
    expect(screen.getByPlaceholderText(/attack/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/damage/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/notes/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /spawn minion/i })).toBeInTheDocument()
  })

  it('should call onSubmit with form data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<MinionForm onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText(/name/i), 'Goblin')
    await user.type(screen.getByPlaceholderText(/hp/i), '7')
    await user.type(screen.getByPlaceholderText(/ac/i), '13')
    await user.type(screen.getByPlaceholderText(/attack/i), '4')
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

**Step 3: Run test to verify it fails**

Run:
```bash
npm run test:run
```
Expected: FAIL - "Cannot find module './MinionForm'"

**Step 4: Implement MinionForm component**

Create `src/components/MinionForm.tsx`:
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
```

**Step 5: Run test to verify it passes**

Run:
```bash
npm run test:run
```
Expected: All tests pass.

**Step 6: Commit**

Run:
```bash
git add src/components/
git commit -m "feat: create minion form component with tdd"
```

---

### Task 9: Create MinionCard Component

**Files:**
- Create: `src/components/MinionCard.tsx`
- Create: `src/components/MinionCard.test.tsx`

**Step 1: Write failing test for MinionCard**

Create `src/components/MinionCard.test.tsx`:
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

    const hpText = screen.getByText(/3\/7/)
    expect(hpText.className).toContain('text-red-600')
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

  it('should call onHPChange when heal button clicked', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionCard minion={mockMinion} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    await user.click(screen.getByRole('button', { name: /\+/i }))

    expect(onHPChange).toHaveBeenCalledWith('1', 1)
  })

  it('should call onHPChange when damage button clicked', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const onDelete = vi.fn()
    const onHPChange = vi.fn()

    render(<MinionCard minion={mockMinion} onUpdate={onUpdate} onDelete={onDelete} onHPChange={onHPChange} />)

    await user.click(screen.getByRole('button', { name: /-/i }))

    expect(onHPChange).toHaveBeenCalledWith('1', -1)
  })
})
```

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test:run
```
Expected: FAIL - "Cannot find module './MinionCard'"

**Step 3: Implement MinionCard component**

Create `src/components/MinionCard.tsx`:
```tsx
import type { Minion } from '../types/minion'

interface MinionCardProps {
  minion: Minion
  onUpdate: (minion: Minion) => void
  onDelete: (id: string) => void
  onHPChange: (id: string, delta: number) => void
}

export function MinionCard({ minion, onUpdate, onDelete, onHPChange }: MinionCardProps) {
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
```

**Step 4: Run test to verify it passes**

Run:
```bash
npm run test:run
```
Expected: All tests pass.

**Step 5: Commit**

Run:
```bash
git add src/components/
git commit -m "feat: create minion card component with tdd"
```

---

### Task 10: Create MinionList Component

**Files:**
- Create: `src/components/MinionList.tsx`
- Create: `src/components/MinionList.test.tsx`

**Step 1: Write failing test for MinionList**

Create `src/components/MinionList.test.tsx`:
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

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test:run
```
Expected: FAIL - "Cannot find module './MinionList'"

**Step 3: Implement MinionList component**

Create `src/components/MinionList.tsx`:
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
```

**Step 4: Run test to verify it passes**

Run:
```bash
npm run test:run
```
Expected: All tests pass.

**Step 5: Commit**

Run:
```bash
git add src/components/
git commit -m "feat: create minion list component with tdd"
```

---

### Task 11: Wire Up App Component

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

**Step 1: Write failing integration test**

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
    await user.type(screen.getByPlaceholderText(/attack/i), '4')
    await user.type(screen.getByPlaceholderText(/damage/i), '1d6+2')

    await user.click(screen.getByRole('button', { name: /spawn minion/i }))

    expect(screen.getByText('Goblin')).toBeInTheDocument()
    expect(screen.queryByText(/no active minions/i)).not.toBeInTheDocument()
  })

  it('allows adjusting minion HP', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Spawn minion
    await user.type(screen.getByPlaceholderText(/name/i), 'Goblin')
    await user.type(screen.getByPlaceholderText(/hp/i), '7')
    await user.type(screen.getByPlaceholderText(/ac/i), '13')
    await user.type(screen.getByPlaceholderText(/attack/i), '4')
    await user.click(screen.getByRole('button', { name: /spawn minion/i }))

    // Damage minion
    const damageButton = screen.getByRole('button', { name: /-/i })
    await user.click(damageButton)

    expect(screen.getByText(/6\/7/)).toBeInTheDocument()
  })

  it('allows dismissing a minion', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Spawn minion
    await user.type(screen.getByPlaceholderText(/name/i), 'Goblin')
    await user.type(screen.getByPlaceholderText(/hp/i), '7')
    await user.type(screen.getByPlaceholderText(/ac/i), '13')
    await user.type(screen.getByPlaceholderText(/attack/i), '4')
    await user.click(screen.getByRole('button', { name: /spawn minion/i }))

    // Dismiss minion
    await user.click(screen.getByRole('button', { name: /dismiss/i }))

    expect(screen.queryByText('Goblin')).not.toBeInTheDocument()
    expect(screen.getByText(/no active minions/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test:run
```
Expected: FAIL - Various component not found errors

**Step 3: Implement App component**

Modify `src/App.tsx`:
```tsx
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
```

**Step 4: Run test to verify it passes**

Run:
```bash
npm run test:run
```
Expected: All tests pass.

**Step 5: Test in browser**

Run:
```bash
npm run dev
```
Expected: App runs, can spawn minions, adjust HP, dismiss minions. Data persists in localStorage.
Stop server with Ctrl+C.

**Step 6: Commit**

Run:
```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: wire up app component with all features"
```

---

### Task 12: Configure for GitHub Pages Deployment

**Files:**
- Modify: `vite.config.ts`
- Create: `.github/workflows/deploy.yml`
- Modify: `package.json`

**Step 1: Update vite config for GitHub Pages**

Modify `vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/minion-tracker/',
})
```

**Step 2: Add deploy script to package.json**

Modify `package.json` scripts section to add:
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
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

**Step 3: Install gh-pages**

Run:
```bash
npm install -D gh-pages
```
Expected: gh-pages installed as dev dependency.

**Step 4: Create GitHub Actions workflow**

Run:
```bash
mkdir -p .github/workflows
```

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ static-react ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:run

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Step 5: Build and verify production build**

Run:
```bash
npm run build
```
Expected: Build succeeds, `dist` directory created.

**Step 6: Preview production build**

Run:
```bash
npm run preview
```
Expected: Preview server starts, app works correctly.
Stop server with Ctrl+C.

**Step 7: Update .gitignore**

Verify `.gitignore` includes:
```
dist
```

**Step 8: Commit**

Run:
```bash
git add .
git commit -m "feat: configure github pages deployment"
```

---

### Task 13: Add Documentation

**Files:**
- Create: `README.md`

**Step 1: Create README**

Create `README.md`:
```markdown
# Minion Tracker - Static React Implementation

A static React + TypeScript web application for tracking D&D minion stat blocks during gameplay.

## Features

- ✨ Spawn minions with stats (Name, HP, MaxHP, AC, Attack, Damage, Notes)
- 📊 Display list of active minions
- ❤️ Adjust HP (heal/damage) with bounds checking (0 to MaxHP)
- ✏️ Visual HP warning when at or below 50%
- 🗑️ Dismiss minions (soft delete)
- 💾 Persistent storage using localStorage

## Tech Stack

- **React 18** - UI library
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool
- **Tailwind CSS 4** - Styling
- **Vitest + React Testing Library** - Testing
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

# Run tests
npm test

# Run tests once
npm run test:run

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

This project uses Test-Driven Development (TDD):

- All components have test coverage
- Tests use Vitest and React Testing Library
- Run `npm test` for watch mode
- Run `npm run test:run` for CI mode

## Architecture

### State Management

- **Context API + useReducer** - Global state management
- **Custom localStorage hook** - Automatic persistence
- **Reducer pattern** - Predictable state updates

### Components

- `App.tsx` - Root component with provider
- `MinionForm.tsx` - Spawn new minions
- `MinionCard.tsx` - Display individual minion
- `MinionList.tsx` - Grid of active minions

### Data Flow

1. User submits form → `addMinion` dispatched
2. Reducer creates new minion with UUID
3. State updates → localStorage syncs
4. Components re-render with new data

## Deployment

Deployed to GitHub Pages via GitHub Actions:

1. Push to `static-react` branch
2. GitHub Actions runs tests
3. Builds production bundle
4. Deploys to GitHub Pages

Live site: `https://[username].github.io/minion-tracker/`

## License

MIT
```

**Step 2: Commit**

Run:
```bash
git add README.md
git commit -m "docs: add comprehensive readme"
```

---

### Task 14: Final Testing and Cleanup

**Files:**
- N/A (verification only)

**Step 1: Run full test suite**

Run:
```bash
npm run test:run
```
Expected: All tests pass.

**Step 2: Check test coverage**

Run:
```bash
npm run test:run -- --coverage
```
Expected: High coverage across all modules.

**Step 3: Run linter**

Run:
```bash
npm run lint
```
Expected: No linting errors (or auto-fixable warnings).

**Step 4: Build production**

Run:
```bash
npm run build
```
Expected: Clean build with no errors.

**Step 5: Test production build**

Run:
```bash
npm run preview
```
Expected: App works in production mode, localStorage persists.
Stop server with Ctrl+C.

**Step 6: Verify localStorage persistence**

Run:
```bash
npm run dev
```

Manual test:
1. Open browser to localhost:5173
2. Spawn several minions
3. Adjust HP on some
4. Refresh page
5. Verify all minions and HP changes persist

Stop server with Ctrl+C.

**Step 7: Final commit**

Run:
```bash
git add .
git commit -m "test: verify full test suite and production build"
```

**Step 8: Push branch**

Run:
```bash
git push -u origin static-react
```
Expected: Branch pushed to remote, GitHub Actions workflow triggered.

---

## Summary

| Task | What it does |
|------|-------------|
| 1 | Vite + React + TypeScript scaffold |
| 2 | Vitest + React Testing Library setup |
| 3 | Tailwind CSS configuration |
| 4 | TypeScript types and interfaces (TDD) |
| 5 | Minion reducer with TDD |
| 6 | localStorage hook with TDD |
| 7 | Minion context provider with TDD |
| 8 | MinionForm component with TDD |
| 9 | MinionCard component with TDD |
| 10 | MinionList component with TDD |
| 11 | Wire up App component with integration tests |
| 12 | GitHub Pages deployment configuration |
| 13 | Documentation (README) |
| 14 | Final testing and verification |

**Total:** 14 tasks following TDD principles throughout. Each component built with failing tests first, minimal implementation, then passing tests. Frequent commits at each step.
