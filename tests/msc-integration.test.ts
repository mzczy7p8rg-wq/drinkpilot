import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getCruiseLine,
} from "@/data/cruiseLines";

import {
  compareDrinkPackages,
} from "@/lib/comparison";

describe(
  "MSC multi-cruise-line integration",
  () => {
    it(
      "MSC está registrada como naviera",
      () => {
        const msc =
          getCruiseLine("msc");

        expect(msc.id).toBe(
          "msc"
        );

        expect(msc.name).toBe(
          "MSC Cruises"
        );
      }
    );

    it(
      "no fabrica una comparación económica cuando faltan precios individuales",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine: "msc",

            days: 7,
            people: 1,

            coffee: 2,
            water: 2,
            soda: 2,
            beer: 1,
            wine: 1,
            cocktail: 1,
          });

        expect(
          result.economicDataAvailable
        ).toBe(false);

        expect(
          result.bestPackage
        ).toBeNull();

        expect(
          result.anyPackageWorthIt
        ).toBe(false);

        expect(
          result.packages
        ).toEqual([]);

        expect(
          result.missingOnboardPriceKeys
            .length
        ).toBeGreaterThan(0);
      }
    );

    it(
      "mantiene disponible el análisis de cobertura aunque falten precios",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine: "msc",

            days: 7,
            people: 1,

            coffee: 2,
            water: 2,
            soda: 2,
            beer: 1,
            wine: 1,
            cocktail: 1,
          });

        expect(
          result.coveragePackages
            .length
        ).toBeGreaterThan(0);

        for (
          const pkg of
          result.coveragePackages
        ) {
          expect(
            typeof pkg.coverageScore
          ).toBe("number");

          expect(
            Array.isArray(
              pkg.coveredCategories
            )
          ).toBe(true);

          expect(
            Array.isArray(
              pkg.uncoveredCategories
            )
          ).toBe(true);
        }
      }
    );
    it(
      "mantiene Minors Package deshabilitado para el análisis económico adulto",
      () => {
        const msc =
          getCruiseLine("msc");

        const minors =
          msc.packages.mscMinors;

        expect(
          minors.economicActivation
        ).toBe("disabled");

        expect(
          minors.economicEligibility
        ).toBe("blocked");

        expect(
          minors.includesAlcohol
        ).toBe(false);
      }
    );

    it(
      "mantiene los paquetes adultos MSC activables únicamente con precio real del usuario",
      () => {
        const msc =
          getCruiseLine("msc");

        expect(
          msc.packages.mscEasy
            .economicActivation
        ).toBe("user-price-only");

        expect(
          msc.packages.mscPremiumExtra
            .economicActivation
        ).toBe("user-price-only");

        expect(
          msc.packages.mscAlcoholFree
            .economicActivation
        ).toBe("user-price-only");
      }
    );
    it(
      "transporta el contexto real hasta las reglas operativas MSC",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine: "msc",

            market: "ES",

            sailingDate:
              "2026-08-15",

            days: 7,
            people: 1,

            coffee: 2,
            water: 2,
            soda: 2,
            beer: 1,
            wine: 1,
            cocktail: 1,
          });

        const easyRule =
          result.operationalRules.find(
            (rule) =>
              rule.packageKey ===
              "mscEasy"
          );

        expect(
          easyRule?.context
        ).toEqual({
          cruiseLine: "msc",
          market: "ES",
          sailingRegion: null,
          onboardCurrency: null,
          sailingDate:
            "2026-08-15",
        });

        expect(
          easyRule
            ?.alcoholicDrinksDailyLimit
        ).toBe(15);

        expect(
          easyRule
            ?.appliedContextualRuleIds
        ).toEqual([]);
      }
    );

    it(
      "aplica el umbral real de Premium Extra para moneda EUR",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine: "msc",

            market: "ES",

            onboardCurrency: "EUR",

            sailingDate:
              "2026-08-15",

            days: 7,
            people: 1,

            coffee: 2,
            water: 2,
            soda: 2,
            beer: 1,
            wine: 1,
            cocktail: 1,
          });

        const premiumRule =
          result.operationalRules.find(
            (rule) =>
              rule.packageKey ===
              "mscPremiumExtra"
          );

        expect(
          premiumRule
            ?.drinkPriceThreshold
        ).toBe(14);

        expect(
          premiumRule
            ?.drinkPriceThresholdCurrency
        ).toBe("EUR");

        expect(
          premiumRule
            ?.drinkPriceThresholdSource
            .source
        ).toBe("contextual");

        expect(
          premiumRule
            ?.appliedContextualRuleIds
        ).toContain(
          "msc-premium-extra-threshold-eur"
        );
      }
    );

    it(
      "aplica el umbral real de Premium Extra para moneda USD",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine: "msc",

            market: "US",

            onboardCurrency: "USD",

            sailingDate:
              "2026-08-15",

            days: 7,
            people: 1,

            coffee: 2,
            water: 2,
            soda: 2,
            beer: 1,
            wine: 1,
            cocktail: 1,
          });

        const premiumRule =
          result.operationalRules.find(
            (rule) =>
              rule.packageKey ===
              "mscPremiumExtra"
          );

        expect(
          premiumRule
            ?.drinkPriceThreshold
        ).toBe(16);

        expect(
          premiumRule
            ?.drinkPriceThresholdCurrency
        ).toBe("USD");

        expect(
          premiumRule
            ?.drinkPriceThresholdSource
            .source
        ).toBe("contextual");

        expect(
          premiumRule
            ?.appliedContextualRuleIds
        ).toContain(
          "msc-premium-extra-threshold-usd"
        );
      }
    );

    it(
      "no aplica un umbral de Premium Extra cuando la moneda a bordo es desconocida",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine: "msc",

            market: "ES",

            onboardCurrency: null,

            sailingDate:
              "2026-08-15",

            days: 7,
            people: 1,

            coffee: 2,
            water: 2,
            soda: 2,
            beer: 1,
            wine: 1,
            cocktail: 1,
          });

        const premiumRule =
          result.operationalRules.find(
            (rule) =>
              rule.packageKey ===
              "mscPremiumExtra"
          );

        expect(
          premiumRule
            ?.drinkPriceThreshold
        ).toBeNull();

        expect(
          premiumRule
            ?.drinkPriceThresholdCurrency
        ).toBeNull();

        expect(
          premiumRule
            ?.drinkPriceThresholdSource
            .source
        ).toBe("none");
      }
    );

    it(
      "no inventa contexto cuando market y sailingDate son desconocidos",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine: "msc",

            days: 7,
            people: 1,

            coffee: 2,
            water: 2,
            soda: 2,
            beer: 1,
            wine: 1,
            cocktail: 1,
          });

        const easyRule =
          result.operationalRules.find(
            (rule) =>
              rule.packageKey ===
              "mscEasy"
          );

        expect(
          easyRule?.context
        ).toEqual({
          cruiseLine: "msc",
          market: null,
          sailingRegion: null,
          onboardCurrency: null,
          sailingDate: null,
        });
      }
    );
  }
);

describe(
  "MSC threshold cruise impact integration",
  () => {
    it(
      "detecta 28 consumiciones sobre el threshold EUR aunque la economía general siga incompleta",
      () => {
        const result =
          compareDrinkPackages({
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

            days:
              7,

            people:
              2,

            coffee:
              0,

            water:
              0,

            soda:
              0,

            beer:
              0,

            wine:
              0,

            cocktail:
              2,

            selectedDrinkPrices: {
              cocktail: {
                price:
                  15,

                currency:
                  "EUR",
              },
            },
          });

        /*
         * MSC continúa sin una cesta
         * completa de precios individuales.
         *
         * El threshold no debe desbloquear
         * artificialmente la economía general.
         */
        expect(
          result.economicDataAvailable
        ).toBe(false);

        expect(
          result.packages
        ).toEqual([]);

        const premiumImpact =
          result
            .thresholdCruiseImpacts
            .find(
              (impact) =>
                impact.packageKey ===
                "mscPremiumExtra"
            );

        expect(
          premiumImpact
        ).toBeDefined();

        expect(
          premiumImpact
            ?.dailyImpact
            .status
        ).toBe(
          "quantified"
        );

        expect(
          premiumImpact
            ?.dailyImpact
            .drinksAboveThresholdPerDay
        ).toBe(2);

        /*
         * 2 bebidas/día
         * × 7 días
         * × 2 personas
         * = 28 consumiciones afectadas.
         */
        expect(
          premiumImpact
            ?.cruiseImpact
            .drinksAboveThreshold
        ).toBe(28);

        expect(
          premiumImpact
            ?.cruiseImpact
            .totalDrinks
        ).toBe(28);

        expect(
          premiumImpact
            ?.cruiseImpact
            .status
        ).toBe(
          "quantified"
        );

        /*
         * La política contextual "difference"
         * permite cuantificar 1 EUR adicional
         * por cada cóctel de 15 EUR.
         */
        expect(
          premiumImpact
            ?.cruiseImpact
            .additionalCostTotal
        ).toBe(28);

        /*
         * Confirmamos además que la cadena
         * utilizó realmente el threshold
         * contextual MSC de 14 EUR.
         */
        const cocktailItem =
          premiumImpact
            ?.dailyImpact
            .items
            .find(
              (item) =>
                item
                  .consumption
                  .drink
                  .category ===
                "cocktail"
            );

        expect(
          cocktailItem
            ?.evaluation
            .packageImpact
            .impact
            .threshold
        ).toBe(14);

        expect(
          cocktailItem
            ?.evaluation
            .packageImpact
            .impact
            .thresholdCurrency
        ).toBe("EUR");

        expect(
          cocktailItem
            ?.evaluation
            .packageImpact
            .thresholdRuleIds
        ).toContain(
          "msc-premium-extra-threshold-eur"
        );
      }
    );
  }
);

describe(
  "MSC threshold coverage integration",
  () => {
    it(
      "propaga cobertura excluida y política de copago contextual",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine:
              "msc",

            market:
              "ES",

            onboardCurrency:
              "EUR",

            sailingDate:
              "2026-08-15",

            days:
              7,

            people:
              1,

            coffee:
              2,

            water:
              2,

            soda:
              2,

            beer:
              1,

            wine:
              1,

            cocktail:
              1,
          });

        const premiumRule =
          result.operationalRules.find(
            (rule) =>
              rule.packageKey ===
              "mscPremiumExtra"
          );

        expect(
          premiumRule
            ?.drinkPriceThresholdCoveragePolicy
        ).toBe(
          "excluded-above-threshold"
        );

        expect(
          premiumRule
            ?.drinkPriceThresholdCoveragePolicySource
            .source
        ).toBe(
          "contextual"
        );

        expect(
          premiumRule
            ?.drinkPriceThresholdChargePolicy
        ).toBe(
          "difference"
        );

        expect(
          premiumRule
            ?.drinkPriceThresholdChargePolicySource
        ).toEqual({
          source:
            "contextual",

          contextualRuleIds: [
            "msc-premium-extra-threshold-eur",
          ],
        });
      }
    );
  }
);

it(
  "no eleva una referencia documented-menu compatible a precio económico",
  () => {
    const result =
      compareDrinkPackages({
        cruiseLine: "msc",

        market: "ES",
        sailingRegion: null,
        onboardCurrency: "EUR",
        sailingDate: "2026-08-15",

        days: 7,
        people: 1,

        coffee: 0,
        water: 0,
        soda: 0,
        beer: 0,
        wine: 0,
        cocktail: 2,

        selectedDrinkPrices: {
          cocktail: {
            category: "cocktail",
            price: 15,
            currency: "EUR",
            source: "documented-menu",
            contextRelevance: "compatible",
          },
        },
      });

    const premiumImpact =
      result
        .thresholdCruiseImpacts
        .find(
          (impact) =>
            impact.packageKey ===
            "mscPremiumExtra"
        );

    expect(
      premiumImpact
        ?.dailyImpact
        .status
    ).toBe("unknown");

    expect(
      premiumImpact
        ?.dailyImpact
        .drinksAboveThresholdPerDay
    ).toBeNull();

    expect(
      premiumImpact
        ?.dailyImpact
        .additionalCostPerDay
    ).toBeNull();

    expect(
      premiumImpact
        ?.cruiseImpact
        .additionalCostTotal
    ).toBeNull();
  }
);

it(
  "acepta una referencia documented-menu exact como precio económico",
  () => {
    const result =
      compareDrinkPackages({
        cruiseLine: "msc",

        market: "ES",
        sailingRegion: null,
        onboardCurrency: "EUR",
        sailingDate: "2026-08-15",

        days: 7,
        people: 1,

        coffee: 0,
        water: 0,
        soda: 0,
        beer: 0,
        wine: 0,
        cocktail: 2,

        selectedDrinkPrices: {
          cocktail: {
            category: "cocktail",
            price: 15,
            currency: "EUR",
            source: "documented-menu",
            contextRelevance: "exact",
          },
        },
      });

    const premiumImpact =
      result
        .thresholdCruiseImpacts
        .find(
          (impact) =>
            impact.packageKey ===
            "mscPremiumExtra"
        );

    expect(
      premiumImpact
        ?.dailyImpact
        .status
    ).toBe("quantified");

    expect(
      premiumImpact
        ?.dailyImpact
        .drinksAboveThresholdPerDay
    ).toBe(2);

    expect(
      premiumImpact
        ?.dailyImpact
        .additionalCostPerDay
    ).toBe(2);

    expect(
      premiumImpact
        ?.cruiseImpact
        .additionalCostTotal
    ).toBe(14);
  }
);
