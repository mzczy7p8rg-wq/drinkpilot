import {
  isNonNegativeSafeInteger,
} from "@/lib/wizardNumberValidation";

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
  return isNonNegativeSafeInteger(value)
    ? value
    : isNonNegativeSafeInteger(fallback)
      ? fallback
      : 0;
}

function sanitizeOptionalCount(
  value: unknown
): number | null {
  return isNonNegativeSafeInteger(value)
    ? value
    : null;
}

export function resolveStoredCocktailConsumption(
  input: StoredCocktailConsumptionInput,
  fallbackCocktail = 0
): StoredCocktailConsumption {
  const cocktail =
    sanitizeCount(
      input.cocktail,
      fallbackCocktail
    );

  const storedAlcoholicCocktail =
    sanitizeOptionalCount(
      input.alcoholicCocktail
    );

  const storedNonAlcoholicCocktail =
    sanitizeOptionalCount(
      input.nonAlcoholicCocktail
    );

  let alcoholicCocktail =
    storedAlcoholicCocktail !== null &&
    storedAlcoholicCocktail <= cocktail
      ? storedAlcoholicCocktail
      : null;

  let nonAlcoholicCocktail =
    storedNonAlcoholicCocktail !== null &&
    storedNonAlcoholicCocktail <= cocktail
      ? storedNonAlcoholicCocktail
      : null;

  /*
   * Si ambos valores existen pero su suma
   * supera el total, no podemos saber cuál
   * de los dos era correcto. Descartamos el
   * reparto completo sin inventar datos.
   */
  if (
    alcoholicCocktail !== null &&
    nonAlcoholicCocktail !== null &&
    alcoholicCocktail >
      cocktail - nonAlcoholicCocktail
  ) {
    alcoholicCocktail = null;
    nonAlcoholicCocktail = null;
  }

  return {
    cocktail,
    alcoholicCocktail,
    nonAlcoholicCocktail,
  };
}
