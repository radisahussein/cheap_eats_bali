import { describe, expect, it } from "vitest";
import { placeSchema } from "@/lib/validations/place";
import { reviewSchema } from "@/lib/validations/review";

describe("placeSchema", () => {
  it("rejects coordinates outside Bali", () => {
    const result = placeSchema.safeParse({
      name: "Test",
      description: "Test description here",
      lat: 40,
      lng: 74,
      area: "Canggu",
      category: "warung",
      priceRange: "<20k",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid Bali coordinates", () => {
    const result = placeSchema.safeParse({
      name: "Warung Enak",
      description: "Good local warung",
      lat: -8.5,
      lng: 115.2,
      area: "Canggu",
      category: "warung",
      priceRange: "<20k",
    });
    expect(result.success).toBe(true);
  });
});

describe("reviewSchema", () => {
  it("rejects rating outside 1-5", () => {
    const result = reviewSchema.safeParse({
      placeId: "00000000-0000-0000-0000-000000000000",
      rating: 6,
      emojiTags: [],
      isAnonymous: false,
    });
    expect(result.success).toBe(false);
  });
});
