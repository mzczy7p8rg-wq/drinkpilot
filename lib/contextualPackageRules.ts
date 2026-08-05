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

export type ContextualRuleValues = {
  alcoholicDrinksDailyLimit?:
    number;

  drinkPriceThreshold?:
    number;

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
