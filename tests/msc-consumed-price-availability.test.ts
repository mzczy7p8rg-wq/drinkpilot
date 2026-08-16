import {
  describe,
  expect,
  it,
} from "vitest";

import {
  compareDrinkPackages,
} from "@/lib/comparison";

describe(
  "MSC consumed price availability",
  () => {
    it(
      "permite comparar cuando conocemos todos los precios de las categorías realmente consumidas",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine: "msc",

            onboardCurrency:
              "EUR",

            cruiseNights: 7,
            people: 1,

            coffee: 0,
            water: 0,
            soda: 0,
            beer: 0,
            wine: 0,
            cocktail: 2,

            alcoholicCocktail: 0,
            nonAlcoholicCocktail: 2,

            customPackagePrices: {
              mscPremiumExtra: 10,
            },

            selectedDrinkPrices: {
              cocktail: {
                category: "cocktail",
                price: 10,
                currency: "EUR",
                source: "user",
              },
            },
          });

        expect(
          result.economicDataAvailable
        ).toBe(true);

        expect(
          result.missingOnboardPriceKeys
        ).toEqual([]);

        expect(
          result.packages.length
        ).toBeGreaterThan(0);
      }
    );
  }
);
