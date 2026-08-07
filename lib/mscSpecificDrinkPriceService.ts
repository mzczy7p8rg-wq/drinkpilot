import {
  mscSpecificDrinkPrices,
  type MscSpecificDrinkPrice,
} from "@/data/msc/specificDrinkPrices";

import {
  createSelectedDrinkPrice,
  type SelectedDrinkPrice,
} from "@/lib/selectedDrinkPrice";

import type {
  OnboardPriceKey,
} from "@/lib/onboardPriceService";

export function getMscSpecificDrinkPrices(
  category?: OnboardPriceKey
): readonly MscSpecificDrinkPrice[] {
  if (!category) {
    return mscSpecificDrinkPrices;
  }

  return mscSpecificDrinkPrices.filter(
    (item) =>
      item.category === category
  );
}

export function getMscSpecificDrinkPriceById(
  id: string
): MscSpecificDrinkPrice | null {
  return (
    mscSpecificDrinkPrices.find(
      (item) => item.id === id
    ) ?? null
  );
}

export function createSelectedDrinkPriceFromMscReference(
  id: string
): SelectedDrinkPrice | null {
  const reference =
    getMscSpecificDrinkPriceById(id);

  if (!reference) {
    return null;
  }

  return createSelectedDrinkPrice({
    category: reference.category,
    price: reference.price,
    currency: reference.currency,
    source: "official",
  });
}
