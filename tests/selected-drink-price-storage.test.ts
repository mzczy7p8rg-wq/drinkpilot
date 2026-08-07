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
