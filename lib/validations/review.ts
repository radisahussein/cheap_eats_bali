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
