# Legacy of Etrio - Agent Guidelines

## Project Overview

This is a monorepo containing:
- **client**: React + TypeScript + Vite + TailwindCSS frontend (Cloudflare Pages)
- **server**: Hono + TypeScript backend (Cloudflare Workers)
- **shared**: Shared TypeScript utilities between client/server

## Build & Development Commands

### Root Commands
```bash
npm run install:all      # Install all dependencies
npm run build            # Build shared + server
npm run deploy:server    # Deploy server to Cloudflare Workers
npm run deploy:client    # Deploy client to Cloudflare Pages
```

### Client Commands (cd client)
```bash
npm run dev              # Start Vite dev server
npm run build           # Production build
npm run lint             # Run ESLint
npm run preview          # Preview production build
```

### Server Commands (cd server)
```bash
npm run dev              # Start Wrangler dev server
npm run build            # Generate Prisma client
npm run deploy           # Deploy to Cloudflare Workers
```

## Architecture Patterns

### State Management (Client)
- Use Zustand for global state via `useGameStore` in `client/src/store/gameStore.ts`
- Store actions return updated state objects
- API calls go through store actions that sync with server

### API Communication
- Client calls server via REST endpoints in `server/src/index.ts`
- Server uses Hono framework with async handlers
- State persisted via Prisma + SQLite (dev) or D1 (prod)

### Shared Code
- Game logic in `shared/src/` - imported by both client and server
- Classes use static methods (e.g., `LineageManager.createHeir()`)
- No side effects in shared code

## Code Style Guidelines

### TypeScript
- Always specify types for function parameters and return values
- Avoid `any` - use `unknown` or proper types when possible
- Use interfaces for object shapes, types for unions/primitives

### Imports
- Use absolute imports from package roots where possible
- Relative imports for local files: `./component`, `../store`
- Order: external libs → shared → local components

### React Components
```typescript
// Functional components with explicit types
const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // hooks at top
  const { state } = useGameStore();
  
  // early returns
  if (!state) return null;
  
  // render
  return <div>...</div>;
};

export default ComponentName;
```

### Naming Conventions
- **Files**: PascalCase for components (`LineageHall.tsx`), camelCase for utilities (`gameStore.ts`)
- **Components**: PascalCase (`<LineageHall />`)
- **Functions**: camelCase, verb prefixes (`handleClick`, `processCombat`)
- **Constants**: UPPER_SNAKE_CASE for magic numbers, camelCase for config objects
- **Types/Interfaces**: PascalCase, descriptive (`CharacterStats`, `GuildVaultItem`)

### Error Handling
- Use try/catch for async operations
- Return meaningful error messages: `throw new Error('Player not found')`
- API endpoints return `{ error: message }` on failure

### Database (Prisma)
- Schema in `server/prisma/schema.prisma`
- Run `npx prisma generate` after schema changes
- Use upsert for create-or-update operations

## Important Patterns

### Combat System
- Combat happens server-side via `GameService.processCombatTick()`
- `CombatEngine.simulate()` handles battle logic
- Results returned to client for display

### Offline Progress
- Calculated in `shared/src/offline.ts` via `OfflineEngine.calculateGains()`
- Capped at 24 hours (1440 minutes)

### Lineage System
- Two Soulmates (100 affinity) can produce an heir
- Heir inherits 20% of highest parent stats + 10% per generation
- Heirloom item stats added to heir's base stats

### Guild Vault
- Items donated to shared vault accessible to all players
- Vault stored in `GuildSettings` table (Prisma)
- API endpoints: `/api/guild/vault/donate`, `/api/guild/vault/claim`

## Linting

The client uses ESLint with TypeScript support. Run:
```bash
cd client && npm run lint
```

Common issues to avoid:
- Unused variables (`@typescript-eslint/no-unused-vars`)
- Implicit `any` (`@typescript-eslint/no-explicit-any`)
- Component creation during render (declare outside)
- Missing React dependencies in useEffect

## Testing

No formal test suite exists yet. For new features:
- Manual testing via `npm run dev` in client
- Server testing via `npm run dev` in server
- Use Cloudflare Wrangler for local API testing

## ESLint Configuration

The client uses ESLint with React, TypeScript, and React Refresh plugins:
- Config: `client/eslint.config.js`
- Runs automatically on build
- Can be run manually: `cd client && npm run lint`

### Common Lint Errors

The codebase has some pre-existing lint issues (not blocking):
- Components created during render (NavItem in App.tsx) - refactor by moving outside
- Date.now() during render - use useMemo or move to useEffect
- Some implicit `any` types in legacy code - prefer explicit types for new code
- Missing useEffect dependencies - include all required deps or use eslint-disable appropriately

When adding new code, prefer:
- Explicit types over `any`
- Avoid calling impure functions (Date.now, Math.random) during render
- Declare component functions outside render functions
- Include all dependencies in useEffect dependency arrays
