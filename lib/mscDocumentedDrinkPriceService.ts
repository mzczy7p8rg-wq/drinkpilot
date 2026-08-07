import {
  mscDocumentedDrinkPrices,
  type MscDocumentedDrinkPrice,
} from "@/data/msc/documentedDrinkPrices";

import type {
  OnboardPriceKey,
} from "@/lib/onboardPriceService";

export type MscDocumentedDrinkPriceQuery = {
  category?: OnboardPriceKey;
  ship?: string;
  market?: string;
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
        item.market,
        query.market
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
