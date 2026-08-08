import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveSelectedDrinkPricesAfterCruiseLineChange,
} from "@/lib/selectedDrinkPriceContext";

import type {
  SelectedDrinkPrices,
} from "@/lib/selectedDrinkPriceStorage";

const selectedDrinkPrices:
  SelectedDrinkPrices = {
  coffee: {
    category: "coffee",
    price: 2.5,
    currency: "EUR",
    source: "user",
  },

  water: {
    category: "water",
    price: 2,
    currency: "EUR",
    source: "official",
    referenceId:
      "msc-aqua-1l-main-restaurant",
  },

  cocktail: {
    category: "cocktail",
    price: 14,
    currency: "USD",
    source: "documented-menu",
    referenceId:
      "msc-world-america-passion-fruit-martini-2025-07",
    contextRelevance:
      "compatible",
  },
};

describe(
  "selected drink prices after cruise line change",
  () => {
    it(
      "conserva todas las selecciones cuando la naviera no cambia",
      () => {
        expect(
          resolveSelectedDrinkPricesAfterCruiseLineChange({
            previousCruiseLine:
              "msc",
            nextCruiseLine:
              "msc",
            selectedDrinkPrices,
          })
        ).toBe(
          selectedDrinkPrices
        );
      }
    );

    it(
      "descarta precios manuales y referenciados al cambiar de naviera",
      () => {
        expect(
          resolveSelectedDrinkPricesAfterCruiseLineChange({
            previousCruiseLine:
              "msc",
            nextCruiseLine:
              "costa",
            selectedDrinkPrices,
          })
        ).toEqual({});
      }
    );
  }
);
