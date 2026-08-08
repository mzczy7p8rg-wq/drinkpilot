import type {
  CruiseContext,
} from "@/lib/cruiseContext";

import type {
  DrinkPriceEvidenceContext,
} from "@/lib/drinkPriceEvidence";

export type DrinkPriceContextRelevance =
  | "exact"
  | "compatible"
  | "mismatch";

export type DrinkPriceContextRelevanceResult = {
  relevance:
    DrinkPriceContextRelevance;

  mismatches:
    readonly string[];

  unknowns:
    readonly string[];
};

function normalizeOptionalString(
  value:
    string | null | undefined
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value.trim().toLowerCase();

  return normalized.length > 0
    ? normalized
    : null;
}

function compareOptionalContextValue(
  field: string,
  cruiseValue:
    string | null | undefined,
  evidenceValue:
    string | null | undefined,
  mismatches: string[],
  unknowns: string[]
) {
  const cruise =
    normalizeOptionalString(
      cruiseValue
    );

  const evidence =
    normalizeOptionalString(
      evidenceValue
    );

  /*
   * Si la evidencia no restringe este
   * campo, no reduce la pertinencia.
   */
  if (evidence === null) {
    return;
  }

  /*
   * La referencia sí tiene contexto,
   * pero todavía no conocemos el del
   * crucero del usuario.
   */
  if (cruise === null) {
    unknowns.push(field);
    return;
  }

  if (cruise !== evidence) {
    mismatches.push(field);
  }
}

export function evaluateDrinkPriceContextRelevance(
  cruiseContext:
    CruiseContext,
  evidenceContext:
    DrinkPriceEvidenceContext
): DrinkPriceContextRelevanceResult {
  const mismatches:
    string[] = [];

  const unknowns:
    string[] = [];

  compareOptionalContextValue(
    "market",
    cruiseContext.market,
    evidenceContext.market,
    mismatches,
    unknowns
  );

  compareOptionalContextValue(
    "currency",
    cruiseContext.onboardCurrency,
    evidenceContext.currency,
    mismatches,
    unknowns
  );

  compareOptionalContextValue(
    "sailingRegion",
    cruiseContext.sailingRegion,
    evidenceContext.sailingRegion,
    mismatches,
    unknowns
  );

  /*
   * CruiseContext todavía no contiene
   * un barco concreto ni itinerario
   * textual equivalente al contexto
   * documental.
   *
   * Si la evidencia los restringe,
   * conservamos esa incertidumbre en
   * vez de fingir una coincidencia.
   */
  if (
    normalizeOptionalString(
      evidenceContext.ship
    ) !== null
  ) {
    unknowns.push("ship");
  }

  if (
    normalizeOptionalString(
      evidenceContext.itinerary
    ) !== null
  ) {
    unknowns.push("itinerary");
  }

  if (mismatches.length > 0) {
    return {
      relevance: "mismatch",
      mismatches,
      unknowns,
    };
  }

  if (unknowns.length > 0) {
    return {
      relevance: "compatible",
      mismatches,
      unknowns,
    };
  }

  return {
    relevance: "exact",
    mismatches,
    unknowns,
  };
}
