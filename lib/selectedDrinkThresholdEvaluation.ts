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

export type SelectedDrinkThresholdCoverageStatus =
  | "unknown"
  | "covered"
  | "excluded";

export type SelectedDrinkThresholdEvaluation = {
  drink:
    SelectedDrinkPrice;

  coverageStatus:
    SelectedDrinkThresholdCoverageStatus;

  packageImpact:
    PackageThresholdEconomicImpact;
};

export function evaluateSelectedDrinkAgainstPackageThreshold(
  operationalRule:
    PackageOperationalRules,
  drink:
    SelectedDrinkPrice
): SelectedDrinkThresholdEvaluation {
  const packageImpact =
    evaluatePackageThresholdEconomicImpact({
      operationalRule,

      drinkPrice:
        drink.price,

      drinkCurrency:
        drink.currency,
    });

  let coverageStatus:
    SelectedDrinkThresholdCoverageStatus =
      "unknown";

  if (
    packageImpact.impact.exceedsThreshold ===
    false
  ) {
    coverageStatus = "covered";
  } else if (
    packageImpact.impact.exceedsThreshold ===
      true &&
    operationalRule
      .drinkPriceThresholdCoveragePolicy ===
      "excluded-above-threshold"
  ) {
    coverageStatus = "excluded";
  }

  return {
    drink,

    coverageStatus,

    packageImpact,
  };
}
