import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveAlcoholConsumption,
} from "@/lib/alcoholConsumption";

import {
  evaluateOperationalRuleImpacts,
} from "@/lib/operationalRuleImpact";

import {
  getPackageOperationalRules,
} from "@/lib/packageRules";

describe(
  "operational rule impact",
  () => {
    it(
      "evalúa el límite de alcohol para cada paquete MSC",
      () => {
        const consumption =
          resolveAlcoholConsumption({
            beer: 6,
            wine: 4,
            cocktail: 8,

            alcoholicCocktail: 8,
            nonAlcoholicCocktail: 0,
          });

        expect(
          consumption
            .alcoholicDrinksPerDay
        ).toBe(18);

        const rules =
          getPackageOperationalRules(
            "msc"
          );

        const impacts =
          evaluateOperationalRuleImpacts(
            consumption,
            rules
          );

        const easy =
          impacts.find(
            (impact) =>
              impact.packageKey ===
              "mscEasy"
          );

        expect(easy).toBeDefined();

        expect(
          easy?.alcoholDailyLimit
            .status
        ).toBe("over-limit");

        expect(
          easy?.alcoholDailyLimit
            .excessDrinksPerDay
        ).toBe(3);
      }
    );

    it(
      "mantiene unknown cuando la composición de cócteles es desconocida",
      () => {
        const consumption =
          resolveAlcoholConsumption({
            beer: 2,
            wine: 1,
            cocktail: 4,
          });

        expect(
          consumption
            .alcoholicDrinksPerDay
        ).toBeNull();

        const impacts =
          evaluateOperationalRuleImpacts(
            consumption,
            getPackageOperationalRules(
              "msc"
            )
          );

        expect(
          impacts.every(
            (impact) =>
              impact
                .alcoholDailyLimit
                .status ===
              "unknown"
          )
        ).toBe(true);
      }
    );

    it(
      "mantiene unknown en paquetes sin límite diario conocido",
      () => {
        const consumption =
          resolveAlcoholConsumption({
            beer: 2,
            wine: 1,
            cocktail: 4,

            alcoholicCocktail: 3,
            nonAlcoholicCocktail: 1,
          });

        const impacts =
          evaluateOperationalRuleImpacts(
            consumption,
            getPackageOperationalRules(
              "costa"
            )
          );

        expect(
          impacts.every(
            (impact) =>
              impact
                .alcoholDailyLimit
                .status ===
              "unknown"
          )
        ).toBe(true);
      }
    );
  }
);

describe(
  "operational economic impact integration",
  () => {
    it(
      "marca como known-unquantified un exceso MSC",
      () => {
        const consumption =
          resolveAlcoholConsumption({
            beer: 6,
            wine: 4,
            cocktail: 8,

            alcoholicCocktail: 8,
            nonAlcoholicCocktail: 0,
          });

        const impacts =
          evaluateOperationalRuleImpacts(
            consumption,
            getPackageOperationalRules(
              "msc"
            )
          );

        const easy =
          impacts.find(
            (impact) =>
              impact.packageKey ===
              "mscEasy"
          );

        expect(
          easy?.economicImpact.status
        ).toBe(
          "known-unquantified"
        );

        expect(
          easy
            ?.economicImpact
            .additionalCostPerDay
        ).toBeNull();
      }
    );

    it(
      "mantiene unknown cuando no puede evaluar el límite",
      () => {
        const consumption =
          resolveAlcoholConsumption({
            beer: 2,
            wine: 1,
            cocktail: 4,
          });

        const impacts =
          evaluateOperationalRuleImpacts(
            consumption,
            getPackageOperationalRules(
              "msc"
            )
          );

        const easy =
          impacts.find(
            (impact) =>
              impact.packageKey ===
              "mscEasy"
          );

        expect(
          easy?.economicImpact.status
        ).toBe("unknown");
      }
    );

    it(
      "transporta la política económica contextual de Premium Extra US",
      () => {
        const consumption =
          resolveAlcoholConsumption({
            beer: 6,
            wine: 4,
            cocktail: 8,
            alcoholicCocktail: 8,
            nonAlcoholicCocktail: 0,
          });

        const impact =
          evaluateOperationalRuleImpacts(
            consumption,
            getPackageOperationalRules({
              cruiseLine: "msc",
              market: "US",
              sailingRegion: null,
              onboardCurrency: "USD",
              sailingDate:
                "2025-04-01",
            })
          ).find(
            (item) =>
              item.packageKey ===
              "mscPremiumExtra"
          );

        expect(
          impact?.economicImpact
            .chargePolicy
        ).toBe(
          "full-price-plus-gratuities"
        );

        expect(
          impact
            ?.alcoholDailyLimitChargePolicySource
        ).toEqual({
          source: "contextual",
          contextualRuleIds: [
            "msc-premium-extra-alcohol-limit-full-price-us",
          ],
        });
      }
    );
  }
);

describe(
  "operational rule source traceability",
  () => {
    it(
      "conserva la procedencia base del límite MSC",
      () => {
        const consumption =
          resolveAlcoholConsumption({
            beer: 6,
            wine: 4,
            cocktail: 8,

            alcoholicCocktail: 8,
            nonAlcoholicCocktail: 0,
          });

        const impacts =
          evaluateOperationalRuleImpacts(
            consumption,
            getPackageOperationalRules(
              "msc"
            )
          );

        const easy =
          impacts.find(
            (impact) =>
              impact.packageKey ===
              "mscEasy"
          );

        expect(
          easy?.alcoholDailyLimitSource
        ).toEqual({
          source: "base",
          contextualRuleIds: [],
        });
      }
    );

    it(
      "conserva los IDs de una procedencia contextual",
      () => {
        const consumption =
          resolveAlcoholConsumption({
            beer: 6,
            wine: 4,
            cocktail: 8,

            alcoholicCocktail: 8,
            nonAlcoholicCocktail: 0,
          });

        const rules =
          getPackageOperationalRules(
            "msc"
          );

        const easyRule =
          rules.find(
            (rule) =>
              rule.packageKey ===
              "mscEasy"
          );

        if (!easyRule) {
          throw new Error(
            "MSC Easy rule not found"
          );
        }

        const impacts =
          evaluateOperationalRuleImpacts(
            consumption,
            [
              {
                ...easyRule,

                alcoholicDrinksDailyLimit:
                  12,

                alcoholicDrinksDailyLimitSource: {
                  source:
                    "contextual",

                  contextualRuleIds: [
                    "test-contextual-alcohol-limit",
                  ],
                },
              },
            ]
          );

        expect(
          impacts[0]
            .alcoholDailyLimitSource
        ).toEqual({
          source: "contextual",

          contextualRuleIds: [
            "test-contextual-alcohol-limit",
          ],
        });

        expect(
          impacts[0]
            .alcoholDailyLimit
            .alcoholicDrinksDailyLimit
        ).toBe(12);
      }
    );
  }
);
