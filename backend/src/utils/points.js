export const REDEEM_POINTS_COST = 100
export const REDEEM_DISCOUNT_RM = 5

export function pointsEarnedFor(amount) {
  return Math.floor(Number(amount))
}
