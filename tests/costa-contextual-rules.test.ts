import {
  describe,
  expect,
  it,
} from "vitest";

import {
  costaContextualPackageRules,
} from "@/data/costa/contextualRules";

import {
  getContextualRulesForCruiseLine,
} from "@/data/contextualRules";

import {
  getPackageOperationalRule,
} from "@/lib/packageRules";

describe(
  "Costa contextual package rules",
  () => {
    it(
      "mantiene un proveedor propio sin reglas comerciales no documentadas",
      () => {
        expect(
          costaContextualPackageRules
        ).toEqual([]);
      }
    );

    it(
      "conecta el proveedor Costa al registro genérico",
      () => {
        expect(
          getContextualRulesForCruiseLine(
            "costa"
          )
        ).toBe(
          costaContextualPackageRules
        );
      }
    );

    it(
      "transporta todo el contexto Costa sin activar reglas no documentadas",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine:
                "costa",

              market:
                "ES",

              sailingRegion:
                "MED",

              onboardCurrency:
                "EUR",

              sailingDate:
                "2026-08-15",
            },
            "myDrinks"
          );

        expect(
          rule?.context
        ).toEqual({
          cruiseLine:
            "costa",
          market:
            "ES",
          sailingRegion:
            "MED",
          onboardCurrency:
            "EUR",
          sailingDate:
            "2026-08-15",
        });

        expect(
          rule
            ?.appliedContextualRuleIds
        ).toEqual([]);
      }
    );

    it(
      "no deduce reglas de edad o alcohol solo por seleccionar el mercado estadounidense",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine:
                "costa",

              market:
                "US",

              sailingRegion:
                "NA",

              onboardCurrency:
                "USD",

              sailingDate:
                "2026-08-15",
            },
            "myDrinks"
          );

        expect(
          rule?.appliedContextualRuleIds
        ).toEqual([]);

        expect(
          rule?.alcoholicDrinksDailyLimit
        ).toBeNull();

        expect(
          rule?.drinkPriceThreshold
        ).toBeNull();
      }
    );
  }
);
