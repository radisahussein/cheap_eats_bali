import { z } from "zod";
import { FLAG_TARGETS } from "../constants";

export const flagSchema = z.object({
  targetType: z.enum(FLAG_TARGETS),
  targetId: z.string().uuid(),
  reason: z.string().min(5).max(500),
});

export type FlagInput = z.infer<typeof flagSchema>;
