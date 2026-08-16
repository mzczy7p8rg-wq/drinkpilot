import {
  describe,
  expect,
  it,
} from "vitest";

import {
  compareDrinkPackages,
} from "@/lib/comparison";

describe(
  "MSC alcohol limit economic uncertainty",
  () => {
    it(
      "no recomienda Easy cuando se supera el límite alcohólico y el coste posterior es desconocido",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine: "msc",

            market: "ES",

            onboardCurrency:
              "EUR",

            sailingDate:
              "2026-08-15",

            cruiseNights: 7,
            people: 1,

            coffee: 0,
            water: 0,
            soda: 0,
            beer: 16,
            wine: 0,
            cocktail: 0,

            alcoholicCocktail:
              0,

            nonAlcoholicCocktail:
              0,

            customPackagePrices: {
              mscEasy: 10,
            },

            selectedDrinkPrices: {
              coffee: {
                category:
                  "coffee",
                price: 3,
                currency: "EUR",
                source: "user",
              },

              water: {
                category:
                  "water",
                price: 2,
                currency: "EUR",
                source: "user",
              },

              soda: {
                category:
                  "soda",
                price: 3,
                currency: "EUR",
                source: "user",
              },

              beer: {
                category:
                  "beer",
                price: 8,
                currency: "EUR",
                source: "user",
              },

              wine: {
                category:
                  "wine",
                price: 9,
                currency: "EUR",
                source: "user",
              },

              cocktail: {
                category:
                  "cocktail",
                price: 10,
                currency: "EUR",
                source: "user",
              },
            },
          });

        const easy =
          result.packages.find(
            (pkg) =>
              pkg.packageKey ===
              "mscEasy"
          );

        const operationalImpact =
          result.operationalRuleImpacts.find(
            (impact) =>
              impact.packageKey ===
              "mscEasy"
          );

        expect(
          operationalImpact
            ?.economicImpact
            .status
        ).toBe(
          "known-unquantified"
        );

        expect(
          operationalImpact
            ?.economicImpact
            .chargePolicy
        ).toBe("unknown");

        /*
         * El ahorro bruto puede ser
         * claramente positivo.
         */
        expect(
          easy?.savings
        ).toBeGreaterThan(0);

        /*
         * Pero no podemos elevarlo a
         * ahorro efectivo mientras
         * desconozcamos el coste del
         * consumo que excede el límite.
         */
        expect(
          easy
            ?.economicComparisonStatus
        ).toBe(
          "partial-unknown"
        );

        expect(
          easy?.effectiveSavings
        ).toBeNull();

        expect(
          result.bestPackage
        ).toBeNull();

        expect(
          result.anyPackageWorthIt
        ).toBe(false);
      }
    );
  }
);
