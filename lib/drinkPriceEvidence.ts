export type DrinkPriceEvidence =
  | "official"
  | "documented-menu"
  | "secondary"
  | "user";

export type DrinkPriceEvidenceContext = {
  ship?: string | null;
  market?: string | null;
  itinerary?: string | null;
  currency: "EUR" | "USD";
  sourceUrl?: string | null;
  verifiedAt?: string | null;
};

export type DrinkPriceEvidenceRecord = {
  evidence: DrinkPriceEvidence;
  context: DrinkPriceEvidenceContext;
};

export function getDrinkPriceEvidencePriority(
  evidence: DrinkPriceEvidence
): number {
  switch (evidence) {
    case "official":
      return 4;

    case "documented-menu":
      return 3;

    case "secondary":
      return 2;

    case "user":
      return 1;
  }
}

export function isOfficialDrinkPriceEvidence(
  evidence: DrinkPriceEvidence
): boolean {
  return evidence === "official";
}
