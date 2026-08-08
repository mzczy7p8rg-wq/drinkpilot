import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getContextualPackageRulesForPackage,
  getMatchingContextualPackageRules,
  matchesContextualPackageRule,
  type ContextualPackageRule,
} from "@/lib/contextualPackageRules";

const rule:
  ContextualPackageRule = {
    id:
      "msc-example-rule",

    cruiseLine:
      "msc",

    packageKey:
      "mscPremiumExtra",

    markets: [
      "ES",
      "EU",
    ],

    validFrom:
      "2026-06-01",

    validUntil:
      "2026-08-31",

    rules: {
      drinkPriceThreshold:
        14,
    },
  };

describe(
  "contextual package rules",
  () => {
    it(
      "aplica la fecha inicial de forma inclusiva",
      () => {
        expect(
          matchesContextualPackageRule(
            rule,
            {
              cruiseLine:
                "msc",

              market:
                "ES",

              sailingDate:
                "2026-06-01",
            }
          )
        ).toBe(true);
      }
    );

    it(
      "aplica la fecha final de forma inclusiva",
      () => {
        expect(
          matchesContextualPackageRule(
            rule,
            {
              cruiseLine:
                "msc",

              market:
                "ES",

              sailingDate:
                "2026-08-31",
            }
          )
        ).toBe(true);
      }
    );

    it(
      "rechaza fechas anteriores a validFrom",
      () => {
        expect(
          matchesContextualPackageRule(
            rule,
            {
              cruiseLine:
                "msc",

              market:
                "ES",

              sailingDate:
                "2026-05-31",
            }
          )
        ).toBe(false);
      }
    );

    it(
      "rechaza fechas posteriores a validUntil",
      () => {
        expect(
          matchesContextualPackageRule(
            rule,
            {
              cruiseLine:
                "msc",

              market:
                "ES",

              sailingDate:
                "2026-09-01",
            }
          )
        ).toBe(false);
      }
    );

    it(
      "no aplica una regla temporal si desconocemos la fecha",
      () => {
        expect(
          matchesContextualPackageRule(
            rule,
            {
              cruiseLine:
                "msc",

              market:
                "ES",

              sailingDate:
                null,
            }
          )
        ).toBe(false);
      }
    );

    it(
      "no aplica una regla de mercado si desconocemos el mercado",
      () => {
        expect(
          matchesContextualPackageRule(
            rule,
            {
              cruiseLine:
                "msc",

              market:
                null,

              sailingDate:
                "2026-07-15",
            }
          )
        ).toBe(false);
      }
    );

    it(
      "rechaza una naviera distinta",
      () => {
        expect(
          matchesContextualPackageRule(
            rule,
            {
              cruiseLine:
                "costa",

              market:
                "ES",

              sailingDate:
                "2026-07-15",
            }
          )
        ).toBe(false);
      }
    );

    it(
      "acepta reglas sin restricciones de mercado ni fecha",
      () => {
        const universalRule:
          ContextualPackageRule = {
            id:
              "universal-example",

            cruiseLine:
              "msc",

            packageKey:
              "mscEasy",

            rules: {
              alcoholicDrinksDailyLimit:
                15,
            },
          };

        expect(
          matchesContextualPackageRule(
            universalRule,
            {
              cruiseLine:
                "msc",

              market:
                null,

              sailingDate:
                null,
            }
          )
        ).toBe(true);
      }
    );

    it(
      "filtra únicamente las reglas que coinciden con el contexto",
      () => {
        const matches =
          getMatchingContextualPackageRules(
            [
              rule,

              {
                ...rule,

                id:
                  "other-market",

                markets: [
                  "US",
                ],
              },
            ],

            {
              cruiseLine:
                "msc",

              market:
                "ES",

              sailingDate:
                "2026-07-15",
            }
          );

        expect(
          matches.map(
            (item) =>
              item.id
          )
        ).toEqual([
          "msc-example-rule",
        ]);
      }
    );

    it(
      "filtra reglas por packageKey después de aplicar contexto",
      () => {
        const matches =
          getContextualPackageRulesForPackage(
            [
              rule,

              {
                ...rule,

                id:
                  "msc-easy-rule",

                packageKey:
                  "mscEasy",
              },
            ],

            {
              cruiseLine:
                "msc",

              market:
                "ES",

              sailingDate:
                "2026-07-15",
            },

            "mscPremiumExtra"
          );

        expect(
          matches.map(
            (item) =>
              item.id
          )
        ).toEqual([
          "msc-example-rule",
        ]);
      }
    );
  }
);

describe(
  "contextual sailing region matching",
  () => {
    const regionalRule = {
      id:
        "test-msc-premium-med",

      cruiseLine:
        "msc" as const,

      packageKey:
        "mscPremiumExtra" as const,

      sailingRegions: [
        "MED",
      ],

      rules: {
        drinkPriceThreshold:
          14,
      },
    };

    it(
      "aplica una regla cuando coincide la región de navegación",
      () => {
        expect(
          matchesContextualPackageRule(
            regionalRule,
            {
              cruiseLine:
                "msc",

              market:
                "ES",

              sailingRegion:
                "MED",

              sailingDate:
                "2026-08-15",
            }
          )
        ).toBe(true);
      }
    );

    it(
      "no aplica una regla regional cuando la región es desconocida",
      () => {
        expect(
          matchesContextualPackageRule(
            regionalRule,
            {
              cruiseLine:
                "msc",

              market:
                "ES",

              sailingRegion:
                null,

              sailingDate:
                "2026-08-15",
            }
          )
        ).toBe(false);
      }
    );

    it(
      "no aplica una regla cuando la navegación pertenece a otra región",
      () => {
        expect(
          matchesContextualPackageRule(
            regionalRule,
            {
              cruiseLine:
                "msc",

              market:
                "ES",

              sailingRegion:
                "CAR",

              sailingDate:
                "2026-08-15",
            }
          )
        ).toBe(false);
      }
    );

    it(
      "no confunde mercado de compra con región de navegación",
      () => {
        expect(
          matchesContextualPackageRule(
            regionalRule,
            {
              cruiseLine:
                "msc",

              market:
                "MED",

              sailingRegion:
                null,

              sailingDate:
                "2026-08-15",
            }
          )
        ).toBe(false);
      }
    );
  }
);

describe(
  "contextual sailing region matching",
  () => {
    const regionalRule = {
      id:
        "test-msc-premium-med",

      cruiseLine:
        "msc" as const,

      packageKey:
        "mscPremiumExtra" as const,

      sailingRegions: [
        "MED",
      ],

      rules: {
        drinkPriceThreshold:
          14,
      },
    };

    it(
      "aplica una regla cuando coincide la región de navegación",
      () => {
        expect(
          matchesContextualPackageRule(
            regionalRule,
            {
              cruiseLine:
                "msc",

              market:
                "ES",

              sailingRegion:
                "MED",

              sailingDate:
                "2026-08-15",
            }
          )
        ).toBe(true);
      }
    );

    it(
      "no aplica una regla regional cuando la región es desconocida",
      () => {
        expect(
          matchesContextualPackageRule(
            regionalRule,
            {
              cruiseLine:
                "msc",

              market:
                "ES",

              sailingRegion:
                null,

              sailingDate:
                "2026-08-15",
            }
          )
        ).toBe(false);
      }
    );

    it(
      "no aplica una regla cuando la navegación pertenece a otra región",
      () => {
        expect(
          matchesContextualPackageRule(
            regionalRule,
            {
              cruiseLine:
                "msc",

              market:
                "ES",

              sailingRegion:
                "CAR",

              sailingDate:
                "2026-08-15",
            }
          )
        ).toBe(false);
      }
    );

    it(
      "no confunde mercado de compra con región de navegación",
      () => {
        expect(
          matchesContextualPackageRule(
            regionalRule,
            {
              cruiseLine:
                "msc",

              market:
                "MED",

              sailingRegion:
                null,

              sailingDate:
                "2026-08-15",
            }
          )
        ).toBe(false);
      }
    );
  }
);


describe(
  "contextual onboard currency matching",
  () => {
    const eurRule:
      ContextualPackageRule = {
        id:
          "test-premium-eur-threshold",

        cruiseLine:
          "msc",

        packageKey:
          "mscPremiumExtra",

        onboardCurrencies: [
          "EUR",
        ],

        rules: {
          drinkPriceThreshold:
            14,

          drinkPriceThresholdCurrency:
            "EUR",
        },
      };

    it(
      "aplica una regla cuando coincide la moneda operativa",
      () => {
        expect(
          matchesContextualPackageRule(
            eurRule,
            {
              cruiseLine:
                "msc",

              market:
                null,

              sailingRegion:
                null,

              onboardCurrency:
                "EUR",

              sailingDate:
                null,
            }
          )
        ).toBe(true);
      }
    );

    it(
      "no aplica una regla cuando la moneda operativa es distinta",
      () => {
        expect(
          matchesContextualPackageRule(
            eurRule,
            {
              cruiseLine:
                "msc",

              market:
                null,

              sailingRegion:
                null,

              onboardCurrency:
                "USD",

              sailingDate:
                null,
            }
          )
        ).toBe(false);
      }
    );

    it(
      "no aplica una regla monetaria cuando la moneda es desconocida",
      () => {
        expect(
          matchesContextualPackageRule(
            eurRule,
            {
              cruiseLine:
                "msc",

              market:
                null,

              sailingRegion:
                null,

              onboardCurrency:
                null,

              sailingDate:
                null,
            }
          )
        ).toBe(false);
      }
    );

    it(
      "mantiene compatibles las reglas sin restricción monetaria",
      () => {
        const unrestrictedRule:
          ContextualPackageRule = {
            id:
              "test-unrestricted-currency",

            cruiseLine:
              "msc",

            packageKey:
              "mscEasy",

            rules: {
              alcoholicDrinksDailyLimit:
                15,
            },
          };

        expect(
          matchesContextualPackageRule(
            unrestrictedRule,
            {
              cruiseLine:
                "msc",

              market:
                null,

              sailingRegion:
                null,

              onboardCurrency:
                null,

              sailingDate:
                null,
            }
          )
        ).toBe(true);
      }
    );
  }
);
