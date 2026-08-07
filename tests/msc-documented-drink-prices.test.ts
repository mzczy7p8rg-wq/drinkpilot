import {
  describe,
  expect,
  it,
} from "vitest";

import {
  mscDocumentedDrinkPrices,
  type MscDocumentedDrinkPrice,
} from "@/data/msc/documentedDrinkPrices";

describe(
  "MSC documented drink prices",
  () => {
    it(
      "empieza sin convertir fuentes secundarias en datos productivos",
      () => {
        expect(
          mscDocumentedDrinkPrices
        ).toEqual([]);
      }
    );

    it(
      "permite representar un precio observado en un menú",
      () => {
        const reference:
          MscDocumentedDrinkPrice = {
          id:
            "msc-documented-example",

          category:
            "cocktail",

          productName:
            "Example cocktail",

          format:
            null,

          price:
            9,

          currency:
            "EUR",

          evidence:
            "documented-menu",

          sourceUrl:
            "https://example.com",

          observedAt:
            null,

          ship:
            null,

          market:
            null,

          itinerary:
            null,
        };

        expect(
          reference.evidence
        ).toBe(
          "documented-menu"
        );

        expect(
          reference.price
        ).toBe(9);
      }
    );

    it(
      "no exige inventar barco mercado o itinerario",
      () => {
        const reference:
          MscDocumentedDrinkPrice = {
          id:
            "msc-context-unknown",

          category:
            "coffee",

          productName:
            "Example coffee",

          format:
            null,

          price:
            4,

          currency:
            "EUR",

          evidence:
            "documented-menu",

          sourceUrl:
            "https://example.com",
        };

        expect(
          reference.ship
        ).toBeUndefined();

        expect(
          reference.market
        ).toBeUndefined();

        expect(
          reference.itinerary
        ).toBeUndefined();
      }
    );
  }
);
