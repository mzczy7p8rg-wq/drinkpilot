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
  }
);
