import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getPackageOperationalRule,
  getPackageOperationalRules,
} from "@/lib/packageRules";

describe(
  "package operational rules",
  () => {
    it(
      "extrae el límite diario de alcohol de MSC Easy",
      () => {
        const rule =
          getPackageOperationalRule(
            "msc",
            "mscEasy"
          );

        expect(
          rule
            ?.alcoholicDrinksDailyLimit
        ).toBe(15);

        expect(
          rule
            ?.drinkPriceThreshold
        ).toBeNull();

        expect(
          rule?.aquaUnlimited
        ).toBe(true);

        expect(
          rule?.minorsOnly
        ).toBe(false);
      }
    );

    it(
      "no inventa un umbral europeo universal para Premium Extra",
      () => {
        const rule =
          getPackageOperationalRule(
            "msc",
            "mscPremiumExtra"
          );

        expect(
          rule
            ?.alcoholicDrinksDailyLimit
        ).toBe(15);

        expect(
          rule
            ?.drinkPriceThreshold
        ).toBeNull();

        expect(
          rule?.aquaUnlimited
        ).toBe(true);
      }
    );

    it(
      "identifica Minors Package como exclusivo de menores",
      () => {
        const rule =
          getPackageOperationalRule(
            "msc",
            "mscMinors"
          );

        expect(
          rule?.minorsOnly
        ).toBe(true);

        expect(
          rule
            ?.alcoholicDrinksDailyLimit
        ).toBeNull();

        expect(
          rule
            ?.drinkPriceThreshold
        ).toBeNull();
      }
    );

    it(
      "no inventa reglas operativas para Costa",
      () => {
        const rules =
          getPackageOperationalRules(
            "costa"
          );

        expect(
          rules.length
        ).toBeGreaterThan(0);

        for (
          const rule of
          rules
        ) {
          expect(
            rule
              .alcoholicDrinksDailyLimit
          ).toBeNull();

          expect(
            rule
              .drinkPriceThreshold
          ).toBeNull();

          expect(
            rule.minorsOnly
          ).toBe(false);
        }
      }
    );

    it(
      "mantiene compatibilidad con el uso simple por naviera",
      () => {
        const rule =
          getPackageOperationalRule(
            "msc",
            "mscEasy"
          );

        expect(
          rule?.context
        ).toEqual({
          cruiseLine: "msc",
          market: null,
          sailingRegion: null,
          onboardCurrency: null,
          sailingDate: null,
        });
      }
    );

    it(
      "acepta un CruiseContext completo sin perder mercado ni fecha",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine: "msc",
              market: "ES",
              sailingRegion: null,
              sailingDate:
                "2026-08-15",
            },
            "mscEasy"
          );

        expect(
          rule?.context
        ).toEqual({
          cruiseLine: "msc",
          market: "ES",
          sailingRegion: null,
          sailingDate:
            "2026-08-15",
        });

        /*
         * Tener contexto todavía no
         * debe inventar reglas nuevas.
         */
        expect(
          rule
            ?.alcoholicDrinksDailyLimit
        ).toBe(15);

        expect(
          rule
            ?.drinkPriceThreshold
        ).toBeNull();
      }
    );

    it(
      "utiliza la naviera contenida en CruiseContext",
      () => {
        const rules =
          getPackageOperationalRules({
            cruiseLine: "costa",
            market: "ES",
            sailingDate:
              "2026-08-15",
          });

        expect(
          rules.length
        ).toBeGreaterThan(0);

        expect(
          rules.some(
            (rule) =>
              rule.packageKey ===
              "mscEasy"
          )
        ).toBe(false);

        for (
          const rule of
          rules
        ) {
          expect(
            rule.context.cruiseLine
          ).toBe("costa");

          expect(
            rule.context.market
          ).toBe("ES");
        }
      }
    );
    it(
      "no aplica reglas contextuales cuando el registro MSC está vacío",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine: "msc",
              market: "ES",
              sailingDate:
                "2026-08-15",
            },
            "mscPremiumExtra"
          );

        expect(
          rule
            ?.drinkPriceThreshold
        ).toBeNull();

        expect(
          rule
            ?.appliedContextualRuleIds
        ).toEqual([]);
      }
    );

    it(
      "conserva las reglas base cuando no existe coincidencia contextual",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine: "msc",
              market: "ES",
              sailingDate:
                "2026-08-15",
            },
            "mscEasy"
          );

        expect(
          rule
            ?.alcoholicDrinksDailyLimit
        ).toBe(15);

        expect(
          rule?.aquaUnlimited
        ).toBe(true);

        expect(
          rule
            ?.drinkPriceThreshold
        ).toBeNull();

        expect(
          rule
            ?.appliedContextualRuleIds
        ).toEqual([]);
      }
    );
    it(
      "aplica una regla contextual inyectada cuando coincide el contexto",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine: "msc",
              market: "ES",
              sailingDate:
                "2026-07-15",
            },
            "mscPremiumExtra",
            {
              contextualRules: [
                {
                  id:
                    "test-premium-threshold",

                  cruiseLine:
                    "msc",

                  packageKey:
                    "mscPremiumExtra",

                  markets: [
                    "ES",
                  ],

                  validFrom:
                    "2026-06-01",

                  validUntil:
                    "2026-08-31",

                  rules: {
                    drinkPriceThreshold:
                      14,

                    drinkPriceThresholdCurrency:
                      "EUR",
                  },
                },
              ],
            }
          );

        expect(
          rule
            ?.drinkPriceThreshold
        ).toBe(14);

        expect(
          rule
            ?.drinkPriceThresholdCurrency
        ).toBe("EUR");

        expect(
          rule
            ?.appliedContextualRuleIds
        ).toEqual([
          "test-premium-threshold",
        ]);
      }
    );

    it(
      "no aplica una regla contextual inyectada fuera de su mercado",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine: "msc",
              market: "US",
              sailingDate:
                "2026-07-15",
            },
            "mscPremiumExtra",
            {
              contextualRules: [
                {
                  id:
                    "test-es-only",

                  cruiseLine:
                    "msc",

                  packageKey:
                    "mscPremiumExtra",

                  markets: [
                    "ES",
                  ],

                  validFrom:
                    "2026-06-01",

                  validUntil:
                    "2026-08-31",

                  rules: {
                    drinkPriceThreshold:
                      14,
                  },
                },
              ],
            }
          );

        expect(
          rule
            ?.drinkPriceThreshold
        ).toBeNull();

        expect(
          rule
            ?.appliedContextualRuleIds
        ).toEqual([]);
      }
    );

    it(
      "no aplica una regla contextual inyectada fuera de su ventana temporal",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine: "msc",
              market: "ES",
              sailingDate:
                "2026-09-01",
            },
            "mscPremiumExtra",
            {
              contextualRules: [
                {
                  id:
                    "test-summer-only",

                  cruiseLine:
                    "msc",

                  packageKey:
                    "mscPremiumExtra",

                  markets: [
                    "ES",
                  ],

                  validFrom:
                    "2026-06-01",

                  validUntil:
                    "2026-08-31",

                  rules: {
                    drinkPriceThreshold:
                      14,
                  },
                },
              ],
            }
          );

        expect(
          rule
            ?.drinkPriceThreshold
        ).toBeNull();

        expect(
          rule
            ?.appliedContextualRuleIds
        ).toEqual([]);
      }
    );

    it(
      "mantiene procedencia por propiedad al aplicar una regla contextual",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine: "msc",
              market: "ES",
              sailingDate:
                "2026-08-15",
            },
            "mscPremiumExtra",
            {
              contextualRules: [
                {
                  id:
                    "test-threshold-only",
                  cruiseLine: "msc",
                  packageKey:
                    "mscPremiumExtra",
                  markets: ["ES"],
                  rules: {
                    drinkPriceThreshold:
                      14,
                  },
                },
              ],
            }
          );

        expect(
          rule
            ?.alcoholicDrinksDailyLimit
        ).toBe(15);

        expect(
          rule
            ?.alcoholicDrinksDailyLimitSource
        ).toEqual({
          source: "base",
          contextualRuleIds: [],
        });

        expect(
          rule?.drinkPriceThreshold
        ).toBe(14);

        expect(
          rule
            ?.drinkPriceThresholdSource
        ).toEqual({
          source: "contextual",
          contextualRuleIds: [
            "test-threshold-only",
          ],
        });

        /*
         * El resumen del paquete continúa
         * disponible por compatibilidad.
         */
        expect(
          rule
            ?.appliedContextualRuleIds
        ).toEqual([
          "test-threshold-only",
        ]);
      }
    );
  }
);

describe(
  "drink price threshold charge policy",
  () => {
    it(
      "resuelve la política difference cuando el threshold MSC la documenta",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine: "msc",
              market: null,
              sailingRegion: null,
              onboardCurrency: "EUR",
              sailingDate: null,
            },
            "mscPremiumExtra"
          );

        expect(
          rule?.drinkPriceThreshold
        ).toBe(14);

        expect(
          rule
            ?.drinkPriceThresholdChargePolicy
        ).toBe("difference");

        expect(
          rule
            ?.drinkPriceThresholdChargePolicySource
        ).toEqual({
          source: "contextual",
          contextualRuleIds: [
            "msc-premium-extra-threshold-eur",
          ],
        });
      }
    );

    it(
      "resuelve una política de cobro contextual con procedencia independiente",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine: "msc",
              market: "ES",
              sailingRegion: null,
              onboardCurrency: "EUR",
              sailingDate:
                "2026-08-15",
            },
            "mscPremiumExtra",
            {
              contextualRules: [
                {
                  id:
                    "test-threshold-charge-policy",

                  cruiseLine:
                    "msc",

                  packageKey:
                    "mscPremiumExtra",

                  markets: [
                    "ES",
                  ],

                  onboardCurrencies: [
                    "EUR",
                  ],

                  rules: {
                    drinkPriceThreshold:
                      14,

                    drinkPriceThresholdCurrency:
                      "EUR",

                    drinkPriceThresholdChargePolicy:
                      "difference",
                  },
                },
              ],
            }
          );

        expect(
          rule?.drinkPriceThreshold
        ).toBe(14);

        expect(
          rule
            ?.drinkPriceThresholdChargePolicy
        ).toBe("difference");

        expect(
          rule
            ?.drinkPriceThresholdChargePolicySource
        ).toEqual({
          source: "contextual",
          contextualRuleIds: [
            "test-threshold-charge-policy",
          ],
        });

        expect(
          rule
            ?.drinkPriceThresholdSource
        ).toEqual({
          source: "contextual",
          contextualRuleIds: [
            "test-threshold-charge-policy",
          ],
        });
      }
    );
  }
);
