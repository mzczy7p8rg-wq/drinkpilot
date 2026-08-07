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

              days:
                7,

              people:
                1,

              totalDrinks:
                14,

              drinksAboveThreshold:
                14,

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

              days:
                7,

              people:
                1,

              totalDrinks:
                14,

              drinksAboveThreshold:
                14,

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
        ] as any;

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
        ] as any;

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
