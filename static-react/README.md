# Minion Tracker - Static React Implementation

A static React + TypeScript web application for tracking D&D minion stat blocks during gameplay.

## Features

- Spawn minions with stats (Name, HP, MaxHP, AC, Attack, Damage, Notes)
- Display list of active minions
- Adjust HP (heal/damage) with bounds checking (0 to MaxHP)
- Visual HP warning when at or below 50%
- Dismiss minions (soft delete)
- Persistent storage using localStorage

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
