import type {
  PackageOperationalRules,
} from "@/lib/packageRules";

import type {
  SelectedDrinkConsumption,
} from "@/lib/selectedDrinkConsumption";

import {
  evaluateSelectedDrinkAgainstPackageThreshold,
  type SelectedDrinkThresholdEvaluation,
} from "@/lib/selectedDrinkThresholdEvaluation";

export type PackageThresholdConsumptionImpactStatus =
  | "unknown"
  | "none"
  | "known-unquantified";

export type PackageThresholdConsumptionItem = {
  consumption:
    SelectedDrinkConsumption;

  evaluation:
    SelectedDrinkThresholdEvaluation;
};

export type PackageThresholdConsumptionImpact = {
  status:
    PackageThresholdConsumptionImpactStatus;

  items:
    PackageThresholdConsumptionItem[];

  totalDrinksPerDay:
    number;

  drinksAboveThresholdPerDay:
    number | null;

  additionalCostPerDay:
    number | null;
};

export function evaluatePackageThresholdConsumptionImpact(
  operationalRule:
    PackageOperationalRules,
  consumptions:
    SelectedDrinkConsumption[]
): PackageThresholdConsumptionImpact {
  const items =
    consumptions.map(
      (consumption) => ({
        consumption,

        evaluation:
          evaluateSelectedDrinkAgainstPackageThreshold(
            operationalRule,
            consumption.drink
          ),
      })
    );

  const totalDrinksPerDay =
    consumptions.reduce(
      (
        total,
        consumption
      ) =>
        total +
        consumption.quantityPerDay,
      0
    );

  const hasUnknown =
    items.some(
      (item) =>
        item.evaluation
          .packageImpact
          .impact
          .status === "unknown"
    );

  if (hasUnknown) {
    return {
      status: "unknown",

      items,

      totalDrinksPerDay,

      drinksAboveThresholdPerDay:
        null,

      additionalCostPerDay:
        null,
    };
  }

  const drinksAboveThresholdPerDay =
    items.reduce(
      (
        total,
        item
      ) => {
        const exceeds =
          item.evaluation
            .packageImpact
            .impact
            .exceedsThreshold;

        if (exceeds !== true) {
          return total;
        }

        return (
          total +
          item.consumption
            .quantityPerDay
        );
      },
      0
    );

  if (
    drinksAboveThresholdPerDay === 0
  ) {
    return {
      status: "none",

      items,

      totalDrinksPerDay,

      drinksAboveThresholdPerDay:
        0,

      additionalCostPerDay:
        0,
    };
  }

  return {
    status:
      "known-unquantified",

    items,

    totalDrinksPerDay,

    drinksAboveThresholdPerDay,

    additionalCostPerDay:
      null,
  };
}
