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
      "mantiene los precios documentados separados de evidencia oficial",
      () => {
        expect(
          mscDocumentedDrinkPrices
        ).toHaveLength(8);

        expect(
          mscDocumentedDrinkPrices.every(
            (item) =>
              item.evidence ===
              "documented-menu"
          )
        ).toBe(true);
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

describe(
  "MSC World America documented menu July 2025",
  () => {
    it(
      "registra tres categorías sin fabricar una media",
      () => {
        expect(
          mscDocumentedDrinkPrices
          .slice(0, 3)
          .map(
            ({
              category,
              productName,
              format,
              price,
              currency,
            }) => ({
              category,
              productName,
              format,
              price,
              currency,
            })
          )
        ).toEqual([
          {
            category:
              "cocktail",

            productName:
              "Passion Fruit Martini",

            format:
              null,

            price:
              14,

            currency:
              "USD",
          },

          {
            category:
              "beer",

            productName:
              "Heineken Draft",

            format:
              "14 oz",

            price:
              9,

            currency:
              "USD",
          },

          {
            category:
              "soda",

            productName:
              "Canned Soda",

            format:
              "can",

            price:
              3.5,

            currency:
              "USD",
          },
        ]);
      }
    );

    it(
      "conserva el contexto de MSC World America",
      () => {
        expect(
          mscDocumentedDrinkPrices.every(
            (item) =>
              item.ship ===
                "MSC World America" &&
              item.sailingRegion ===
                "North America" &&
              item.currency ===
                "USD" &&
              item.observedAt ===
                "2025-07"
          )
        ).toBe(true);
      }
    );

    it(
      "no eleva ninguna referencia a official",
      () => {
        expect(
          mscDocumentedDrinkPrices.some(
            (item) =>
              item.evidence ===
              "official"
          )
        ).toBe(false);
      }
    );
  }
);

describe(
  "MSC documented drink price traceability",
  () => {
    it(
      "mantiene sourceUrl como URL limpia",
      () => {
        expect(
          mscDocumentedDrinkPrices.every(
            (item) =>
              item.sourceUrl.startsWith(
                "https://"
              ) &&
              !item.sourceUrl.includes("[") &&
              !item.sourceUrl.includes("]")
          )
        ).toBe(true);
      }
    );
  }
);

describe(
  "MSC World America documented menu expansion",
  () => {
    it(
      "añade coffee water wine y un segundo formato de beer",
      () => {
        const ids =
          mscDocumentedDrinkPrices.map(
            (item) => item.id
          );

        expect(ids).toContain(
          "msc-world-america-espresso-fleetwide-2025-07"
        );

        expect(ids).toContain(
          "msc-world-america-water-16oz-fleetwide-2025-07"
        );

        expect(ids).toContain(
          "msc-world-america-valdo-prosecco-glass-2025-07"
        );

        expect(ids).toContain(
          "msc-world-america-heineken-draft-7oz-2025-07"
        );
      }
    );

    it(
      "conserva exactamente los cuatro nuevos precios documentados",
      () => {
        const additions =
          mscDocumentedDrinkPrices.slice(3, 7);

        expect(
          additions.map(
            ({
              category,
              productName,
              format,
              price,
            }) => ({
              category,
              productName,
              format,
              price,
            })
          )
        ).toEqual([
          {
            category: "coffee",
            productName: "Espresso",
            format: null,
            price: 2.5,
          },
          {
            category: "water",
            productName: "Still/Sparkling Water",
            format: "16 oz",
            price: 3.25,
          },
          {
            category: "wine",
            productName: "Valdo, Prosecco",
            format: "glass",
            price: 14,
          },
          {
            category: "beer",
            productName: "Heineken Draft",
            format: "7 oz",
            price: 6,
          },
        ]);
      }
    );

    it(
      "conserva el menú como parte del contexto documental",
      () => {
        expect(
          mscDocumentedDrinkPrices.every(
            (item) =>
              item.menuName ===
                "Fleetwide menu" ||
              item.menuName ===
                "Coffee Emporium"
          )
        ).toBe(true);
      }
    );

    it(
      "mantiene todas las referencias como documented-menu",
      () => {
        expect(
          mscDocumentedDrinkPrices.every(
            (item) =>
              item.evidence ===
              "documented-menu"
          )
        ).toBe(true);
      }
    );
  }
);
