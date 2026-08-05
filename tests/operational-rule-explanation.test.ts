import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildOperationalRuleNotices,
} from "@/lib/operationalRuleExplanation";

import {
  getPackageOperationalRules,
} from "@/lib/packageRules";

describe(
  "operational rule explanation",
  () => {
    it(
      "explica las reglas operativas conocidas de MSC",
      () => {
        const rules =
          getPackageOperationalRules({
            cruiseLine: "msc",
            market: "ES",
            sailingDate:
              "2026-08-15",
          });

        const notices =
          buildOperationalRuleNotices(
            rules
          );

        expect(
          notices.some(
            (notice) =>
              notice.type ===
                "alcohol-daily-limit" &&
              notice.packageKey ===
                "mscEasy"
          )
        ).toBe(true);

        expect(
          notices.some(
            (notice) =>
              notice.type ===
                "aqua-unlimited" &&
              notice.packageKey ===
                "mscEasy"
          )
        ).toBe(true);

        expect(
          notices.some(
            (notice) =>
              notice.type ===
                "minors-only" &&
              notice.packageKey ===
                "mscMinors"
          )
        ).toBe(true);
      }
    );

    it(
      "no inventa un umbral de precio MSC sin regla contextual",
      () => {
        const rules =
          getPackageOperationalRules({
            cruiseLine: "msc",
            market: "ES",
            sailingDate:
              "2026-08-15",
          });

        const notices =
          buildOperationalRuleNotices(
            rules
          );

        expect(
          notices.some(
            (notice) =>
              notice.type ===
              "drink-price-threshold"
          )
        ).toBe(false);
      }
    );

    it(
      "no inventa avisos operativos para Costa",
      () => {
        const rules =
          getPackageOperationalRules({
            cruiseLine: "costa",
            market: "ES",
            sailingDate:
              "2026-08-15",
          });

        const notices =
          buildOperationalRuleNotices(
            rules
          );

        expect(
          notices
        ).toEqual([]);
      }
    );
  }
);
