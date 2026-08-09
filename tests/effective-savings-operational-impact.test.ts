import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveEconomicComparison,
} from "@/lib/comparison";

const completeCoverage = {
  fullyCovered: true,
  uncoveredCategories: [],
};

describe(
  "effective savings operational impact integration",
  () => {
    it(
      "mantiene desconocido el ahorro cuando existe un exceso con política económica conocida",
      () => {
        const result =
          resolveEconomicComparison(
            completeCoverage,
            120,
            undefined,
            {
              status:
                "known-unquantified",
              excessDrinksPerDay: 3,
              chargePolicy:
                "full-price-plus-gratuities",
              additionalCostPerDay:
                null,
            }
          );

        expect(
          result.status
        ).toBe(
          "partial-unknown"
        );

        expect(
          result.effectiveSavings
        ).toBeNull();
      }
    );

    it(
      "mantiene desconocido el ahorro cuando existe exceso y la política económica sigue siendo desconocida",
      () => {
        const result =
          resolveEconomicComparison(
            completeCoverage,
            120,
            undefined,
            {
              status:
                "known-unquantified",
              excessDrinksPerDay: 3,
              chargePolicy:
                "unknown",
              additionalCostPerDay:
                null,
            }
          );

        expect(
          result.status
        ).toBe(
          "partial-unknown"
        );

        expect(
          result.effectiveSavings
        ).toBeNull();
      }
    );

    it(
      "no altera el ahorro cuando el consumo no supera el límite",
      () => {
        const result =
          resolveEconomicComparison(
            completeCoverage,
            120,
            undefined,
            {
              status: "none",
              excessDrinksPerDay: 0,
              chargePolicy:
                "full-price-plus-gratuities",
              additionalCostPerDay: 0,
            }
          );

        expect(
          result.status
        ).toBe("complete");

        expect(
          result.effectiveSavings
        ).toBe(120);
      }
    );
  }
);
