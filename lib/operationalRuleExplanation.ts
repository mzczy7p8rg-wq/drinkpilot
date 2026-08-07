import type {
  PackageOperationalRules,
} from "@/lib/packageRules";

import {
  filterAdultPackageItems,
} from "@/lib/adultPackageFilter";

export type OperationalRuleNotice = {
  id: string;

  packageKey:
    PackageOperationalRules["packageKey"];

  packageName: string;

  type:
    | "alcohol-daily-limit"
    | "drink-price-threshold"
    | "aqua-unlimited"
    | "minors-only";

  message: string;

  /*
   * IDs de reglas contextuales que
   * justifican este aviso.
   *
   * Puede estar vacío cuando la regla
   * procede de evidencia base observada.
   */
  source:
    | "base"
    | "contextual";

  /*
   * Indica si esta condición modifica
   * actualmente el cálculo de DrinkPilot.
   *
   * informational:
   * la mostramos al usuario, pero el
   * motor todavía no altera ahorro,
   * cobertura ni recomendación por ella.
   *
   * economic:
   * reservado para reglas que realmente
   * participen en el cálculo económico.
   */
  calculationImpact:
    | "informational"
    | "economic";

  appliedContextualRuleIds:
    string[];
};

export function buildOperationalRuleNotices(
  rules: PackageOperationalRules[]
): OperationalRuleNotice[] {
  const notices:
    OperationalRuleNotice[] = [];

  for (const rule of rules) {
    if (
      rule.alcoholicDrinksDailyLimit !==
      null
    ) {
      notices.push({
        id:
          `${rule.packageKey}-alcohol-daily-limit`,

        packageKey:
          rule.packageKey,

        packageName:
          rule.packageName,

        type:
          "alcohol-daily-limit",

        calculationImpact:
          "informational",

        message:
          `${rule.packageName}: límite conocido de ${rule.alcoholicDrinksDailyLimit} bebidas alcohólicas por huésped y día.`,

        source:
          rule
            .alcoholicDrinksDailyLimitSource
            .source === "contextual"
            ? "contextual"
            : "base",

        appliedContextualRuleIds:
          rule
            .alcoholicDrinksDailyLimitSource
            .contextualRuleIds,
      });
    }

    if (
      rule.drinkPriceThreshold !==
      null
    ) {
      notices.push({
        id:
          `${rule.packageKey}-drink-price-threshold`,

        packageKey:
          rule.packageKey,

        packageName:
          rule.packageName,

        type:
          "drink-price-threshold",

        calculationImpact:
          "informational",

        message:
          `${rule.packageName}: para el contexto indicado se ha resuelto un límite de ${rule.drinkPriceThreshold.toFixed(
            2
          )} € por bebida.`,

        source:
          rule
            .drinkPriceThresholdSource
            .source === "contextual"
            ? "contextual"
            : "base",

        appliedContextualRuleIds:
          rule
            .drinkPriceThresholdSource
            .contextualRuleIds,
      });
    }

    if (rule.aquaUnlimited) {
      notices.push({
        id:
          `${rule.packageKey}-aqua-unlimited`,

        packageKey:
          rule.packageKey,

        packageName:
          rule.packageName,

        type:
          "aqua-unlimited",

        calculationImpact:
          "informational",

        message:
          `${rule.packageName}: incluye cobertura AQUA según los datos operativos disponibles.`,

        source:
          rule
            .aquaUnlimitedSource
            .source === "contextual"
            ? "contextual"
            : "base",

        appliedContextualRuleIds:
          rule
            .aquaUnlimitedSource
            .contextualRuleIds,
      });
    }

    if (rule.minorsOnly) {
      notices.push({
        id:
          `${rule.packageKey}-minors-only`,

        packageKey:
          rule.packageKey,

        packageName:
          rule.packageName,

        type:
          "minors-only",

        calculationImpact:
          "informational",

        message:
          `${rule.packageName}: paquete reservado a menores y no aplicable como paquete adulto.`,

        source:
          rule
            .minorsOnlySource
            .source === "contextual"
            ? "contextual"
            : "base",

        appliedContextualRuleIds:
          rule
            .minorsOnlySource
            .contextualRuleIds,
      });
    }
  }

  return notices;
}

/*
 * El flujo actual de DrinkPilot analiza
 * paquetes adultos.
 *
 * Un paquete marcado como minorsOnly no
 * debe aportar ningún aviso al resultado,
 * aunque también tenga otras propiedades
 * operativas como AQUA.
 */
export function filterAdultOperationalRuleNotices(
  notices: OperationalRuleNotice[],
  rules: PackageOperationalRules[]
): OperationalRuleNotice[] {
  return filterAdultPackageItems(
    notices,
    rules
  );
}
