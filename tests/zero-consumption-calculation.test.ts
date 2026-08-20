import { describe, expect, it } from "vitest";

import { calculateRecommendation } from "@/lib/calculator";

describe("zero consumption calculation", () => {
  it("mantiene métricas económicas seguras cuando no hay consumo de bebidas", () => {
    const result = calculateRecommendation({
      cruiseNights: 7,
      people: 1,

      packagePricePerChargeUnit: 34,

      coffee: 0,
      water: 0,
      soda: 0,
      juice: 0,
      beer: 0,
      wine: 0,
      cocktail: 0,

      coffeePrice: 3.5,
      waterPrice: 2.5,
      sodaPrice: 3.5,
      juicePrice: 4,
      beerPrice: 7,
      winePrice: 8,
      cocktailPrice: 10,
    });

    expect(result.drinksCost).toBe(0);
    expect(result.packageCost).toBe(238);
    expect(result.savings).toBe(-238);
    expect(result.savingsPercentage).toBe(0);
    expect(result.recommended).toBe(false);
    expect(result.dailyMargin).toBe(-34);

    expect(
      [
        result.packageCost,
        result.drinksCost,
        result.savings,
        result.savingsPercentage,
        result.dailyMargin,
        result.breakEvenDrinksPerDay,
      ].every(Number.isFinite)
    ).toBe(true);
  });
});
