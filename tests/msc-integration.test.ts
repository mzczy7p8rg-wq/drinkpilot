import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getCruiseLine,
} from "@/data/cruiseLines";

import {
  compareDrinkPackages,
} from "@/lib/comparison";

describe(
  "MSC multi-cruise-line integration",
  () => {
    it(
      "MSC está registrada como naviera",
      () => {
        const msc =
          getCruiseLine("msc");

        expect(msc.id).toBe(
          "msc"
        );

        expect(msc.name).toBe(
          "MSC Cruises"
        );
      }
    );

    it(
      "no fabrica una comparación económica cuando faltan precios individuales",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine: "msc",

            days: 7,
            people: 1,

            coffee: 2,
            water: 2,
            soda: 2,
            beer: 1,
            wine: 1,
            cocktail: 1,
          });

        expect(
          result.economicDataAvailable
        ).toBe(false);

        expect(
          result.bestPackage
        ).toBeNull();

        expect(
          result.anyPackageWorthIt
        ).toBe(false);

        expect(
          result.packages
        ).toEqual([]);

        expect(
          result.missingOnboardPriceKeys
            .length
        ).toBeGreaterThan(0);
      }
    );

    it(
      "mantiene disponible el análisis de cobertura aunque falten precios",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine: "msc",

            days: 7,
            people: 1,

            coffee: 2,
            water: 2,
            soda: 2,
            beer: 1,
            wine: 1,
            cocktail: 1,
          });

        expect(
          result.coveragePackages
            .length
        ).toBeGreaterThan(0);

        for (
          const pkg of
          result.coveragePackages
        ) {
          expect(
            typeof pkg.coverageScore
          ).toBe("number");

          expect(
            Array.isArray(
              pkg.coveredCategories
            )
          ).toBe(true);

          expect(
            Array.isArray(
              pkg.uncoveredCategories
            )
          ).toBe(true);
        }
      }
    );
  }
);
