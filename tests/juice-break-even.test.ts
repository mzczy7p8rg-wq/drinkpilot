import { describe, expect, it } from "vitest";

import { calculateRecommendation } from "@/lib/calculator";

describe("juice break-even", () => {
  it("incluye el zumo en el número total de bebidas usado para calcular el punto de equilibrio", () => {
    const result = calculateRecommendation({
      cruiseNights: 7,
      people: 1,

      packagePricePerChargeUnit: 10,

      coffee: 0,
      water: 0,
      soda: 0,
      juice: 1,
      beer: 0,
      wine: 0,
      cocktail: 0,

      coffeePrice: 0,
      waterPrice: 0,
      sodaPrice: 0,
      juicePrice: 5,
      beerPrice: 0,
      winePrice: 0,
      cocktailPrice: 0,
    });

    expect(result.dailyDrinkCost).toBe(5);
    expect(result.breakEvenDrinksPerDay).toBe(2);
  });
});
