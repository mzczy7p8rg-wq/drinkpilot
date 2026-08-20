import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateRecommendation,
} from "@/lib/calculator";

describe(
  "calculator consistency with package charge units",
  () => {
    it(
      "mantiene coherentes ahorro, margen diario y punto de equilibrio cuando se factura menos días que el consumo",
      () => {
        const result =
          calculateRecommendation({
            cruiseNights: 7,
            packageChargeUnits: 6,
            people: 1,

            packagePricePerChargeUnit: 34,

            coffee: 0,
            water: 0,
            soda: 0,
            beer: 0,
            wine: 0,
            cocktail: 3,

            coffeePrice: 3.5,
            waterPrice: 2.5,
            sodaPrice: 3.5,
            beerPrice: 7,
            winePrice: 8,
            cocktailPrice: 10,
          });

        expect(
          result.drinksCost
        ).toBe(210);

        expect(
          result.packageCost
        ).toBe(204);

        expect(
          result.savings
        ).toBe(6);

        expect(
          result.recommended
        ).toBe(true);

        expect(
          result.dailyMargin
        ).toBeCloseTo(
          30 - 204 / 7
        );

        expect(
          result.dailyMargin
        ).toBeGreaterThan(0);

        expect(
          result.recommendationLevel
        ).toBe("very-close");

        expect(
          result.breakEvenDrinksPerDay
        ).toBeCloseTo(
          (204 / 7) / 10
        );
      }
    );

    it(
      "mantiene coherentes ahorro, margen diario y punto de equilibrio cuando se factura más días que las noches del crucero",
      () => {
        const result =
          calculateRecommendation({
            cruiseNights: 7,
            packageChargeUnits: 8,
            people: 1,

            packagePricePerChargeUnit: 34,

            coffee: 0,
            water: 0,
            soda: 0,
            beer: 0,
            wine: 0,
            cocktail: 4,

            coffeePrice: 3.5,
            waterPrice: 2.5,
            sodaPrice: 3.5,
            beerPrice: 7,
            winePrice: 8,
            cocktailPrice: 10,
          });

        expect(
          result.drinksCost
        ).toBe(280);

        expect(
          result.packageCost
        ).toBe(272);

        expect(
          result.savings
        ).toBe(8);

        expect(
          result.recommended
        ).toBe(true);

        expect(
          result.dailyMargin
        ).toBeCloseTo(
          40 - 272 / 7
        );

        expect(
          result.dailyMargin
        ).toBeGreaterThan(0);

        expect(
          result.recommendationLevel
        ).toBe("very-close");

        expect(
          result.breakEvenDrinksPerDay
        ).toBeCloseTo(
          (272 / 7) / 10
        );
      }
    );

  }
);
