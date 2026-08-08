import {
  mscDocumentedDrinkPrices,
  type MscDocumentedDrinkPrice,
} from "@/data/msc/documentedDrinkPrices";

import type {
  OnboardPriceKey,
} from "@/lib/onboardPriceService";

import {
  createSelectedDrinkPrice,
  type SelectedDrinkPrice,
} from "@/lib/selectedDrinkPrice";

import type {
  DrinkPriceEvidenceRecord,
} from "@/lib/drinkPriceEvidence";

import type {
  CruiseContext,
} from "@/lib/cruiseContext";

import {
  evaluateDrinkPriceContextRelevance,
  type DrinkPriceContextRelevanceResult,
} from "@/lib/drinkPriceContextRelevance";

export type MscDocumentedDrinkPriceQuery = {
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
  return expected === undefined
    ? true
    : actual === expected;
}

export function getMscDocumentedDrinkPrices(
  query: MscDocumentedDrinkPriceQuery = {}
): readonly MscDocumentedDrinkPrice[] {
  return mscDocumentedDrinkPrices.filter(
    (item) =>
      (query.category === undefined ||
        item.category === query.category) &&
      (query.currency === undefined ||
        item.currency === query.currency) &&
      matchesOptionalString(
        item.ship,
        query.ship
      ) &&
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

export function getMscDocumentedDrinkPriceById(
  id: string
): MscDocumentedDrinkPrice | null {
  return (
    mscDocumentedDrinkPrices.find(
      (item) => item.id === id
    ) ?? null
  );
}

export function createSelectedDrinkPriceFromMscDocumentedReference(
  id: string
): SelectedDrinkPrice | null {
  const reference =
    getMscDocumentedDrinkPriceById(id);

  if (!reference) {
    return null;
  }

  return createSelectedDrinkPrice({
    category:
      reference.category,

    price:
      reference.price,

    currency:
      reference.currency,

    source:
      "documented-menu",

    referenceId:
      reference.id,
  });
}

export type MscDocumentedDrinkPriceSelection = {
  reference:
    MscDocumentedDrinkPrice;

  selectedDrinkPrice:
    SelectedDrinkPrice;

  evidence:
    DrinkPriceEvidenceRecord;
};

export function resolveMscDocumentedDrinkPriceSelection(
  id: string
): MscDocumentedDrinkPriceSelection | null {
  const reference =
    getMscDocumentedDrinkPriceById(id);

  if (!reference) {
    return null;
  }

  const selectedDrinkPrice =
    createSelectedDrinkPriceFromMscDocumentedReference(
      id
    );

  if (!selectedDrinkPrice) {
    return null;
  }

  return {
    reference,

    selectedDrinkPrice,

    evidence: {
      evidence:
        reference.evidence,

      context: {
        ship:
          reference.ship,

        sailingRegion:
          reference.sailingRegion,

        itinerary:
          reference.itinerary,

        currency:
          reference.currency,

        sourceUrl:
          reference.sourceUrl,

        verifiedAt:
          reference.observedAt,
      },
    },
  };
}

export type MscContextualDocumentedDrinkPriceSelection =
  MscDocumentedDrinkPriceSelection & {
    contextRelevance:
      DrinkPriceContextRelevanceResult;
  };

export function resolveMscDocumentedDrinkPriceSelectionForContext(
  id: string,
  cruiseContext: CruiseContext
): MscContextualDocumentedDrinkPriceSelection | null {
  const selection =
    resolveMscDocumentedDrinkPriceSelection(
      id
    );

  if (!selection) {
    return null;
  }

  return {
    ...selection,

    contextRelevance:
      evaluateDrinkPriceContextRelevance(
        cruiseContext,
        selection.evidence.context
      ),
  };
}
