import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveDrinkPriceReferenceSelection,
  resolveDrinkPriceSelectionSource,
} from "@/lib/drinkPriceSelectionSource";

describe(
  "drink price selection source",
  () => {
    it(
      "mantiene compatibilidad con referencias oficiales existentes",
      () => {
        expect(
          resolveDrinkPriceSelectionSource(
            "msc-aqua-1l-main-restaurant"
          )
        ).toBe("official");
      }
    );

    it(
      "conserva documented-menu cuando la referencia es documentada",
      () => {
        expect(
          resolveDrinkPriceSelectionSource(
            "msc-world-america-espresso-coffee-emporium-2025-07",
            "documented-menu"
          )
        ).toBe(
          "documented-menu"
        );
      }
    );

    it(
      "vuelve a user cuando desaparece la referencia",
      () => {
        expect(
          resolveDrinkPriceSelectionSource(
            undefined,
            "documented-menu"
          )
        ).toBe("user");

        expect(
          resolveDrinkPriceSelectionSource(
            null,
            "official"
          )
        ).toBe("user");
      }
    );

    it(
      "no convierte una selección manual en referencia documentada",
      () => {
        expect(
          resolveDrinkPriceSelectionSource(
            null,
            "documented-menu"
          )
        ).toBe("user");
      }
    );
  }
);

describe(
  "stored drink price reference selection",
  () => {
    it(
      "restaura las referencias oficiales y documentadas del wizard",
      () => {
        expect(
          resolveDrinkPriceReferenceSelection({
            water: {
              category: "water",
              price: 3,
              currency: "EUR",
              source: "official",
              referenceId:
                "msc-aqua-1l-main-restaurant",
            },
            coffee: {
              category: "coffee",
              price: 2.5,
              currency: "USD",
              source: "documented-menu",
              referenceId:
                "msc-world-america-espresso-fleetwide-2025-07",
              contextRelevance:
                "compatible",
            },
          })
        ).toEqual({
          referenceIds: {
            water:
              "msc-aqua-1l-main-restaurant",
            coffee:
              "msc-world-america-espresso-fleetwide-2025-07",
          },
          referenceSources: {
            water: "official",
            coffee:
              "documented-menu",
          },
        });
      }
    );

    it(
      "no restaura precios manuales ni selecciones antiguas sin identificador",
      () => {
        expect(
          resolveDrinkPriceReferenceSelection({
            beer: {
              category: "beer",
              price: 8,
              currency: "EUR",
              source: "user",
            },
            wine: {
              category: "wine",
              price: 14,
              currency: "USD",
              source:
                "documented-menu",
              contextRelevance:
                "exact",
            },
          })
        ).toEqual({
          referenceIds: {},
          referenceSources: {},
        });
      }
    );
  }
);
