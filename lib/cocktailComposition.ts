export type CocktailComposition = {
  alcoholicCocktail: number;
  nonAlcoholicCocktail: number;
};

function sanitizeCount(
  value: unknown
): number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  )
    ? value
    : 0;
}

/*
 * Ajusta una de las dos categorías sin
 * permitir que la suma supere el total
 * de cócteles.
 */
export function updateCocktailComposition(
  totalCocktails: number,
  current: CocktailComposition,
  field:
    | "alcoholicCocktail"
    | "nonAlcoholicCocktail",
  requestedValue: number
): CocktailComposition {
  const total =
    sanitizeCount(
      totalCocktails
    );

  const alcoholic =
    sanitizeCount(
      current.alcoholicCocktail
    );

  const nonAlcoholic =
    sanitizeCount(
      current.nonAlcoholicCocktail
    );

  const requested =
    sanitizeCount(
      requestedValue
    );

  if (
    field ===
    "alcoholicCocktail"
  ) {
    const maximum =
      Math.max(
        0,
        total -
          nonAlcoholic
      );

    return {
      alcoholicCocktail:
        Math.min(
          requested,
          maximum
        ),

      nonAlcoholicCocktail:
        nonAlcoholic,
    };
  }

  const maximum =
    Math.max(
      0,
      total -
        alcoholic
    );

  return {
    alcoholicCocktail:
      alcoholic,

    nonAlcoholicCocktail:
      Math.min(
        requested,
        maximum
      ),
  };
}
