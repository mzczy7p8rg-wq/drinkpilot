import {
  describe,
  expect,
  it,
} from "vitest";

import {
  mscContextualPackageRules,
} from "@/data/msc/contextualRules";

import {
  mscMetadata,
} from "@/data/msc/metadata";

import {
  getMatchingContextualPackageRules,
} from "@/lib/contextualPackageRules";

describe(
  "MSC contextual package rules",
  () => {
    it(
      "resuelve el umbral Premium Extra de 14 EUR",
      () => {
        const rules =
          getMatchingContextualPackageRules(
            mscContextualPackageRules,
            {
              cruiseLine:
                "msc",

              market:
                null,

              sailingRegion:
                null,

              onboardCurrency:
                "EUR",

              sailingDate:
                null,
            }
          );

        expect(
          rules.map(
            (rule) =>
              rule.id
          )
        ).toEqual([
          "msc-premium-extra-threshold-eur",
        ]);

        expect(
          rules[0]
            ?.rules
            .drinkPriceThreshold
        ).toBe(14);

        expect(
          rules[0]
            ?.rules
            .drinkPriceThresholdCurrency
        ).toBe("EUR");
      }
    );

    it(
      "resuelve el umbral Premium Extra de 16 USD",
      () => {
        const rules =
          getMatchingContextualPackageRules(
            mscContextualPackageRules,
            {
              cruiseLine:
                "msc",

              market:
                null,

              sailingRegion:
                null,

              onboardCurrency:
                "USD",

              sailingDate:
                null,
            }
          );

        expect(
          rules.map(
            (rule) =>
              rule.id
          )
        ).toEqual([
          "msc-premium-extra-threshold-usd",
        ]);

        expect(
          rules[0]
            ?.rules
            .drinkPriceThreshold
        ).toBe(16);

        expect(
          rules[0]
            ?.rules
            .drinkPriceThresholdCurrency
        ).toBe("USD");
      }
    );

    it(
      "no inventa un umbral cuando la moneda a bordo es desconocida",
      () => {
        const rules =
          getMatchingContextualPackageRules(
            mscContextualPackageRules,
            {
              cruiseLine:
                "msc",

              market:
                null,

              sailingRegion:
                null,

              onboardCurrency:
                null,

              sailingDate:
                null,
            }
          );

        expect(
          rules
        ).toEqual([]);
      }
    );

    it(
      "no inventa un umbral para una moneda no documentada",
      () => {
        const rules =
          getMatchingContextualPackageRules(
            mscContextualPackageRules,
            {
              cruiseLine:
                "msc",

              market:
                null,

              sailingRegion:
                null,

              onboardCurrency:
                "GBP",

              sailingDate:
                null,
            }
          );

        expect(
          rules
        ).toEqual([]);
      }
    );
  }
);

describe(
  "MSC contextual evidence",
  () => {
    it(
      "registra el umbral oficial Premium Extra en EUR",
      () => {
        const evidence =
          mscMetadata
            .contextualEvidence
            .find(
              (item) =>
                item.id ===
                "premium-extra-threshold-eur"
            );

        expect(
          evidence
        ).toBeDefined();

        expect(
          "onboardCurrency" in
            (evidence ?? {})
            ? evidence
                .onboardCurrency
            : null
        ).toBe("EUR");

        expect(
          "value" in
            (evidence ?? {})
            ? evidence.value
            : null
        ).toBe(14);
      }
    );

    it(
      "registra el umbral oficial Premium Extra en USD",
      () => {
        const evidence =
          mscMetadata
            .contextualEvidence
            .find(
              (item) =>
                item.id ===
                "premium-extra-threshold-usd"
            );

        expect(
          evidence
        ).toBeDefined();

        expect(
          "onboardCurrency" in
            (evidence ?? {})
            ? evidence
                .onboardCurrency
            : null
        ).toBe("USD");

        expect(
          "value" in
            (evidence ?? {})
            ? evidence.value
            : null
        ).toBe(16);
      }
    );

    it(
      "mantiene documentada la transición legacy sin automatizarla",
      () => {
        const evidence =
          mscMetadata
            .contextualEvidence
            .find(
              (item) =>
                item.id ===
                "legacy-package-transition"
            );

        expect(
          evidence
        ).toBeDefined();

        expect(
          "effectivePurchaseDate" in
            (evidence ?? {})
            ? evidence
                .effectivePurchaseDate
            : null
        ).toBe(
          "2025-10-01"
        );

        expect(
          mscContextualPackageRules
            .some(
              (rule) =>
                rule.id.includes(
                  "legacy"
                )
            )
        ).toBe(false);
      }
    );
  }
);

describe(
  "MSC threshold coverage policy",
  () => {
    it(
      "marca Premium Extra EUR con crédito hasta el threshold y copago por diferencia",
      () => {
        const rules =
          getMatchingContextualPackageRules(
            mscContextualPackageRules,
            {
              cruiseLine:
                "msc",

              market:
                null,

              sailingRegion:
                null,

              onboardCurrency:
                "EUR",

              sailingDate:
                null,
            }
          );

        const rule =
          rules[0];

        expect(
          rule?.rules
            .drinkPriceThresholdCoveragePolicy
        ).toBe(
          "credited-through-threshold"
        );

        expect(
          rule?.rules
            .drinkPriceThresholdChargePolicy
        ).toBe("difference");
      }
    );

    it(
      "marca Premium Extra USD con crédito hasta el threshold y copago por diferencia",
      () => {
        const rules =
          getMatchingContextualPackageRules(
            mscContextualPackageRules,
            {
              cruiseLine:
                "msc",

              market:
                null,

              sailingRegion:
                null,

              onboardCurrency:
                "USD",

              sailingDate:
                null,
            }
          );

        const rule =
          rules[0];

        expect(
          rule?.rules
            .drinkPriceThresholdCoveragePolicy
        ).toBe(
          "credited-through-threshold"
        );

        expect(
          rule?.rules
            .drinkPriceThresholdChargePolicy
        ).toBe("difference");
      }
    );
  }
);

describe(
  "MSC Premium Extra threshold charge policy",
  () => {
    it(
      "resuelve copago por diferencia para el threshold EUR",
      () => {
        const rules =
          getMatchingContextualPackageRules(
            mscContextualPackageRules,
            {
              cruiseLine: "msc",
              market: "ES",
              sailingRegion: null,
              onboardCurrency: "EUR",
              sailingDate: "2026-08-15",
            }
          );

        const thresholdRule =
          rules.find(
            (rule) =>
              rule.id ===
              "msc-premium-extra-threshold-eur"
          );

        expect(
          thresholdRule
            ?.rules
            .drinkPriceThresholdChargePolicy
        ).toBe("difference");
      }
    );

    it(
      "resuelve copago por diferencia para el threshold USD",
      () => {
        const rules =
          getMatchingContextualPackageRules(
            mscContextualPackageRules,
            {
              cruiseLine: "msc",
              market: "US",
              sailingRegion: null,
              onboardCurrency: "USD",
              sailingDate: "2026-08-15",
            }
          );

        const thresholdRule =
          rules.find(
            (rule) =>
              rule.id ===
              "msc-premium-extra-threshold-usd"
          );

        expect(
          thresholdRule
            ?.rules
            .drinkPriceThresholdChargePolicy
        ).toBe("difference");
      }
    );
  }
);
