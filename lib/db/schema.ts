import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import {
  CATEGORIES,
  EMOJI_REACTIONS,
  FLAG_TARGETS,
  PLACE_STATUSES,
  PLACE_TAGS,
  PRICE_RANGES,
  ROLES,
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
  placeId: uuid("place_id")
    .references(() => places.id, { onDelete: "cascade" })
    .notNull(),
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
  placeId: uuid("place_id")
    .references(() => places.id, { onDelete: "cascade" })
    .notNull(),
  reviewId: uuid("review_id").references(() => reviews.id, {
    onDelete: "cascade",
  }),
  userId: uuid("user_id").references(() => users.id),
  cloudinaryId: text("cloudinary_id").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const placeReactions = pgTable(
  "place_reactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    placeId: uuid("place_id")
      .references(() => places.id, { onDelete: "cascade" })
      .notNull(),
    emoji: emojiEnum("emoji").notNull(),
    ipHash: text("ip_hash").notNull(),
    userId: uuid("user_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.placeId, t.ipHash, t.emoji)],
);

export const placeTags = pgTable(
  "place_tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    placeId: uuid("place_id")
      .references(() => places.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    tag: placeTagEnum("tag").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.placeId, t.userId, t.tag)],
);

export const reviewVotes = pgTable(
  "review_votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reviewId: uuid("review_id")
      .references(() => reviews.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.reviewId, t.userId)],
);

export const flags = pgTable("flags", {
  id: uuid("id").primaryKey().defaultRandom(),
  targetType: flagTargetEnum("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  reportedBy: uuid("reported_by").references(() => users.id),
  reason: text("reason").notNull(),
  resolved: boolean("resolved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  places: many(places),
  reviews: many(reviews),
  placeTags: many(placeTags),
  reviewVotes: many(reviewVotes),
}));

export const placesRelations = relations(places, ({ one, many }) => ({
  submitter: one(users, {
    fields: [places.submittedBy],
    references: [users.id],
  }),
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
