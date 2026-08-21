import {
  describe,
  expect,
  it,
} from "vitest";

import { calculateRecommendation } from "@/lib/calculator";
import { resolveStoredWizardProgress } from "@/lib/wizardProgressStorage";

const prices = {
  coffeePrice: 4,
  waterPrice: 3,
  sodaPrice: 5,
  juicePrice: 5,
  beerPrice: 6,
  winePrice: 8,
  cocktailPrice: 10,
};

describe("phase 5 traveler consumption characterization", () => {
  it("applies the single current daily profile to every adult", () => {
    const result = calculateRecommendation({
      cruiseNights: 7,
      people: 2,
      packagePricePerChargeUnit: 40,
      coffee: 3,
      water: 0,
      soda: 0,
      juice: 0,
      beer: 2,
      wine: 0,
      cocktail: 0,
      ...prices,
    });

    expect(result.dailyDrinkCost).toBe(24);
    expect(result.drinksCost).toBe(24 * 7 * 2);
    expect(result.coffeeCost).toBe(3 * 4 * 7 * 2);
    expect(result.beerCost).toBe(2 * 6 * 7 * 2);
    expect(result.packageCost).toBe(40 * 7 * 2);
  });

  it("shows why two different adult profiles cannot be represented exactly today", () => {
    const adultOne = calculateRecommendation({
      cruiseNights: 7,
      people: 1,
      packagePricePerChargeUnit: 40,
      coffee: 3,
      water: 0,
      soda: 0,
      juice: 0,
      beer: 2,
      wine: 0,
      cocktail: 0,
      ...prices,
    });

    const adultTwo = calculateRecommendation({
      cruiseNights: 7,
      people: 1,
      packagePricePerChargeUnit: 40,
      coffee: 1,
      water: 1,
      soda: 0,
      juice: 0,
      beer: 0,
      wine: 0,
      cocktail: 2,
      ...prices,
    });

    const desiredGroupDrinksCost =
      adultOne.drinksCost + adultTwo.drinksCost;

    const repeatedAdultOne = calculateRecommendation({
      cruiseNights: 7,
      people: 2,
      packagePricePerChargeUnit: 40,
      coffee: 3,
      water: 0,
      soda: 0,
      juice: 0,
      beer: 2,
      wine: 0,
      cocktail: 0,
      ...prices,
    });

    const repeatedAdultTwo = calculateRecommendation({
      cruiseNights: 7,
      people: 2,
      packagePricePerChargeUnit: 40,
      coffee: 1,
      water: 1,
      soda: 0,
      juice: 0,
      beer: 0,
      wine: 0,
      cocktail: 2,
      ...prices,
    });

    expect(desiredGroupDrinksCost).toBe(357);
    expect(repeatedAdultOne.drinksCost).toBe(336);
    expect(repeatedAdultTwo.drinksCost).toBe(378);
    expect(repeatedAdultOne.drinksCost).not.toBe(desiredGroupDrinksCost);
    expect(repeatedAdultTwo.drinksCost).not.toBe(desiredGroupDrinksCost);
  });

  it("cannot persist the fractional averages required by a heterogeneous group", () => {
    const resolved = resolveStoredWizardProgress({
      people: 2,
      coffee: 2,
      water: 0.5,
      soda: 0,
      juice: 0,
      beer: 1,
      wine: 0,
    });

    expect(resolved).toMatchObject({
      people: 2,
      coffee: 2,
      water: 0,
      beer: 1,
    });
  });
});
