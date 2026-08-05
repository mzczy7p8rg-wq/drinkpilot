import {
  describe,
  expect,
  it,
} from "vitest";

import {
  mscContextualPackageRules,
} from "@/data/msc/contextualRules";

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
