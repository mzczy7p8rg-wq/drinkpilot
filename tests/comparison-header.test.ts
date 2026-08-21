import { describe, expect, it } from "vitest";

import { resolveComparisonHeader } from "@/lib/comparisonHeader";

describe("comparison header", () => {
  it("prioriza la decisión de mantener un paquete ya incluido", () => {
    expect(
      resolveComparisonHeader(null, {
        status: "keep",
        current: {
          packageKey: "mscEasy",
          packageName: "Easy Package",
          currency: "EUR",
          packageCost: 0,
          effectiveSavings: 0,
          economicComparisonStatus: "complete",
          coverageScore: 50,
          fullyCovered: false,
        },
        alternative: {
          packageKey: "mscPremiumExtra",
          packageName: "Premium Extra Package",
          currency: "EUR",
          packageCost: 315,
          effectiveSavings: -42,
          economicComparisonStatus: "complete",
          coverageScore: 100,
          fullyCovered: true,
        },
        savingsDifference: -42,
        addedCost: 315,
        coverageDifference: 50,
      })
    ).toBe("Mantén Easy Package");
  });

  it("mantiene la mejor opción normal cuando existe", () => {
    expect(resolveComparisonHeader({ packageName: "My Drinks" }, null)).toBe(
      "Mejor opción: My Drinks"
    );
  });
});
