export type StoredCocktailConsumptionInput = {
  cocktail?: unknown;

  alcoholicCocktail?: unknown;

  nonAlcoholicCocktail?: unknown;
};

export type StoredCocktailConsumption = {
  cocktail: number;

  alcoholicCocktail:
    number | null;

  nonAlcoholicCocktail:
    number | null;
};

function sanitizeCount(
  value: unknown,
  fallback: number
): number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= 0
  )
    ? value
    : fallback;
}

function sanitizeOptionalCount(
  value: unknown
): number | null {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= 0
  )
    ? value
    : null;
}

export function resolveStoredCocktailConsumption(
  input: StoredCocktailConsumptionInput,
  fallbackCocktail = 0
): StoredCocktailConsumption {
  return {
    cocktail:
      sanitizeCount(
        input.cocktail,
        fallbackCocktail
      ),

    alcoholicCocktail:
      sanitizeOptionalCount(
        input.alcoholicCocktail
      ),

    nonAlcoholicCocktail:
      sanitizeOptionalCount(
        input.nonAlcoholicCocktail
      ),
  };
}
