import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveDisplayedEconomicDifference,
} from "@/lib/economicDifferenceDisplay";

describe(
  "economic difference display",
  () => {
    it(
      "muestra el ahorro efectivo cuando la comparación está resuelta",
      () => {
        expect(
          resolveDisplayedEconomicDifference({
            effectiveSavings: 42,
            savings: 120,
          })
        ).toBe(42);
      }
    );

    it(
      "no muestra el ahorro bruto cuando el ahorro efectivo es desconocido",
      () => {
        expect(
          resolveDisplayedEconomicDifference({
            effectiveSavings: null,
            savings: 120,
          })
        ).toBeNull();
      }
    );
  }
);
