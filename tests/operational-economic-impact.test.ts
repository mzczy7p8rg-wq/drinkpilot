import {
  describe,
  expect,
  it,
} from "vitest";

import {
  evaluateOperationalEconomicImpact,
} from "@/lib/operationalEconomicImpact";

describe(
  "operational economic impact",
  () => {
    it(
      "devuelve unknown cuando el impacto operativo es desconocido",
      () => {
        expect(
          evaluateOperationalEconomicImpact({
            status: "unknown",
            alcoholicDrinksPerDay: null,
            alcoholicDrinksDailyLimit: null,
            excessDrinksPerDay: null,
          })
        ).toEqual({
          status: "unknown",
          excessDrinksPerDay: null,
          chargePolicy: "unknown",
          additionalCostPerDay: null,
        });
      }
    );

    it(
      "no registra impacto económico dentro del límite",
      () => {
        expect(
          evaluateOperationalEconomicImpact({
            status: "within-limit",
            alcoholicDrinksPerDay: 10,
            alcoholicDrinksDailyLimit: 15,
            excessDrinksPerDay: 0,
          })
        ).toEqual({
          status: "none",
          excessDrinksPerDay: 0,
          chargePolicy: "unknown",
          additionalCostPerDay: 0,
        });
      }
    );

    it(
      "no registra impacto económico exactamente en el límite",
      () => {
        expect(
          evaluateOperationalEconomicImpact({
            status: "at-limit",
            alcoholicDrinksPerDay: 15,
            alcoholicDrinksDailyLimit: 15,
            excessDrinksPerDay: 0,
          })
        ).toEqual({
          status: "none",
          excessDrinksPerDay: 0,
          chargePolicy: "unknown",
          additionalCostPerDay: 0,
        });
      }
    );

    it(
      "marca el exceso conocido como económicamente no cuantificado",
      () => {
        expect(
          evaluateOperationalEconomicImpact({
            status: "over-limit",
            alcoholicDrinksPerDay: 18,
            alcoholicDrinksDailyLimit: 15,
            excessDrinksPerDay: 3,
          })
        ).toEqual({
          status:
            "known-unquantified",
          excessDrinksPerDay: 3,
          chargePolicy: "unknown",
          additionalCostPerDay: null,
        });
      }
    );

    it(
      "conserva la política de precio completo más propinas sin inventar un importe",
      () => {
        const result =
          evaluateOperationalEconomicImpact(
            {
              status: "over-limit",
              alcoholicDrinksPerDay: 18,
              alcoholicDrinksDailyLimit: 15,
              excessDrinksPerDay: 3,
            },
            "full-price-plus-gratuities"
          );

        expect(
          result.status
        ).toBe(
          "known-unquantified"
        );

        expect(
          result.chargePolicy
        ).toBe(
          "full-price-plus-gratuities"
        );

        expect(
          result.additionalCostPerDay
        ).toBeNull();
      }
    );
  }
);
