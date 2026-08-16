import {
  costaDocumentedDrinkPrices,
  type CostaDocumentedDrinkPrice,
} from "@/data/costa/documentedDrinkPrices";

import type {
  CruiseContext,
} from "@/lib/cruiseContext";

import {
  evaluateDrinkPriceContextRelevance,
  type DrinkPriceContextRelevanceResult,
} from "@/lib/drinkPriceContextRelevance";

import type {
  DrinkPriceEvidenceRecord,
} from "@/lib/drinkPriceEvidence";

import type {
  OnboardPriceKey,
} from "@/lib/onboardPriceService";

import {
  createSelectedDrinkPrice,
  type SelectedDrinkPrice,
} from "@/lib/selectedDrinkPrice";

import type {
  PackageKey,
} from "@/lib/packageService";

export type CostaDocumentedDrinkPriceQuery = {
  category?: OnboardPriceKey;
  ship?: string;
  sailingRegion?: string;
  itinerary?: string;
  menuName?: string;
  currency?: "EUR" | "USD";
  observedAt?: string;
};

function matchesOptionalString(
  actual: string | null | undefined,
  expected: string | undefined
): boolean {
  return expected === undefined ||
    actual === expected;
}

export function getCostaDocumentedDrinkPrices(
  query: CostaDocumentedDrinkPriceQuery = {}
): readonly CostaDocumentedDrinkPrice[] {
  return costaDocumentedDrinkPrices.filter(
    (item) =>
      (query.category === undefined ||
        item.category === query.category) &&
      (query.currency === undefined ||
        item.currency === query.currency) &&
      matchesOptionalString(item.ship, query.ship) &&
      matchesOptionalString(
        item.sailingRegion,
        query.sailingRegion
      ) &&
      matchesOptionalString(
        item.itinerary,
        query.itinerary
      ) &&
      matchesOptionalString(
        item.menuName,
        query.menuName
      ) &&
      matchesOptionalString(
        item.observedAt,
        query.observedAt
      )
  );
}

export function getCostaDocumentedDrinkPriceById(
  id: string
): CostaDocumentedDrinkPrice | null {
  return costaDocumentedDrinkPrices.find(
    (item) => item.id === id
  ) ?? null;
}

export type CostaDocumentedPackageCoverageResolution = {
  status:
    CostaDocumentedDrinkPrice["packageCoverage"][keyof CostaDocumentedDrinkPrice["packageCoverage"]];
  referenceId: string;
  sourceUrl: string;
  evidence: "documented-menu";
};

export function resolveCostaDocumentedPackageCoverage(
  referenceId: string,
  packageKey: PackageKey
): CostaDocumentedPackageCoverageResolution | null {
  const reference =
    getCostaDocumentedDrinkPriceById(referenceId);

  if (
    !reference ||
    !(
      packageKey in
      reference.packageCoverage
    )
  ) {
    return null;
  }

  const status =
    reference.packageCoverage[
      packageKey as keyof typeof reference.packageCoverage
    ];

  return {
    status,
    referenceId: reference.id,
    sourceUrl: reference.sourceUrl,
    evidence: reference.evidence,
  };
}

export function createSelectedDrinkPriceFromCostaDocumentedReference(
  id: string
): SelectedDrinkPrice | null {
  const reference =
    getCostaDocumentedDrinkPriceById(id);

  return reference
    ? createSelectedDrinkPrice({
        category: reference.category,
        price: reference.price,
        currency: reference.currency,
        source: "documented-menu",
        referenceId: reference.id,
      })
    : null;
}

export type CostaDocumentedDrinkPriceSelection = {
  reference: CostaDocumentedDrinkPrice;
  selectedDrinkPrice: SelectedDrinkPrice;
  evidence: DrinkPriceEvidenceRecord;
};

export function resolveCostaDocumentedDrinkPriceSelection(
  id: string
): CostaDocumentedDrinkPriceSelection | null {
  const reference =
    getCostaDocumentedDrinkPriceById(id);
  const selectedDrinkPrice =
    createSelectedDrinkPriceFromCostaDocumentedReference(id);

  if (!reference || !selectedDrinkPrice) {
    return null;
  }

  return {
    reference,
    selectedDrinkPrice,
    evidence: {
      evidence: reference.evidence,
      context: {
        ship: reference.ship,
        sailingRegion: reference.sailingRegion,
        itinerary: reference.itinerary,
        currency: reference.currency,
        sourceUrl: reference.sourceUrl,
        verifiedAt: reference.observedAt,
      },
    },
  };
}

export type CostaContextualDocumentedDrinkPriceSelection =
  CostaDocumentedDrinkPriceSelection & {
    contextRelevance: DrinkPriceContextRelevanceResult;
  };

export function resolveCostaDocumentedDrinkPriceSelectionForContext(
  id: string,
  cruiseContext: CruiseContext
): CostaContextualDocumentedDrinkPriceSelection | null {
  const selection =
    resolveCostaDocumentedDrinkPriceSelection(id);

  return selection
    ? {
        ...selection,
        contextRelevance:
          evaluateDrinkPriceContextRelevance(
            cruiseContext,
            selection.evidence.context
          ),
      }
    : null;
}
