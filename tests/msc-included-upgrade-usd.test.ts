import { describe, expect, it } from "vitest";

import { compareDrinkPackages } from "@/lib/comparison";
import { resolveComparisonHeader } from "@/lib/comparisonHeader";
import { resolveIncludedPackageUpgradeDecision } from "@/lib/includedPackageUpgrade";

describe("MSC Easy incluido y upgrade en USD", () => {
  it("no recomienda cuando conoce el precio del producto pero no su cobertura específica", () => {
    const comparison = compareDrinkPackages({
      cruiseLine: "msc",
      market: "US",
      sailingRegion: "north-america",
      onboardCurrency: "USD",
      sailingDate: "2026-10-12",
      cruiseNights: 7,
      people: 1,
      coffee: 0,
      water: 0,
      soda: 0,
      juice: 0,
      beer: 0,
      wine: 0,
      cocktail: 1,
      includedPackageKey: "mscEasy",
      customPackagePrices: {
        mscPremiumExtra: { price: 10, currency: "USD" },
      },
      documentedDrinkQuantities: {
        "msc-world-america-passion-fruit-martini-2025-07": 1,
      },
    });

    expect(comparison.economicCurrency).toBe("USD");
    expect(comparison.calculationDrinkPrices?.cocktail).toBe(14);
    expect(comparison.packages.map((pkg) => pkg.packageKey)).toEqual([
      "mscEasy",
      "mscPremiumExtra",
    ]);
    expect(comparison.packages[0]?.uncoveredCategories).not.toContain(
      "cocktail"
    );
    expect(comparison.packages[0]?.unknownCoverageCategories).toContain(
      "cocktail"
    );
    const decision =
      resolveIncludedPackageUpgradeDecision(
        comparison.packages,
        "mscEasy"
      );

    expect(decision).toMatchObject({ status: "insufficient-data" });
    expect(
      resolveComparisonHeader(comparison.bestPackage, decision)
    ).toBe("Comparación pendiente de datos");
  });
});
