import { describe, expect, it } from "vitest";

import {
  buildEconomicOptionsComparison,
} from "@/lib/economicOptionsComparison";

const packageOption = {
  packageKey: "easy",
  packageName: "Easy Package",
  packageCost: 420,
  drinksCost: 560,
  effectiveSavings: 90,
  economicComparisonStatus: "complete" as const,
  coverageScore: 80,
  fullyCovered: false,
  priceSource: "user" as const,
};

describe("complete economic options comparison", () => {
  it("compares no package with package cost plus known uncovered drinks", () => {
    const result = buildEconomicOptionsComparison({
      currency: "EUR",
      baselineCost: 560,
      packages: [packageOption],
    });

    expect(result.options).toEqual([
      expect.objectContaining({
        key: "no-package",
        packageCost: 0,
        outsidePackageCost: 560,
        totalCost: 560,
      }),
      expect.objectContaining({
        key: "easy",
        packageCost: 420,
        outsidePackageCost: 50,
        totalCost: 470,
      }),
    ]);
    expect(result.bestOption?.key).toBe("easy");
    expect(result.savingsAgainstNoPackage).toBe(90);
  });

  it("treats an included package as zero incremental package cost", () => {
    const result = buildEconomicOptionsComparison({
      currency: "EUR",
      baselineCost: 300,
      packages: [
        {
          ...packageOption,
          packageCost: 0,
          drinksCost: 300,
          effectiveSavings: 240,
          priceSource: "included",
        },
      ],
    });

    expect(result.options[1]).toMatchObject({
      status: "included",
      packageCost: 0,
      outsidePackageCost: 60,
      totalCost: 60,
    });
    expect(result.bestOption?.key).toBe("easy");
  });

  it("labels paid alternatives as upgrades when a package is included", () => {
    const result = buildEconomicOptionsComparison({
      currency: "EUR",
      baselineCost: 300,
      packages: [
        {
          ...packageOption,
          packageCost: 0,
          drinksCost: 300,
          effectiveSavings: 200,
          priceSource: "included",
        },
        {
          ...packageOption,
          packageKey: "premium",
          packageName: "Premium Extra",
          packageCost: 70,
          drinksCost: 300,
          effectiveSavings: 230,
        },
      ],
    });

    expect(result.options[2].status).toBe("upgrade");
  });

  it("can conclude that paying separately is the cheapest option", () => {
    const result = buildEconomicOptionsComparison({
      currency: "EUR",
      baselineCost: 300,
      packages: [
        {
          ...packageOption,
          packageCost: 420,
          drinksCost: 300,
          effectiveSavings: -120,
        },
      ],
    });

    expect(result.bestOption?.key).toBe("no-package");
    expect(result.savingsAgainstNoPackage).toBe(0);
  });

  it("does not invent a total or recommendation for an incomplete package", () => {
    const result = buildEconomicOptionsComparison({
      currency: "EUR",
      baselineCost: 560,
      packages: [
        {
          ...packageOption,
          effectiveSavings: null,
          economicComparisonStatus: "partial-unknown",
        },
      ],
    });

    expect(result.options[1]).toMatchObject({
      outsidePackageCost: null,
      totalCost: null,
    });
    expect(result.bestOption?.key).toBe("no-package");
    expect(result.hasIncompleteOptions).toBe(true);
  });
});
