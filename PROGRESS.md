# Cheap Eats Bali — Progress

## Phase 1: Project Foundation ✅ COMPLETE

**Branch:** `phase/1-foundation`
**Date:** 2026-06-07

### What was done

| Task | Status | Commit |
|------|--------|--------|
| 1. Scaffold Next.js 15 + Bun | ✅ | `6324bf3` |
| 2. Database Schema (Drizzle + Neon) | ✅ | `3ff9183` |
| 3. Middleware (Arcjet + Clerk) | ✅ | `07f1e79` |
| 4. Clerk Webhook + User Sync | ✅ | `b10f1c4` |
| 5. i18n Setup (EN + ID) | ✅ | `4f3a951` |
| 6. Zod Validation Schemas | ✅ | `5f3d95b` |
| 7. Ranking Logic (TDD) | ✅ | `48b27d7` |

### What was verified

- `bun run type-check` → PASS
- `bun run lint` → PASS
- `bun run test` → 8 tests passing (5 ranking + 3 validations)
- Database migration applied to Neon — all 8 tables + 7 enums live
- Git branches: `main` → `stage` → `phase/1-foundation`

### Key decisions / notes

- Biome v2.4.16 installed (plan specified v1.9.4 schema — adapted to v2, all functionality equivalent)
- next-intl v4 API used (`requestLocale` pattern, not v3's `locale` parameter)
- Clerk custom JWT types declared in `types/clerk.d.ts` for `sessionClaims.metadata.role`
- `CLERK_WEBHOOK_SECRET` left empty — requires Clerk dashboard setup after deploy
- `.claude/` and `.superpowers/` excluded from git via `.gitignore`
- Husky pre-commit hook exports `$HOME/.bun/bin` to PATH (bun not in git hook PATH by default)

---

## Phase 2: Map & Discovery 🔜 NEXT

**Before starting Phase 2:**
1. Merge `phase/1-foundation` → `stage`
2. Create `phase/2-map` branch off `stage`
3. Tasks: Nav, Place Queries, Bali Map Component

---

## Phases Remaining

| Phase | Focus | Status |
|-------|-------|--------|
| 2 | Map & Discovery (Nav, Queries, Leaflet map) | Pending |
| 3 | Place Submission & Detail | Pending |
| 4 | Reviews, Reactions, Tags & Votes | Pending |
| 5 | User Profiles | Pending |
| 6 | Admin Dashboard | Pending |
| 7 | CI/CD + E2E Tests + Deploy | Pending |
