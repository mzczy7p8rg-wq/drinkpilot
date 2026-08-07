import type {
  AlcoholConsumptionResolution,
} from "@/lib/alcoholConsumption";

import {
  evaluateAlcoholDailyLimit,
  type AlcoholDailyLimitEvaluation,
} from "@/lib/alcoholDailyLimit";

import {
  evaluateOperationalEconomicImpact,
  type OperationalEconomicImpact,
} from "@/lib/operationalEconomicImpact";

import type {
  PackageOperationalRules,
} from "@/lib/packageRules";

export type PackageOperationalRuleImpact = {
  packageKey:
    PackageOperationalRules["packageKey"];

  packageName: string;

  alcoholDailyLimit:
    AlcoholDailyLimitEvaluation;

  economicImpact:
    OperationalEconomicImpact;
};

/*
 * Cruza el consumo conocido del usuario
 * con las reglas operativas resueltas de
 * cada paquete.
 *
 * Esta capa es únicamente descriptiva.
 *
 * No modifica:
 *
 * - cobertura;
 * - ahorro;
 * - rentabilidad;
 * - recomendación.
 */
export function evaluateOperationalRuleImpacts(
  alcoholConsumption:
    AlcoholConsumptionResolution,
  operationalRules:
    PackageOperationalRules[]
): PackageOperationalRuleImpact[] {
  return operationalRules.map(
    (rule) => {
      const alcoholDailyLimit =
        evaluateAlcoholDailyLimit(
          alcoholConsumption
            .alcoholicDrinksPerDay,

          rule
            .alcoholicDrinksDailyLimit
        );

      return {
        packageKey:
          rule.packageKey,

        packageName:
          rule.packageName,

        alcoholDailyLimit,

        economicImpact:
          evaluateOperationalEconomicImpact(
            alcoholDailyLimit
          ),
      };
    }
  );
}
