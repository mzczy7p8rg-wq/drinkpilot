import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getMscDocumentedDrinkPriceById,
  getMscDocumentedDrinkPrices,
} from "@/lib/mscDocumentedDrinkPriceService";

describe(
  "MSC documented drink price service",
  () => {
    it(
      "devuelve todas las referencias sin filtros",
      () => {
        expect(
          getMscDocumentedDrinkPrices()
        ).toHaveLength(8);
      }
    );

    it(
      "filtra por categoría",
      () => {
        const beer =
          getMscDocumentedDrinkPrices({
            category: "beer",
          });

        expect(beer).toHaveLength(2);

        expect(
          beer.every(
            (item) =>
              item.category === "beer"
          )
        ).toBe(true);
      }
    );

    it(
      "filtra por barco mercado menú moneda y fecha",
      () => {
        const coffee =
          getMscDocumentedDrinkPrices({
            category: "coffee",
            ship: "MSC World America",
            market: "North America",
            menuName: "Fleetwide menu",
            currency: "USD",
            observedAt: "2025-07",
          });

        expect(coffee).toHaveLength(1);

        expect(coffee[0]).toMatchObject({
          productName: "Espresso",
          price: 2.5,
          menuName: "Fleetwide menu",
        });
      }
    );

    it(
      "separa Coffee Emporium del Fleetwide menu",
      () => {
        const coffeeEmporium =
          getMscDocumentedDrinkPrices({
            category: "coffee",
            ship: "MSC World America",
            menuName: "Coffee Emporium",
          });

        expect(
          coffeeEmporium
        ).toHaveLength(1);

        expect(
          coffeeEmporium[0]
        ).toMatchObject({
          productName: "Espresso",
          price: 4,
          menuName: "Coffee Emporium",
        });
      }
    );

    it(
      "conserva ambos Espresso sin filtro de menú",
      () => {
        const espresso =
          getMscDocumentedDrinkPrices({
            category: "coffee",
            ship: "MSC World America",
          }).filter(
            (item) =>
              item.productName ===
              "Espresso"
          );

        expect(
          espresso.map(
            ({ menuName, price }) => ({
              menuName,
              price,
            })
          )
        ).toEqual([
          {
            menuName: "Fleetwide menu",
            price: 2.5,
          },
          {
            menuName: "Coffee Emporium",
            price: 4,
          },
        ]);
      }
    );

    it(
      "conserva los dos formatos de Heineken",
      () => {
        const heineken =
          getMscDocumentedDrinkPrices({
            category: "beer",
            ship: "MSC World America",
            menuName: "Fleetwide menu",
          }).filter(
            (item) =>
              item.productName ===
              "Heineken Draft"
          );

        expect(
          heineken.map(
            ({ format, price }) => ({
              format,
              price,
            })
          )
        ).toEqual([
          {
            format: "14 oz",
            price: 9,
          },
          {
            format: "7 oz",
            price: 6,
          },
        ]);
      }
    );

    it(
      "resuelve una referencia por id",
      () => {
        expect(
          getMscDocumentedDrinkPriceById(
            "msc-world-america-valdo-prosecco-glass-2025-07"
          )
        ).toMatchObject({
          category: "wine",
          productName: "Valdo, Prosecco",
          format: "glass",
          price: 14,
        });
      }
    );

    it(
      "no inventa una referencia inexistente",
      () => {
        expect(
          getMscDocumentedDrinkPriceById(
            "missing-reference"
          )
        ).toBeNull();
      }
    );
  }
);

describe(
  "MSC documented drink price selection",
  () => {
    it(
      "convierte una referencia documentada en SelectedDrinkPrice sin elevarla a official",
      async () => {
        const {
          createSelectedDrinkPriceFromMscDocumentedReference,
        } = await import(
          "@/lib/mscDocumentedDrinkPriceService"
        );

        expect(
          createSelectedDrinkPriceFromMscDocumentedReference(
            "msc-world-america-espresso-coffee-emporium-2025-07"
          )
        ).toEqual({
          category:
            "coffee",

          price:
            4,

          currency:
            "USD",

          source:
            "documented-menu",
        });
      }
    );

    it(
      "resuelve precio referencia y evidencia conjuntamente",
      async () => {
        const {
          resolveMscDocumentedDrinkPriceSelection,
        } = await import(
          "@/lib/mscDocumentedDrinkPriceService"
        );

        const result =
          resolveMscDocumentedDrinkPriceSelection(
            "msc-world-america-espresso-coffee-emporium-2025-07"
          );

        expect(
          result?.selectedDrinkPrice
        ).toEqual({
          category:
            "coffee",

          price:
            4,

          currency:
            "USD",

          source:
            "documented-menu",
        });

        expect(
          result?.reference.menuName
        ).toBe(
          "Coffee Emporium"
        );

        expect(
          result?.evidence.evidence
        ).toBe(
          "documented-menu"
        );

        expect(
          result?.evidence.context.ship
        ).toBe(
          "MSC World America"
        );

        expect(
          result?.evidence.context.market
        ).toBe(
          "North America"
        );

        expect(
          result?.evidence.context.currency
        ).toBe(
          "USD"
        );

        expect(
          result?.evidence.context.verifiedAt
        ).toBe(
          "2025-07"
        );
      }
    );

    it(
      "no fabrica selección documentada para una referencia inexistente",
      async () => {
        const {
          createSelectedDrinkPriceFromMscDocumentedReference,
          resolveMscDocumentedDrinkPriceSelection,
        } = await import(
          "@/lib/mscDocumentedDrinkPriceService"
        );

        expect(
          createSelectedDrinkPriceFromMscDocumentedReference(
            "missing-reference"
          )
        ).toBeNull();

        expect(
          resolveMscDocumentedDrinkPriceSelection(
            "missing-reference"
          )
        ).toBeNull();
      }
    );
  }
);
