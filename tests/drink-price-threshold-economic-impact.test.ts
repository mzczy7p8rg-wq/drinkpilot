import {
  describe,
  expect,
  it,
} from "vitest";

import {
  evaluateDrinkPriceThresholdEconomicImpact,
} from "@/lib/drinkPriceThresholdEconomicImpact";

describe(
  "drink price threshold economic impact",
  () => {
    it(
      "no registra impacto por debajo del threshold",
      () => {
        expect(
          evaluateDrinkPriceThresholdEconomicImpact({
            drinkPrice: 13,
            drinkCurrency: "EUR",
            threshold: 14,
            thresholdCurrency: "EUR",
          })
        ).toEqual({
          status: "none",
          drinkPrice: 13,
          drinkCurrency: "EUR",
          threshold: 14,
          thresholdCurrency: "EUR",
          exceedsThreshold: false,
          additionalCostPerDrink: 0,
        });
      }
    );

    it(
      "no registra impacto exactamente en el threshold",
      () => {
        expect(
          evaluateDrinkPriceThresholdEconomicImpact({
            drinkPrice: 14,
            drinkCurrency: "EUR",
            threshold: 14,
            thresholdCurrency: "EUR",
          })
        ).toEqual({
          status: "none",
          drinkPrice: 14,
          drinkCurrency: "EUR",
          threshold: 14,
          thresholdCurrency: "EUR",
          exceedsThreshold: false,
          additionalCostPerDrink: 0,
        });
      }
    );

    it(
      "detecta un precio superior sin inventar el coste adicional",
      () => {
        expect(
          evaluateDrinkPriceThresholdEconomicImpact({
            drinkPrice: 15,
            drinkCurrency: "EUR",
            threshold: 14,
            thresholdCurrency: "EUR",
          })
        ).toEqual({
          status:
            "known-unquantified",
          drinkPrice: 15,
          drinkCurrency: "EUR",
          threshold: 14,
          thresholdCurrency: "EUR",
          exceedsThreshold: true,
          additionalCostPerDrink: null,
        });
      }
    );

    it(
      "mantiene correctamente un threshold USD",
      () => {
        expect(
          evaluateDrinkPriceThresholdEconomicImpact({
            drinkPrice: 17,
            drinkCurrency: "USD",
            threshold: 16,
            thresholdCurrency: "USD",
          })
        ).toEqual({
          status:
            "known-unquantified",
          drinkPrice: 17,
          drinkCurrency: "USD",
          threshold: 16,
          thresholdCurrency: "USD",
          exceedsThreshold: true,
          additionalCostPerDrink: null,
        });
      }
    );

    it(
      "no compara cantidades expresadas en monedas distintas",
      () => {
        const result =
          evaluateDrinkPriceThresholdEconomicImpact({
            drinkPrice: 15,
            drinkCurrency: "USD",
            threshold: 14,
            thresholdCurrency: "EUR",
          });

        expect(
          result.status
        ).toBe("unknown");

        expect(
          result.exceedsThreshold
        ).toBeNull();

        expect(
          result.additionalCostPerDrink
        ).toBeNull();
      }
    );

    it(
      "devuelve unknown cuando falta el precio de la bebida",
      () => {
        const result =
          evaluateDrinkPriceThresholdEconomicImpact({
            drinkPrice: null,
            drinkCurrency: "EUR",
            threshold: 14,
            thresholdCurrency: "EUR",
          });

        expect(
          result.status
        ).toBe("unknown");

        expect(
          result.exceedsThreshold
        ).toBeNull();
      }
    );

    it(
      "devuelve unknown cuando falta el threshold",
      () => {
        const result =
          evaluateDrinkPriceThresholdEconomicImpact({
            drinkPrice: 15,
            drinkCurrency: "EUR",
            threshold: null,
            thresholdCurrency: null,
          });

        expect(
          result.status
        ).toBe("unknown");

        expect(
          result.exceedsThreshold
        ).toBeNull();
      }
    );

    it(
      "devuelve unknown cuando falta la moneda de la bebida",
      () => {
        const result =
          evaluateDrinkPriceThresholdEconomicImpact({
            drinkPrice: 15,
            drinkCurrency: null,
            threshold: 14,
            thresholdCurrency: "EUR",
          });

        expect(
          result.status
        ).toBe("unknown");
      }
    );

    it(
      "normaliza monedas sin alterar su significado",
      () => {
        const result =
          evaluateDrinkPriceThresholdEconomicImpact({
            drinkPrice: 15,
            drinkCurrency: " eur ",
            threshold: 14,
            thresholdCurrency: "EUR",
          });

        expect(
          result.status
        ).toBe(
          "known-unquantified"
        );

        expect(
          result.drinkCurrency
        ).toBe("EUR");

        expect(
          result.thresholdCurrency
        ).toBe("EUR");
      }
    );

    it(
      "rechaza precios no positivos o no finitos",
      () => {
        expect(
          evaluateDrinkPriceThresholdEconomicImpact({
            drinkPrice: 0,
            drinkCurrency: "EUR",
            threshold: 14,
            thresholdCurrency: "EUR",
          }).status
        ).toBe("unknown");

        expect(
          evaluateDrinkPriceThresholdEconomicImpact({
            drinkPrice:
              Number.POSITIVE_INFINITY,
            drinkCurrency: "EUR",
            threshold: 14,
            thresholdCurrency: "EUR",
          }).status
        ).toBe("unknown");
      }
    );
  }
);

describe(
  "threshold charge policy quantification",
  () => {
    it(
      "mantiene el impacto sin cuantificar cuando la política es unknown",
      () => {
        const result =
          evaluateDrinkPriceThresholdEconomicImpact(
            {
              drinkPrice: 18,
              drinkCurrency: "EUR",
              threshold: 14,
              thresholdCurrency: "EUR",
              chargePolicy: "unknown",
            }
          );

        expect(result.status).toBe(
          "known-unquantified"
        );

        expect(
          result.exceedsThreshold
        ).toBe(true);

        expect(
          result.additionalCostPerDrink
        ).toBeNull();
      }
    );

    it(
      "cuantifica únicamente la diferencia cuando la política es difference",
      () => {
        const result =
          evaluateDrinkPriceThresholdEconomicImpact(
            {
              drinkPrice: 18,
              drinkCurrency: "EUR",
              threshold: 14,
              thresholdCurrency: "EUR",
              chargePolicy: "difference",
            }
          );

        expect(result.status).toBe(
          "quantified"
        );

        expect(
          result.exceedsThreshold
        ).toBe(true);

        expect(
          result.additionalCostPerDrink
        ).toBe(4);
      }
    );

    it(
      "cuantifica el precio completo cuando la política es full-price",
      () => {
        const result =
          evaluateDrinkPriceThresholdEconomicImpact(
            {
              drinkPrice: 18,
              drinkCurrency: "EUR",
              threshold: 14,
              thresholdCurrency: "EUR",
              chargePolicy: "full-price",
            }
          );

        expect(result.status).toBe(
          "quantified"
        );

        expect(
          result.exceedsThreshold
        ).toBe(true);

        expect(
          result.additionalCostPerDrink
        ).toBe(18);
      }
    );
  }
);
