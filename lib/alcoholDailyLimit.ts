export type AlcoholDailyLimitStatus =
  | "unknown"
  | "within-limit"
  | "at-limit"
  | "over-limit";

export type AlcoholDailyLimitEvaluation = {
  status:
    AlcoholDailyLimitStatus;

  alcoholicDrinksPerDay:
    number | null;

  alcoholicDrinksDailyLimit:
    number | null;

  excessDrinksPerDay:
    number | null;
};

function isValidNonNegativeNumber(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

function isValidPositiveNumber(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

/*
 * Evalúa exclusivamente la relación entre
 * consumo alcohólico diario conocido y
 * límite operativo diario conocido.
 *
 * No decide cobertura, rentabilidad ni
 * recomendación.
 */
export function evaluateAlcoholDailyLimit(
  alcoholicDrinksPerDay:
    number | null,
  alcoholicDrinksDailyLimit:
    number | null
): AlcoholDailyLimitEvaluation {
  if (
    !isValidNonNegativeNumber(
      alcoholicDrinksPerDay
    ) ||
    !isValidPositiveNumber(
      alcoholicDrinksDailyLimit
    )
  ) {
    return {
      status: "unknown",

      alcoholicDrinksPerDay:
        isValidNonNegativeNumber(
          alcoholicDrinksPerDay
        )
          ? alcoholicDrinksPerDay
          : null,

      alcoholicDrinksDailyLimit:
        isValidPositiveNumber(
          alcoholicDrinksDailyLimit
        )
          ? alcoholicDrinksDailyLimit
          : null,

      excessDrinksPerDay:
        null,
    };
  }

  if (
    alcoholicDrinksPerDay >
    alcoholicDrinksDailyLimit
  ) {
    return {
      status: "over-limit",
      alcoholicDrinksPerDay,
      alcoholicDrinksDailyLimit,

      excessDrinksPerDay:
        alcoholicDrinksPerDay -
        alcoholicDrinksDailyLimit,
    };
  }

  if (
    alcoholicDrinksPerDay ===
    alcoholicDrinksDailyLimit
  ) {
    return {
      status: "at-limit",
      alcoholicDrinksPerDay,
      alcoholicDrinksDailyLimit,
      excessDrinksPerDay: 0,
    };
  }

  return {
    status: "within-limit",
    alcoholicDrinksPerDay,
    alcoholicDrinksDailyLimit,
    excessDrinksPerDay: 0,
  };
}
