import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolvePackageChargeDays,
} from "@/lib/packageChargeDays";

describe(
  "package charge days",
  () => {
    it(
      "excluye el día de desembarque cuando la política lo documenta",
      () => {
        expect(
          resolvePackageChargeDays({
            cruiseDays: 7,
            packagePricingDayPolicy:
              "exclude-disembarkation-day",
          })
        ).toEqual({
          chargeDays: 6,
          applied: true,
        });
      }
    );

    it(
      "no altera los días cuando la política es desconocida",
      () => {
        expect(
          resolvePackageChargeDays({
            cruiseDays: 7,
            packagePricingDayPolicy:
              "unknown",
          })
        ).toEqual({
          chargeDays: 7,
          applied: false,
        });
      }
    );

    it(
      "no produce cero días facturables para un crucero de un día",
      () => {
        expect(
          resolvePackageChargeDays({
            cruiseDays: 1,
            packagePricingDayPolicy:
              "exclude-disembarkation-day",
          })
        ).toEqual({
          chargeDays: 1,
          applied: false,
        });
      }
    );
  }
);

import {
  getPackageOperationalRule as getPackageOperationalRuleWithContext,
} from "@/lib/packageRules";

import {
  createCruiseContextFixture,
  type CruiseContextFixture,
} from "@/tests/fixtures/cruiseContext";

function getPackageOperationalRule(
  input: CruiseContextFixture,
  packageKey: Parameters<
    typeof getPackageOperationalRuleWithContext
  >[1]
) {
  return getPackageOperationalRuleWithContext(
    createCruiseContextFixture(
      input
    ),
    packageKey
  );
}

describe(
  "package charge days from operational rules",
  () => {
    it(
      "resuelve 6 días facturables para MSC Easy en un crucero de 7 días",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine: "msc",
            },
            "mscEasy"
          );

        if (!rule) {
          throw new Error(
            "MSC Easy operational rule missing"
          );
        }

        const result =
          resolvePackageChargeDays({
            cruiseDays: 7,

            packagePricingDayPolicy:
              rule.packagePricingDayPolicy,
          });

        expect(result).toEqual({
          chargeDays: 6,
          applied: true,
        });
      }
    );

    it(
      "mantiene 7 días facturables para Costa cuando la política es desconocida",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine: "costa",
            },
            "myDrinks"
          );

        if (!rule) {
          throw new Error(
            "Costa My Drinks operational rule missing"
          );
        }

        const result =
          resolvePackageChargeDays({
            cruiseDays: 7,

            packagePricingDayPolicy:
              rule.packagePricingDayPolicy,
          });

        expect(result).toEqual({
          chargeDays: 7,
          applied: false,
        });
      }
    );
  }
);
