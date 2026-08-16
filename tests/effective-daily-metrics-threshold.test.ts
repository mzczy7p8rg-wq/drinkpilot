import {
  describe,
  expect,
  it,
} from "vitest";

import {
  compareDrinkPackages,
} from "@/lib/comparison";

describe(
  "effective daily metrics with quantified threshold",
  () => {
    it(
      "mantiene margen diario y break-even coherentes con el ahorro efectivo",
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
            beer: 0,
            wine: 0,
            cocktail: 4,

            alcoholicCocktail: 0,
            nonAlcoholicCocktail: 4,

            customPackagePrices: {
              mscPremiumExtra: 69,
            },

            selectedDrinkPrices: {
              cocktail: {
                category:
                  "cocktail",
                price: 15,
                currency: "EUR",
                source: "user",
              },
            },
          });

        const premiumExtra =
          result.packages.find(
            (pkg) =>
              pkg.packageKey ===
              "mscPremiumExtra"
          );

        expect(
          premiumExtra
        ).toBeDefined();

        /*
         * Economía base.
         */
        expect(
          premiumExtra?.drinksCost
        ).toBe(420);

        expect(
          premiumExtra?.packageCost
        ).toBe(483);

        expect(
          premiumExtra?.savings
        ).toBe(-63);

        /*
         * 4 bebidas/día × 1 € de
         * diferencia sobre threshold
         * × 7 días = 28 € adicionales.
         */
        expect(
          premiumExtra
            ?.effectiveSavings
        ).toBe(-91);

        expect(
          premiumExtra
            ?.economicComparisonStatus
        ).toBe("complete");

        expect(
          result.bestPackage
        ).toBeNull();

        /*
         * Si el resultado efectivo es
         * -91 €, el margen diario efectivo
         * por persona debe ser -91 / 7.
         */
        expect(
          premiumExtra
            ?.dailyMargin
        ).toBeCloseTo(
          -91 / 7
        );

        /*
         * Cada cóctel aporta 15 € al coste
         * de pagar por separado, pero 1 €
         * vuelve a pagarse por superar el
         * threshold.
         *
         * Valor económico neto por bebida:
         * 14 €.
         *
         * Coste equivalente diario paquete:
         * 483 / 7.
         */
        expect(
          premiumExtra
            ?.breakEvenDrinksPerDay
        ).toBeCloseTo(
          (483 / 7) / 14
        );

        /*
         * Con 4 bebidas/día seguimos por
         * debajo del verdadero break-even.
         */
        expect(
          premiumExtra
            ?.breakEvenDrinksPerDay
        ).toBeGreaterThan(4);
      }
    );
  }
);
