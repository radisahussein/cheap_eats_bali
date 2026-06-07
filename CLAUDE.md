# Cheap Eats Bali — CLAUDE.md

## Core Principles
- Apply DRY, YAGNI, KISS. Use industry standards and best practices.
- Minimal code changes for fixes and features. Main goal is functionality.
- Never assume — grill user for any uncertainties before proceeding.
- Utilize skills and plugins to your advantage at every opportunity.
- Max 3 attempts to solve/fix something. If exceeded, ask user with: the issue + your suggested solutions.

## Stack
- Next.js 15 (App Router) + Bun + TypeScript
- Drizzle ORM → Neon Postgres (serverless)
- Clerk (auth) · Cloudinary (images) · Arcjet (security) · PostHog (analytics)
- Leaflet + OpenStreetMap (map — 2D top-down only, Bali bounds only)
- Zod (validation) · Biome (lint/format) · Husky (git hooks)
- next-intl (i18n: Indonesian + English)
- Motion (animations) · Lucide (icons)

## Git Workflow
- Branch structure: `main` → `stage` → `phase/N-name`
- Create `stage` off `main`. Create a new branch for each phase.
- Merge phase branch → `stage` on phase completion. Merge `stage` → `main` after full verification.
- Commit after every task. Commit messages: `feat:`, `fix:`, `chore:`, `test:`, `ci:`, `docs:`.
- **NEVER push to remote without explicit user approval.**

## Environment
- Zero hardcoded values. All configurable values must be in env vars.
- Reference `.env.example` for all required keys.
- Never commit `.env.local` or any file with real secrets.

## Services (free-first)
- Prioritize free tiers. Design for painless migration to paid if needed.
- Current free services: Neon, Clerk, Cloudinary (25GB), Arcjet, PostHog, Vercel, OpenStreetMap/Leaflet.

## Security
- Arcjet middleware on all mutation routes (rate limit + bot protection + shield).
- Clerk middleware for all auth-required routes.
- Zod validates all inputs at every boundary before any DB write.
- Drizzle only — no raw SQL.
- Signed Cloudinary upload URLs only (no direct client uploads).

## Testing — MANDATORY
- **TDD**: write failing test first → implement → verify passing.
- Unit tests: `vitest` — all pure functions, validation schemas, ranking logic.
- Integration tests: `vitest` — server actions, DB queries.
- Component tests: test all UI components in isolation.
- Type tests: `tsc --noEmit` must pass on every commit.
- Lint tests: `biome check .` must pass on every commit.
- E2E tests: **use the `playwright` skill** for browser testing. All critical UI/UX flows must have Playwright coverage:
  - Map loads + filters work
  - Place submission flow
  - Review submission flow
  - Auth redirect behavior
  - Admin dashboard access control
- CI: GitHub Actions runs all of the above on every push to `main` and `stage`.

## After Each Phase
- Update `PROGRESS.md`: what was done, what was verified, what's next.
- All tests must pass before merging to `stage`.
- Inform user of any manual steps required before the next phase begins.

## Key Files
- Schema: `lib/db/schema.ts`
- Constants: `lib/constants.ts`
- Server actions: `lib/actions/*.ts`
- DB queries: `lib/queries/*.ts`
- Zod schemas: `lib/validations/*.ts`
- Plan: `docs/superpowers/plans/2026-06-07-cheap-eats-bali.md`
- Spec: `docs/superpowers/specs/2026-06-07-cheap-eats-bali-design.md`

## Coding Style
- No mutations — return new objects (`{ ...obj, key: val }`).
- Files max 400 lines. Functions max 50 lines. Max 4 levels of nesting.
- No `console.log` in production code.
- Error handling: `try/catch` with meaningful user-facing messages.
- API response format: `{ success: boolean, data?: T, error?: string }`.
