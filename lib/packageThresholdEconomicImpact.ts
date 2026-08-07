import type {
  PackageOperationalRules,
} from "@/lib/packageRules";

import {
  evaluateDrinkPriceThresholdEconomicImpact,
  type DrinkPriceThresholdEconomicImpact,
} from "@/lib/drinkPriceThresholdEconomicImpact";

export type PackageThresholdEconomicImpactInput = {
  operationalRule:
    PackageOperationalRules;

  drinkPrice:
    number | null | undefined;

  drinkCurrency:
    string | null | undefined;
};

export type PackageThresholdEconomicImpact = {
  packageKey:
    PackageOperationalRules["packageKey"];

  packageName:
    string;

  thresholdRuleIds:
    string[];

  impact:
    DrinkPriceThresholdEconomicImpact;
};

/*
 * Une una regla operativa ya resuelta
 * con el evaluador económico de threshold.
 *
 * No conoce MSC, Costa ni ningún packageKey
 * concreto.
 *
 * Tanto el threshold como la política
 * económica llegan ya resueltos desde
 * PackageOperationalRules.
 */
export function evaluatePackageThresholdEconomicImpact(
  input:
    PackageThresholdEconomicImpactInput
): PackageThresholdEconomicImpact {
  const {
    operationalRule,
  } = input;

  return {
    packageKey:
      operationalRule.packageKey,

    packageName:
      operationalRule.packageName,

    thresholdRuleIds:
      operationalRule
        .drinkPriceThresholdSource
        .contextualRuleIds,

    impact:
      evaluateDrinkPriceThresholdEconomicImpact({
        drinkPrice:
          input.drinkPrice,

        drinkCurrency:
          input.drinkCurrency,

        threshold:
          operationalRule
            .drinkPriceThreshold,

        thresholdCurrency:
          operationalRule
            .drinkPriceThresholdCurrency,

        chargePolicy:
          operationalRule
            .drinkPriceThresholdChargePolicy,
      }),
  };
}
