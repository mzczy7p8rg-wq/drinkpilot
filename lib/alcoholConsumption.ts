export type AlcoholConsumptionInput = {
  beer: number;
  wine: number;

  /*
   * Cantidad legacy de cócteles.
   *
   * Sabemos cuántos cócteles consume
   * el usuario, pero este valor por sí
   * solo no permite saber cuántos
   * contienen alcohol.
   */
  cocktail: number;

  /*
   * Cantidades V2.
   *
   * null/undefined = composición
   * todavía desconocida.
   */
  alcoholicCocktail?:
    number | null;

  nonAlcoholicCocktail?:
    number | null;
};

export type AlcoholConsumptionResolution = {
  /*
   * Bebidas inequívocamente alcohólicas
   * que conocemos por día.
   */
  knownAlcoholicDrinksPerDay:
    number;

  /*
   * Indica si conocemos completamente
   * la composición alcohólica de los
   * cócteles legacy.
   */
  cocktailCompositionKnown:
    boolean;

  /*
   * Solo existe cuando la composición
   * de los cócteles es completa.
   *
   * null significa que NO debemos usar
   * este valor para aplicar límites
   * operativos.
   */
  alcoholicDrinksPerDay:
    number | null;
};

function sanitizeCount(
  value: unknown
): number | null {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  )
    ? value
    : null;
}

export function resolveAlcoholConsumption(
  input: AlcoholConsumptionInput
): AlcoholConsumptionResolution {
  const beer =
    sanitizeCount(input.beer) ?? 0;

  const wine =
    sanitizeCount(input.wine) ?? 0;

  const legacyCocktail =
    sanitizeCount(
      input.cocktail
    ) ?? 0;

  const alcoholicCocktail =
    sanitizeCount(
      input.alcoholicCocktail
    );

  const nonAlcoholicCocktail =
    sanitizeCount(
      input.nonAlcoholicCocktail
    );

  /*
   * Solo consideramos conocida la
   * composición cuando tenemos ambos
   * componentes V2 y juntos explican
   * exactamente el total legacy.
   *
   * Así evitamos inferencias silenciosas.
   */
  const cocktailCompositionKnown =
    alcoholicCocktail !== null &&
    nonAlcoholicCocktail !== null &&
    alcoholicCocktail +
      nonAlcoholicCocktail ===
      legacyCocktail;

  const knownAlcoholicDrinksPerDay =
    beer +
    wine +
    (alcoholicCocktail ?? 0);

  return {
    knownAlcoholicDrinksPerDay,

    cocktailCompositionKnown,

    alcoholicDrinksPerDay:
      cocktailCompositionKnown
        ? knownAlcoholicDrinksPerDay
        : null,
  };
}
