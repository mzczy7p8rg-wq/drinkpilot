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
        ).toHaveLength(135);

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
          mscDocumentedDrinkPrices.slice(0, 8).every(
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

describe(
  "MSC documented drink price traceability",
  () => {
    it(
      "mantiene sourceUrl como URL limpia",
      () => {
        expect(
          mscDocumentedDrinkPrices.every(
            (item) =>
              item.sourceUrl === null
                ? item.sourceDocument ===
                  "00c6f9_e331c43a1e7d43198142e527483cd3d4.pdf"
                : item.sourceUrl.startsWith(
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
  "MSC Cocktails & more EUR March 2023",
  () => {
    it(
      "conserva el documento local, fecha, moneda y categorías compatibles",
      () => {
        const references =
          mscDocumentedDrinkPrices.filter(
            (item) =>
              item.sourceDocument ===
              "00c6f9_e331c43a1e7d43198142e527483cd3d4.pdf"
          );

        expect(references).toHaveLength(127);
        expect(
          references.every(
            (item) =>
              item.currency === "EUR" &&
              item.observedAt === "2023-03" &&
              item.sourceUrl === null
          )
        ).toBe(true);

        expect(
          references.filter(
            (item) => item.category === "juice"
          )
        ).toHaveLength(2);
      }
    );

    it(
      "distingue Fever-Tree y Red Bull de los refrescos básicos en Easy histórico",
      () => {
        const byName = (name: string) =>
          mscDocumentedDrinkPrices.find(
            (item) =>
              item.sourceDocument ===
                "00c6f9_e331c43a1e7d43198142e527483cd3d4.pdf" &&
              item.productName === name
          );

        expect(
          byName("Refresco en lata")
            ?.packageCoverage?.mscEasy
        ).toBe("included");
        expect(
          byName("Fever-Tree Tonic")
            ?.packageCoverage?.mscEasy
        ).toBe("notIncluded");
        expect(
          byName("Red Bull")
            ?.packageCoverage?.mscEasy
        ).toBe("notIncluded");
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
                "Coffee Emporium" ||
              item.menuName ===
                "MSC Cocktails & more"
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
