import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveDrinkPriceDataConfidence,
  resolvePackageDataConfidence,
} from "@/lib/dataConfidenceResolution";

describe(
  "package data confidence resolution",
  () => {
    it(
      "muestra el precio del usuario que participa en la comparación",
      () => {
        expect(
          resolvePackageDataConfidence({
            economicActivation:
              "user-price-only",
            customPrice: 25,
            referencePrice: null,
            packageCurrency: "EUR",
            economicCurrency: "EUR",
            economicDataAvailable:
              true,
            comparedPackage: {
              packagePricePerDay: 25,
              priceSource: "user",
              currency: "EUR",
            },
          })
        ).toEqual({
          pricePerDay: 25,
          currency: "EUR",
          priceSource: "user",
          economicStatus:
            "available",
          economicExplanation:
            "Participa en la comparación con el precio introducido por ti.",
        });
      }
    );

    it(
      "no vuelve a pedir un precio de paquete ya introducido cuando faltan bebidas",
      () => {
        const result =
          resolvePackageDataConfidence({
            economicActivation:
              "user-price-only",
            customPrice: 32,
            referencePrice: null,
            packageCurrency: "EUR",
            economicCurrency: "EUR",
            economicDataAvailable:
              false,
          });

        expect(result.priceSource).toBe(
          "user"
        );
        expect(
          result.economicStatus
        ).toBe(
          "waiting-drink-prices"
        );
        expect(
          result.economicExplanation
        ).toContain(
          "espera una cesta completa"
        );
      }
    );

    it(
      "explica una diferencia de moneda sin presentar el precio como ausente",
      () => {
        const result =
          resolvePackageDataConfidence({
            economicActivation:
              "user-price-only",
            customPrice: 55,
            referencePrice: null,
            packageCurrency: "EUR",
            economicCurrency: "USD",
            economicDataAvailable:
              true,
          });

        expect(result.pricePerDay).toBe(
          55
        );
        expect(
          result.economicStatus
        ).toBe(
          "currency-mismatch"
        );
      }
    );
  }
);

describe(
  "drink price data confidence resolution",
  () => {
    it(
      "expone exactamente la cesta económica y sus fuentes",
      () => {
        const result =
          resolveDrinkPriceDataConfidence({
            economicDrinkPrices: {
              coffee: 3,
              water: 2.5,
              soda: 4,
              beer: 7,
              wine: 9,
              cocktail: 12,
            },
            economicCurrency: "EUR",
            selectedDrinkPrices: {
              coffee: {
                price: 3,
                currency: "EUR",
                source: "user",
              },
              cocktail: {
                price: 12,
                currency: "EUR",
                source: "official",
              },
            },
          });

        expect(
          result.find(
            (row) =>
              row.category === "coffee"
          )
        ).toMatchObject({
          price: 3,
          source: "user",
        });

        expect(
          result.find(
            (row) =>
              row.category === "water"
          )
        ).toMatchObject({
          price: 2.5,
          source: "reference",
        });

        expect(
          result.find(
            (row) =>
              row.category ===
              "cocktail"
          )
        ).toMatchObject({
          price: 12,
          source: "official",
        });
      }
    );

    it(
      "mantiene como pendiente un menú documentado solo compatible",
      () => {
        const result =
          resolveDrinkPriceDataConfidence({
            economicDrinkPrices: {
              coffee: null,
              water: null,
              soda: null,
              beer: null,
              wine: null,
              cocktail: null,
            },
            economicCurrency: "USD",
            selectedDrinkPrices: {
              beer: {
                price: 9,
                currency: "USD",
                source:
                  "documented-menu",
                contextRelevance:
                  "compatible",
              },
            },
          });

        expect(
          result.find(
            (row) =>
              row.category === "beer"
          )
        ).toMatchObject({
          price: null,
          source: "pending",
        });
      }
    );
  }
);
