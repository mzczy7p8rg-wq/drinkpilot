import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateRecommendation,
} from "@/lib/calculator";

describe(
  "calculator consistency with package charge days",
  () => {
    it(
      "mantiene coherentes ahorro, margen diario y punto de equilibrio cuando se factura menos días que el consumo",
      () => {
        const result =
          calculateRecommendation({
            days: 7,
            packageChargeDays: 6,
            people: 1,

            packagePricePerDay: 34,

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
  }
);
