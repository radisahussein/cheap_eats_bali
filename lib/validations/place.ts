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
