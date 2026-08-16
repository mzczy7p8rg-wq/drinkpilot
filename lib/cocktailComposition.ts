export type CocktailComposition = {
  alcoholicCocktail: number;
  nonAlcoholicCocktail: number;
};

export type OptionalCocktailComposition = {
  alcoholicCocktail: number | null;
  nonAlcoholicCocktail: number | null;
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

/*
 * En el formulario, 0 + 0 significa que el usuario
 * todavía no ha especificado el reparto opcional.
 * Cualquier reparto con al menos una bebida conserva
 * los ceros como valores explícitos y conocidos.
 */
export function updateOptionalCocktailComposition(
  totalCocktails: number,
  current: OptionalCocktailComposition,
  field:
    | "alcoholicCocktail"
    | "nonAlcoholicCocktail",
  requestedValue: number
): OptionalCocktailComposition {
  const composition =
    updateCocktailComposition(
      totalCocktails,
      {
        alcoholicCocktail:
          current.alcoholicCocktail ?? 0,
        nonAlcoholicCocktail:
          current.nonAlcoholicCocktail ?? 0,
      },
      field,
      requestedValue
    );

  if (
    composition.alcoholicCocktail === 0 &&
    composition.nonAlcoholicCocktail === 0
  ) {
    return {
      alcoholicCocktail: null,
      nonAlcoholicCocktail: null,
    };
  }

  return composition;
}
