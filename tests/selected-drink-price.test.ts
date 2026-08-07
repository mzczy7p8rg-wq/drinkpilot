import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createSelectedDrinkPrice,
} from "@/lib/selectedDrinkPrice";

describe(
  "selected drink price",
  () => {
    it(
      "crea una bebida concreta válida",
      () => {
        expect(
          createSelectedDrinkPrice({
            category:
              "cocktail",

            price:
              15,

            currency:
              "EUR",
          })
        ).toEqual({
          category:
            "cocktail",

          price:
            15,

          currency:
            "EUR",
        });
      }
    );

    it(
      "normaliza la moneda",
      () => {
        expect(
          createSelectedDrinkPrice({
            category:
              "wine",

            price:
              17,

            currency:
              " usd ",
          })
        ).toEqual({
          category:
            "wine",

          price:
            17,

          currency:
            "USD",
        });
      }
    );

    it(
      "rechaza un precio cero",
      () => {
        expect(
          createSelectedDrinkPrice({
            category:
              "beer",

            price:
              0,

            currency:
              "EUR",
          })
        ).toBeNull();
      }
    );

    it(
      "rechaza un precio negativo",
      () => {
        expect(
          createSelectedDrinkPrice({
            category:
              "cocktail",

            price:
              -1,

            currency:
              "EUR",
          })
        ).toBeNull();
      }
    );

    it(
      "rechaza un precio no finito",
      () => {
        expect(
          createSelectedDrinkPrice({
            category:
              "cocktail",

            price:
              Number.POSITIVE_INFINITY,

            currency:
              "EUR",
          })
        ).toBeNull();
      }
    );

    it(
      "rechaza una moneda vacía",
      () => {
        expect(
          createSelectedDrinkPrice({
            category:
              "coffee",

            price:
              4,

            currency:
              "   ",
          })
        ).toBeNull();
      }
    );

    it(
      "rechaza una moneda desconocida",
      () => {
        expect(
          createSelectedDrinkPrice({
            category:
              "water",

            price:
              4,

            currency:
              null,
          })
        ).toBeNull();
      }
    );
  }
);
