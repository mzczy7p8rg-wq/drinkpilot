import type {
  AlcoholDailyLimitEvaluation,
} from "@/lib/alcoholDailyLimit";

import type {
  AlcoholicDrinksDailyLimitChargePolicy,
} from "@/lib/contextualPackageRules";

export type OperationalEconomicImpactStatus =
  | "unknown"
  | "none"
  | "known-unquantified";

export type OperationalEconomicImpact = {
  status:
    OperationalEconomicImpactStatus;

  excessDrinksPerDay:
    number | null;

  chargePolicy:
    AlcoholicDrinksDailyLimitChargePolicy;

  /*
   * null significa que sabemos que existe
   * un exceso operativo, pero no disponemos
   * de evidencia suficiente para asignarle
   * un coste económico.
   */
  additionalCostPerDay:
    number | null;
};

/*
 * Traduce un impacto operativo conocido a
 * su grado de conocimiento económico.
 *
 * IMPORTANTE:
 *
 * Esta función NO supone que una bebida
 * que exceda el límite tenga un precio
 * determinado ni modifica la recomendación.
 */
export function evaluateOperationalEconomicImpact(
  evaluation:
    AlcoholDailyLimitEvaluation,
  chargePolicy:
    AlcoholicDrinksDailyLimitChargePolicy =
      "unknown"
): OperationalEconomicImpact {
  if (
    evaluation.status === "unknown"
  ) {
    return {
      status: "unknown",
      excessDrinksPerDay: null,
      chargePolicy,
      additionalCostPerDay: null,
    };
  }

  if (
    evaluation.status === "over-limit"
  ) {
    return {
      status:
        "known-unquantified",

      excessDrinksPerDay:
        evaluation.excessDrinksPerDay,

      chargePolicy,

      additionalCostPerDay: null,
    };
  }

  return {
    status: "none",

    excessDrinksPerDay:
      evaluation.excessDrinksPerDay,

    chargePolicy,

    additionalCostPerDay: 0,
  };
}
