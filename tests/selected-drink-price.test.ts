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

          source:
            "user",
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

          source:
            "user",
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

describe(
  "selected drink price source",
  () => {
    it(
      "marca como user un precio sin origen explícito",
      () => {
        expect(
          createSelectedDrinkPrice({
            category: "cocktail",
            price: 15,
            currency: "EUR",
          })
        ).toEqual({
          category: "cocktail",
          price: 15,
          currency: "EUR",
          source: "user",
        });
      }
    );

    it(
      "conserva un origen documented-menu explícito",
      () => {
        expect(
          createSelectedDrinkPrice({
            category: "coffee",
            price: 4,
            currency: "USD",
            source: "documented-menu",
          })
        ).toEqual({
          category: "coffee",
          price: 4,
          currency: "USD",
          source: "documented-menu",
        });
      }
    );

    it(
      "conserva un origen oficial explícito",
      () => {
        expect(
          createSelectedDrinkPrice({
            category: "water",
            price: 3,
            currency: "EUR",
            source: "official",
          })
        ).toEqual({
          category: "water",
          price: 3,
          currency: "EUR",
          source: "official",
        });
      }
    );
  }
);

describe(
  "selected drink price reference identity",
  () => {
    it(
      "conserva la referencia oficial seleccionada",
      () => {
        expect(
          createSelectedDrinkPrice({
            category: "water",
            price: 3,
            currency: "EUR",
            source: "official",
            referenceId:
              " msc-aqua-1l-main-restaurant ",
          })
        ).toEqual({
          category: "water",
          price: 3,
          currency: "EUR",
          source: "official",
          referenceId:
            "msc-aqua-1l-main-restaurant",
        });
      }
    );

    it(
      "conserva la referencia de menú documentado seleccionada",
      () => {
        expect(
          createSelectedDrinkPrice({
            category: "coffee",
            price: 2.5,
            currency: "USD",
            source: "documented-menu",
            referenceId:
              "msc-world-america-espresso-fleetwide-2025-07",
            contextRelevance:
              "compatible",
          })
        ).toEqual({
          category: "coffee",
          price: 2.5,
          currency: "USD",
          source: "documented-menu",
          referenceId:
            "msc-world-america-espresso-fleetwide-2025-07",
          contextRelevance:
            "compatible",
        });
      }
    );

    it(
      "no conserva una referencia en precios manuales",
      () => {
        expect(
          createSelectedDrinkPrice({
            category: "beer",
            price: 8,
            currency: "EUR",
            source: "user",
            referenceId:
              "stale-reference",
          })
        ).toEqual({
          category: "beer",
          price: 8,
          currency: "EUR",
          source: "user",
        });
      }
    );
  }
);
