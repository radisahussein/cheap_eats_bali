import {
  ANON_REVIEW_WEIGHT,
  REACTION_WEIGHT,
  REGISTERED_REVIEW_WEIGHT,
} from "./constants";

interface ReviewForScore {
  rating: number;
  isRegistered: boolean;
}

export function computeScore(
  reviews: ReviewForScore[],
  reactionCount: number,
): number {
  if (reviews.length === 0 && reactionCount === 0) return 0;

  const weightedSum = reviews.reduce((sum, r) => {
    const weight = r.isRegistered
      ? REGISTERED_REVIEW_WEIGHT
      : ANON_REVIEW_WEIGHT;
    return sum + r.rating * weight;
  }, 0);

  const totalWeight = reviews.reduce((sum, r) => {
    return (
      sum + (r.isRegistered ? REGISTERED_REVIEW_WEIGHT : ANON_REVIEW_WEIGHT)
    );
  }, 0);

  const reactionBonus = reactionCount * REACTION_WEIGHT;
  const divisor = Math.max(totalWeight, 1);

  return (weightedSum + reactionBonus) / divisor;
}
