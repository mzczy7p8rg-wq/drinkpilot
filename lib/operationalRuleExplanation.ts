import type {
  PackageOperationalRules,
} from "@/lib/packageRules";

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

        message:
          `${rule.packageName}: límite conocido de ${rule.alcoholicDrinksDailyLimit} bebidas alcohólicas por huésped y día.`,

        appliedContextualRuleIds:
          rule.appliedContextualRuleIds,
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

        message:
          `${rule.packageName}: para el contexto indicado se ha resuelto un límite de ${rule.drinkPriceThreshold.toFixed(
            2
          )} € por bebida.`,

        appliedContextualRuleIds:
          rule.appliedContextualRuleIds,
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

        message:
          `${rule.packageName}: incluye cobertura AQUA según los datos operativos disponibles.`,

        appliedContextualRuleIds:
          rule.appliedContextualRuleIds,
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

        message:
          `${rule.packageName}: paquete reservado a menores y no aplicable como paquete adulto.`,

        appliedContextualRuleIds:
          rule.appliedContextualRuleIds,
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
  const minorsOnlyPackageKeys =
    new Set(
      rules
        .filter(
          (rule) =>
            rule.minorsOnly
        )
        .map(
          (rule) =>
            rule.packageKey
        )
    );

  return notices.filter(
    (notice) =>
      !minorsOnlyPackageKeys.has(
        notice.packageKey
      )
  );
}
