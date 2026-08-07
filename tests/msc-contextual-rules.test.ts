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
      "no activa reglas contextuales MSC sin evidencia registrada",
      () => {
        expect(
          mscContextualPackageRules
        ).toEqual([]);
      }
    );

    it(
      "no fabrica reglas para un contexto MSC completo",
      () => {
        const rules =
          getMatchingContextualPackageRules(
            mscContextualPackageRules,
            {
              cruiseLine: "msc",
              market: "ES",
              sailingDate:
                "2026-08-15",
            }
          );

        expect(
          rules
        ).toEqual([]);
      }
    );

    it(
      "no fabrica reglas cuando faltan mercado y fecha",
      () => {
        const rules =
          getMatchingContextualPackageRules(
            mscContextualPackageRules,
            {
              cruiseLine: "msc",
              market: null,
              sailingDate: null,
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
          evidence
            ?.packageKey
        ).toBe(
          "mscPremiumExtra"
        );

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

        expect(
          evidence
            ?.status
        ).toBe("verified");
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

        expect(
          evidence
            ?.status
        ).toBe("verified");
      }
    );

    it(
      "registra la transición legacy sin convertirla todavía en regla",
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

        /*
         * La evidencia legacy existe,
         * pero todavía no debe activar
         * ninguna regla automática.
         */
        expect(
          mscContextualPackageRules
        ).toEqual([]);
      }
    );
  }
);
