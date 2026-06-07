# Cheap Eats Bali — Design Spec

**Date:** 2026-06-07
**Status:** Approved

---

## 1. Problem

Bali locals and residents have no good way to discover inexpensive, locally-owned, underrated eating spots. Google Maps is cluttered with paid promotions and tourist-facing establishments. Smaller warungs and local food courts lack digital presence. The influx of foreigners has pushed more FnB establishments to cater to higher-income markets, making it harder for locals to find good value meals. People avoid trying new places without a trusted recommendation.

---

## 2. Solution

A community-driven web application for discovering and sharing cheap, local, underrated FnB establishments in Bali. Map-centric UI. Users contribute places, reviews, tags, and reactions. Credibility is earned through account registration and review volume. No ads, no paid promotion — ranked purely by community signal.

---

## 3. Scope

- Geographic scope: Bali only (2D top-down map, no street view)
- FnB categories: warung, restaurant, cafe, food court, street food
- Languages: Indonesian (Bahasa) + English, user-toggleable

---

## 4. Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 15 (App Router) | SSR, Server Actions, Vercel-native |
| Package Manager | Bun | Fast, modern |
| Language | TypeScript | Type safety |
| Database | Neon (serverless Postgres) | Free tier, scalable, edge-compatible |
| ORM | Drizzle | Lightweight, HTTP driver for Neon, serverless-friendly |
| Auth | Clerk | Best-in-class, generous free tier, roles built-in |
| Images | Cloudinary | 25GB free, auto-resize, CDN |
| Map | Leaflet + OpenStreetMap | Fully free, 2D top-down, swappable later |
| Deployment | Vercel | Next.js native, edge functions |
| Analytics | PostHog | Product analytics, session replays, feature flags, A/B |
| Rate limiting | Arcjet | Bot protection, rate limiting, shield — applied at edge |
| Validation | Zod | Runtime validation + TypeScript type inference |
| Icons | Lucide | Open-source, clean |
| Animations | Motion | Production-grade animations |
| Linting/Format | Biome | Fast, unified linter + formatter |
| Git hooks | Husky | Clean commits, pre-commit checks |
| Dead code | Fallow | Duplication + complexity detection |
| i18n | next-intl | Indonesian + English |

---

## 5. Architecture

**Pattern:** Next.js monolith on Vercel. No separate backend service.

- **Server Components** — data fetching directly from Neon via Drizzle
- **Server Actions** — all mutations (submit place, add review, flag, react, vote) — CSRF-protected by default
- **API Routes** — Clerk webhooks, Cloudinary upload callbacks only
- **Middleware** — Arcjet (rate limit + bot protection) runs first, then Clerk auth guard

### Security Stack

1. **Arcjet** — edge middleware: rate limiting per route, bot detection, attack shield
2. **Clerk** — auth middleware: route guards, role checks (user/admin), webhook verification
3. **Server Actions + Zod** — all inputs validated at boundary before any DB operation
4. **Drizzle** — parameterized queries only, no raw SQL
5. **Env vars** — zero hardcoded secrets; all config via environment variables

---

## 6. Data Model

### `users`
| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| clerk_id | text UNIQUE | Synced via Clerk webhook |
| username | text UNIQUE | |
| avatar_url | text | |
| role | enum(user, admin) | Default: user |
| created_at | timestamp | |

### `places`
| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| submitted_by | uuid FK → users | Nullable (anonymous submission allowed) |
| name | text | |
| description | text | |
| lat | decimal | |
| lng | decimal | |
| area | text | Canggu, Ubud, Seminyak, etc. |
| category | enum | warung, restaurant, cafe, food_court, street_food |
| price_range | enum | <20k, 20-50k, 50-100k, >100k (IDR per person) |
| price_notes | text | Dish-level free text |
| cuisine_tags | text[] | Predefined list |
| score | decimal | Computed ranking score |
| status | enum(active, flagged, removed) | Default: active |
| created_at | timestamp | |

### `reviews`
| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| place_id | uuid FK → places | |
| user_id | uuid FK → users | Nullable |
| rating | int (1–5) | |
| emoji_tags | text[] | From predefined emoji set |
| body | text | Optional |
| is_anonymous | boolean | |
| status | enum(active, flagged, removed) | |
| created_at | timestamp | |

### `place_images`
| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| place_id | uuid FK → places | |
| review_id | uuid FK → reviews | Nullable |
| user_id | uuid FK → users | Nullable |
| cloudinary_id | text | |
| url | text | |
| created_at | timestamp | |

### `place_reactions`
| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| place_id | uuid FK → places | |
| emoji | enum | 🔥 💯 👍 👎 😐 🍽️ |
| ip_hash | text | Anonymous dedup |
| user_id | uuid FK → users | Nullable |
| created_at | timestamp | |
| | UNIQUE | (place_id, ip_hash, emoji) |

### `place_tags`
| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| place_id | uuid FK → places | |
| user_id | uuid FK → users | Auth required to tag |
| tag | enum | Predefined set (see below) |
| created_at | timestamp | |
| | UNIQUE | (place_id, user_id, tag) |

### `review_votes`
| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| review_id | uuid FK → reviews | |
| user_id | uuid FK → users | Auth required |
| created_at | timestamp | |
| | UNIQUE | (review_id, user_id) |

### `flags`
| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| target_type | enum(place, review) | |
| target_id | uuid | |
| reported_by | uuid FK → users | Nullable |
| reason | text | |
| resolved | boolean | Default: false |
| created_at | timestamp | |

### Predefined Tag Enum (`place_tags.tag`)

**Amenities:** fast_wifi, slow_wifi, has_chargers, no_chargers, air_conditioned, outdoor_seating, indoor_smoking, parking

**Vibe:** quiet, loud, busy, family_friendly, solo_friendly, wfh_friendly, romantic, local_crowd, tourist_crowd

**Practical:** cash_only, card_accepted, open_late, open_early, takeaway, delivery, fast_service, slow_service

### Ranking Score Formula

```
score = (
  Σ registered_review_ratings × 2.0
  + Σ anon_review_ratings × 1.0
  + reaction_count × 0.5
) / weighted_total
```

Recalculated on every new review or reaction. Stored on `places.score`. Map pins sorted by score descending within filtered results.

---

## 7. Pages & Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Full-screen 2D map of Bali. Filter bar (area, price, rating, cuisine, category, tags). Search bar. Click pin → place preview card. |
| `/places/[id]` | Public | Place detail: photos, info, tags (by frequency), score, reviews (sorted by upvotes). Add review (auth). Add tag (auth). React with emoji (anonymous OK). Flag (anyone). |
| `/submit` | Auth | Add new place: drop pin or search → form → photo upload → submit → live immediately. |
| `/profile/[username]` | Public | User profile: submitted places, written reviews, join date, avg rating given. |
| `/profile/me` | Auth | Own profile + edit. |
| `/admin` | Admin role | Flagged content queue, user management, stats, place management. |
| `/sign-in` `/sign-up` | Public | Clerk hosted UI. |

---

## 8. Core Features

### Discovery (anonymous)
- Full-screen Leaflet map, Bali bounds only, 2D top-down
- Filter: area, price range, rating (min), cuisine tags, category, place tags
- Search by name/keyword
- Pins sized/colored by score
- Click pin → slide-up preview card
- Card click → full place detail page

### Place Submission (auth required)
- Drop pin on map OR search address
- Form: name, description, category, area, price range, price notes, cuisine tags
- Photo upload via Cloudinary (max 5 photos)
- Submits live immediately (community-flagged moderation)
- Appears on submitter's public profile

### Reviews (auth required)
- 1–5 star rating
- Optional emoji reaction tags (🔥 💯 👍 👎 😐 🍽️)
- Optional text body
- Optional photos
- Upvote only by other registered users (no downvotes)
- Reviews sorted by upvote count DESC on place detail page
- Reviewer's review history visible on their public profile

### Emoji Reactions on Places (anonymous OK)
- Tap emoji on place detail or map pin popup
- Predefined set: 🔥 💯 👍 👎 😐 🍽️
- Deduped per IP hash (anonymous) or user_id (registered)
- Weight 0.5x in ranking score

### Place Tags (auth required)
- Predefined enum tags across Amenities / Vibe / Practical
- One tag per user per place (no double-tagging same tag)
- Tags shown on place detail sorted by frequency count
- Filterable on map

### Content Moderation
- All content (places, reviews) live immediately on submit
- Flag button on places and reviews — anyone can flag
- Flag goes to admin queue
- Admin reviews, approves (keep) or removes
- 3+ flags auto-hides content pending admin review

### Admin Dashboard
- Flagged content queue (places + reviews) with approve/remove actions
- User management (view, suspend, promote to admin)
- Stats: total places, reviews, users, active flags
- Place management: edit any place, force-remove

### User Profiles (public)
- Avatar, username, join date
- List of submitted places
- List of written reviews
- Avg rating given
- Anyone can view any user's full history

### Auth & Roles
- Clerk handles sign-in/sign-up (email + social)
- Two roles: `user` (default), `admin`
- Admin role assigned manually in Clerk dashboard or via DB
- Browsing + emoji reactions: no auth required
- Submit, review, tag, vote, flag: auth required

### i18n
- Indonesian + English
- Language toggle in nav
- All UI strings externalized via next-intl
- No machine translation — strings manually maintained

---

## 9. Security

- Arcjet middleware: rate limiting on all mutation routes, bot protection, attack shield
- Clerk middleware: guards all auth-required routes
- Server Actions: CSRF-protected, Zod-validated, auth-checked before any DB write
- Drizzle: parameterized queries, no raw SQL
- Cloudinary: signed upload URLs only (no direct client uploads)
- No hardcoded secrets — all via env vars
- Input validation at every boundary (Zod schemas for all forms and actions)

---

## 10. CI/CD & Quality

- **Husky** — pre-commit hooks: lint, type check, format
- **Biome** — lint + format (replaces ESLint + Prettier)
- **Fallow** — dead code, duplication, complexity detection
- **CI pipeline (GitHub Actions):**
  - Lint (Biome)
  - Type check (tsc)
  - Unit tests
  - Integration tests
  - E2E tests (Playwright)
- **Playwright** — browser testing for all critical UI flows
- Branch strategy: `main` → `stage` → feature branches per phase

---

## 11. Environment Variables

All config via env. No hardcoded values in code.

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET

# Neon
DATABASE_URL

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

# Arcjet
ARCJET_KEY

# PostHog
NEXT_PUBLIC_POSTHOG_KEY
NEXT_PUBLIC_POSTHOG_HOST

# App
NEXT_PUBLIC_APP_URL
```

---

## 12. Out of Scope (v1)

- Native mobile app
- Push notifications
- Real-time updates (WebSocket)
- Monetization / ads
- User-to-user messaging
- Delivery / ordering integration
- Outside Bali expansion
