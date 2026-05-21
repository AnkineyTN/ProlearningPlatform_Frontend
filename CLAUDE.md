# CLAUDE.md — ProLearning Frontend

## Project Overview

React 19 + TypeScript + Vite SPA for an online learning platform. See README.md for full feature list and tech stack.

## Dev Commands

```bash
npm run dev       # Start dev server on http://localhost:3000
npm run build     # tsc -b && vite build
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Architecture

### State Management

**No Redux.** Server state is exclusively managed with **TanStack React Query v5**.

- Query cache is persisted to `localStorage` via `createAsyncStoragePersister` with 24h TTL
- Auth and notifications are excluded from persistence (volatile data)
- Query keys follow a per-feature pattern: `['sets']`, `['flashcards', setId]`, etc.
- Mutations call `queryClient.invalidateQueries()` to trigger refetches

### API Layer

```
services/
├── client.ts          # Axios instance with JWT interceptors
├── endpoints/         # One module per feature (sets.ts, flashcard.ts, exam.ts …)
└── types/             # TypeScript interfaces for API responses
```

- `client.ts` exports two instances: `apiClient` (auth headers) and `publicApiClient` (no auth)
- Request interceptor: injects `Authorization: Bearer {accessToken}`
- Response interceptor: silently refreshes token on 401, redirects to `/login` if refresh fails
- Tokens stored in `localStorage`

### Hooks

All data-fetching logic lives in `src/hooks/`. Each hook:
1. Calls functions from `services/endpoints/`
2. Wraps them in `useQuery` / `useMutation`
3. Exposes typed data + loading/error states to components

Never call API functions directly in components — always go through hooks.

### Routing

Defined in `src/config/routeConfig.tsx`. Three route groups:
- **Public routes** — auto-redirect to dashboard if authenticated
- **Protected routes** — wrapped in `ProtectedLayout` which checks `useAuth()`
- **Admin routes** — additionally check `ROLE_ADMIN`

### Real-time Collaboration

Notes use Yjs CRDTs synced over WebSocket:
- Provider: Hocuspocus (`VITE_COLLAB_WS_URL`)
- Hook: `useCollaboration`
- Only active on the Note editor page

### Styling

- Tailwind CSS v4 (configured via `@tailwindcss/vite`)
- Radix UI headless primitives + custom styles in `src/components/ui/`
- Dark/light theme via `ThemeProvider` — persisted to `localStorage`
- Global CSS in `src/index.css`

### Forms

React Hook Form + Zod. Schemas live in `src/schemas/`. Always use the `@hookform/resolvers/zod` resolver.

### i18n

Two languages: `en` and `vi`. Translation files at `src/i18n/resources/`. Use the `useTranslation` hook; never hardcode user-facing strings.

## Key Conventions

- **Path alias**: `@/` maps to `src/` — use it for all imports
- **Component files**: PascalCase `.tsx`; hooks: camelCase prefixed with `use`
- **No comments** unless the WHY is non-obvious
- **Feature docs**: `FLASHCARD_GUIDE.md`, `REVIEW_SYSTEM.md`, `KNOWLEDGE_ANALYSIS_FE_INTEGRATION.md`, `ROADMAP_FE_INTEGRATION.md` have detailed API integration notes for those subsystems

## Environment Variables

```
VITE_API_URL          # Backend REST API base URL
VITE_COLLAB_WS_URL    # WebSocket server for collaborative editing
```

All env vars must be prefixed with `VITE_` to be accessible via `import.meta.env`.
