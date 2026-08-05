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
            ?.drinkPriceThresholdEurope
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
      "extrae el umbral europeo de Premium Extra",
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
            ?.drinkPriceThresholdEurope
        ).toBe(14);

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
            ?.drinkPriceThresholdEurope
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
              .drinkPriceThresholdEurope
          ).toBeNull();

          expect(
            rule.minorsOnly
          ).toBe(false);
        }
      }
    );
  }
);
