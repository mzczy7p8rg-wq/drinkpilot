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
    number | null
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
  };
}

describe(
  "operational impact explanation",
  () => {
    it(
      "crea advertencia cuando el consumo supera el límite",
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
            .packageKey
        ).toBe("mscEasy");

        expect(
          explanations[0]
            .message
        ).toContain(
          "supera en 3"
        );

        expect(
          explanations[0]
            .message
        ).toContain(
          "límite operativo conocido de 15"
        );

        expect(
          explanations[0]
            .message
        ).toContain(
          "todavía no aplica este exceso al cálculo económico"
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
