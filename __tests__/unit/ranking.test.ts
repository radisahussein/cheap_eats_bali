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
    // 10 * 0.5 / 1 = 5 (no reviews, divisor clamped to 1)
    expect(score).toBeCloseTo(5, 1);
  });
});
