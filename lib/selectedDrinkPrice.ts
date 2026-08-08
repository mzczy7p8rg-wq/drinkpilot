import type {
  OnboardPriceKey,
} from "@/lib/onboardPriceService";

export type SelectedDrinkPriceSource =
  | "user"
  | "official"
  | "documented-menu";

export type SelectedDrinkPriceContextRelevance =
  | "exact"
  | "compatible";

export type SelectedDrinkPrice = {
  category:
    OnboardPriceKey;

  price:
    number;

  currency:
    string;

  source:
    SelectedDrinkPriceSource;

  referenceId?:
    string;

  contextRelevance?:
    SelectedDrinkPriceContextRelevance;
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

  referenceId?:
    string | null;

  contextRelevance?:
    SelectedDrinkPriceContextRelevance;
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

function normalizeReferenceId(
  value:
    string | null | undefined
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized.length > 0
    ? normalized
    : null;
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

  const source =
    input.source ?? "user";

  const referenceId =
    source === "user"
      ? null
      : normalizeReferenceId(
          input.referenceId
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
      source,

    ...(referenceId
      ? {
          referenceId,
        }
      : {}),

    ...(source === "documented-menu" &&
    (input.contextRelevance === "exact" ||
      input.contextRelevance === "compatible")
      ? {
          contextRelevance:
            input.contextRelevance,
        }
      : {}),
  };
}
