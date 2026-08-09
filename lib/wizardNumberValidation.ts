export function isNonNegativeSafeInteger(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0
  );
}

export function isPositiveSafeInteger(
  value: unknown
): value is number {
  return (
    isNonNegativeSafeInteger(value) &&
    value > 0
  );
}

export function isValidCruiseDays(
  value: unknown
): value is number {
  return (
    isPositiveSafeInteger(value) &&
    value <= MAX_CRUISE_DAYS
  );
}

export function isValidTravelerCount(
  value: unknown
): value is number {
  return (
    isPositiveSafeInteger(value) &&
    value <= MAX_TRAVELERS
  );
}

export function isValidDailyDrinkCount(
  value: unknown
): value is number {
  return (
    isNonNegativeSafeInteger(value) &&
    value <= MAX_DAILY_DRINKS_PER_CATEGORY
  );
}
export const MAX_CRUISE_DAYS = 365;
export const MAX_TRAVELERS = 100;
export const MAX_DAILY_DRINKS_PER_CATEGORY = 100;
