import type {
  PackageOperationalRules,
} from "@/lib/packageRules";

import {
  evaluatePackageThresholdEconomicImpact,
  type PackageThresholdEconomicImpact,
} from "@/lib/packageThresholdEconomicImpact";

import type {
  SelectedDrinkPrice,
} from "@/lib/selectedDrinkPrice";

export type SelectedDrinkThresholdEvaluation = {
  drink:
    SelectedDrinkPrice;

  packageImpact:
    PackageThresholdEconomicImpact;
};

export function evaluateSelectedDrinkAgainstPackageThreshold(
  operationalRule:
    PackageOperationalRules,
  drink:
    SelectedDrinkPrice
): SelectedDrinkThresholdEvaluation {
  return {
    drink,

    packageImpact:
      evaluatePackageThresholdEconomicImpact({
        operationalRule,

        drinkPrice:
          drink.price,

        drinkCurrency:
          drink.currency,
      }),
  };
}
