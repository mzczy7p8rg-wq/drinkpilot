import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getDrinkPriceEvidencePriority,
  isOfficialDrinkPriceEvidence,
  type DrinkPriceEvidenceRecord,
} from "@/lib/drinkPriceEvidence";

describe(
  "drink price evidence",
  () => {
    it(
      "distingue los cuatro niveles de evidencia",
      () => {
        expect(
          getDrinkPriceEvidencePriority(
            "official"
          )
        ).toBeGreaterThan(
          getDrinkPriceEvidencePriority(
            "documented-menu"
          )
        );

        expect(
          getDrinkPriceEvidencePriority(
            "documented-menu"
          )
        ).toBeGreaterThan(
          getDrinkPriceEvidencePriority(
            "secondary"
          )
        );

        expect(
          getDrinkPriceEvidencePriority(
            "secondary"
          )
        ).toBeGreaterThan(
          getDrinkPriceEvidencePriority(
            "user"
          )
        );
      }
    );

    it(
      "solo considera official como evidencia oficial",
      () => {
        expect(
          isOfficialDrinkPriceEvidence(
            "official"
          )
        ).toBe(true);

        expect(
          isOfficialDrinkPriceEvidence(
            "documented-menu"
          )
        ).toBe(false);

        expect(
          isOfficialDrinkPriceEvidence(
            "secondary"
          )
        ).toBe(false);

        expect(
          isOfficialDrinkPriceEvidence(
            "user"
          )
        ).toBe(false);
      }
    );

    it(
      "permite contextualizar una referencia",
      () => {
        const record:
          DrinkPriceEvidenceRecord = {
          evidence:
            "documented-menu",

          context: {
            ship:
              "MSC World America",

            market:
              "North America",

            itinerary:
              null,

            currency:
              "USD",

            sourceUrl:
              "https://example.com/menu",

            verifiedAt:
              "2026-08-07",
          },
        };

        expect(
          record.context.ship
        ).toBe(
          "MSC World America"
        );

        expect(
          record.context.currency
        ).toBe("USD");

        expect(
          record.evidence
        ).toBe(
          "documented-menu"
        );
      }
    );

    it(
      "no obliga a inventar contexto desconocido",
      () => {
        const record:
          DrinkPriceEvidenceRecord = {
          evidence:
            "user",

          context: {
            currency:
              "EUR",
          },
        };

        expect(
          record.context.ship
        ).toBeUndefined();

        expect(
          record.context.market
        ).toBeUndefined();

        expect(
          record.context.sourceUrl
        ).toBeUndefined();
      }
    );
  }
);
