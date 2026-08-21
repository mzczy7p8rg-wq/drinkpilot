import { describe, expect, it } from "vitest";

import { compareDrinkPackages } from "@/lib/comparison";
import { resolveIncludedPackageUpgradeDecision } from "@/lib/includedPackageUpgrade";

function compareCostaUpgrade(upgradePrice: number) {
  return compareDrinkPackages({
    cruiseLine: "costa",
    onboardCurrency: "EUR",
    cruiseNights: 7,
    people: 3,
    coffee: 0,
    water: 0,
    soda: 1,
    juice: 0,
    beer: 0,
    wine: 0,
    cocktail: 0,
    includedPackageKey: "myDrinks",
    customPackagePrices: {
      // Solo el suplemento para mejorar desde My Drinks.
      myDrinksPlus: upgradePrice,
    },
    documentedDrinkQuantities: {
      "costa-bar-list-red-bull": 1,
    },
  });
}

describe("Costa My Drinks incluido frente a My Drinks Plus", () => {
  it("recomienda mejorar cuando el suplemento evita más gasto del que cuesta", () => {
    const comparison = compareCostaUpgrade(4);
    const current = comparison.packages.find(
      (pkg) => pkg.packageKey === "myDrinks"
    );
    const upgrade = comparison.packages.find(
      (pkg) => pkg.packageKey === "myDrinksPlus"
    );

    expect(current).toMatchObject({
      packageCost: 0,
      documentedProductAdditionalCost: 105,
      economicComparisonStatus: "complete",
      effectiveSavings: 0,
    });
    expect(upgrade).toMatchObject({
      packageCost: 84,
      documentedProductAdditionalCost: 0,
      economicComparisonStatus: "complete",
      effectiveSavings: 21,
    });

    expect(
      resolveIncludedPackageUpgradeDecision(
        comparison.packages,
        "myDrinks"
      )
    ).toMatchObject({
      status: "upgrade",
      addedCost: 84,
      savingsDifference: 21,
      current: { packageName: "My Drinks" },
      alternative: { packageName: "My Drinks Plus" },
    });
  });

  it("mantiene My Drinks cuando el suplemento supera el Red Bull exterior", () => {
    const comparison = compareCostaUpgrade(6);
    const upgrade = comparison.packages.find(
      (pkg) => pkg.packageKey === "myDrinksPlus"
    );

    expect(upgrade).toMatchObject({
      packageCost: 126,
      economicComparisonStatus: "complete",
      effectiveSavings: -21,
    });

    expect(
      resolveIncludedPackageUpgradeDecision(
        comparison.packages,
        "myDrinks"
      )
    ).toMatchObject({
      status: "keep",
      addedCost: 126,
      savingsDifference: -21,
      current: { packageName: "My Drinks" },
      alternative: { packageName: "My Drinks Plus" },
    });
  });
});
