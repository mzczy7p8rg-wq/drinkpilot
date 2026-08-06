import {
  describe,
  expect,
  it,
} from "vitest";

import {
  evaluateAlcoholDailyLimit,
} from "@/lib/alcoholDailyLimit";

describe(
  "alcohol daily limit",
  () => {
    it(
      "devuelve unknown si el consumo alcohólico es desconocido",
      () => {
        expect(
          evaluateAlcoholDailyLimit(
            null,
            15
          )
        ).toEqual({
          status: "unknown",
          alcoholicDrinksPerDay:
            null,
          alcoholicDrinksDailyLimit:
            15,
          excessDrinksPerDay:
            null,
        });
      }
    );

    it(
      "devuelve unknown si el paquete no tiene límite conocido",
      () => {
        expect(
          evaluateAlcoholDailyLimit(
            6,
            null
          )
        ).toEqual({
          status: "unknown",
          alcoholicDrinksPerDay:
            6,
          alcoholicDrinksDailyLimit:
            null,
          excessDrinksPerDay:
            null,
        });
      }
    );

    it(
      "detecta consumo por debajo del límite",
      () => {
        expect(
          evaluateAlcoholDailyLimit(
            6,
            15
          )
        ).toEqual({
          status:
            "within-limit",
          alcoholicDrinksPerDay:
            6,
          alcoholicDrinksDailyLimit:
            15,
          excessDrinksPerDay:
            0,
        });
      }
    );

    it(
      "detecta consumo exactamente en el límite",
      () => {
        expect(
          evaluateAlcoholDailyLimit(
            15,
            15
          )
        ).toEqual({
          status: "at-limit",
          alcoholicDrinksPerDay:
            15,
          alcoholicDrinksDailyLimit:
            15,
          excessDrinksPerDay:
            0,
        });
      }
    );

    it(
      "detecta consumo por encima del límite",
      () => {
        expect(
          evaluateAlcoholDailyLimit(
            18,
            15
          )
        ).toEqual({
          status:
            "over-limit",
          alcoholicDrinksPerDay:
            18,
          alcoholicDrinksDailyLimit:
            15,
          excessDrinksPerDay:
            3,
        });
      }
    );

    it(
      "no acepta un límite cero como regla válida",
      () => {
        expect(
          evaluateAlcoholDailyLimit(
            6,
            0
          ).status
        ).toBe("unknown");
      }
    );
  }
);
