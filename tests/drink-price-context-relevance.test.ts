import {
  describe,
  expect,
  it,
} from "vitest";

import {
  evaluateDrinkPriceContextRelevance,
} from "@/lib/drinkPriceContextRelevance";

import type {
  CruiseContext,
} from "@/lib/cruiseContext";

import type {
  DrinkPriceEvidenceContext,
} from "@/lib/drinkPriceEvidence";

function createContext(
  overrides:
    Partial<CruiseContext> = {}
): CruiseContext {
  return {
    cruiseLine: "msc",
    market: null,
    sailingRegion: null,
    onboardCurrency: null,
    sailingDate: null,
    ...overrides,
  };
}

function createEvidence(
  overrides:
    Partial<DrinkPriceEvidenceContext> = {}
): DrinkPriceEvidenceContext {
  return {
    currency: "USD",
    ...overrides,
  };
}

describe(
  "drink price context relevance",
  () => {
    it(
      "es exact cuando todo el contexto restringido conocido coincide",
      () => {
        const result =
          evaluateDrinkPriceContextRelevance(
            createContext({
              sailingRegion:
                "North America",
              onboardCurrency:
                "USD",
            }),
            createEvidence({
              sailingRegion:
                "North America",
            })
          );

        expect(result).toEqual({
          relevance: "exact",
          mismatches: [],
          unknowns: [],
        });
      }
    );

    it(
      "es compatible cuando falta contexto del crucero",
      () => {
        const result =
          evaluateDrinkPriceContextRelevance(
            createContext({
              onboardCurrency:
                "USD",
            }),
            createEvidence({
              sailingRegion:
                "North America",
              ship:
                "MSC World America",
            })
          );

        expect(
          result.relevance
        ).toBe("compatible");

        expect(
          result.mismatches
        ).toEqual([]);

        expect(
          result.unknowns
        ).toEqual([
          "sailingRegion",
          "ship",
        ]);
      }
    );

    it(
      "detecta moneda incompatible",
      () => {
        const result =
          evaluateDrinkPriceContextRelevance(
            createContext({
              onboardCurrency:
                "EUR",
            }),
            createEvidence({
              currency:
                "USD",
            })
          );

        expect(
          result.relevance
        ).toBe("mismatch");

        expect(
          result.mismatches
        ).toContain(
          "currency"
        );
      }
    );

    it(
      "detecta mercado incompatible",
      () => {
        const result =
          evaluateDrinkPriceContextRelevance(
            createContext({
              market:
                "Europe",
              onboardCurrency:
                "USD",
            }),
            createEvidence({
              market:
                "North America",
              currency:
                "USD",
            })
          );

        expect(
          result.relevance
        ).toBe("mismatch");

        expect(
          result.mismatches
        ).toContain(
          "market"
        );
      }
    );

    it(
      "detecta región de navegación incompatible sin confundirla con el mercado",
      () => {
        const result =
          evaluateDrinkPriceContextRelevance(
            createContext({
              market: "US",
              sailingRegion:
                "Europe",
              onboardCurrency:
                "USD",
            }),
            createEvidence({
              sailingRegion:
                "North America",
              currency:
                "USD",
            })
          );

        expect(
          result.mismatches
        ).toContain(
          "sailingRegion"
        );

        expect(
          result.mismatches
        ).not.toContain("market");
      }
    );

    it(
      "no penaliza campos que la evidencia no restringe",
      () => {
        const result =
          evaluateDrinkPriceContextRelevance(
            createContext({
              onboardCurrency:
                "USD",
            }),
            createEvidence()
          );

        expect(result).toEqual({
          relevance: "exact",
          mismatches: [],
          unknowns: [],
        });
      }
    );

    it(
      "no trata un barco documental desconocido como coincidencia exacta",
      () => {
        const result =
          evaluateDrinkPriceContextRelevance(
            createContext({
              onboardCurrency:
                "USD",
            }),
            createEvidence({
              ship:
                "MSC World America",
            })
          );

        expect(
          result.relevance
        ).toBe("compatible");

        expect(
          result.unknowns
        ).toContain("ship");
      }
    );
  }
);
