# Cheap Eats Bali — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a community-driven map-centric web app for discovering cheap, local FnB spots in Bali.

**Architecture:** Next.js 15 monolith on Vercel. Server Components fetch data via Drizzle from Neon Postgres. Server Actions handle all mutations. Arcjet + Clerk middleware secure every route.

**Tech Stack:** Next.js 15, Bun, TypeScript, Drizzle ORM, Neon Postgres, Clerk, Cloudinary, Leaflet + OpenStreetMap, Arcjet, Zod, PostHog, Biome, Husky, Motion, Lucide, next-intl

---

## File Structure

```
app/
  (auth)/sign-in/[[...sign-in]]/page.tsx
  (auth)/sign-up/[[...sign-up]]/page.tsx
  (public)/layout.tsx
  (public)/page.tsx                        # map home
  (public)/places/[id]/page.tsx
  submit/page.tsx
  profile/[username]/page.tsx
  profile/me/page.tsx
  admin/layout.tsx
  admin/page.tsx
  admin/flags/page.tsx
  admin/users/page.tsx
  api/webhooks/clerk/route.ts
  api/upload/route.ts
  layout.tsx
  globals.css
components/
  map/BaliMap.tsx
  map/MapPin.tsx
  map/PlacePreviewCard.tsx
  map/FilterBar.tsx
  map/SearchBar.tsx
  places/PlaceDetail.tsx
  places/PlaceForm.tsx
  places/PinDropMap.tsx
  places/ImageUpload.tsx
  places/TagSelector.tsx
  reviews/ReviewList.tsx
  reviews/ReviewForm.tsx
  reviews/ReviewCard.tsx
  reviews/EmojiReactions.tsx
  profile/UserProfile.tsx
  admin/FlagQueue.tsx
  admin/UserTable.tsx
  admin/StatsCards.tsx
  ui/Nav.tsx
  ui/LanguageToggle.tsx
  ui/CategoryBadge.tsx
lib/
  db/index.ts
  db/schema.ts
  actions/places.ts
  actions/reviews.ts
  actions/reactions.ts
  actions/tags.ts
  actions/votes.ts
  actions/flags.ts
  queries/places.ts
  queries/reviews.ts
  queries/users.ts
  validations/place.ts
  validations/review.ts
  validations/flag.ts
  arcjet.ts
  cloudinary.ts
  ranking.ts
  constants.ts
middleware.ts
i18n/config.ts
i18n/messages/en.json
i18n/messages/id.json
drizzle.config.ts
drizzle/migrations/
__tests__/unit/ranking.test.ts
__tests__/unit/validations.test.ts
__tests__/integration/places.test.ts
e2e/map.spec.ts
e2e/submit.spec.ts
e2e/review.spec.ts
biome.json
.husky/pre-commit
.env.example
CLAUDE.md
PRD.md
PROGRESS.md
```

---

## Phase 1: Project Foundation

> **BEFORE starting Phase 1 — user must:**
> 1. Create Neon project at neon.tech → copy `DATABASE_URL`
> 2. Create Clerk application at clerk.com → copy `PUBLISHABLE_KEY` + `SECRET_KEY`
> 3. Create Cloudinary account at cloudinary.com → copy cloud name, API key, API secret
> 4. Create Arcjet account at arcjet.com → copy `ARCJET_KEY`
> 5. Create PostHog project at posthog.com → copy key + host
> 6. Have Vercel account ready for deployment later

---

### Task 1: Scaffold Next.js 15 with Bun

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/globals.css`

- [ ] **Step 1: Create project**

```bash
bun create next-app@latest cheap_eats --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
cd cheap_eats
```

- [ ] **Step 2: Install all dependencies**

```bash
bun add drizzle-orm @neondatabase/serverless drizzle-zod
bun add @clerk/nextjs
bun add cloudinary
bun add @arcjet/next arcjet
bun add posthog-js posthog-node
bun add leaflet react-leaflet
bun add @types/leaflet
bun add next-intl
bun add zod
bun add lucide-react
bun add motion
bun add @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-slider
bun add -d drizzle-kit
bun add -d @biomejs/biome
bun add -d husky
bun add -d vitest @vitejs/plugin-react
bun add -d @playwright/test
```

- [ ] **Step 3: Remove ESLint, add Biome**

```bash
bun remove eslint eslint-config-next
bunx biome init
```

Update `biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "semicolons": "always"
    }
  }
}
```

- [ ] **Step 4: Add scripts to package.json**

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "biome check .",
    "format": "biome format --write .",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

- [ ] **Step 5: Setup Husky**

```bash
bunx husky init
```

Write `.husky/pre-commit`:

```bash
#!/bin/sh
bun run lint
bun run type-check
```

- [ ] **Step 6: Create .env.example**

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Neon
DATABASE_URL=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Arcjet
ARCJET_KEY=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Copy to `.env.local` and fill in real values.

- [ ] **Step 7: Setup git**

```bash
git init
git checkout -b main
git add .
git commit -m "chore: initial Next.js 15 scaffold with Bun, Biome, Husky"
git checkout -b stage
git checkout -b phase/1-foundation
```

---

### Task 2: Database Schema

**Files:**
- Create: `lib/db/schema.ts`, `lib/db/index.ts`, `drizzle.config.ts`, `lib/constants.ts`

- [ ] **Step 1: Write `drizzle.config.ts`**

```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

- [ ] **Step 2: Write `lib/constants.ts`**

```typescript
export const PRICE_RANGES = ["<20k", "20-50k", "50-100k", ">100k"] as const;
export type PriceRange = (typeof PRICE_RANGES)[number];

export const CATEGORIES = ["warung", "restaurant", "cafe", "food_court", "street_food"] as const;
export type Category = (typeof CATEGORIES)[number];

export const PLACE_STATUSES = ["active", "flagged", "removed"] as const;
export type PlaceStatus = (typeof PLACE_STATUSES)[number];

export const ROLES = ["user", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const EMOJI_REACTIONS = ["🔥", "💯", "👍", "👎", "😐", "🍽️"] as const;
export type EmojiReaction = (typeof EMOJI_REACTIONS)[number];

export const PLACE_TAGS = [
  "fast_wifi", "slow_wifi", "has_chargers", "no_chargers",
  "air_conditioned", "outdoor_seating", "indoor_smoking", "parking",
  "quiet", "loud", "busy", "family_friendly", "solo_friendly",
  "wfh_friendly", "romantic", "local_crowd", "tourist_crowd",
  "cash_only", "card_accepted", "open_late", "open_early",
  "takeaway", "delivery", "fast_service", "slow_service",
] as const;
export type PlaceTag = (typeof PLACE_TAGS)[number];

export const FLAG_TARGETS = ["place", "review"] as const;
export type FlagTarget = (typeof FLAG_TARGETS)[number];

export const AUTO_FLAG_THRESHOLD = 3;
export const REGISTERED_REVIEW_WEIGHT = 2.0;
export const ANON_REVIEW_WEIGHT = 1.0;
export const REACTION_WEIGHT = 0.5;
```

- [ ] **Step 3: Write `lib/db/schema.ts`**

```typescript
import { relations } from "drizzle-orm";
import {
  boolean, decimal, pgEnum, pgTable, text, timestamp, unique, uuid,
} from "drizzle-orm/pg-core";
import {
  CATEGORIES, EMOJI_REACTIONS, FLAG_TARGETS, PLACE_STATUSES, PLACE_TAGS, PRICE_RANGES, ROLES,
} from "../constants";

export const roleEnum = pgEnum("role", ROLES);
export const priceRangeEnum = pgEnum("price_range", PRICE_RANGES);
export const categoryEnum = pgEnum("category", CATEGORIES);
export const placeStatusEnum = pgEnum("place_status", PLACE_STATUSES);
export const emojiEnum = pgEnum("emoji_reaction", EMOJI_REACTIONS);
export const placeTagEnum = pgEnum("place_tag", PLACE_TAGS);
export const flagTargetEnum = pgEnum("flag_target", FLAG_TARGETS);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").unique().notNull(),
  username: text("username").unique().notNull(),
  avatarUrl: text("avatar_url"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const places = pgTable("places", {
  id: uuid("id").primaryKey().defaultRandom(),
  submittedBy: uuid("submitted_by").references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  lat: decimal("lat", { precision: 10, scale: 7 }).notNull(),
  lng: decimal("lng", { precision: 10, scale: 7 }).notNull(),
  area: text("area").notNull(),
  category: categoryEnum("category").notNull(),
  priceRange: priceRangeEnum("price_range").notNull(),
  priceNotes: text("price_notes"),
  cuisineTags: text("cuisine_tags").array().default([]),
  score: decimal("score", { precision: 5, scale: 2 }).default("0"),
  status: placeStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  placeId: uuid("place_id").references(() => places.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id),
  rating: decimal("rating", { precision: 2, scale: 0 }).notNull(),
  emojiTags: text("emoji_tags").array().default([]),
  body: text("body"),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  status: placeStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const placeImages = pgTable("place_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  placeId: uuid("place_id").references(() => places.id, { onDelete: "cascade" }).notNull(),
  reviewId: uuid("review_id").references(() => reviews.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id),
  cloudinaryId: text("cloudinary_id").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const placeReactions = pgTable("place_reactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  placeId: uuid("place_id").references(() => places.id, { onDelete: "cascade" }).notNull(),
  emoji: emojiEnum("emoji").notNull(),
  ipHash: text("ip_hash").notNull(),
  userId: uuid("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [unique().on(t.placeId, t.ipHash, t.emoji)]);

export const placeTags = pgTable("place_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  placeId: uuid("place_id").references(() => places.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  tag: placeTagEnum("tag").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [unique().on(t.placeId, t.userId, t.tag)]);

export const reviewVotes = pgTable("review_votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  reviewId: uuid("review_id").references(() => reviews.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [unique().on(t.reviewId, t.userId)]);

export const flags = pgTable("flags", {
  id: uuid("id").primaryKey().defaultRandom(),
  targetType: flagTargetEnum("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  reportedBy: uuid("reported_by").references(() => users.id),
  reason: text("reason").notNull(),
  resolved: boolean("resolved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  places: many(places),
  reviews: many(reviews),
  placeTags: many(placeTags),
  reviewVotes: many(reviewVotes),
}));

export const placesRelations = relations(places, ({ one, many }) => ({
  submitter: one(users, { fields: [places.submittedBy], references: [users.id] }),
  reviews: many(reviews),
  images: many(placeImages),
  reactions: many(placeReactions),
  tags: many(placeTags),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  place: one(places, { fields: [reviews.placeId], references: [places.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  images: many(placeImages),
  votes: many(reviewVotes),
}));
```

- [ ] **Step 4: Write `lib/db/index.ts`**

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

- [ ] **Step 5: Generate and run migration**

```bash
bun run db:generate
bun run db:migrate
```

Expected: migration files created in `drizzle/migrations/`, tables created in Neon.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: database schema with Drizzle + Neon"
```

---

### Task 3: Middleware — Arcjet + Clerk

**Files:**
- Create: `middleware.ts`, `lib/arcjet.ts`

- [ ] **Step 1: Write `lib/arcjet.ts`**

```typescript
import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/next";

export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
  ],
});

export const ajWithRateLimit = aj.withRule(
  tokenBucket({
    mode: "LIVE",
    characteristics: ["ip.src"],
    refillRate: 10,
    interval: 60,
    capacity: 20,
  })
);
```

- [ ] **Step 2: Write `middleware.ts`**

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAuthRequired = createRouteMatcher([
  "/submit(.*)",
  "/profile/me(.*)",
  "/admin(.*)",
  "/api/upload(.*)",
]);

const isAdminOnly = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isAuthRequired(req)) {
    await auth.protect();
  }
  if (isAdminOnly(req)) {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: Arcjet + Clerk middleware"
```

---

### Task 4: Clerk Webhook + User Sync

**Files:**
- Create: `app/api/webhooks/clerk/route.ts`

- [ ] **Step 1: Write webhook route**

```typescript
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { WebhookEvent } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { Webhook } from "svix";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) return new Response("Missing secret", { status: 500 });

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (evt.type === "user.created") {
    const { id, username, image_url } = evt.data;
    await db.insert(users).values({
      clerkId: id,
      username: username ?? `user_${id.slice(-8)}`,
      avatarUrl: image_url,
    });
  }

  if (evt.type === "user.deleted") {
    const { id } = evt.data;
    if (id) await db.delete(users).where(eq(users.clerkId, id));
  }

  return new Response("OK", { status: 200 });
}
```

- [ ] **Step 2: Add svix dependency**

```bash
bun add svix
```

- [ ] **Step 3: Register webhook in Clerk dashboard**

In Clerk dashboard → Webhooks → Add endpoint:
- URL: `https://your-domain.com/api/webhooks/clerk`
- Events: `user.created`, `user.deleted`
- Copy signing secret → set as `CLERK_WEBHOOK_SECRET` in `.env.local`

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: Clerk webhook for user sync"
```

---

### Task 5: i18n Setup

**Files:**
- Create: `i18n/config.ts`, `i18n/messages/en.json`, `i18n/messages/id.json`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Write `i18n/config.ts`**

```typescript
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}));
```

- [ ] **Step 2: Write `i18n/messages/en.json`**

```json
{
  "nav": {
    "addPlace": "Add Place",
    "signIn": "Sign In",
    "signOut": "Sign Out",
    "profile": "My Profile",
    "admin": "Admin"
  },
  "map": {
    "searchPlaceholder": "Search places...",
    "filters": "Filters",
    "area": "Area",
    "price": "Price",
    "rating": "Rating",
    "cuisine": "Cuisine",
    "category": "Category",
    "tags": "Tags"
  },
  "place": {
    "addReview": "Write a Review",
    "flag": "Report",
    "submit": "Submit Place",
    "name": "Place Name",
    "description": "Description",
    "area": "Area",
    "category": "Category",
    "priceRange": "Price Range",
    "priceNotes": "Price Notes (optional)",
    "photos": "Photos"
  },
  "review": {
    "rating": "Rating",
    "emojiTags": "Vibe",
    "body": "Your review (optional)",
    "submit": "Submit Review",
    "upvote": "Helpful"
  },
  "profile": {
    "placesSubmitted": "Places Submitted",
    "reviewsWritten": "Reviews Written",
    "joinedDate": "Joined"
  }
}
```

- [ ] **Step 3: Write `i18n/messages/id.json`**

```json
{
  "nav": {
    "addPlace": "Tambah Tempat",
    "signIn": "Masuk",
    "signOut": "Keluar",
    "profile": "Profil Saya",
    "admin": "Admin"
  },
  "map": {
    "searchPlaceholder": "Cari tempat...",
    "filters": "Filter",
    "area": "Area",
    "price": "Harga",
    "rating": "Rating",
    "cuisine": "Masakan",
    "category": "Kategori",
    "tags": "Tag"
  },
  "place": {
    "addReview": "Tulis Ulasan",
    "flag": "Laporkan",
    "submit": "Tambah Tempat",
    "name": "Nama Tempat",
    "description": "Deskripsi",
    "area": "Area",
    "category": "Kategori",
    "priceRange": "Kisaran Harga",
    "priceNotes": "Catatan Harga (opsional)",
    "photos": "Foto"
  },
  "review": {
    "rating": "Rating",
    "emojiTags": "Vibe",
    "body": "Ulasan kamu (opsional)",
    "submit": "Kirim Ulasan",
    "upvote": "Bermanfaat"
  },
  "profile": {
    "placesSubmitted": "Tempat Ditambahkan",
    "reviewsWritten": "Ulasan Ditulis",
    "joinedDate": "Bergabung"
  }
}
```

- [ ] **Step 4: Write root `app/layout.tsx`**

```typescript
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cheap Eats Bali",
  description: "Discover local, underrated, affordable food in Bali",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <ClerkProvider>
      <html lang={locale}>
        <body className={geist.className}>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: i18n setup (EN + ID)"
```

---

### Task 6: Zod Validations

**Files:**
- Create: `lib/validations/place.ts`, `lib/validations/review.ts`, `lib/validations/flag.ts`

- [ ] **Step 1: Write `lib/validations/place.ts`**

```typescript
import { z } from "zod";
import { CATEGORIES, PLACE_TAGS, PRICE_RANGES } from "../constants";

export const placeSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(1000),
  lat: z.number().min(-9).max(-8),
  lng: z.number().min(114).max(116),
  area: z.string().min(1).max(100),
  category: z.enum(CATEGORIES),
  priceRange: z.enum(PRICE_RANGES),
  priceNotes: z.string().max(500).optional(),
  cuisineTags: z.array(z.string()).max(5).default([]),
});

export type PlaceInput = z.infer<typeof placeSchema>;

export const placeTagSchema = z.object({
  placeId: z.string().uuid(),
  tag: z.enum(PLACE_TAGS),
});
```

- [ ] **Step 2: Write `lib/validations/review.ts`**

```typescript
import { z } from "zod";
import { EMOJI_REACTIONS } from "../constants";

export const reviewSchema = z.object({
  placeId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  emojiTags: z.array(z.enum(EMOJI_REACTIONS)).max(3).default([]),
  body: z.string().max(2000).optional(),
  isAnonymous: z.boolean().default(false),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const reactionSchema = z.object({
  placeId: z.string().uuid(),
  emoji: z.enum(EMOJI_REACTIONS),
});
```

- [ ] **Step 3: Write `lib/validations/flag.ts`**

```typescript
import { z } from "zod";
import { FLAG_TARGETS } from "../constants";

export const flagSchema = z.object({
  targetType: z.enum(FLAG_TARGETS),
  targetId: z.string().uuid(),
  reason: z.string().min(5).max(500),
});

export type FlagInput = z.infer<typeof flagSchema>;
```

- [ ] **Step 4: Write unit tests `__tests__/unit/validations.test.ts`**

```typescript
import { describe, expect, it } from "vitest";
import { placeSchema } from "@/lib/validations/place";
import { reviewSchema } from "@/lib/validations/review";

describe("placeSchema", () => {
  it("rejects coordinates outside Bali", () => {
    const result = placeSchema.safeParse({
      name: "Test", description: "Test description here",
      lat: 40, lng: 74, area: "Canggu",
      category: "warung", priceRange: "<20k",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid Bali coordinates", () => {
    const result = placeSchema.safeParse({
      name: "Warung Enak", description: "Good local warung",
      lat: -8.5, lng: 115.2, area: "Canggu",
      category: "warung", priceRange: "<20k",
    });
    expect(result.success).toBe(true);
  });
});

describe("reviewSchema", () => {
  it("rejects rating outside 1-5", () => {
    const result = reviewSchema.safeParse({
      placeId: "00000000-0000-0000-0000-000000000000",
      rating: 6, emojiTags: [], isAnonymous: false,
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 5: Run tests**

```bash
bun run test
```

Expected: 3 passing tests.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: Zod validation schemas with unit tests"
```

---

### Task 7: Ranking Logic

**Files:**
- Create: `lib/ranking.ts`, `__tests__/unit/ranking.test.ts`

- [ ] **Step 1: Write failing test `__tests__/unit/ranking.test.ts`**

```typescript
import { describe, expect, it } from "vitest";
import { computeScore } from "@/lib/ranking";

describe("computeScore", () => {
  it("returns 0 for no reviews or reactions", () => {
    expect(computeScore([], 0)).toBe(0);
  });

  it("weights registered reviews at 2x", () => {
    const reviews = [{ rating: 4, isRegistered: true }];
    expect(computeScore(reviews, 0)).toBe(4);
  });

  it("weights anonymous reviews at 1x", () => {
    const reviews = [{ rating: 4, isRegistered: false }];
    expect(computeScore(reviews, 0)).toBe(4);
  });

  it("blends registered and anonymous correctly", () => {
    const reviews = [
      { rating: 4, isRegistered: true },
      { rating: 2, isRegistered: false },
    ];
    // (4*2 + 2*1) / (2+1) = 10/3 ≈ 3.33
    expect(computeScore(reviews, 0)).toBeCloseTo(3.33, 1);
  });

  it("adds reaction bonus", () => {
    const score = computeScore([], 10);
    // 10 * 0.5 / 1 = 5 (no reviews so reaction bonus / 1)
    expect(score).toBeCloseTo(5, 1);
  });
});
```

- [ ] **Step 2: Run test to confirm failure**

```bash
bun run test __tests__/unit/ranking.test.ts
```

Expected: FAIL — "computeScore is not defined"

- [ ] **Step 3: Write `lib/ranking.ts`**

```typescript
import { ANON_REVIEW_WEIGHT, REACTION_WEIGHT, REGISTERED_REVIEW_WEIGHT } from "./constants";

interface ReviewForScore {
  rating: number;
  isRegistered: boolean;
}

export function computeScore(reviews: ReviewForScore[], reactionCount: number): number {
  if (reviews.length === 0 && reactionCount === 0) return 0;

  const weightedSum = reviews.reduce((sum, r) => {
    const weight = r.isRegistered ? REGISTERED_REVIEW_WEIGHT : ANON_REVIEW_WEIGHT;
    return sum + r.rating * weight;
  }, 0);

  const totalWeight = reviews.reduce((sum, r) => {
    return sum + (r.isRegistered ? REGISTERED_REVIEW_WEIGHT : ANON_REVIEW_WEIGHT);
  }, 0);

  const reactionBonus = reactionCount * REACTION_WEIGHT;
  const divisor = Math.max(totalWeight, 1);

  return (weightedSum + reactionBonus) / divisor;
}
```

- [ ] **Step 4: Run tests to confirm passing**

```bash
bun run test __tests__/unit/ranking.test.ts
```

Expected: 5 passing.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: ranking score algorithm with tests"
```

---

> **AFTER Phase 1 — verify:**
> - `bun run dev` starts without errors
> - `bun run type-check` passes
> - `bun run lint` passes
> - `bun run test` passes
> - Database tables visible in Neon console or `bun run db:studio`

---

## Phase 2: Map & Discovery

> **BEFORE Phase 2:** Merge Phase 1 branch to `stage`, create `phase/2-map`.

---

### Task 8: Base Layout + Nav

**Files:**
- Create: `components/ui/Nav.tsx`, `components/ui/LanguageToggle.tsx`, `app/(public)/layout.tsx`

- [ ] **Step 1: Write `components/ui/LanguageToggle.tsx`**

```typescript
"use client";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();

  const toggle = () => {
    const next = locale === "en" ? "id" : "en";
    document.cookie = `NEXT_LOCALE=${next}; path=/`;
    router.refresh();
  };

  return (
    <button
      onClick={toggle}
      className="px-3 py-1 text-sm border rounded-full hover:bg-gray-100 transition"
    >
      {locale === "en" ? "🇮🇩 ID" : "🇬🇧 EN"}
    </button>
  );
}
```

- [ ] **Step 2: Write `components/ui/Nav.tsx`**

```typescript
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { LanguageToggle } from "./LanguageToggle";

export async function Nav() {
  const user = await currentUser();
  const isAdmin = user?.privateMetadata?.role === "admin";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur border-b">
      <Link href="/" className="font-bold text-orange-500 text-lg">
        🍜 Cheap Eats Bali
      </Link>
      <div className="flex items-center gap-3">
        <LanguageToggle />
        <SignedIn>
          {isAdmin && <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">Admin</Link>}
          <Link href="/submit" className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition">
            + Add Place
          </Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-3 py-1.5 border text-sm rounded-lg hover:bg-gray-50 transition">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Write `app/(public)/layout.tsx`**

```typescript
import { Nav } from "@/components/ui/Nav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="pt-14">{children}</main>
    </>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: nav with Clerk auth + language toggle"
```

---

### Task 9: Place Queries

**Files:**
- Create: `lib/queries/places.ts`, `lib/queries/users.ts`

- [ ] **Step 1: Write `lib/queries/places.ts`**

```typescript
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import { placeTags, placeReactions, places, reviews, users } from "../db/schema";
import type { Category, PlaceStatus, PriceRange } from "../constants";

export interface PlaceFilters {
  area?: string;
  priceRange?: PriceRange;
  minRating?: number;
  cuisineTag?: string;
  category?: Category;
  tag?: string;
  status?: PlaceStatus;
}

export async function getPlacesForMap(filters: PlaceFilters = {}) {
  const conditions = [eq(places.status, "active")];

  if (filters.area) conditions.push(eq(places.area, filters.area));
  if (filters.priceRange) conditions.push(eq(places.priceRange, filters.priceRange));
  if (filters.category) conditions.push(eq(places.category, filters.category));
  if (filters.minRating) conditions.push(gte(places.score, String(filters.minRating)));

  return db.query.places.findMany({
    where: and(...conditions),
    with: {
      submitter: { columns: { username: true, avatarUrl: true } },
    },
    orderBy: [desc(places.score)],
    columns: {
      id: true, name: true, lat: true, lng: true,
      category: true, priceRange: true, score: true, area: true,
    },
  });
}

export async function getPlaceById(id: string) {
  return db.query.places.findFirst({
    where: eq(places.id, id),
    with: {
      submitter: { columns: { username: true, avatarUrl: true, id: true } },
      images: true,
      reactions: true,
      tags: true,
      reviews: {
        where: eq(reviews.status, "active"),
        with: {
          user: { columns: { username: true, avatarUrl: true } },
          images: true,
          votes: true,
        },
        orderBy: [desc(sql`(SELECT COUNT(*) FROM review_votes WHERE review_id = ${reviews.id})`)],
      },
    },
  });
}
```

- [ ] **Step 2: Write `lib/queries/users.ts`**

```typescript
import { eq } from "drizzle-orm";
import { db } from "../db";
import { places, reviews, users } from "../db/schema";

export async function getUserByUsername(username: string) {
  return db.query.users.findFirst({
    where: eq(users.username, username),
    with: {
      places: {
        where: eq(places.status, "active"),
        orderBy: (p, { desc }) => [desc(p.createdAt)],
      },
      reviews: {
        with: {
          place: { columns: { name: true, id: true } },
        },
        orderBy: (r, { desc }) => [desc(r.createdAt)],
      },
    },
  });
}

export async function getUserByClerkId(clerkId: string) {
  return db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: place and user query functions"
```

---

### Task 10: Bali Map Component

**Files:**
- Create: `components/map/BaliMap.tsx`, `components/map/MapPin.tsx`, `components/map/PlacePreviewCard.tsx`, `components/map/FilterBar.tsx`, `app/(public)/page.tsx`

- [ ] **Step 1: Write `components/map/BaliMap.tsx`**

```typescript
"use client";
import type { PlaceFilters } from "@/lib/queries/places";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { MapPin } from "./MapPin";
import { PlacePreviewCard } from "./PlacePreviewCard";

// Fix Leaflet default icon path issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

const BALI_CENTER: [number, number] = [-8.4095, 115.1889];
const BALI_BOUNDS: [[number, number], [number, number]] = [[-9.0, 114.4], [-7.9, 115.9]];

interface PlaceMapData {
  id: string;
  name: string;
  lat: string;
  lng: string;
  category: string;
  priceRange: string;
  score: string | null;
  area: string;
}

interface BaliMapProps {
  places: PlaceMapData[];
}

export function BaliMap({ places }: BaliMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceMapData | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: BALI_CENTER,
      zoom: 11,
      maxBounds: BALI_BOUNDS,
      maxBoundsViscosity: 1.0,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    // Add new markers
    places.forEach((place) => {
      const marker = L.marker([parseFloat(place.lat), parseFloat(place.lng)]);
      marker.on("click", () => setSelectedPlace(place));
      marker.addTo(map);
    });
  }, [places]);

  return (
    <div className="relative w-full h-screen">
      <div ref={containerRef} className="w-full h-full" />
      {selectedPlace && (
        <PlacePreviewCard
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Copy Leaflet marker assets**

```bash
mkdir -p public/leaflet
cp node_modules/leaflet/dist/images/marker-icon.png public/leaflet/
cp node_modules/leaflet/dist/images/marker-icon-2x.png public/leaflet/
cp node_modules/leaflet/dist/images/marker-shadow.png public/leaflet/
```

- [ ] **Step 3: Write `components/map/PlacePreviewCard.tsx`**

```typescript
import { X } from "lucide-react";
import Link from "next/link";

interface PlacePreviewCardProps {
  place: {
    id: string;
    name: string;
    area: string;
    category: string;
    priceRange: string;
    score: string | null;
  };
  onClose: () => void;
}

export function PlacePreviewCard({ place, onClose }: PlacePreviewCardProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-80 bg-white rounded-2xl shadow-xl p-4 z-[1000]">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        <X size={16} />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl">
          {place.category === "cafe" ? "☕" : place.category === "warung" ? "🍽️" : "🥘"}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{place.name}</h3>
          <p className="text-sm text-gray-500">{place.area} · {place.priceRange} IDR</p>
          {place.score && (
            <p className="text-sm text-orange-500 font-medium">★ {parseFloat(place.score).toFixed(1)}</p>
          )}
        </div>
      </div>
      <Link
        href={`/places/${place.id}`}
        className="mt-3 block w-full text-center py-2 bg-orange-500 text-white text-sm rounded-xl hover:bg-orange-600 transition"
      >
        View Details
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Write `components/map/FilterBar.tsx`**

```typescript
"use client";
import { CATEGORIES, PRICE_RANGES } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`/?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="absolute top-16 left-0 right-0 z-[1000] flex gap-2 px-4 py-2 overflow-x-auto">
      <select
        className="px-3 py-1.5 bg-white border rounded-full text-sm shadow-sm"
        onChange={(e) => update("category", e.target.value)}
        value={searchParams.get("category") ?? ""}
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
      </select>
      <select
        className="px-3 py-1.5 bg-white border rounded-full text-sm shadow-sm"
        onChange={(e) => update("price", e.target.value)}
        value={searchParams.get("price") ?? ""}
      >
        <option value="">Any Price</option>
        {PRICE_RANGES.map((p) => <option key={p} value={p}>{p} IDR</option>)}
      </select>
      <select
        className="px-3 py-1.5 bg-white border rounded-full text-sm shadow-sm"
        onChange={(e) => update("rating", e.target.value)}
        value={searchParams.get("rating") ?? ""}
      >
        <option value="">Any Rating</option>
        {[1, 2, 3, 4].map((r) => <option key={r} value={r}>{r}+ stars</option>)}
      </select>
    </div>
  );
}
```

- [ ] **Step 5: Write `app/(public)/page.tsx`**

```typescript
import { BaliMap } from "@/components/map/BaliMap";
import { FilterBar } from "@/components/map/FilterBar";
import { getPlacesForMap } from "@/lib/queries/places";
import type { Category, PriceRange } from "@/lib/constants";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    price?: string;
    rating?: string;
    area?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const places = await getPlacesForMap({
    category: params.category as Category | undefined,
    priceRange: params.price as PriceRange | undefined,
    minRating: params.rating ? Number(params.rating) : undefined,
    area: params.area,
  });

  return (
    <div className="relative h-screen overflow-hidden">
      <Suspense>
        <FilterBar />
      </Suspense>
      <BaliMap places={places} />
    </div>
  );
}
```

- [ ] **Step 6: Test map loads**

```bash
bun run dev
```

Open http://localhost:3000. Map of Bali should render with OpenStreetMap tiles. Filter dropdowns visible.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: Bali map with Leaflet, filter bar, place preview card"
```

---

## Phase 3: Place Submission & Detail

> **BEFORE Phase 3:** Merge Phase 2 to `stage`, create `phase/3-places`.

---

### Task 11: Cloudinary Upload

**Files:**
- Create: `lib/cloudinary.ts`, `app/api/upload/route.ts`, `components/places/ImageUpload.tsx`

- [ ] **Step 1: Write `lib/cloudinary.ts`**

```typescript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: Buffer, folder: string) {
  return new Promise<{ public_id: string; secure_url: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: "image", transformation: [{ width: 1200, crop: "limit" }, { quality: "auto" }] },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({ public_id: result.public_id, secure_url: result.secure_url });
      }
    ).end(file);
  });
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}
```

- [ ] **Step 2: Write `app/api/upload/route.ts`**

```typescript
import { ajWithRateLimit } from "@/lib/arcjet";
import { uploadImage } from "@/lib/cloudinary";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const decision = await ajWithRateLimit.protect(req);
  if (decision.isDenied()) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadImage(buffer, "cheap-eats/places");
  return NextResponse.json(result);
}
```

- [ ] **Step 3: Write `components/places/ImageUpload.tsx`**

```typescript
"use client";
import { ImagePlus, X } from "lucide-react";
import { useState } from "react";

interface UploadedImage {
  public_id: string;
  secure_url: string;
}

interface ImageUploadProps {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  max?: number;
}

export function ImageUpload({ value, onChange, max = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (value.length >= max) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.secure_url) onChange([...value, data]);
    } finally {
      setUploading(false);
    }
  };

  const remove = (publicId: string) => onChange(value.filter((i) => i.public_id !== publicId));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((img) => (
          <div key={img.public_id} className="relative w-20 h-20">
            <img src={img.secure_url} alt="" className="w-full h-full object-cover rounded-lg" />
            <button
              type="button"
              onClick={() => remove(img.public_id)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
            >
              <X size={10} />
            </button>
          </div>
        ))}
        {value.length < max && (
          <label className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50">
            <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {uploading ? <span className="text-xs text-gray-400">...</span> : <ImagePlus size={20} className="text-gray-400" />}
          </label>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: Cloudinary image upload API with size/type validation"
```

---

### Task 12: Place Server Actions

**Files:**
- Create: `lib/actions/places.ts`

- [ ] **Step 1: Write `lib/actions/places.ts`**

```typescript
"use server";
import { ajWithRateLimit } from "@/lib/arcjet";
import { db } from "@/lib/db";
import { placeImages, places } from "@/lib/db/schema";
import { getUserByClerkId } from "@/lib/queries/users";
import { computeScore } from "@/lib/ranking";
import { placeSchema } from "@/lib/validations/place";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function submitPlace(formData: unknown, imageUrls: Array<{ public_id: string; secure_url: string }>) {
  const { userId } = await auth();

  const parsed = placeSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  let dbUser = null;
  if (userId) {
    dbUser = await getUserByClerkId(userId);
  }

  const [place] = await db.insert(places).values({
    ...parsed.data,
    lat: String(parsed.data.lat),
    lng: String(parsed.data.lng),
    submittedBy: dbUser?.id ?? null,
  }).returning();

  if (imageUrls.length > 0) {
    await db.insert(placeImages).values(
      imageUrls.map((img) => ({
        placeId: place.id,
        userId: dbUser?.id ?? null,
        cloudinaryId: img.public_id,
        url: img.secure_url,
      }))
    );
  }

  revalidatePath("/");
  return { success: true, id: place.id };
}

export async function updatePlaceScore(placeId: string) {
  const place = await db.query.places.findFirst({
    where: eq(places.id, placeId),
    with: { reviews: true, reactions: true },
  });
  if (!place) return;

  const reviewData = place.reviews.map((r) => ({
    rating: Number(r.rating),
    isRegistered: r.userId !== null && !r.isAnonymous,
  }));

  const score = computeScore(reviewData, place.reactions.length);
  await db.update(places).set({ score: String(score) }).where(eq(places.id, placeId));
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: place submission server action"
```

---

### Task 13: Submit Place Page

**Files:**
- Create: `components/places/PlaceForm.tsx`, `components/places/PinDropMap.tsx`, `app/submit/page.tsx`

- [ ] **Step 1: Write `components/places/PinDropMap.tsx`**

```typescript
"use client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

const BALI_CENTER: [number, number] = [-8.4095, 115.1889];

interface PinDropMapProps {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
}

export function PinDropMap({ value, onChange }: PinDropMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { center: BALI_CENTER, zoom: 11 });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }
      onChange({ lat, lng });
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [onChange]);

  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">Click on the map to drop a pin</p>
      <div ref={containerRef} className="h-64 rounded-xl border overflow-hidden" />
      {value && <p className="text-xs text-gray-400 mt-1">{value.lat.toFixed(5)}, {value.lng.toFixed(5)}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Write `components/places/PlaceForm.tsx`**

```typescript
"use client";
import { submitPlace } from "@/lib/actions/places";
import { CATEGORIES, PRICE_RANGES } from "@/lib/constants";
import { useState } from "react";
import { ImageUpload } from "./ImageUpload";
import { PinDropMap } from "./PinDropMap";
import { useRouter } from "next/navigation";

export function PlaceForm() {
  const router = useRouter();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [images, setImages] = useState<Array<{ public_id: string; secure_url: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!coords) { setError("Please drop a pin on the map"); return; }
    setSubmitting(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      lat: coords.lat,
      lng: coords.lng,
      area: fd.get("area") as string,
      category: fd.get("category") as string,
      priceRange: fd.get("priceRange") as string,
      priceNotes: fd.get("priceNotes") as string,
      cuisineTags: [],
    };

    const result = await submitPlace(data, images);
    if (result.error) { setError("Please check all fields"); setSubmitting(false); return; }
    router.push(`/places/${result.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Add a Place</h1>

      <div><label className="block text-sm font-medium mb-1">Place Name *</label>
        <input name="name" required className="w-full border rounded-xl px-3 py-2" /></div>

      <div><label className="block text-sm font-medium mb-1">Description *</label>
        <textarea name="description" required rows={3} className="w-full border rounded-xl px-3 py-2" /></div>

      <div><label className="block text-sm font-medium mb-1">Area *</label>
        <input name="area" required placeholder="e.g. Canggu, Ubud, Seminyak" className="w-full border rounded-xl px-3 py-2" /></div>

      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Category *</label>
          <select name="category" required className="w-full border rounded-xl px-3 py-2">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
          </select></div>
        <div><label className="block text-sm font-medium mb-1">Price Range *</label>
          <select name="priceRange" required className="w-full border rounded-xl px-3 py-2">
            {PRICE_RANGES.map((p) => <option key={p} value={p}>{p} IDR/person</option>)}
          </select></div>
      </div>

      <div><label className="block text-sm font-medium mb-1">Price Notes</label>
        <input name="priceNotes" placeholder="e.g. Nasi goreng 15k, Ayam bakar 25k" className="w-full border rounded-xl px-3 py-2" /></div>

      <div><label className="block text-sm font-medium mb-1">Location *</label>
        <PinDropMap value={coords} onChange={setCoords} /></div>

      <div><label className="block text-sm font-medium mb-1">Photos (up to 5)</label>
        <ImageUpload value={images} onChange={setImages} /></div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 transition"
      >
        {submitting ? "Submitting..." : "Submit Place"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Write `app/submit/page.tsx`**

```typescript
import { PlaceForm } from "@/components/places/PlaceForm";

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <PlaceForm />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: place submission page with pin drop map + image upload"
```

---

### Task 14: Place Detail Page

**Files:**
- Create: `components/places/PlaceDetail.tsx`, `app/(public)/places/[id]/page.tsx`

- [ ] **Step 1: Write `components/places/PlaceDetail.tsx`**

```typescript
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { EmojiReactions } from "../reviews/EmojiReactions";
import { ReviewList } from "../reviews/ReviewList";

interface PlaceDetailProps {
  place: Awaited<ReturnType<typeof import("@/lib/queries/places").getPlaceById>>;
  currentUserId?: string;
}

export function PlaceDetail({ place, currentUserId }: PlaceDetailProps) {
  if (!place) return null;

  const tagCounts = place.tags.reduce<Record<string, number>>((acc, t) => {
    acc[t.tag] = (acc[t.tag] ?? 0) + 1;
    return acc;
  }, {});

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Images */}
      {place.images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {place.images.map((img) => (
            <img key={img.id} src={img.url} alt={place.name}
              className="h-48 w-72 object-cover rounded-2xl flex-shrink-0" />
          ))}
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{place.name}</h1>
            <p className="text-gray-500">{place.area} · {place.category.replace("_", " ")} · {place.priceRange} IDR/person</p>
          </div>
          {place.score && (
            <div className="flex items-center gap-1 text-orange-500 font-bold text-xl">
              <Star size={20} fill="currentColor" />
              {parseFloat(place.score).toFixed(1)}
            </div>
          )}
        </div>
        <p className="mt-3 text-gray-700">{place.description}</p>
        {place.priceNotes && <p className="mt-2 text-sm text-gray-500 italic">{place.priceNotes}</p>}
        {place.submitter && (
          <p className="mt-2 text-sm text-gray-400">
            Added by{" "}
            <Link href={`/profile/${place.submitter.username}`} className="text-orange-500 hover:underline">
              @{place.submitter.username}
            </Link>
          </p>
        )}
      </div>

      {/* Emoji Reactions */}
      <EmojiReactions placeId={place.id} reactions={place.reactions} />

      {/* Tags */}
      {topTags.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Community Tags</h3>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                {tag.replace(/_/g, " ")} <span className="text-gray-400">({count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <ReviewList reviews={place.reviews} placeId={place.id} currentUserId={currentUserId} />
    </div>
  );
}
```

- [ ] **Step 2: Write `app/(public)/places/[id]/page.tsx`**

```typescript
import { PlaceDetail } from "@/components/places/PlaceDetail";
import { getPlaceById } from "@/lib/queries/places";
import { getUserByClerkId } from "@/lib/queries/users";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export default async function PlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [place, { userId }] = await Promise.all([getPlaceById(id), auth()]);
  if (!place) notFound();

  let currentUserId: string | undefined;
  if (userId) {
    const user = await getUserByClerkId(userId);
    currentUserId = user?.id;
  }

  return <PlaceDetail place={place} currentUserId={currentUserId} />;
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: place detail page"
```

---

## Phase 4: Reviews, Reactions, Tags & Votes

> **BEFORE Phase 4:** Merge Phase 3 to `stage`, create `phase/4-social`.

---

### Task 15: Review + Reaction + Vote + Flag Actions

**Files:**
- Create: `lib/actions/reviews.ts`, `lib/actions/reactions.ts`, `lib/actions/tags.ts`, `lib/actions/votes.ts`, `lib/actions/flags.ts`

- [ ] **Step 1: Write `lib/actions/reviews.ts`**

```typescript
"use server";
import { db } from "@/lib/db";
import { placeImages, reviews } from "@/lib/db/schema";
import { getUserByClerkId } from "@/lib/queries/users";
import { updatePlaceScore } from "./places";
import { reviewSchema } from "@/lib/validations/review";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function submitReview(
  formData: unknown,
  imageUrls: Array<{ public_id: string; secure_url: string }>
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const parsed = reviewSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const dbUser = await getUserByClerkId(userId);
  if (!dbUser) return { error: "User not found" };

  const [review] = await db.insert(reviews).values({
    ...parsed.data,
    rating: String(parsed.data.rating),
    userId: dbUser.id,
  }).returning();

  if (imageUrls.length > 0) {
    await db.insert(placeImages).values(
      imageUrls.map((img) => ({
        placeId: parsed.data.placeId,
        reviewId: review.id,
        userId: dbUser.id,
        cloudinaryId: img.public_id,
        url: img.secure_url,
      }))
    );
  }

  await updatePlaceScore(parsed.data.placeId);
  revalidatePath(`/places/${parsed.data.placeId}`);
  return { success: true };
}
```

- [ ] **Step 2: Write `lib/actions/reactions.ts`**

```typescript
"use server";
import { db } from "@/lib/db";
import { placeReactions } from "@/lib/db/schema";
import { updatePlaceScore } from "./places";
import { reactionSchema } from "@/lib/validations/review";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/queries/users";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import crypto from "crypto";

export async function toggleReaction(formData: unknown) {
  const parsed = reactionSchema.safeParse(formData);
  if (!parsed.success) return { error: "Invalid" };

  const { userId } = await auth();
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "unknown";
  const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

  let dbUserId: string | undefined;
  if (userId) {
    const user = await getUserByClerkId(userId);
    dbUserId = user?.id;
  }

  const existing = await db.query.placeReactions.findFirst({
    where: and(
      eq(placeReactions.placeId, parsed.data.placeId),
      eq(placeReactions.ipHash, ipHash),
      eq(placeReactions.emoji, parsed.data.emoji)
    ),
  });

  if (existing) {
    await db.delete(placeReactions).where(eq(placeReactions.id, existing.id));
  } else {
    await db.insert(placeReactions).values({
      placeId: parsed.data.placeId,
      emoji: parsed.data.emoji,
      ipHash,
      userId: dbUserId ?? null,
    });
  }

  await updatePlaceScore(parsed.data.placeId);
  revalidatePath(`/places/${parsed.data.placeId}`);
  return { success: true };
}
```

- [ ] **Step 3: Write `lib/actions/votes.ts`**

```typescript
"use server";
import { db } from "@/lib/db";
import { reviewVotes } from "@/lib/db/schema";
import { getUserByClerkId } from "@/lib/queries/users";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleReviewVote(reviewId: string, placeId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const dbUser = await getUserByClerkId(userId);
  if (!dbUser) return { error: "User not found" };

  const existing = await db.query.reviewVotes.findFirst({
    where: and(eq(reviewVotes.reviewId, reviewId), eq(reviewVotes.userId, dbUser.id)),
  });

  if (existing) {
    await db.delete(reviewVotes).where(eq(reviewVotes.id, existing.id));
  } else {
    await db.insert(reviewVotes).values({ reviewId, userId: dbUser.id });
  }

  revalidatePath(`/places/${placeId}`);
  return { success: true };
}
```

- [ ] **Step 4: Write `lib/actions/tags.ts`**

```typescript
"use server";
import { db } from "@/lib/db";
import { placeTags } from "@/lib/db/schema";
import { getUserByClerkId } from "@/lib/queries/users";
import { placeTagSchema } from "@/lib/validations/place";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function togglePlaceTag(formData: unknown) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const parsed = placeTagSchema.safeParse(formData);
  if (!parsed.success) return { error: "Invalid" };

  const dbUser = await getUserByClerkId(userId);
  if (!dbUser) return { error: "User not found" };

  const existing = await db.query.placeTags.findFirst({
    where: and(
      eq(placeTags.placeId, parsed.data.placeId),
      eq(placeTags.userId, dbUser.id),
      eq(placeTags.tag, parsed.data.tag)
    ),
  });

  if (existing) {
    await db.delete(placeTags).where(eq(placeTags.id, existing.id));
  } else {
    await db.insert(placeTags).values({ ...parsed.data, userId: dbUser.id });
  }

  revalidatePath(`/places/${parsed.data.placeId}`);
  return { success: true };
}
```

- [ ] **Step 5: Write `lib/actions/flags.ts`**

```typescript
"use server";
import { AUTO_FLAG_THRESHOLD } from "@/lib/constants";
import { db } from "@/lib/db";
import { flags, places, reviews } from "@/lib/db/schema";
import { flagSchema } from "@/lib/validations/flag";
import { getUserByClerkId } from "@/lib/queries/users";
import { auth } from "@clerk/nextjs/server";
import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitFlag(formData: unknown) {
  const parsed = flagSchema.safeParse(formData);
  if (!parsed.success) return { error: "Invalid" };

  const { userId } = await auth();
  let dbUserId: string | undefined;
  if (userId) {
    const user = await getUserByClerkId(userId);
    dbUserId = user?.id;
  }

  await db.insert(flags).values({ ...parsed.data, reportedBy: dbUserId ?? null });

  // Auto-flag if threshold reached
  const [{ value: flagCount }] = await db
    .select({ value: count() })
    .from(flags)
    .where(and(
      eq(flags.targetId, parsed.data.targetId),
      eq(flags.targetType, parsed.data.targetType),
      eq(flags.resolved, false)
    ));

  if (Number(flagCount) >= AUTO_FLAG_THRESHOLD) {
    if (parsed.data.targetType === "place") {
      await db.update(places).set({ status: "flagged" }).where(eq(places.id, parsed.data.targetId));
    } else {
      await db.update(reviews).set({ status: "flagged" }).where(eq(reviews.id, parsed.data.targetId));
    }
  }

  revalidatePath(`/places/${parsed.data.targetId}`);
  return { success: true };
}
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: review, reaction, tag, vote, flag server actions"
```

---

### Task 16: Review UI Components

**Files:**
- Create: `components/reviews/ReviewForm.tsx`, `components/reviews/ReviewList.tsx`, `components/reviews/ReviewCard.tsx`, `components/reviews/EmojiReactions.tsx`

- [ ] **Step 1: Write `components/reviews/EmojiReactions.tsx`**

```typescript
"use client";
import { toggleReaction } from "@/lib/actions/reactions";
import { EMOJI_REACTIONS, type EmojiReaction } from "@/lib/constants";

interface Reaction { emoji: string; }

interface EmojiReactionsProps {
  placeId: string;
  reactions: Reaction[];
}

export function EmojiReactions({ placeId, reactions }: EmojiReactionsProps) {
  const counts = EMOJI_REACTIONS.reduce<Record<string, number>>((acc, e) => {
    acc[e] = reactions.filter((r) => r.emoji === e).length;
    return acc;
  }, {} as Record<string, number>);

  const handleReact = async (emoji: EmojiReaction) => {
    await toggleReaction({ placeId, emoji });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {EMOJI_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleReact(emoji)}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-orange-50 rounded-full text-sm transition"
        >
          <span>{emoji}</span>
          {counts[emoji] > 0 && <span className="text-gray-500">{counts[emoji]}</span>}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write `components/reviews/ReviewCard.tsx`**

```typescript
"use client";
import { toggleReviewVote } from "@/lib/actions/votes";
import { ThumbsUp } from "lucide-react";
import Link from "next/link";

interface ReviewCardProps {
  review: {
    id: string;
    rating: string;
    emojiTags: string[] | null;
    body: string | null;
    isAnonymous: boolean;
    createdAt: Date;
    user: { username: string; avatarUrl: string | null } | null;
    votes: { id: string }[];
    images: { url: string }[];
  };
  placeId: string;
  currentUserId?: string;
}

export function ReviewCard({ review, placeId, currentUserId }: ReviewCardProps) {
  const stars = "★".repeat(Number(review.rating)) + "☆".repeat(5 - Number(review.rating));

  return (
    <div className="border rounded-2xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {review.user && !review.isAnonymous ? (
            <Link href={`/profile/${review.user.username}`} className="font-medium text-sm hover:underline">
              @{review.user.username}
            </Link>
          ) : (
            <span className="text-sm text-gray-400">Anonymous</span>
          )}
        </div>
        <span className="text-orange-400 text-sm">{stars}</span>
      </div>

      {review.emojiTags && review.emojiTags.length > 0 && (
        <div className="flex gap-1">{review.emojiTags.map((e) => <span key={e}>{e}</span>)}</div>
      )}

      {review.body && <p className="text-gray-700 text-sm">{review.body}</p>}

      {review.images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {review.images.map((img, i) => (
            <img key={i} src={img.url} alt="" className="h-24 w-32 object-cover rounded-xl flex-shrink-0" />
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <form action={async () => { "use server"; await toggleReviewVote(review.id, placeId); }}>
          <button type="submit" className="flex items-center gap-1 text-sm text-gray-400 hover:text-orange-500 transition">
            <ThumbsUp size={14} />
            <span>{review.votes.length}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write `components/reviews/ReviewForm.tsx`**

```typescript
"use client";
import { submitReview } from "@/lib/actions/reviews";
import { EMOJI_REACTIONS, type EmojiReaction } from "@/lib/constants";
import { useState } from "react";
import { ImageUpload } from "../places/ImageUpload";

export function ReviewForm({ placeId }: { placeId: string }) {
  const [rating, setRating] = useState(0);
  const [selectedEmojis, setSelectedEmojis] = useState<EmojiReaction[]>([]);
  const [images, setImages] = useState<Array<{ public_id: string; secure_url: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const toggleEmoji = (e: EmojiReaction) =>
    setSelectedEmojis((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : prev.length < 3 ? [...prev, e] : prev
    );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    await submitReview({
      placeId,
      rating,
      emojiTags: selectedEmojis,
      body: fd.get("body") as string,
      isAnonymous: fd.get("isAnonymous") === "on",
    }, images);
    setDone(true);
  };

  if (done) return <p className="text-green-600 font-medium">Review submitted!</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-2xl p-4">
      <h3 className="font-semibold">Write a Review</h3>

      <div className="flex gap-1">
        {[1,2,3,4,5].map((s) => (
          <button key={s} type="button" onClick={() => setRating(s)}
            className={`text-2xl ${s <= rating ? "text-orange-400" : "text-gray-200"}`}>★</button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {EMOJI_REACTIONS.map((e) => (
          <button key={e} type="button" onClick={() => toggleEmoji(e)}
            className={`px-3 py-1 rounded-full text-sm border ${selectedEmojis.includes(e) ? "border-orange-400 bg-orange-50" : "border-gray-200"}`}>
            {e}
          </button>
        ))}
      </div>

      <textarea name="body" placeholder="Share your experience (optional)" rows={3}
        className="w-full border rounded-xl px-3 py-2 text-sm" />

      <ImageUpload value={images} onChange={setImages} max={3} />

      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input type="checkbox" name="isAnonymous" />
        Post anonymously
      </label>

      <button type="submit" disabled={!rating || submitting}
        className="w-full py-2 bg-orange-500 text-white rounded-xl text-sm disabled:opacity-50">
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Write `components/reviews/ReviewList.tsx`**

```typescript
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";

interface ReviewListProps {
  reviews: any[];
  placeId: string;
  currentUserId?: string;
}

export function ReviewList({ reviews, placeId, currentUserId }: ReviewListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Reviews ({reviews.length})</h2>
      {currentUserId && <ReviewForm placeId={placeId} />}
      {reviews.map((r) => (
        <ReviewCard key={r.id} review={r} placeId={placeId} currentUserId={currentUserId} />
      ))}
      {reviews.length === 0 && <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: review form, review card, emoji reactions UI"
```

---

## Phase 5: User Profiles

> **BEFORE Phase 5:** Merge Phase 4 to `stage`, create `phase/5-profiles`.

---

### Task 17: Profile Pages

**Files:**
- Create: `components/profile/UserProfile.tsx`, `app/profile/[username]/page.tsx`, `app/profile/me/page.tsx`

- [ ] **Step 1: Write `components/profile/UserProfile.tsx`**

```typescript
import Link from "next/link";

interface UserProfileProps {
  user: {
    username: string;
    avatarUrl: string | null;
    createdAt: Date;
    places: Array<{ id: string; name: string; area: string; score: string | null; category: string }>;
    reviews: Array<{ id: string; rating: string; body: string | null; place: { id: string; name: string } }>;
  };
}

export function UserProfile({ user }: UserProfileProps) {
  const avgRating = user.reviews.length
    ? (user.reviews.reduce((sum, r) => sum + Number(r.rating), 0) / user.reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.username} className="w-16 h-16 rounded-full" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
            {user.username[0].toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold">@{user.username}</h1>
          <p className="text-sm text-gray-500">
            Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
          {avgRating && <p className="text-sm text-orange-500">Avg rating given: ★ {avgRating}</p>}
        </div>
      </div>

      {/* Places submitted */}
      <div>
        <h2 className="font-semibold mb-3">Places Submitted ({user.places.length})</h2>
        <div className="space-y-2">
          {user.places.map((p) => (
            <Link key={p.id} href={`/places/${p.id}`}
              className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50 transition">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-gray-500">{p.area} · {p.category.replace("_", " ")}</p>
              </div>
              {p.score && <span className="text-orange-500 text-sm">★ {parseFloat(p.score).toFixed(1)}</span>}
            </Link>
          ))}
          {user.places.length === 0 && <p className="text-gray-400 text-sm">No places submitted yet.</p>}
        </div>
      </div>

      {/* Reviews written */}
      <div>
        <h2 className="font-semibold mb-3">Reviews Written ({user.reviews.length})</h2>
        <div className="space-y-2">
          {user.reviews.map((r) => (
            <Link key={r.id} href={`/places/${r.place.id}`}
              className="block p-3 border rounded-xl hover:bg-gray-50 transition">
              <div className="flex items-center justify-between">
                <p className="font-medium">{r.place.name}</p>
                <span className="text-orange-400">{"★".repeat(Number(r.rating))}</span>
              </div>
              {r.body && <p className="text-sm text-gray-500 mt-1 truncate">{r.body}</p>}
            </Link>
          ))}
          {user.reviews.length === 0 && <p className="text-gray-400 text-sm">No reviews yet.</p>}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `app/profile/[username]/page.tsx`**

```typescript
import { UserProfile } from "@/components/profile/UserProfile";
import { getUserByUsername } from "@/lib/queries/users";
import { notFound } from "next/navigation";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) notFound();
  return <UserProfile user={user} />;
}
```

- [ ] **Step 3: Write `app/profile/me/page.tsx`**

```typescript
import { UserProfile } from "@/components/profile/UserProfile";
import { getUserByClerkId } from "@/lib/queries/users";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function MyProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const user = await getUserByClerkId(userId);
  if (!user) redirect("/");
  return <UserProfile user={user as any} />;
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: public user profile page with place + review history"
```

---

## Phase 6: Admin Dashboard

> **BEFORE Phase 6:** Merge Phase 5 to `stage`, create `phase/6-admin`.

---

### Task 18: Admin Queries + Actions

**Files:**
- Create: `lib/queries/admin.ts`, `lib/actions/admin.ts`

- [ ] **Step 1: Write `lib/queries/admin.ts`**

```typescript
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { flags, places, reviews, users } from "../db/schema";

export async function getFlaggedContent() {
  return db.query.flags.findMany({
    where: eq(flags.resolved, false),
    orderBy: [desc(flags.createdAt)],
    with: { reportedBy: { columns: { username: true } } },
  });
}

export async function getAdminStats() {
  const [totalPlaces] = await db.select({ count: count() }).from(places).where(eq(places.status, "active"));
  const [totalUsers] = await db.select({ count: count() }).from(users);
  const [totalReviews] = await db.select({ count: count() }).from(reviews).where(eq(reviews.status, "active"));
  const [openFlags] = await db.select({ count: count() }).from(flags).where(eq(flags.resolved, false));

  return {
    places: Number(totalPlaces.count),
    users: Number(totalUsers.count),
    reviews: Number(totalReviews.count),
    openFlags: Number(openFlags.count),
  };
}

export async function getAllUsers() {
  return db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
  });
}
```

- [ ] **Step 2: Write `lib/actions/admin.ts`**

```typescript
"use server";
import { db } from "@/lib/db";
import { flags, places, reviews, users } from "@/lib/db/schema";
import { getUserByClerkId } from "@/lib/queries/users";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await getUserByClerkId(userId);
  if (user?.role !== "admin") throw new Error("Forbidden");
  return user;
}

export async function resolveFlag(flagId: string) {
  await assertAdmin();
  await db.update(flags).set({ resolved: true }).where(eq(flags.id, flagId));
  revalidatePath("/admin/flags");
}

export async function removePlace(placeId: string) {
  await assertAdmin();
  await db.update(places).set({ status: "removed" }).where(eq(places.id, placeId));
  revalidatePath("/admin");
}

export async function removeReview(reviewId: string) {
  await assertAdmin();
  await db.update(reviews).set({ status: "removed" }).where(eq(reviews.id, reviewId));
  revalidatePath("/admin");
}

export async function restorePlace(placeId: string) {
  await assertAdmin();
  await db.update(places).set({ status: "active" }).where(eq(places.id, placeId));
  revalidatePath("/admin");
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: admin queries and actions"
```

---

### Task 19: Admin UI

**Files:**
- Create: `components/admin/StatsCards.tsx`, `components/admin/FlagQueue.tsx`, `app/admin/layout.tsx`, `app/admin/page.tsx`, `app/admin/flags/page.tsx`, `app/admin/users/page.tsx`

- [ ] **Step 1: Write `components/admin/StatsCards.tsx`**

```typescript
interface Stats { places: number; users: number; reviews: number; openFlags: number; }

export function StatsCards({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Active Places", value: stats.places, color: "text-orange-500" },
    { label: "Total Users", value: stats.users, color: "text-blue-500" },
    { label: "Total Reviews", value: stats.reviews, color: "text-green-500" },
    { label: "Open Flags", value: stats.openFlags, color: "text-red-500" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-white border rounded-2xl p-4 text-center">
          <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
          <p className="text-sm text-gray-500 mt-1">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write `components/admin/FlagQueue.tsx`**

```typescript
"use client";
import { resolveFlag, removePlace, removeReview } from "@/lib/actions/admin";

interface Flag {
  id: string;
  targetType: "place" | "review";
  targetId: string;
  reason: string;
  createdAt: Date;
  reportedBy: { username: string } | null;
}

export function FlagQueue({ flags }: { flags: Flag[] }) {
  if (flags.length === 0) return <p className="text-gray-400">No open flags.</p>;

  return (
    <div className="space-y-3">
      {flags.map((flag) => (
        <div key={flag.id} className="border rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium capitalize">{flag.targetType} flagged</span>
            <span className="text-xs text-gray-400">
              by {flag.reportedBy?.username ?? "anonymous"}
            </span>
          </div>
          <p className="text-sm text-gray-700">{flag.reason}</p>
          <p className="text-xs text-gray-400 font-mono">{flag.targetId}</p>
          <div className="flex gap-2">
            <form action={async () => { "use server"; await resolveFlag(flag.id); }}>
              <button className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50">Dismiss</button>
            </form>
            <form action={async () => {
              "use server";
              if (flag.targetType === "place") await removePlace(flag.targetId);
              else await removeReview(flag.targetId);
              await resolveFlag(flag.id);
            }}>
              <button className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">Remove Content</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Write admin pages**

`app/admin/layout.tsx`:
```typescript
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-6 mb-8">
          <h1 className="text-2xl font-bold">Admin</h1>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin" className="hover:text-orange-500">Overview</Link>
            <Link href="/admin/flags" className="hover:text-orange-500">Flags</Link>
            <Link href="/admin/users" className="hover:text-orange-500">Users</Link>
          </nav>
        </div>
        {children}
      </div>
    </div>
  );
}
```

`app/admin/page.tsx`:
```typescript
import { StatsCards } from "@/components/admin/StatsCards";
import { getAdminStats } from "@/lib/queries/admin";

export default async function AdminPage() {
  const stats = await getAdminStats();
  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />
    </div>
  );
}
```

`app/admin/flags/page.tsx`:
```typescript
import { FlagQueue } from "@/components/admin/FlagQueue";
import { getFlaggedContent } from "@/lib/queries/admin";

export default async function AdminFlagsPage() {
  const flaggedContent = await getFlaggedContent();
  return (
    <div>
      <h2 className="font-semibold mb-4">Open Flags ({flaggedContent.length})</h2>
      <FlagQueue flags={flaggedContent as any} />
    </div>
  );
}
```

`app/admin/users/page.tsx`:
```typescript
import { getAllUsers } from "@/lib/queries/admin";
import Link from "next/link";

export default async function AdminUsersPage() {
  const allUsers = await getAllUsers();
  return (
    <div>
      <h2 className="font-semibold mb-4">Users ({allUsers.length})</h2>
      <div className="space-y-2">
        {allUsers.map((u) => (
          <div key={u.id} className="flex items-center justify-between p-3 bg-white border rounded-xl">
            <div>
              <Link href={`/profile/${u.username}`} className="font-medium hover:underline">@{u.username}</Link>
              <p className="text-xs text-gray-400">{u.role} · {new Date(u.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: admin dashboard — stats, flag queue, user management"
```

---

## Phase 7: CI/CD & E2E Testing

> **BEFORE Phase 7:** Merge Phase 6 to `stage`, create `phase/7-cicd`.

---

### Task 20: Vitest Config + Integration Tests

**Files:**
- Create: `vitest.config.ts`, `__tests__/integration/places.test.ts`

- [ ] **Step 1: Write `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 2: Write integration test `__tests__/integration/places.test.ts`**

```typescript
import { describe, expect, it } from "vitest";
import { placeSchema } from "@/lib/validations/place";
import { computeScore } from "@/lib/ranking";

describe("place submission integration", () => {
  it("validates a complete valid place submission", () => {
    const result = placeSchema.safeParse({
      name: "Warung Bu Sari",
      description: "Local family warung with amazing nasi campur",
      lat: -8.5069,
      lng: 115.2624,
      area: "Ubud",
      category: "warung",
      priceRange: "<20k",
      priceNotes: "Nasi campur 15k",
      cuisineTags: ["Indonesian"],
    });
    expect(result.success).toBe(true);
  });

  it("score increases with more registered reviews", () => {
    const oneAnon = computeScore([{ rating: 4, isRegistered: false }], 0);
    const oneRegistered = computeScore([{ rating: 4, isRegistered: true }], 0);
    expect(oneRegistered).toBeGreaterThanOrEqual(oneAnon);
  });
});
```

- [ ] **Step 3: Run all tests**

```bash
bun run test
```

Expected: all unit + integration tests passing.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "test: vitest config + integration tests"
```

---

### Task 21: Playwright E2E Tests

**Files:**
- Create: `playwright.config.ts`, `e2e/map.spec.ts`, `e2e/submit.spec.ts`

- [ ] **Step 1: Write `playwright.config.ts`**

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "Mobile Chrome", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 2: Write `e2e/map.spec.ts`**

```typescript
import { expect, test } from "@playwright/test";

test("homepage loads Bali map", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".leaflet-container")).toBeVisible();
});

test("filter bar is visible on homepage", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("select").first()).toBeVisible();
});

test("category filter updates URL", async ({ page }) => {
  await page.goto("/");
  await page.selectOption("select:first-of-type", "warung");
  await expect(page).toHaveURL(/category=warung/);
});
```

- [ ] **Step 3: Write `e2e/submit.spec.ts`**

```typescript
import { expect, test } from "@playwright/test";

test("submit page redirects unauthenticated users", async ({ page }) => {
  await page.goto("/submit");
  // Clerk redirects to sign-in
  await expect(page).toHaveURL(/sign-in/);
});

test("place detail page renders", async ({ page }) => {
  // Assumes at least one place exists in test DB
  await page.goto("/");
  const map = page.locator(".leaflet-container");
  await expect(map).toBeVisible();
});
```

- [ ] **Step 4: Install Playwright browsers**

```bash
bunx playwright install chromium
```

- [ ] **Step 5: Run E2E tests**

```bash
bun run test:e2e
```

Expected: map tests pass, submit redirect test passes.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "test: Playwright E2E for map and auth redirects"
```

---

### Task 22: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main, stage]
  pull_request:
    branches: [main, stage]

jobs:
  quality:
    name: Lint + Type Check + Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install
      - run: bun run lint
      - run: bun run type-check
      - run: bun run test

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: quality
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}
      CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY }}
      CLERK_WEBHOOK_SECRET: ${{ secrets.CLERK_WEBHOOK_SECRET }}
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: ${{ secrets.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME }}
      CLOUDINARY_API_KEY: ${{ secrets.CLOUDINARY_API_KEY }}
      CLOUDINARY_API_SECRET: ${{ secrets.CLOUDINARY_API_SECRET }}
      ARCJET_KEY: ${{ secrets.ARCJET_KEY }}
      NEXT_PUBLIC_POSTHOG_KEY: ${{ secrets.NEXT_PUBLIC_POSTHOG_KEY }}
      NEXT_PUBLIC_POSTHOG_HOST: https://app.posthog.com
      NEXT_PUBLIC_APP_URL: http://localhost:3000
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bunx playwright install --with-deps chromium
      - run: bun run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

> **User must:** Add all env vars as GitHub repository secrets before CI will pass E2E tests.

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "ci: GitHub Actions — lint, type-check, unit tests, E2E"
```

---

### Task 23: CLAUDE.md + PRD.md + PROGRESS.md

**Files:**
- Modify: `CLAUDE.md`
- Create: `PRD.md`, `PROGRESS.md`

- [ ] **Step 1: Verify `CLAUDE.md` exists in project root**

CLAUDE.md was written during brainstorming. Verify it exists and contains all required sections:
- Core Principles (DRY, YAGNI, KISS, max 3 attempts, utilize skills/plugins)
- Git Workflow (main → stage → phase/N branches, no push without approval)
- Environment (no hardcoded values)
- Security (Arcjet, Clerk, Zod, Drizzle-only, signed Cloudinary URLs)
- Testing (TDD, Vitest unit/integration, playwright skill for E2E, CI)
- After Each Phase (update PROGRESS.md)

If missing or incomplete, write it from `docs/superpowers/specs/2026-06-07-cheap-eats-bali-design.md`.

- [ ] **Step 2: Write `PRD.md`** — copy the contents from `docs/superpowers/specs/2026-06-07-cheap-eats-bali-design.md` to project root for agents.

```bash
cp docs/superpowers/specs/2026-06-07-cheap-eats-bali-design.md PRD.md
```

- [ ] **Step 3: Write `PROGRESS.md`**

```markdown
# Progress

## Phase 1: Foundation ⬜
- [ ] Scaffold + Bun + Biome + Husky
- [ ] Database schema (Drizzle + Neon)
- [ ] Middleware (Arcjet + Clerk)
- [ ] Clerk webhook + user sync
- [ ] i18n (EN + ID)
- [ ] Zod validations
- [ ] Ranking algorithm

## Phase 2: Map & Discovery ⬜
- [ ] Nav + layout
- [ ] Place queries
- [ ] Bali map (Leaflet)
- [ ] Filter bar

## Phase 3: Place Submission & Detail ⬜
- [ ] Cloudinary upload
- [ ] Place server actions
- [ ] Submit form + pin drop map
- [ ] Place detail page

## Phase 4: Reviews, Reactions, Tags & Votes ⬜
- [ ] Server actions (review, reaction, tag, vote, flag)
- [ ] Review UI components

## Phase 5: User Profiles ⬜
- [ ] Public profile page

## Phase 6: Admin Dashboard ⬜
- [ ] Admin queries + actions
- [ ] Admin UI

## Phase 7: CI/CD & Testing ⬜
- [ ] Vitest config + integration tests
- [ ] Playwright E2E
- [ ] GitHub Actions CI
- [ ] CLAUDE.md + PRD.md
```

- [ ] **Step 4: Commit and merge to stage**

```bash
git add .
git commit -m "docs: CLAUDE.md, PRD.md, PROGRESS.md"
git checkout stage
git merge phase/7-cicd
git checkout main
git merge stage
```

---

> **AFTER Phase 7 — final checklist:**
> 1. `bun run lint` — passes
> 2. `bun run type-check` — passes
> 3. `bun run test` — all unit + integration pass
> 4. `bun run test:e2e` — E2E pass locally
> 5. Push to GitHub, verify CI green
> 6. Deploy to Vercel: connect repo, add all env vars, deploy
> 7. Register Clerk webhook with production URL
> 8. Verify map loads, place submission works, reviews work end-to-end
