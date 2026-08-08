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
