import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveStoredSelectedDrinkPrices,
} from "@/lib/selectedDrinkPriceStorage";

describe(
  "selected drink price storage",
  () => {
    it(
      "devuelve vacío cuando no existe estado almacenado",
      () => {
        expect(
          resolveStoredSelectedDrinkPrices(
            undefined
          )
        ).toEqual({});

        expect(
          resolveStoredSelectedDrinkPrices(
            null
          )
        ).toEqual({});
      }
    );

    it(
      "rehidrata un precio válido",
      () => {
        expect(
          resolveStoredSelectedDrinkPrices({
            cocktail: {
              price: 18,
              currency: "EUR",
            },
          })
        ).toEqual({
          cocktail: {
            category:
              "cocktail",
            price: 18,
            currency: "EUR",
            source: "user",
          },
        });
      }
    );

    it(
      "normaliza la moneda almacenada",
      () => {
        expect(
          resolveStoredSelectedDrinkPrices({
            wine: {
              price: 16,
              currency:
                " usd ",
            },
          })
        ).toEqual({
          wine: {
            category: "wine",
            price: 16,
            currency: "USD",
            source: "user",
          },
        });
      }
    );

    it(
      "descarta precios inválidos sin inventar valores",
      () => {
        expect(
          resolveStoredSelectedDrinkPrices({
            cocktail: {
              price: 0,
              currency: "EUR",
            },

            wine: {
              price: -5,
              currency: "EUR",
            },

            beer: {
              price:
                Number.POSITIVE_INFINITY,
              currency: "EUR",
            },
          })
        ).toEqual({});
      }
    );

    it(
      "descarta entradas sin moneda válida",
      () => {
        expect(
          resolveStoredSelectedDrinkPrices({
            cocktail: {
              price: 18,
              currency: "",
            },

            wine: {
              price: 16,
              currency: null,
            },
          })
        ).toEqual({});
      }
    );

    it(
      "ignora categorías desconocidas",
      () => {
        expect(
          resolveStoredSelectedDrinkPrices({
            cocktail: {
              price: 18,
              currency: "EUR",
            },

            champagne: {
              price: 30,
              currency: "EUR",
            },
          })
        ).toEqual({
          cocktail: {
            category:
              "cocktail",
            price: 18,
            currency: "EUR",
            source: "user",
          },
        });
      }
    );

    it(
      "tolera una estructura corrupta",
      () => {
        expect(
          resolveStoredSelectedDrinkPrices(
            []
          )
        ).toEqual({});

        expect(
          resolveStoredSelectedDrinkPrices(
            "corrupt"
          )
        ).toEqual({});

        expect(
          resolveStoredSelectedDrinkPrices({
            cocktail:
              "not-an-object",
          })
        ).toEqual({});
      }
    );
  }
);

describe(
  "selected drink price source storage",
  () => {
    it(
      "conserva un origen oficial almacenado",
      () => {
        expect(
          resolveStoredSelectedDrinkPrices({
            water: {
              price: 3,
              currency: "EUR",
              source: "official",
            },
          })
        ).toEqual({
          water: {
            category: "water",
            price: 3,
            currency: "EUR",
            source: "official",
          },
        });
      }
    );

    it(
      "conserva un origen documented-menu almacenado",
      () => {
        expect(
          resolveStoredSelectedDrinkPrices({
            coffee: {
              price: 4,
              currency: "USD",
              source: "documented-menu",
            },
          })
        ).toEqual({
          coffee: {
            category: "coffee",
            price: 4,
            currency: "USD",
            source: "documented-menu",
          },
        });
      }
    );

    it(
      "mantiene compatibilidad con datos antiguos sin source",
      () => {
        expect(
          resolveStoredSelectedDrinkPrices({
            beer: {
              price: 8,
              currency: "EUR",
            },
          })
        ).toEqual({
          beer: {
            category: "beer",
            price: 8,
            currency: "EUR",
            source: "user",
          },
        });
      }
    );
  }
);
