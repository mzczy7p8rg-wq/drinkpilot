import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildOperationalImpactExplanations,
} from "@/lib/operationalImpactExplanation";

import type {
  PackageOperationalRuleImpact,
} from "@/lib/operationalRuleImpact";

function createImpact(
  status:
    PackageOperationalRuleImpact[
      "alcoholDailyLimit"
    ]["status"],
  alcoholicDrinksPerDay:
    number | null,
  alcoholicDrinksDailyLimit:
    number | null,
  excessDrinksPerDay:
    number | null,
  chargePolicy:
    PackageOperationalRuleImpact[
      "economicImpact"
    ]["chargePolicy"] = "unknown"
): PackageOperationalRuleImpact {
  return {
    packageKey: "mscEasy",
    packageName: "Easy Package",

    alcoholDailyLimit: {
      status,
      alcoholicDrinksPerDay,
      alcoholicDrinksDailyLimit,
      excessDrinksPerDay,
    },

    alcoholDailyLimitSource: {
      source: "base",
      contextualRuleIds: [],
    },

    alcoholDailyLimitChargePolicySource: {
      source:
        chargePolicy === "unknown"
          ? "none"
          : "contextual",
      contextualRuleIds:
        chargePolicy === "unknown"
          ? []
          : [
              "test-alcohol-limit-charge-policy",
            ],
    },

    economicImpact: {
      status:
        status === "over-limit"
          ? "known-unquantified"
          : status === "unknown"
            ? "unknown"
            : "none",

      excessDrinksPerDay,

      chargePolicy,

      additionalCostPerDay:
        status === "over-limit" ||
        status === "unknown"
          ? null
          : 0,
    },
  };
}

describe(
  "operational impact explanation",
  () => {
    it(
      "separa impacto operativo e incertidumbre económica",
      () => {
        const explanations =
          buildOperationalImpactExplanations([
            createImpact(
              "over-limit",
              18,
              15,
              3
            ),
          ]);

        expect(
          explanations
        ).toHaveLength(1);

        expect(
          explanations[0]
            .severity
        ).toBe("warning");

        expect(
          explanations[0]
            .operationalMessage
        ).toContain(
          "supera en 3"
        );

        expect(
          explanations[0]
            .operationalMessage
        ).toContain(
          "límite operativo conocido de 15"
        );

        expect(
          explanations[0]
            .operationalMessage
        ).not.toContain(
          "cálculo económico"
        );

        expect(
          explanations[0]
            .economicMessage
        ).toContain(
          "no permiten cuantificarlo"
        );

        expect(
          explanations[0]
            .economicMessage
        ).toContain(
          "no lo incorpora todavía al cálculo económico"
        );
      }
    );

    it(
      "explica precio completo más propinas sin fingir un coste exacto",
      () => {
        const explanation =
          buildOperationalImpactExplanations([
            createImpact(
              "over-limit",
              18,
              15,
              3,
              "full-price-plus-gratuities"
            ),
          ])[0];

        expect(
          explanation
            .economicMessage
        ).toContain(
          "precio completo más propinas"
        );

        expect(
          explanation
            .economicMessage
        ).toContain(
          "no puede cuantificar"
        );
      }
    );

    it(
      "no crea advertencia por debajo del límite",
      () => {
        expect(
          buildOperationalImpactExplanations([
            createImpact(
              "within-limit",
              14,
              15,
              0
            ),
          ])
        ).toEqual([]);
      }
    );

    it(
      "no crea advertencia exactamente en el límite",
      () => {
        expect(
          buildOperationalImpactExplanations([
            createImpact(
              "at-limit",
              15,
              15,
              0
            ),
          ])
        ).toEqual([]);
      }
    );

    it(
      "no crea advertencia cuando el impacto es desconocido",
      () => {
        expect(
          buildOperationalImpactExplanations([
            createImpact(
              "unknown",
              null,
              15,
              null
            ),
          ])
        ).toEqual([]);
      }
    );
  }
);
