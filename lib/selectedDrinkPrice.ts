import type {
  OnboardPriceKey,
} from "@/lib/onboardPriceService";

export type SelectedDrinkPriceSource =
  | "user"
  | "official"
  | "documented-menu";

export type SelectedDrinkPrice = {
  category:
    OnboardPriceKey;

  price:
    number;

  currency:
    string;

  source:
    SelectedDrinkPriceSource;
};

export type SelectedDrinkPriceInput = {
  category:
    OnboardPriceKey;

  price:
    number | null | undefined;

  currency:
    string | null | undefined;

  source?:
    SelectedDrinkPriceSource;
};

function normalizeCurrency(
  value:
    string | null | undefined
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value.trim().toUpperCase();

  return normalized.length > 0
    ? normalized
    : null;
}

function normalizePrice(
  value:
    number | null | undefined
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return null;
  }

  return value;
}

export function createSelectedDrinkPrice(
  input:
    SelectedDrinkPriceInput
): SelectedDrinkPrice | null {
  const price =
    normalizePrice(
      input.price
    );

  const currency =
    normalizeCurrency(
      input.currency
    );

  if (
    price === null ||
    currency === null
  ) {
    return null;
  }

  return {
    category:
      input.category,

    price,

    currency,

    source:
      input.source ?? "user",
  };
}
