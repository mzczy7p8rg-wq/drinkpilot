import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getMissingOnboardPriceKeys,
  hasCompleteOnboardPriceValues,
  PartialOnboardPriceValues,
} from "@/lib/onboardPriceService";

describe("onboard price service", () => {
  it("acepta una cesta completa de precios válidos", () => {
    const prices:
      PartialOnboardPriceValues = {
        coffee: 3.5,
        water: 2.5,
        soda: 3.5,
        juice: 4,
        beer: 7,
        wine: 8,
        cocktail: 9,
      };

    expect(
      hasCompleteOnboardPriceValues(
        prices
      )
    ).toBe(true);

    expect(
      getMissingOnboardPriceKeys(
        prices
      )
    ).toEqual([]);
  });

  it("detecta precios pendientes", () => {
    const prices:
      PartialOnboardPriceValues = {
        coffee: null,
        water: 2,
        soda: null,
        juice: null,
        beer: null,
        wine: null,
        cocktail: null,
      };

    expect(
      hasCompleteOnboardPriceValues(
        prices
      )
    ).toBe(false);

    expect(
      getMissingOnboardPriceKeys(
        prices
      )
    ).toEqual([
      "coffee",
      "soda",
      "juice",
      "beer",
      "wine",
      "cocktail",
    ]);
  });

  it("no considera cero un precio válido", () => {
    const prices:
      PartialOnboardPriceValues = {
        coffee: 0,
        water: 2.5,
        soda: 3.5,
        juice: 4,
        beer: 7,
        wine: 8,
        cocktail: 9,
      };

    expect(
      hasCompleteOnboardPriceValues(
        prices
      )
    ).toBe(false);

    expect(
      getMissingOnboardPriceKeys(
        prices
      )
    ).toContain("coffee");
  });

  it("rechaza valores negativos", () => {
    const prices:
      PartialOnboardPriceValues = {
        coffee: 3.5,
        water: -1,
        soda: 3.5,
        juice: 4,
        beer: 7,
        wine: 8,
        cocktail: 9,
      };

    expect(
      hasCompleteOnboardPriceValues(
        prices
      )
    ).toBe(false);

    expect(
      getMissingOnboardPriceKeys(
        prices
      )
    ).toContain("water");
  });

  it("rechaza NaN e Infinity", () => {
    const prices:
      PartialOnboardPriceValues = {
        coffee: Number.NaN,
        water: 2.5,
        soda: 3.5,
        juice: 4,
        beer:
          Number.POSITIVE_INFINITY,
        wine: 8,
        cocktail: 9,
      };

    expect(
      hasCompleteOnboardPriceValues(
        prices
      )
    ).toBe(false);

    expect(
      getMissingOnboardPriceKeys(
        prices
      )
    ).toEqual([
      "coffee",
      "beer",
    ]);
  });

  it("rechaza precios fuera del rango seguro", () => {
    const prices:
      PartialOnboardPriceValues = {
        coffee:
          Number.MAX_SAFE_INTEGER + 1,
        water: 2.5,
        soda: 3.5,
        juice: 4,
        beer: 7,
        wine: 8,
        cocktail: 9,
      };

    expect(
      hasCompleteOnboardPriceValues(
        prices
      )
    ).toBe(false);

    expect(
      getMissingOnboardPriceKeys(
        prices
      )
    ).toContain("coffee");
  });
});
