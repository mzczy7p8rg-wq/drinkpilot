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
    it(
      "mantiene Minors Package deshabilitado para el análisis económico adulto",
      () => {
        const msc =
          getCruiseLine("msc");

        const minors =
          msc.packages.mscMinors;

        expect(
          minors.economicActivation
        ).toBe("disabled");

        expect(
          minors.economicEligibility
        ).toBe("blocked");

        expect(
          minors.includesAlcohol
        ).toBe(false);
      }
    );

    it(
      "mantiene los paquetes adultos MSC activables únicamente con precio real del usuario",
      () => {
        const msc =
          getCruiseLine("msc");

        expect(
          msc.packages.mscEasy
            .economicActivation
        ).toBe("user-price-only");

        expect(
          msc.packages.mscPremiumExtra
            .economicActivation
        ).toBe("user-price-only");

        expect(
          msc.packages.mscAlcoholFree
            .economicActivation
        ).toBe("user-price-only");
      }
    );
    it(
      "transporta el contexto real hasta las reglas operativas MSC",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine: "msc",

            market: "ES",

            sailingDate:
              "2026-08-15",

            days: 7,
            people: 1,

            coffee: 2,
            water: 2,
            soda: 2,
            beer: 1,
            wine: 1,
            cocktail: 1,
          });

        const easyRule =
          result.operationalRules.find(
            (rule) =>
              rule.packageKey ===
              "mscEasy"
          );

        expect(
          easyRule?.context
        ).toEqual({
          cruiseLine: "msc",
          market: "ES",
          sailingRegion: null,
          sailingDate:
            "2026-08-15",
        });

        expect(
          easyRule
            ?.alcoholicDrinksDailyLimit
        ).toBe(15);

        expect(
          easyRule
            ?.appliedContextualRuleIds
        ).toEqual([]);
      }
    );

    it(
      "no inventa contexto cuando market y sailingDate son desconocidos",
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

        const easyRule =
          result.operationalRules.find(
            (rule) =>
              rule.packageKey ===
              "mscEasy"
          );

        expect(
          easyRule?.context
        ).toEqual({
          cruiseLine: "msc",
          market: null,
          sailingRegion: null,
          sailingDate: null,
        });
      }
    );
  }
);
