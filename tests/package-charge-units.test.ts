import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolvePackageChargeUnits,
} from "@/lib/packageChargeUnits";

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
  "package charge units from cruise nights",
  () => {
    it(
      "resuelve 7 unidades para Costa BCN07A8U desde 7 noches",
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

        expect(
          resolvePackageChargeUnits({
            cruiseNights: 7,
            packageChargeUnitPolicy:
              rule.packageChargeUnitPolicy,
          })
        ).toEqual({
          status: "resolved",
          chargeUnits: 7,
          policy: "per-night",
        });
      }
    );

    it(
      "resuelve 7 unidades para MSC SX20270206VLCVLC sin doble resta",
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

        expect(
          resolvePackageChargeUnits({
            cruiseNights: 7,
            packageChargeUnitPolicy:
              rule.packageChargeUnitPolicy,
          })
        ).toEqual({
          status: "resolved",
          chargeUnits: 7,
          policy:
            "per-itinerary-day-excluding-disembarkation",
        });
      }
    );
  }
);
