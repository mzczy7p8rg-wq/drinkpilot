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

  it("explica que faltan datos cuando no puede decidir un upgrade", () => {
    expect(
      resolveComparisonHeader(null, {
        status: "insufficient-data",
        current: {
          packageKey: "mscEasy",
          packageName: "Easy Package",
          currency: "USD",
          packageCost: 0,
          effectiveSavings: null,
          economicComparisonStatus: "partial-unknown",
          coverageScore: 0,
          fullyCovered: false,
        },
      })
    ).toBe("Comparación pendiente de datos");
  });
});
