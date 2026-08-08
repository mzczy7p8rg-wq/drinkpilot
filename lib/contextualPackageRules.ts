import type {
  CruiseLineKey,
} from "@/data/cruiseLines";

import type {
  CruiseContext,
} from "@/lib/cruiseContext";

import {
  isIsoSailingDate,
} from "@/lib/cruiseContext";

import type {
  PackageKey,
} from "@/lib/packageService";

export type DrinkPriceThresholdCoveragePolicy =
  | "unknown"
  | "included-through-threshold"
  | "credited-through-threshold"
  | "excluded-above-threshold";

export type DrinkPriceThresholdChargePolicy =
  | "unknown"
  | "difference"
  | "full-price";

export type ContextualRuleValues = {
  alcoholicDrinksDailyLimit?:
    number;

  drinkPriceThreshold?:
    number;

  /*
   * Moneda en la que está expresado
   * drinkPriceThreshold.
   *
   * Debe viajar junto al umbral para
   * evitar interpretar el mismo número
   * como EUR, USD u otra moneda.
   */
  drinkPriceThresholdCurrency?:
    string;

  /*
   * Política económica aplicable cuando
   * una bebida supera el threshold.
   *
   * unknown:
   * conocemos el límite, pero no existe
   * evidencia suficiente para cuantificar
   * qué debe pagar el huésped.
   *
   * difference:
   * paga únicamente la diferencia sobre
   * el threshold.
   *
   * full-price:
   * paga el precio completo de la bebida.
   */
  drinkPriceThresholdChargePolicy?:
    DrinkPriceThresholdChargePolicy;

  /*
   * Política de cobertura cuando una bebida
   * supera el threshold.
   *
   * unknown:
   * no existe evidencia suficiente para
   * determinar cómo afecta el threshold
   * a la cobertura.
   *
   * included-through-threshold:
   * la bebida permanece cubierta hasta
   * el valor del threshold.
   *
   * credited-through-threshold:
   * una bebida cuyo precio supera el
   * threshold conserva un crédito del
   * paquete equivalente al threshold.
   *
   * excluded-above-threshold:
   * una bebida cuyo precio supera el
   * threshold queda fuera de cobertura.
   *
   * Esta propiedad describe cobertura,
   * no cuánto debe pagar el huésped.
   */
  drinkPriceThresholdCoveragePolicy?:
    DrinkPriceThresholdCoveragePolicy;

  aquaUnlimited?:
    boolean;

  minorsOnly?:
    boolean;
};

export type ContextualPackageRule = {
  id: string;

  cruiseLine:
    CruiseLineKey;

  packageKey:
    PackageKey;

  /*
   * Mercados donde aplica.
   *
   * undefined o [] = cualquier mercado.
   */
  markets?:
    string[];

  /*
   * Regiones operativas de navegación
   * donde aplica la regla.
   *
   * Es deliberadamente independiente
   * del mercado de compra o reserva.
   *
   * undefined o [] = cualquier región.
   */
  sailingRegions?:
    string[];

  /*
   * Monedas operativas a bordo para las
   * que resulta válida la regla.
   *
   * Es independiente del mercado de compra
   * y de la región de navegación.
   *
   * undefined o [] = cualquier moneda.
   */
  onboardCurrencies?:
    string[];

  /*
   * Límites temporales inclusivos.
   *
   * null/undefined = sin límite.
   */
  validFrom?:
    string | null;

  validUntil?:
    string | null;

  rules:
    ContextualRuleValues;
};

function matchesMarket(
  rule: ContextualPackageRule,
  context: CruiseContext
): boolean {
  if (
    !rule.markets ||
    rule.markets.length === 0
  ) {
    return true;
  }

  if (!context.market) {
    return false;
  }

  return rule.markets.includes(
    context.market
  );
}

function matchesSailingRegion(
  rule: ContextualPackageRule,
  context: CruiseContext
): boolean {
  if (
    !rule.sailingRegions ||
    rule.sailingRegions.length === 0
  ) {
    return true;
  }

  /*
   * Una regla regional nunca debe
   * activarse si desconocemos la
   * región real de navegación.
   */
  if (!context.sailingRegion) {
    return false;
  }

  return rule.sailingRegions.includes(
    context.sailingRegion
  );
}

function matchesOnboardCurrency(
  rule: ContextualPackageRule,
  context: CruiseContext
): boolean {
  if (
    !rule.onboardCurrencies ||
    rule.onboardCurrencies.length === 0
  ) {
    return true;
  }

  /*
   * Una regla monetaria nunca debe
   * activarse si desconocemos la moneda
   * operativa real del crucero.
   */
  if (!context.onboardCurrency) {
    return false;
  }

  return rule.onboardCurrencies.includes(
    context.onboardCurrency
  );
}

function matchesSailingDate(
  rule: ContextualPackageRule,
  context: CruiseContext
): boolean {
  const hasDateConstraint =
    Boolean(
      rule.validFrom ||
      rule.validUntil
    );

  if (!hasDateConstraint) {
    return true;
  }

  /*
   * Una regla temporal no debe aplicarse
   * si desconocemos la fecha de salida.
   */
  if (
    !context.sailingDate ||
    !isIsoSailingDate(
      context.sailingDate
    )
  ) {
    return false;
  }

  const sailingDate =
    context.sailingDate;

  if (
    rule.validFrom &&
    sailingDate <
      rule.validFrom
  ) {
    return false;
  }

  if (
    rule.validUntil &&
    sailingDate >
      rule.validUntil
  ) {
    return false;
  }

  return true;
}

export function matchesContextualPackageRule(
  rule: ContextualPackageRule,
  context: CruiseContext
): boolean {
  if (
    rule.cruiseLine !==
    context.cruiseLine
  ) {
    return false;
  }

  if (
    !matchesMarket(
      rule,
      context
    )
  ) {
    return false;
  }

  if (
    !matchesSailingRegion(
      rule,
      context
    )
  ) {
    return false;
  }

  if (
    !matchesOnboardCurrency(
      rule,
      context
    )
  ) {
    return false;
  }

  if (
    !matchesSailingDate(
      rule,
      context
    )
  ) {
    return false;
  }

  return true;
}

export function getMatchingContextualPackageRules(
  rules:
    ContextualPackageRule[],
  context:
    CruiseContext
): ContextualPackageRule[] {
  return rules.filter(
    (rule) =>
      matchesContextualPackageRule(
        rule,
        context
      )
  );
}

export function getContextualPackageRulesForPackage(
  rules:
    ContextualPackageRule[],
  context:
    CruiseContext,
  packageKey:
    PackageKey
): ContextualPackageRule[] {
  return getMatchingContextualPackageRules(
    rules,
    context
  ).filter(
    (rule) =>
      rule.packageKey ===
      packageKey
  );
}
