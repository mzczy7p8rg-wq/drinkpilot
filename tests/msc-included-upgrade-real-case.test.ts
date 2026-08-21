import { describe, expect, it } from "vitest";

import { compareDrinkPackages } from "@/lib/comparison";
import { resolveIncludedPackageUpgradeDecision } from "@/lib/includedPackageUpgrade";
import { buildRecommendationExplanation } from "@/lib/recommendationExplanation";

function compareRealMscUpgrade(upgradePrice: number) {
  return compareDrinkPackages({
    cruiseLine: "msc",
    onboardCurrency: "EUR",
    cruiseNights: 7,
    people: 3,
    coffee: 0,
    water: 0,
    soda: 0,
    juice: 0,
    beer: 0,
    wine: 0,
    cocktail: 1,
    includedPackageKey: "mscEasy",
    customPackagePrices: {
      // El usuario introduce únicamente el suplemento del upgrade.
      mscPremiumExtra: upgradePrice,
    },
    documentedDrinkQuantities: {
      "msc-cocktails-more-2023-elderflower-g-t-serving": 1,
    },
  });
}

describe("MSC Easy incluido frente a Premium Extra", () => {
  it("compara el coste incremental real para tres adultos y siete noches", () => {
    const comparison = compareRealMscUpgrade(10);

    const easy = comparison.packages.find(
      (pkg) => pkg.packageKey === "mscEasy"
    );
    const premium = comparison.packages.find(
      (pkg) => pkg.packageKey === "mscPremiumExtra"
    );

    expect(easy).toMatchObject({
      packageCost: 0,
      economicComparisonStatus: "complete",
      effectiveSavings: 0,
    });
    expect(premium).toMatchObject({
      packageCost: 210,
      economicComparisonStatus: "complete",
      effectiveSavings: 63,
    });

    expect(
      resolveIncludedPackageUpgradeDecision(
        comparison.packages,
        "mscEasy"
      )
    ).toMatchObject({
      status: "upgrade",
      addedCost: 210,
      savingsDifference: 63,
      current: { packageName: "Easy Package" },
      alternative: { packageName: "Premium Extra Package" },
    });

    const explanation = buildRecommendationExplanation(comparison);

    expect(explanation.summary).toContain(
      "antes de descontar las bebidas que deja fuera"
    );
    expect(explanation.summary).not.toContain("ahorro bruto");
  });

  it("mantiene Easy cuando el suplemento supera el gasto que evita", () => {
    const comparison = compareRealMscUpgrade(15);

    expect(
      resolveIncludedPackageUpgradeDecision(
        comparison.packages,
        "mscEasy"
      )
    ).toMatchObject({
      status: "keep",
      addedCost: 315,
      savingsDifference: -42,
      current: { packageName: "Easy Package" },
      alternative: { packageName: "Premium Extra Package" },
    });

    const explanation = buildRecommendationExplanation(comparison);

    expect(explanation.title).toBe(
      "Mantener Easy Package es más económico que mejorar"
    );
    expect(explanation.summary).toContain(
      "mantener Easy Package y pagar solo las bebidas que deja fuera"
    );
    expect(explanation.reason).toContain("42,00");
    expect(explanation.reason).toContain("más");
  });
});
