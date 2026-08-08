import type {
  SelectedDrinkPrice,
  SelectedDrinkPriceSource,
} from "@/lib/selectedDrinkPrice";

import {
  onboardPriceKeys,
  type OnboardPriceKey,
} from "@/lib/onboardPriceService";

export type DrinkPriceReferenceSource =
  Exclude<
    SelectedDrinkPriceSource,
    "user"
  >;

export type DrinkPriceReferenceSelection = {
  referenceIds:
    Partial<
      Record<
        OnboardPriceKey,
        string
      >
    >;

  referenceSources:
    Partial<
      Record<
        OnboardPriceKey,
        DrinkPriceReferenceSource
      >
    >;
};

export function resolveDrinkPriceSelectionSource(
  referenceId:
    string | null | undefined,

  referenceSource:
    DrinkPriceReferenceSource =
      "official"
): SelectedDrinkPriceSource {
  if (!referenceId) {
    return "user";
  }

  return referenceSource;
}

export function resolveDrinkPriceReferenceSelection(
  selectedDrinkPrices:
    Partial<
      Record<
        OnboardPriceKey,
        SelectedDrinkPrice
      >
    >
): DrinkPriceReferenceSelection {
  const referenceIds:
    DrinkPriceReferenceSelection["referenceIds"] =
      {};

  const referenceSources:
    DrinkPriceReferenceSelection["referenceSources"] =
      {};

  for (
    const category of onboardPriceKeys
  ) {
    const selectedPrice =
      selectedDrinkPrices[
        category
      ];

    if (
      !selectedPrice
    ) {
      continue;
    }

    if (
      selectedPrice.source !== "official" &&
      selectedPrice.source !==
        "documented-menu"
    ) {
      continue;
    }

    if (
      typeof selectedPrice.referenceId !==
        "string" ||
      selectedPrice.referenceId.trim() ===
        ""
    ) {
      continue;
    }

    referenceIds[category] =
      selectedPrice.referenceId;

    referenceSources[category] =
      selectedPrice.source;
  }

  return {
    referenceIds,
    referenceSources,
  };
}
