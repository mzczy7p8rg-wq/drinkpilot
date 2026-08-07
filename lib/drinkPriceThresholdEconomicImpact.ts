export type DrinkPriceThresholdEconomicImpactStatus =
  | "unknown"
  | "none"
  | "known-unquantified"
  | "quantified";

export type DrinkPriceThresholdChargePolicy =
  | "unknown"
  | "difference"
  | "full-price";

export type DrinkPriceThresholdEconomicImpactInput = {
  drinkPrice:
    number | null | undefined;

  drinkCurrency:
    string | null | undefined;

  threshold:
    number | null | undefined;

  thresholdCurrency:
    string | null | undefined;

  /*
   * Opcional por compatibilidad.
   *
   * Si una capa anterior todavía no
   * proporciona una política explícita,
   * nunca cuantificamos el exceso.
   */
  chargePolicy?:
    DrinkPriceThresholdChargePolicy;
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
   * Coste que realmente debe añadirse
   * por cada bebida afectada.
   *
   * null = sabemos que existe impacto,
   * pero todavía no podemos cuantificarlo.
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
 * Evalúa el impacto económico de un
 * precio individual frente al threshold.
 *
 * La política de cobro es independiente
 * del threshold:
 *
 * unknown:
 *   sabemos que supera el límite,
 *   pero no cuánto debe pagarse.
 *
 * difference:
 *   se paga solo drinkPrice - threshold.
 *
 * full-price:
 *   se paga el precio completo.
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

  const chargePolicy =
    input.chargePolicy ??
    "unknown";

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

      additionalCostPerDrink:
        0,
    };
  }

  if (
    chargePolicy ===
    "difference"
  ) {
    return {
      status: "quantified",

      drinkPrice,

      drinkCurrency,

      threshold,

      thresholdCurrency,

      exceedsThreshold: true,

      additionalCostPerDrink:
        drinkPrice - threshold,
    };
  }

  if (
    chargePolicy ===
    "full-price"
  ) {
    return {
      status: "quantified",

      drinkPrice,

      drinkCurrency,

      threshold,

      thresholdCurrency,

      exceedsThreshold: true,

      additionalCostPerDrink:
        drinkPrice,
    };
  }

  /*
   * Threshold conocido pero política
   * económica todavía desconocida.
   */
  return {
    status:
      "known-unquantified",

    drinkPrice,

    drinkCurrency,

    threshold,

    thresholdCurrency,

    exceedsThreshold: true,

    additionalCostPerDrink:
      null,
  };
}
