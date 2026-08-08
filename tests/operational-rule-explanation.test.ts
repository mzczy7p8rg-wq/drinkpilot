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
      "expone únicamente avisos operativos respaldados para Costa",
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
          notices.length
        ).toBe(3);

        expect(
          notices.every(
            (notice) =>
              notice.type ===
                "venue-coverage" &&
              notice.source ===
                "base" &&
              notice.calculationImpact ===
                "informational"
          )
        ).toBe(true);
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

describe(
  "operational notice provenance",
  () => {
    it(
      "distingue avisos base de avisos contextuales",
      () => {
        const rules =
          getPackageOperationalRules(
            {
              cruiseLine: "msc",
              market: "ES",
              sailingDate:
                "2026-08-15",
            },
            {
              contextualRules: [
                {
                  id:
                    "test-threshold-contextual",
                  cruiseLine:
                    "msc",
                  packageKey:
                    "mscPremiumExtra",
                  markets: [
                    "ES",
                  ],
                  rules: {
                    drinkPriceThreshold:
                      14,
                  },
                },
              ],
            }
          );

        const notices =
          buildOperationalRuleNotices(
            rules
          );

        const alcoholNotice =
          notices.find(
            (notice) =>
              notice.packageKey ===
                "mscPremiumExtra" &&
              notice.type ===
                "alcohol-daily-limit"
          );

        const thresholdNotice =
          notices.find(
            (notice) =>
              notice.packageKey ===
                "mscPremiumExtra" &&
              notice.type ===
                "drink-price-threshold"
          );

        expect(
          alcoholNotice?.source
        ).toBe("base");

        expect(
          alcoholNotice
            ?.appliedContextualRuleIds
        ).toEqual([]);

        expect(
          thresholdNotice?.source
        ).toBe("contextual");

        expect(
          thresholdNotice
            ?.appliedContextualRuleIds
        ).toEqual([
          "test-threshold-contextual",
        ]);
      }
    );
  }
);

describe(
  "operational notice calculation impact",
  () => {
    it(
      "marca las reglas operativas actuales como informativas",
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
          notices.length
        ).toBeGreaterThan(0);

        for (
          const notice of
          notices
        ) {
          expect(
            notice.calculationImpact
          ).toBe(
            "informational"
          );
        }
      }
    );

    it(
      "no convierte un umbral contextual ficticio en impacto económico antes de que el motor lo utilice",
      () => {
        const rules =
          getPackageOperationalRules(
            {
              cruiseLine: "msc",
              market: "ES",
              sailingDate:
                "2026-08-15",
            },
            {
              contextualRules: [
                {
                  id:
                    "test-threshold-impact",
                  cruiseLine:
                    "msc",
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

        const thresholdNotice =
          buildOperationalRuleNotices(
            rules
          ).find(
            (notice) =>
              notice.type ===
                "drink-price-threshold" &&
              notice.packageKey ===
                "mscPremiumExtra"
          );

        expect(
          thresholdNotice
            ?.calculationImpact
        ).toBe(
          "informational"
        );

        expect(
          thresholdNotice?.source
        ).toBe(
          "contextual"
        );
      }
    );
  }
);

describe(
  "operational notice calculation impact",
  () => {
    it(
      "marca las reglas operativas actuales como informativas",
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
          notices.length
        ).toBeGreaterThan(0);

        for (
          const notice of
          notices
        ) {
          expect(
            notice.calculationImpact
          ).toBe(
            "informational"
          );
        }
      }
    );

    it(
      "mantiene informativo un umbral contextual mientras el motor no lo utilice",
      () => {
        const rules =
          getPackageOperationalRules(
            {
              cruiseLine: "msc",
              market: "ES",
              sailingDate:
                "2026-08-15",
            },
            {
              contextualRules: [
                {
                  id:
                    "test-threshold-impact",
                  cruiseLine:
                    "msc",
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

        const thresholdNotice =
          buildOperationalRuleNotices(
            rules
          ).find(
            (notice) =>
              notice.packageKey ===
                "mscPremiumExtra" &&
              notice.type ===
                "drink-price-threshold"
          );

        expect(
          thresholdNotice
            ?.calculationImpact
        ).toBe(
          "informational"
        );

        expect(
          thresholdNotice?.source
        ).toBe(
          "contextual"
        );

        expect(
          thresholdNotice
            ?.appliedContextualRuleIds
        ).toEqual([
          "test-threshold-impact",
        ]);
      }
    );
  }
);

describe(
  "AQUA semantic distinction",
  () => {
    it(
      "distingue AQUA by MSC ilimitada del agua mineral embotellada tradicional ilimitada",
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

        const easyAquaNotice =
          notices.find(
            (notice) =>
              notice.type ===
                "aqua-unlimited" &&
              notice.packageKey ===
                "mscEasy"
          );

        expect(
          easyAquaNotice
        ).toBeDefined();

        expect(
          easyAquaNotice?.message
        ).toContain(
          "AQUA by MSC ilimitada"
        );

        expect(
          easyAquaNotice?.message
        ).toContain(
          "no equivale a agua mineral embotellada tradicional ilimitada"
        );
      }
    );
  }
);

describe(
  "MSC Premium Extra contextual threshold end to end",
  () => {
    it(
      "explica el umbral EUR real como regla contextual informativa",
      () => {
        const rules =
          getPackageOperationalRules({
            cruiseLine: "msc",
            market: "ES",
            sailingRegion: null,
            onboardCurrency: "EUR",
            sailingDate:
              "2026-08-15",
          });

        const notices =
          buildOperationalRuleNotices(
            rules
          );

        const notice =
          notices.find(
            (item) =>
              item.packageKey ===
                "mscPremiumExtra" &&
              item.type ===
                "drink-price-threshold"
          );

        expect(
          notice
        ).toBeDefined();

        expect(
          notice?.message
        ).toContain(
          "14.00 EUR"
        );

        expect(
          notice?.source
        ).toBe("contextual");

        expect(
          notice?.appliedContextualRuleIds
        ).toContain(
          "msc-premium-extra-threshold-eur"
        );

        expect(
          notice?.calculationImpact
        ).toBe("informational");
      }
    );

    it(
      "explica el umbral USD real sin confundir su moneda",
      () => {
        const rules =
          getPackageOperationalRules({
            cruiseLine: "msc",
            market: "US",
            sailingRegion: null,
            onboardCurrency: "USD",
            sailingDate:
              "2026-08-15",
          });

        const notices =
          buildOperationalRuleNotices(
            rules
          );

        const notice =
          notices.find(
            (item) =>
              item.packageKey ===
                "mscPremiumExtra" &&
              item.type ===
                "drink-price-threshold"
          );

        expect(
          notice
        ).toBeDefined();

        expect(
          notice?.message
        ).toContain(
          "16.00 USD"
        );

        expect(
          notice?.source
        ).toBe("contextual");

        expect(
          notice?.appliedContextualRuleIds
        ).toContain(
          "msc-premium-extra-threshold-usd"
        );

        expect(
          notice?.calculationImpact
        ).toBe("informational");
      }
    );

    it(
      "no genera un aviso de umbral cuando se desconoce la moneda a bordo",
      () => {
        const rules =
          getPackageOperationalRules({
            cruiseLine: "msc",
            market: "ES",
            sailingRegion: null,
            onboardCurrency: null,
            sailingDate:
              "2026-08-15",
          });

        const notices =
          buildOperationalRuleNotices(
            rules
          );

        const notice =
          notices.find(
            (item) =>
              item.packageKey ===
                "mscPremiumExtra" &&
              item.type ===
                "drink-price-threshold"
          );

        expect(
          notice
        ).toBeUndefined();
      }
    );
  }
);

describe(
  "venue coverage operational notices",
  () => {
    it(
      "expone las limitaciones de venues de Costa como información estructurada",
      () => {
        const rules =
          getPackageOperationalRules({
            cruiseLine: "costa",
          });

        const notices =
          buildOperationalRuleNotices(
            rules
          );

        const notice =
          notices.find(
            (item) =>
              item.packageKey ===
                "myDrinks" &&
              item.type ===
                "venue-coverage"
          );

        expect(
          notice
        ).toBeDefined();

        expect(
          notice?.calculationImpact
        ).toBe(
          "informational"
        );

        expect(
          notice?.source
        ).toBe("base");

        expect(
          notice
            ?.appliedContextualRuleIds
        ).toEqual([]);

        expect(
          notice?.message
        ).toContain(
          "Archipelago"
        );

        expect(
          notice?.message
        ).toContain(
          "Casanova"
        );
      }
    );

    it(
      "expone la cobertura condicional de Premium Extra sin llamarla exclusión",
      () => {
        const rules =
          getPackageOperationalRules({
            cruiseLine: "msc",
            market: "ES",
            onboardCurrency: "EUR",
            sailingDate:
              "2026-08-15",
          });

        const notices =
          buildOperationalRuleNotices(
            rules
          );

        const notice =
          notices.find(
            (item) =>
              item.packageKey ===
                "mscPremiumExtra" &&
              item.type ===
                "venue-coverage"
          );

        expect(
          notice
        ).toBeDefined();

        expect(
          notice?.message
        ).toContain(
          "cobertura condicional"
        );

        expect(
          notice?.message
        ).not.toContain(
          "excluidos"
        );

        expect(
          notice?.calculationImpact
        ).toBe(
          "informational"
        );
      }
    );

    it(
      "no crea aviso cuando toda la cobertura de venues es desconocida",
      () => {
        const rules =
          getPackageOperationalRules({
            cruiseLine: "msc",
          });

        const unknownRule =
          rules.find(
            (rule) =>
              rule.packageKey ===
              "mscPremiumExtra"
          );

        if (!unknownRule) {
          throw new Error(
            "MSC Premium Extra rule missing"
          );
        }

        const notices =
          buildOperationalRuleNotices([
            {
              ...unknownRule,

              venueCoverage: {
                specialityRestaurants:
                  "unknown",

                privateIslands:
                  "unknown",

                themedVenues:
                  "unknown",
              },
            },
          ]);

        expect(
          notices.some(
            (notice) =>
              notice.type ===
              "venue-coverage"
          )
        ).toBe(false);
      }
    );
  }
);
