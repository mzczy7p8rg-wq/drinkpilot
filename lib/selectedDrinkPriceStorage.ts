import type {
  OnboardPriceKey,
} from "@/lib/onboardPriceService";

import {
  createSelectedDrinkPrice,
  type SelectedDrinkPrice,
} from "@/lib/selectedDrinkPrice";

export type StoredSelectedDrinkPrices =
  Partial<
    Record<
      OnboardPriceKey,
      {
        price?: unknown;
        currency?: unknown;
        source?: unknown;
        referenceId?: unknown;
        contextRelevance?: unknown;
      }
    >
  >;

export type SelectedDrinkPrices =
  Partial<
    Record<
      OnboardPriceKey,
      SelectedDrinkPrice
    >
  >;

const ONBOARD_PRICE_KEYS: OnboardPriceKey[] =
  [
    "coffee",
    "water",
    "soda",
    "beer",
    "wine",
    "cocktail",
  ];

export function resolveStoredSelectedDrinkPrices(
  input: unknown
): SelectedDrinkPrices {
  if (
    typeof input !== "object" ||
    input === null ||
    Array.isArray(input)
  ) {
    return {};
  }

  const stored =
    input as StoredSelectedDrinkPrices;

  const result:
    SelectedDrinkPrices = {};

  for (
    const category of ONBOARD_PRICE_KEYS
  ) {
    const candidate =
      stored[category];

    if (
      typeof candidate !== "object" ||
      candidate === null ||
      Array.isArray(candidate)
    ) {
      continue;
    }

    const price =
      createSelectedDrinkPrice({
        category,

        price:
          typeof candidate.price ===
          "number"
            ? candidate.price
            : null,

        currency:
          typeof candidate.currency ===
          "string"
            ? candidate.currency
            : null,

        source:
          candidate.source === "official" ||
          candidate.source === "documented-menu"
            ? candidate.source
            : "user",

        referenceId:
          typeof candidate.referenceId ===
          "string"
            ? candidate.referenceId
            : null,

        contextRelevance:
          candidate.contextRelevance === "exact" ||
          candidate.contextRelevance === "compatible"
            ? candidate.contextRelevance
            : undefined,
      });

    if (price !== null) {
      result[category] =
        price;
    }
  }

  return result;
}
