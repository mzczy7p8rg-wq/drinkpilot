import {
  costaSpecificDrinkPrices,
  type CostaSpecificDrinkPrice,
} from "@/data/costa/specificDrinkPrices";

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

export function getCostaSpecificDrinkPrices(
  category?: OnboardPriceKey
): readonly CostaSpecificDrinkPrice[] {
  return category
    ? costaSpecificDrinkPrices.filter(
        (item) => item.category === category
      )
    : costaSpecificDrinkPrices;
}

export function getCostaSpecificDrinkPriceById(
  id: string
): CostaSpecificDrinkPrice | null {
  return costaSpecificDrinkPrices.find(
    (item) => item.id === id
  ) ?? null;
}

export function createSelectedDrinkPriceFromCostaReference(
  id: string
): SelectedDrinkPrice | null {
  const reference =
    getCostaSpecificDrinkPriceById(id);

  return reference
    ? createSelectedDrinkPrice({
        category: reference.category,
        price: reference.price,
        currency: reference.currency,
        source: "official",
        referenceId: reference.id,
      })
    : null;
}

export type CostaSpecificDrinkPriceSelection = {
  reference: CostaSpecificDrinkPrice;
  selectedDrinkPrice: SelectedDrinkPrice;
  evidence: DrinkPriceEvidenceRecord;
};

export function resolveCostaSpecificDrinkPriceSelection(
  id: string
): CostaSpecificDrinkPriceSelection | null {
  const reference =
    getCostaSpecificDrinkPriceById(id);
  const selectedDrinkPrice =
    createSelectedDrinkPriceFromCostaReference(id);

  if (!reference || !selectedDrinkPrice) {
    return null;
  }

  return {
    reference,
    selectedDrinkPrice,
    evidence: {
      evidence: reference.evidence,
      context: {
        currency: reference.currency,
        sourceUrl: reference.sourceUrl,
        verifiedAt: reference.verifiedAt,
      },
    },
  };
}
