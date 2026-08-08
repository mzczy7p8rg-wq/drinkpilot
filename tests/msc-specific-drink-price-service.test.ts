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
          referenceId:
            "msc-aqua-50cl-refill",
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

describe(
  "MSC specific drink price evidence resolution",
  () => {
    it(
      "resuelve conjuntamente precio, referencia y evidencia",
      async () => {
        const {
          resolveMscSpecificDrinkPriceSelection,
        } = await import(
          "@/lib/mscSpecificDrinkPriceService"
        );

        const result =
          resolveMscSpecificDrinkPriceSelection(
            "msc-aqua-1l-main-restaurant"
          );

        expect(
          result?.selectedDrinkPrice
        ).toEqual({
          category: "water",
          price: 2,
          currency: "EUR",
          source: "official",
          referenceId:
            "msc-aqua-1l-main-restaurant",
        });

        expect(
          result?.reference.id
        ).toBe(
          "msc-aqua-1l-main-restaurant"
        );

        expect(
          result?.evidence.evidence
        ).toBe("official");

        expect(
          result?.evidence.context
            .currency
        ).toBe("EUR");

        expect(
          result?.evidence.context
            .verifiedAt
        ).toBe("2026-08-07");
      }
    );

    it(
      "no fabrica evidencia para una referencia inexistente",
      async () => {
        const {
          resolveMscSpecificDrinkPriceSelection,
        } = await import(
          "@/lib/mscSpecificDrinkPriceService"
        );

        expect(
          resolveMscSpecificDrinkPriceSelection(
            "missing-reference"
          )
        ).toBeNull();
      }
    );
  }
);
