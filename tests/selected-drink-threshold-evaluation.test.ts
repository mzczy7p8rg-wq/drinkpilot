import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getPackageOperationalRule,
} from "@/lib/packageRules";

import {
  createSelectedDrinkPrice,
} from "@/lib/selectedDrinkPrice";

import {
  evaluateSelectedDrinkAgainstPackageThreshold,
} from "@/lib/selectedDrinkThresholdEvaluation";

describe(
  "selected drink threshold evaluation",
  () => {
    it(
      "detecta una bebida concreta por encima del threshold EUR de Premium Extra",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine:
                "msc",

              market:
                "ES",

              sailingRegion:
                null,

              onboardCurrency:
                "EUR",

              sailingDate:
                "2026-08-15",
            },
            "mscPremiumExtra"
          );

        const drink =
          createSelectedDrinkPrice({
            category:
              "cocktail",

            price:
              15,

            currency:
              "EUR",
          });

        if (
          !rule ||
          !drink
        ) {
          throw new Error(
            "Test setup failed"
          );
        }

        const result =
          evaluateSelectedDrinkAgainstPackageThreshold(
            rule,
            drink
          );

        expect(
          result.drink
        ).toEqual({
          category:
            "cocktail",

          price:
            15,

          currency:
            "EUR",

          source:
            "user",
        });

        expect(
          result.packageImpact
            .impact.status
        ).toBe(
          "quantified"
        );

        expect(
          result.packageImpact
            .impact.threshold
        ).toBe(14);

        expect(
          result.packageImpact
            .impact.exceedsThreshold
        ).toBe(true);

        expect(
          result.packageImpact
            .impact.additionalCostPerDrink
        ).toBe(1);
      }
    );

    it(
      "no registra impacto para una bebida dentro del threshold",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine:
                "msc",

              market:
                "ES",

              sailingRegion:
                null,

              onboardCurrency:
                "EUR",

              sailingDate:
                "2026-08-15",
            },
            "mscPremiumExtra"
          );

        const drink =
          createSelectedDrinkPrice({
            category:
              "wine",

            price:
              12,

            currency:
              "EUR",
          });

        if (
          !rule ||
          !drink
        ) {
          throw new Error(
            "Test setup failed"
          );
        }

        const result =
          evaluateSelectedDrinkAgainstPackageThreshold(
            rule,
            drink
          );

        expect(
          result.packageImpact
            .impact.status
        ).toBe("none");

        expect(
          result.packageImpact
            .impact.exceedsThreshold
        ).toBe(false);

        expect(
          result.packageImpact
            .impact.additionalCostPerDrink
        ).toBe(0);
      }
    );

    it(
      "mantiene unknown si las monedas no coinciden",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine:
                "msc",

              market:
                "ES",

              sailingRegion:
                null,

              onboardCurrency:
                "EUR",

              sailingDate:
                "2026-08-15",
            },
            "mscPremiumExtra"
          );

        const drink =
          createSelectedDrinkPrice({
            category:
              "cocktail",

            price:
              15,

            currency:
              "USD",
          });

        if (
          !rule ||
          !drink
        ) {
          throw new Error(
            "Test setup failed"
          );
        }

        const result =
          evaluateSelectedDrinkAgainstPackageThreshold(
            rule,
            drink
          );

        expect(
          result.packageImpact
            .impact.status
        ).toBe("unknown");

        expect(
          result.packageImpact
            .impact.exceedsThreshold
        ).toBeNull();
      }
    );

    it(
      "utiliza también el threshold USD resuelto contextualmente",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine:
                "msc",

              market:
                "US",

              sailingRegion:
                null,

              onboardCurrency:
                "USD",

              sailingDate:
                "2026-08-15",
            },
            "mscPremiumExtra"
          );

        const drink =
          createSelectedDrinkPrice({
            category:
              "cocktail",

            price:
              17,

            currency:
              "USD",
          });

        if (
          !rule ||
          !drink
        ) {
          throw new Error(
            "Test setup failed"
          );
        }

        const result =
          evaluateSelectedDrinkAgainstPackageThreshold(
            rule,
            drink
          );

        expect(
          result.packageImpact
            .impact.threshold
        ).toBe(16);

        expect(
          result.packageImpact
            .impact.thresholdCurrency
        ).toBe("USD");

        expect(
          result.packageImpact
            .impact.status
        ).toBe(
          "quantified"
        );
      }
    );
  }
);

describe(
  "selected drink threshold coverage",
  () => {
    it(
      "marca como excluida una bebida por encima del threshold cuando la cobertura lo indica",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine:
                "msc",

              market:
                "ES",

              sailingRegion:
                null,

              onboardCurrency:
                "EUR",

              sailingDate:
                "2026-08-15",
            },
            "mscPremiumExtra"
          );

        const drink =
          createSelectedDrinkPrice({
            category:
              "cocktail",

            price:
              15,

            currency:
              "EUR",
          });

        if (
          !rule ||
          !drink
        ) {
          throw new Error(
            "Test setup failed"
          );
        }

        const result =
          evaluateSelectedDrinkAgainstPackageThreshold(
            rule,
            drink
          );

        expect(
          result.coverageStatus
        ).toBe("excluded");

        expect(
          result.packageImpact
            .impact
            .exceedsThreshold
        ).toBe(true);

        expect(
          result.packageImpact
            .impact
            .additionalCostPerDrink
        ).toBe(1);
      }
    );

    it(
      "marca como cubierta una bebida dentro del threshold",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine:
                "msc",

              market:
                "ES",

              sailingRegion:
                null,

              onboardCurrency:
                "EUR",

              sailingDate:
                "2026-08-15",
            },
            "mscPremiumExtra"
          );

        const drink =
          createSelectedDrinkPrice({
            category:
              "wine",

            price:
              12,

            currency:
              "EUR",
          });

        if (
          !rule ||
          !drink
        ) {
          throw new Error(
            "Test setup failed"
          );
        }

        const result =
          evaluateSelectedDrinkAgainstPackageThreshold(
            rule,
            drink
          );

        expect(
          result.coverageStatus
        ).toBe("covered");

        expect(
          result.packageImpact
            .impact
            .exceedsThreshold
        ).toBe(false);
      }
    );

    it(
      "mantiene cobertura desconocida cuando no puede comparar el threshold",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine:
                "msc",

              market:
                "ES",

              sailingRegion:
                null,

              onboardCurrency:
                "EUR",

              sailingDate:
                "2026-08-15",
            },
            "mscPremiumExtra"
          );

        const drink =
          createSelectedDrinkPrice({
            category:
              "cocktail",

            price:
              15,

            currency:
              "USD",
          });

        if (
          !rule ||
          !drink
        ) {
          throw new Error(
            "Test setup failed"
          );
        }

        const result =
          evaluateSelectedDrinkAgainstPackageThreshold(
            rule,
            drink
          );

        expect(
          result.coverageStatus
        ).toBe("unknown");

        expect(
          result.packageImpact
            .impact
            .exceedsThreshold
        ).toBeNull();
      }
    );
  }
);
