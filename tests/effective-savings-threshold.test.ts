import {
  describe,
  expect,
  it,
} from "vitest";

import {
  findBestPackageByEffectiveSavings,
  resolveEconomicComparison,
} from "@/lib/comparison";

describe(
  "effective savings threshold integration",
  () => {
    it(
      "marca el ahorro efectivo como desconocido cuando el threshold no puede cuantificarse",
      () => {
        const result =
          resolveEconomicComparison(
            {
              fullyCovered: true,
              uncoveredCategories: [],
            },
            120,
            {
              status:
                "known-unquantified",

              cruiseNights:
                7,

              people:
                1,

              totalDrinks:
                14,

              drinksAboveThreshold:
                14,

              drinksExcludedFromCoverage:
                null,

              additionalCostTotal:
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
      "resta el coste de threshold cuantificado del ahorro bruto",
      () => {
        const result =
          resolveEconomicComparison(
            {
              fullyCovered: true,
              uncoveredCategories: [],
            },
            120,
            {
              status:
                "quantified",

              cruiseNights:
                7,

              people:
                1,

              totalDrinks:
                14,

              drinksAboveThreshold:
                14,

              drinksExcludedFromCoverage:
                null,

              additionalCostTotal:
                40,
            }
          );

        expect(
          result.status
        ).toBe("complete");

        expect(
          result.effectiveSavings
        ).toBe(80);
      }
    );

    it(
      "no selecciona un paquete cuyo ahorro efectivo es desconocido",
      () => {
        const packages = [
          {
            packageKey:
              "synthetic",

            packageName:
              "Synthetic Package",

            savings:
              200,

            effectiveSavings:
              null,

            fullyCovered:
              true,
          },
        ];

        const result =
          findBestPackageByEffectiveSavings(
            packages
          );

        expect(result).toBeNull();
      }
    );

    it(
      "selecciona un paquete con cobertura completa y ahorro efectivo positivo",
      () => {
        const packages = [
          {
            packageKey:
              "uncertain",

            packageName:
              "Uncertain",

            savings:
              300,

            effectiveSavings:
              null,

            fullyCovered:
              true,
          },

          {
            packageKey:
              "quantified",

            packageName:
              "Quantified",

            savings:
              120,

            effectiveSavings:
              80,

            fullyCovered:
              true,
          },
        ];

        const result =
          findBestPackageByEffectiveSavings(
            packages
          );

        expect(
          result?.packageKey
        ).toBe(
          "quantified"
        );
      }
    );
  }
);

describe("best package by effective savings", () => {
  it("selecciona el mayor ahorro efectivo entre varios paquetes completamente cubiertos", () => {
    const packages = [
      {
        packageKey: "first",
        packageName: "First Package",
        savings: 40,
        effectiveSavings: 40,
        fullyCovered: true,
      },
      {
        packageKey: "better",
        packageName: "Better Package",
        savings: 90,
        effectiveSavings: 90,
        fullyCovered: true,
      },
    ];

    const result =
      findBestPackageByEffectiveSavings(
        packages
      );

    expect(
      result?.packageKey
    ).toBe(
      "better"
    );
  });
});

