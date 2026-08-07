import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getPackageOperationalRule,
} from "@/lib/packageRules";

import {
  evaluatePackageThresholdEconomicImpact,
} from "@/lib/packageThresholdEconomicImpact";

describe(
  "package threshold economic impact",
  () => {
    it(
      "utiliza el threshold MSC real de 14 EUR",
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

        expect(
          rule
        ).toBeDefined();

        if (!rule) {
          throw new Error(
            "MSC Premium Extra rule missing"
          );
        }

        const result =
          evaluatePackageThresholdEconomicImpact({
            operationalRule:
              rule,

            drinkPrice:
              15,

            drinkCurrency:
              "EUR",
          });

        expect(
          result.packageKey
        ).toBe(
          "mscPremiumExtra"
        );

        expect(
          result.thresholdRuleIds
        ).toContain(
          "msc-premium-extra-threshold-eur"
        );

        expect(
          result.impact.status
        ).toBe(
          "known-unquantified"
        );

        expect(
          result.impact.threshold
        ).toBe(14);

        expect(
          result.impact
            .thresholdCurrency
        ).toBe("EUR");

        expect(
          result.impact
            .additionalCostPerDrink
        ).toBeNull();
      }
    );

    it(
      "utiliza el threshold MSC real de 16 USD",
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

        if (!rule) {
          throw new Error(
            "MSC Premium Extra rule missing"
          );
        }

        const result =
          evaluatePackageThresholdEconomicImpact({
            operationalRule:
              rule,

            drinkPrice:
              17,

            drinkCurrency:
              "USD",
          });

        expect(
          result.thresholdRuleIds
        ).toContain(
          "msc-premium-extra-threshold-usd"
        );

        expect(
          result.impact.status
        ).toBe(
          "known-unquantified"
        );

        expect(
          result.impact.threshold
        ).toBe(16);

        expect(
          result.impact
            .thresholdCurrency
        ).toBe("USD");
      }
    );

    it(
      "mantiene unknown cuando Premium Extra no tiene moneda contextual",
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
                null,

              sailingDate:
                "2026-08-15",
            },
            "mscPremiumExtra"
          );

        if (!rule) {
          throw new Error(
            "MSC Premium Extra rule missing"
          );
        }

        const result =
          evaluatePackageThresholdEconomicImpact({
            operationalRule:
              rule,

            drinkPrice:
              15,

            drinkCurrency:
              "EUR",
          });

        expect(
          result.thresholdRuleIds
        ).toEqual([]);

        expect(
          result.impact.status
        ).toBe("unknown");

        expect(
          result.impact.threshold
        ).toBeNull();
      }
    );

    it(
      "no inventa impacto para un paquete sin threshold",
      () => {
        const rule =
          getPackageOperationalRule(
            "msc",
            "mscEasy"
          );

        if (!rule) {
          throw new Error(
            "MSC Easy rule missing"
          );
        }

        const result =
          evaluatePackageThresholdEconomicImpact({
            operationalRule:
              rule,

            drinkPrice:
              15,

            drinkCurrency:
              "EUR",
          });

        expect(
          result.impact.status
        ).toBe("unknown");

        expect(
          result.impact
            .exceedsThreshold
        ).toBeNull();
      }
    );

    it(
      "no compara el precio con un threshold de otra moneda",
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

        if (!rule) {
          throw new Error(
            "MSC Premium Extra rule missing"
          );
        }

        const result =
          evaluatePackageThresholdEconomicImpact({
            operationalRule:
              rule,

            drinkPrice:
              15,

            drinkCurrency:
              "USD",
          });

        expect(
          result.impact.status
        ).toBe("unknown");

        expect(
          result.impact
            .exceedsThreshold
        ).toBeNull();
      }
    );
  }
);
