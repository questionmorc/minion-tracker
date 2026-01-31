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
6. HP stat remains visible during adjustment

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
