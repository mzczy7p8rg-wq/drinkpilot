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

describe(
  "adult operational rule notices",
  () => {
    it(
      "excluye todos los avisos de paquetes exclusivos para menores",
      async () => {
        const {
          filterAdultOperationalRuleNotices,
        } = await import(
          "@/lib/operationalRuleExplanation"
        );

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

        /*
         * Minors Package genera más de
         * un aviso, incluido AQUA.
         *
         * El filtro debe eliminar todos,
         * no únicamente "minors-only".
         */
        expect(
          notices.some(
            (notice) =>
              notice.packageKey ===
              "mscMinors"
          )
        ).toBe(true);

        const adultNotices =
          filterAdultOperationalRuleNotices(
            notices,
            rules
          );

        expect(
          adultNotices.some(
            (notice) =>
              notice.packageKey ===
              "mscMinors"
          )
        ).toBe(false);

        expect(
          adultNotices.some(
            (notice) =>
              notice.packageKey ===
                "mscEasy" &&
              notice.type ===
                "aqua-unlimited"
          )
        ).toBe(true);
      }
    );

    it(
      "no elimina avisos de paquetes adultos",
      async () => {
        const {
          filterAdultOperationalRuleNotices,
        } = await import(
          "@/lib/operationalRuleExplanation"
        );

        const rules =
          getPackageOperationalRules(
            "msc"
          );

        const notices =
          buildOperationalRuleNotices(
            rules
          );

        const adultNotices =
          filterAdultOperationalRuleNotices(
            notices,
            rules
          );

        expect(
          adultNotices.some(
            (notice) =>
              notice.packageKey ===
              "mscEasy"
          )
        ).toBe(true);

        expect(
          adultNotices.some(
            (notice) =>
              notice.packageKey ===
              "mscPremiumExtra"
          )
        ).toBe(true);
      }
    );
  }
);
