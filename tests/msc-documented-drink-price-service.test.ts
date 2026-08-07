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
        ).toHaveLength(7);
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
      "no mezcla un menú diferente",
      () => {
        expect(
          getMscDocumentedDrinkPrices({
            category: "coffee",
            ship: "MSC World America",
            menuName: "Coffee Emporium",
          })
        ).toEqual([]);
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
