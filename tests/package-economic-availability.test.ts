import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveEconomicComparisonAvailability,
  resolvePackageEconomicAvailability,
} from "@/lib/packageEconomicAvailability";

describe(
  "package economic availability",
  () => {
    it(
      "explica cuándo basta una referencia o un precio del usuario",
      () => {
        expect(
          resolvePackageEconomicAvailability(
            "reference-or-user"
          )
        ).toEqual({
          status: "available",
          explanation:
            "Habilitado para la comparación. Si introduces el precio real de tu reserva, DrinkPilot lo utiliza con prioridad.",
        });
      }
    );

    it(
      "explica cuándo el paquete necesita un precio real",
      () => {
        expect(
          resolvePackageEconomicAvailability(
            "user-price-only"
          )
        ).toEqual({
          status:
            "user-price-required",
          explanation:
            "El paquete está identificado, pero necesita un precio real introducido por el usuario para participar en la comparación económica.",
        });
      }
    );

    it(
      "no presenta un paquete deshabilitado como disponible",
      () => {
        expect(
          resolvePackageEconomicAvailability(
            "disabled"
          )
        ).toEqual({
          status: "disabled",
          explanation:
            "No participa actualmente en la comparación económica de adultos.",
        });
      }
    );

    it(
      "mantiene deshabilitado un valor desconocido",
      () => {
        expect(
          resolvePackageEconomicAvailability(
            "unexpected"
          )
        ).toEqual({
          status: "disabled",
          explanation:
            "No participa actualmente en la comparación económica de adultos.",
        });
      }
    );
  }
);

describe(
  "economic comparison availability",
  () => {
    it(
      "prioriza los precios de bebidas que todavía faltan",
      () => {
        expect(
          resolveEconomicComparisonAvailability({
            economicDrinkPricesAvailable:
              false,
            comparedPackageCount:
              0,
          })
        ).toBe(
          "drink-prices-required"
        );
      }
    );

    it(
      "no presenta una comparación vacía como completada",
      () => {
        expect(
          resolveEconomicComparisonAvailability({
            economicDrinkPricesAvailable:
              true,
            comparedPackageCount:
              0,
          })
        ).toBe(
          "package-price-required"
        );
      }
    );

    it(
      "confirma la comparación cuando ambas fuentes están disponibles",
      () => {
        expect(
          resolveEconomicComparisonAvailability({
            economicDrinkPricesAvailable:
              true,
            comparedPackageCount:
              1,
          })
        ).toBe("available");
      }
    );
  }
);
