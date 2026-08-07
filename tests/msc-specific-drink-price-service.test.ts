import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createSelectedDrinkPriceFromMscReference,
  getMscSpecificDrinkPriceById,
  getMscSpecificDrinkPrices,
} from "@/lib/mscSpecificDrinkPriceService";

describe(
  "MSC specific drink price service",
  () => {
    it(
      "filtra referencias por categoría",
      () => {
        const water =
          getMscSpecificDrinkPrices(
            "water"
          );

        expect(
          water
        ).toHaveLength(3);

        expect(
          water.every(
            (item) =>
              item.category === "water"
          )
        ).toBe(true);
      }
    );

    it(
      "resuelve una referencia por id",
      () => {
        const reference =
          getMscSpecificDrinkPriceById(
            "msc-aqua-1l-main-restaurant"
          );

        expect(
          reference?.price
        ).toBe(2);

        expect(
          reference?.currency
        ).toBe("EUR");
      }
    );

    it(
      "convierte una referencia oficial en SelectedDrinkPrice",
      () => {
        expect(
          createSelectedDrinkPriceFromMscReference(
            "msc-aqua-50cl-refill"
          )
        ).toEqual({
          category: "water",
          price: 1,
          currency: "EUR",
          source: "official",
        });
      }
    );

    it(
      "no inventa una referencia inexistente",
      () => {
        expect(
          createSelectedDrinkPriceFromMscReference(
            "missing-reference"
          )
        ).toBeNull();
      }
    );
  }
);
