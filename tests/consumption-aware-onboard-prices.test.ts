import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getMissingRequiredOnboardPriceKeys,
  resolveOnboardPriceValuesForConsumption,
  type PartialOnboardPriceValues,
} from "@/lib/onboardPriceService";

describe(
  "consumption-aware onboard prices",
  () => {
    it(
      "no exige precios para categorías con consumo cero",
      () => {
        const prices:
          PartialOnboardPriceValues = {
          coffee: null,
          water: null,
          soda: null,
          beer: null,
          wine: null,
          cocktail: 10,
        };

        const consumption = {
          coffee: 0,
          water: 0,
          soda: 0,
          juice: 0,
          beer: 0,
          wine: 0,
          cocktail: 2,
        };

        expect(
          getMissingRequiredOnboardPriceKeys(
            prices,
            consumption
          )
        ).toEqual([]);

        expect(
          resolveOnboardPriceValuesForConsumption(
            prices,
            consumption
          )
        ).toEqual({
          coffee: 0,
          water: 0,
          soda: 0,
          juice: 0,
          beer: 0,
          wine: 0,
          cocktail: 10,
        });
      }
    );

    it(
      "sigue exigiendo el precio de una categoría realmente consumida",
      () => {
        const prices:
          PartialOnboardPriceValues = {
          coffee: null,
          water: null,
          soda: null,
          beer: null,
          wine: null,
          cocktail: null,
        };

        const consumption = {
          coffee: 0,
          water: 0,
          soda: 0,
          beer: 0,
          wine: 0,
          cocktail: 2,
        };

        expect(
          getMissingRequiredOnboardPriceKeys(
            prices,
            consumption
          )
        ).toEqual([
          "cocktail",
        ]);

        expect(
          resolveOnboardPriceValuesForConsumption(
            prices,
            consumption
          )
        ).toBeNull();
      }
    );
  }
);
