import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveSelectedDrinkPricesAfterCruiseLineChange,
  resolveSelectedDrinkPricesForCruiseContext,
} from "@/lib/selectedDrinkPriceContext";

import type {
  CruiseContext,
} from "@/lib/cruiseContext";

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

function createCruiseContext(
  overrides:
    Partial<CruiseContext> = {}
): CruiseContext {
  return {
    cruiseLine: "msc",
    market: null,
    sailingRegion: null,
    onboardCurrency: null,
    sailingDate: null,
    ...overrides,
  };
}

describe(
  "selected drink prices for cruise context",
  () => {
    it(
      "conserva un precio manual cuando su moneda sigue siendo compatible",
      () => {
        const manualPrice =
          selectedDrinkPrices.coffee;

        const result =
          resolveSelectedDrinkPricesForCruiseContext({
            cruiseContext:
              createCruiseContext({
                onboardCurrency:
                  "EUR",
              }),

            selectedDrinkPrices: {
              coffee:
                manualPrice,
            },
          });

        expect(result).toEqual({
          coffee:
            manualPrice,
        });
      }
    );

    it(
      "descarta un precio manual cuando la moneda a bordo ha cambiado",
      () => {
        expect(
          resolveSelectedDrinkPricesForCruiseContext({
            cruiseContext:
              createCruiseContext({
                onboardCurrency:
                  "USD",
              }),

            selectedDrinkPrices: {
              coffee:
                selectedDrinkPrices.coffee,
            },
          })
        ).toEqual({});
      }
    );

    it(
      "restaura una referencia oficial desde su valor canónico",
      () => {
        expect(
          resolveSelectedDrinkPricesForCruiseContext({
            cruiseContext:
              createCruiseContext({
                onboardCurrency:
                  "EUR",
              }),

            selectedDrinkPrices: {
              water: {
                category: "water",
                price: 999,
                currency: "EUR",
                source: "official",
                referenceId:
                  "msc-aqua-1l-main-restaurant",
              },
            },
          })
        ).toEqual({
          water: {
            category: "water",
            price: 2,
            currency: "EUR",
            source: "official",
            referenceId:
              "msc-aqua-1l-main-restaurant",
          },
        });
      }
    );

    it(
      "descarta una referencia oficial incompatible con la moneda actual",
      () => {
        expect(
          resolveSelectedDrinkPricesForCruiseContext({
            cruiseContext:
              createCruiseContext({
                onboardCurrency:
                  "USD",
              }),

            selectedDrinkPrices: {
              water:
                selectedDrinkPrices.water,
            },
          })
        ).toEqual({});
      }
    );

    it(
      "actualiza la pertinencia de una referencia documental conservada",
      () => {
        expect(
          resolveSelectedDrinkPricesForCruiseContext({
            cruiseContext:
              createCruiseContext({
                sailingRegion:
                  "North America",
                onboardCurrency:
                  "USD",
              }),

            selectedDrinkPrices: {
              cocktail: {
                category:
                  "cocktail",
                price: 999,
                currency: "USD",
                source:
                  "documented-menu",
                referenceId:
                  "msc-world-america-passion-fruit-martini-2025-07",
                contextRelevance:
                  "exact",
              },
            },
          })
        ).toEqual({
          cocktail: {
            category: "cocktail",
            price: 14,
            currency: "USD",
            source:
              "documented-menu",
            referenceId:
              "msc-world-america-passion-fruit-martini-2025-07",
            contextRelevance:
              "compatible",
          },
        });
      }
    );

    it(
      "descarta una referencia documental incompatible con la región actual",
      () => {
        expect(
          resolveSelectedDrinkPricesForCruiseContext({
            cruiseContext:
              createCruiseContext({
                sailingRegion:
                  "Europe",
                onboardCurrency:
                  "USD",
              }),

            selectedDrinkPrices: {
              cocktail:
                selectedDrinkPrices.cocktail,
            },
          })
        ).toEqual({});
      }
    );

    it(
      "no inventa caducidad por fecha cuando la evidencia no define vigencia",
      () => {
        const result =
          resolveSelectedDrinkPricesForCruiseContext({
            cruiseContext:
              createCruiseContext({
                sailingRegion:
                  "North America",
                onboardCurrency:
                  "USD",
                sailingDate:
                  "2030-08-09",
              }),

            selectedDrinkPrices: {
              cocktail:
                selectedDrinkPrices.cocktail,
            },
          });

        expect(
          result.cocktail
        ).toMatchObject({
          referenceId:
            "msc-world-america-passion-fruit-martini-2025-07",
          contextRelevance:
            "compatible",
        });
      }
    );

    it(
      "descarta referencias rotas o pertenecientes a otra naviera",
      () => {
        expect(
          resolveSelectedDrinkPricesForCruiseContext({
            cruiseContext:
              createCruiseContext(),

            selectedDrinkPrices: {
              cocktail: {
                category:
                  "cocktail",
                price: 14,
                currency: "USD",
                source:
                  "documented-menu",
                referenceId:
                  "missing-reference",
              },
            },
          })
        ).toEqual({});

        expect(
          resolveSelectedDrinkPricesForCruiseContext({
            cruiseContext:
              createCruiseContext({
                cruiseLine:
                  "costa",
              }),

            selectedDrinkPrices: {
              cocktail:
                selectedDrinkPrices.cocktail,
            },
          })
        ).toEqual({});
      }
    );
  }
);
