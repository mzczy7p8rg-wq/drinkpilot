export type DrinkPriceThresholdEconomicImpactStatus =
  | "unknown"
  | "none"
  | "known-unquantified";

export type DrinkPriceThresholdEconomicImpactInput = {
  drinkPrice:
    number | null | undefined;

  drinkCurrency:
    string | null | undefined;

  threshold:
    number | null | undefined;

  thresholdCurrency:
    string | null | undefined;
};

export type DrinkPriceThresholdEconomicImpact = {
  status:
    DrinkPriceThresholdEconomicImpactStatus;

  drinkPrice:
    number | null;

  drinkCurrency:
    string | null;

  threshold:
    number | null;

  thresholdCurrency:
    string | null;

  exceedsThreshold:
    boolean | null;

  /*
   * Sabemos si la bebida supera el threshold,
   * pero todavía NO sabemos cuánto debe pagar
   * realmente el huésped.
   *
   * No asumimos que MSC cobre:
   *
   * - la diferencia;
   * - el precio completo;
   * - ningún otro importe.
   */
  additionalCostPerDrink:
    number | null;
};

function normalizeCurrency(
  value:
    string | null | undefined
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value.trim().toUpperCase();

  return normalized.length > 0
    ? normalized
    : null;
}

function normalizePositivePrice(
  value:
    number | null | undefined
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return null;
  }

  return value;
}

/*
 * Evalúa exclusivamente si un precio
 * individual conocido supera un threshold
 * conocido expresado en la misma moneda.
 *
 * IMPORTANTE:
 *
 * Esta función NO calcula todavía el coste
 * adicional real de una bebida que excede
 * el threshold.
 */
export function evaluateDrinkPriceThresholdEconomicImpact(
  input:
    DrinkPriceThresholdEconomicImpactInput
): DrinkPriceThresholdEconomicImpact {
  const drinkPrice =
    normalizePositivePrice(
      input.drinkPrice
    );

  const threshold =
    normalizePositivePrice(
      input.threshold
    );

  const drinkCurrency =
    normalizeCurrency(
      input.drinkCurrency
    );

  const thresholdCurrency =
    normalizeCurrency(
      input.thresholdCurrency
    );

  if (
    drinkPrice === null ||
    threshold === null ||
    drinkCurrency === null ||
    thresholdCurrency === null ||
    drinkCurrency !==
      thresholdCurrency
  ) {
    return {
      status: "unknown",

      drinkPrice,

      drinkCurrency,

      threshold,

      thresholdCurrency,

      exceedsThreshold: null,

      additionalCostPerDrink:
        null,
    };
  }

  if (
    drinkPrice <= threshold
  ) {
    return {
      status: "none",

      drinkPrice,

      drinkCurrency,

      threshold,

      thresholdCurrency,

      exceedsThreshold: false,

      additionalCostPerDrink: 0,
    };
  }

  return {
    status:
      "known-unquantified",

    drinkPrice,

    drinkCurrency,

    threshold,

    thresholdCurrency,

    exceedsThreshold: true,

    /*
     * Deliberadamente null.
     *
     * drinkPrice - threshold NO equivale
     * automáticamente al importe que debe
     * pagar el huésped.
     */
    additionalCostPerDrink: null,
  };
}
