# HNC Frontend Prototype

This prototype implements HNC Law Firm’s AI Operations Console. It pairs a polished UX with mocked AI workflows so stakeholders can experience the intake, document, and review journey targeted for the August demo.

## Architecture Highlights

- **Stack**: Next.js (App Router + Turbopack), TypeScript, Tailwind CSS v4, TanStack Query, Storybook.
- **App Shell & Design System**: Global tokens, responsive layout, reusable cards/badges, and Storybook-documented UI primitives.
- **Client Intake Wizard**: Stepper-driven flow with Zod validation, autosave (local storage + mocked API), voice transcript suggestions, and a review-ready summary stage.
- **Data Layer**: TanStack Query provider wrapping mocked services (`src/services/intake-mock.ts`) for intake drafts and review queues—drop-in for future backend endpoints.
- **Tooling**: Vitest + Testing Library (query-enabled helpers), ESLint, Prettier, build-storybook, and CI-friendly npm scripts.

## Project Structure

```
src/
  app/                 # Next.js routes (dashboard, intake wizard, layout, globals)
  components/
    layout/            # App shell and navigation
    providers/         # App-wide providers (QueryClient)
    ui/                # Reusable UI atoms (Card, Badge, Button)
    intake/            # Wizard-specific components (Stepper, Transcript panel)
  hooks/               # TanStack Query hooks + local storage helper
  services/            # Mocked API layer for drafts and review queue
  __tests__/           # Vitest suites + render helpers with QueryClientProvider
```

## Getting Started

```bash
npm install
npm run dev                 # http://localhost:3000
npm run storybook           # http://localhost:6006
```

## Quality Commands

```bash
npm run lint               # ESLint (Flat config)

npm run build              # Production Next.js build
npm run build-storybook -- --quiet  # Static Storybook bundle
npm run format:check       # Prettier verification
```

## Milestones Achieved

- Responsive dashboard summarizing intake, workspace prep, and review queue.
- Intake wizard with autosave, validation, transcript-driven suggestions, and risk checklist gating.
- Mocked data services orchestrated via TanStack Query with optimistic updates and reset flows.
- Storybook-driven design system and Vitest coverage for core screens/components.

## Next Steps

- Replace mocked services with live API endpoints for drafts and review queues.
- Extend TanStack Query mutations for collaborative workflows and error resurfacing.
- Add accessibility snapshots in Storybook and expand Vitest coverage as new flows arrive.
