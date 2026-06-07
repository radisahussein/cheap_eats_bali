export const PRICE_RANGES = ["<20k", "20-50k", "50-100k", ">100k"] as const;
export type PriceRange = (typeof PRICE_RANGES)[number];

export const CATEGORIES = [
  "warung",
  "restaurant",
  "cafe",
  "food_court",
  "street_food",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const PLACE_STATUSES = ["active", "flagged", "removed"] as const;
export type PlaceStatus = (typeof PLACE_STATUSES)[number];

export const ROLES = ["user", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const EMOJI_REACTIONS = ["🔥", "💯", "👍", "👎", "😐", "🍽️"] as const;
export type EmojiReaction = (typeof EMOJI_REACTIONS)[number];

export const PLACE_TAGS = [
  "fast_wifi",
  "slow_wifi",
  "has_chargers",
  "no_chargers",
  "air_conditioned",
  "outdoor_seating",
  "indoor_smoking",
  "parking",
  "quiet",
  "loud",
  "busy",
  "family_friendly",
  "solo_friendly",
  "wfh_friendly",
  "romantic",
  "local_crowd",
  "tourist_crowd",
  "cash_only",
  "card_accepted",
  "open_late",
  "open_early",
  "takeaway",
  "delivery",
  "fast_service",
  "slow_service",
] as const;
export type PlaceTag = (typeof PLACE_TAGS)[number];

export const FLAG_TARGETS = ["place", "review"] as const;
export type FlagTarget = (typeof FLAG_TARGETS)[number];

export const AUTO_FLAG_THRESHOLD = 3;
export const REGISTERED_REVIEW_WEIGHT = 2.0;
export const ANON_REVIEW_WEIGHT = 1.0;
export const REACTION_WEIGHT = 0.5;
