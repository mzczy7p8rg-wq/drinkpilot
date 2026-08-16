import type {
  PackageOperationalRules,
} from "@/lib/packageRules";

import {
  filterAdultPackageItems,
} from "@/lib/adultPackageFilter";

import {
  explainVenueCoverage,
} from "@/lib/venueCoverageExplanation";

export type OperationalRuleNotice = {
  id: string;

  packageKey:
    PackageOperationalRules["packageKey"];

  packageName: string;

  type:
    | "alcohol-daily-limit"
    | "drink-price-threshold"
    | "aqua-unlimited"
    | "minors-only"
    | "venue-coverage"
    | "package-purchase-group-requirement"
    | "package-pricing-day-policy";

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

export function getOperationalRuleNoticeImpactLabel(
  calculationImpact:
    OperationalRuleNotice["calculationImpact"]
): string | null {
  if (calculationImpact === "economic") {
    return "Aplicado al cálculo económico";
  }

  return null;
}

function buildPackageChargeUnitPolicyMessage(
  rule: PackageOperationalRules
): string | null {
  if (
    rule.packageChargeUnitPolicy ===
    "per-itinerary-day-excluding-disembarkation"
  ) {
    return (
      `${rule.packageName}: el día de desembarque ` +
      `no se factura dentro del precio del paquete.`
    );
  }

  if (
    rule.packageChargeUnitPolicy ===
    "per-night"
  ) {
    return (
      `${rule.packageName}: el paquete se factura ` +
      `por noche de crucero.`
    );
  }

  if (
    rule.packageChargeUnitPolicy ===
    "per-itinerary-day"
  ) {
    return (
      `${rule.packageName}: el paquete se factura ` +
      `por cada jornada del itinerario, incluido el desembarque.`
    );
  }

  return null;
}

function buildPackagePurchaseGroupRequirementMessage(
  rule: PackageOperationalRules
): string | null {
  if (
    rule.packagePurchaseGroupRequirement ===
    "same-cabin"
  ) {
    return (
      `${rule.packageName}: el paquete debe contratarse ` +
      `para los huéspedes sujetos a la condición de mismo camarote.`
    );
  }

  if (
    rule.packagePurchaseGroupRequirement ===
    "same-booking-or-cabin"
  ) {
    return (
      `${rule.packageName}: el paquete debe contratarse ` +
      `para los pasajeros sujetos a las condiciones de la misma reserva o camarote.`
    );
  }

  return null;
}

function buildVenueCoverageMessage(
  rule: PackageOperationalRules
): string | null {
  const explanation =
    explainVenueCoverage(
      rule.venueCoverage
    );

  if (
    !explanation
      .hasKnownLimitations
  ) {
    return null;
  }

  const parts:
    string[] = [];

  const appendStatus = (
    label: string,
    status:
      typeof explanation
        .specialityRestaurants
        .status
  ) => {
    if (status === "limited") {
      parts.push(
        `${label}: cobertura limitada`
      );
    } else if (
      status === "conditional"
    ) {
      parts.push(
        `${label}: cobertura condicional`
      );
    } else if (
      status === "excluded"
    ) {
      parts.push(
        `${label}: excluidos`
      );
    }
  };

  appendStatus(
    "Restaurantes de especialidad",
    explanation
      .specialityRestaurants
      .status
  );

  appendStatus(
    "Islas privadas",
    explanation
      .privateIslands
      .status
  );

  appendStatus(
    "Venues temáticos",
    explanation
      .themedVenues
      .status
  );

  if (
    explanation
      .excludedVenues
      .length > 0
  ) {
    parts.push(
      `Venues excluidos: ${explanation.excludedVenues.join(
        ", "
      )}`
    );
  }

  return (
    `${rule.packageName}: ` +
    `${parts.join("; ")}.`
  );
}

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
          "economic",

        message:
          `${rule.packageName}: para el contexto indicado se ha resuelto un límite de ${rule.drinkPriceThreshold.toFixed(
            2
          )}${
            rule
              .drinkPriceThresholdCurrency
              ? ` ${rule.drinkPriceThresholdCurrency}`
              : ""
          } por bebida.`,

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
          `${rule.packageName}: incluye AQUA by MSC ilimitada según los datos operativos disponibles. Esta cobertura no equivale a agua mineral embotellada tradicional ilimitada.`,

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

    const venueMessage =
      buildVenueCoverageMessage(
        rule
      );

    if (venueMessage) {
      notices.push({
        id:
          `${rule.packageKey}-venue-coverage`,

        packageKey:
          rule.packageKey,

        packageName:
          rule.packageName,

        type:
          "venue-coverage",

        calculationImpact:
          "informational",

        message:
          venueMessage,

        source:
          rule
            .venueCoverageSource
            .source === "contextual"
            ? "contextual"
            : "base",

        appliedContextualRuleIds:
          rule
            .venueCoverageSource
            .contextualRuleIds,
      });
    }

    const packagePurchaseGroupRequirementMessage =
      buildPackagePurchaseGroupRequirementMessage(
        rule
      );

    if (
      packagePurchaseGroupRequirementMessage
    ) {
      notices.push({
        id:
          `${rule.packageKey}-package-purchase-group-requirement`,

        packageKey:
          rule.packageKey,

        packageName:
          rule.packageName,

        type:
          "package-purchase-group-requirement",

        calculationImpact:
          "informational",

        message:
          packagePurchaseGroupRequirementMessage,

        source:
          rule
            .packagePurchaseGroupRequirementSource
            .source === "contextual"
            ? "contextual"
            : "base",

        appliedContextualRuleIds:
          rule
            .packagePurchaseGroupRequirementSource
            .contextualRuleIds,
      });
    }

    const packageChargeUnitPolicyMessage =
      buildPackageChargeUnitPolicyMessage(
        rule
      );

    if (
      packageChargeUnitPolicyMessage
    ) {
      notices.push({
        id:
          `${rule.packageKey}-package-pricing-day-policy`,

        packageKey:
          rule.packageKey,

        packageName:
          rule.packageName,

        type:
          "package-pricing-day-policy",

        calculationImpact:
          "economic",

        message:
          packageChargeUnitPolicyMessage,

        source:
          rule
            .packageChargeUnitPolicySource
            .source === "contextual"
            ? "contextual"
            : "base",

        appliedContextualRuleIds:
          rule
            .packageChargeUnitPolicySource
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
