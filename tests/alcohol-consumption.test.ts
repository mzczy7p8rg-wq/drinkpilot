import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveAlcoholConsumption,
} from "@/lib/alcoholConsumption";

describe(
  "alcohol consumption resolution",
  () => {
    it(
      "no interpreta los cócteles legacy como alcohólicos",
      () => {
        const result =
          resolveAlcoholConsumption({
            beer: 2,
            wine: 1,
            cocktail: 3,
          });

        expect(
          result
            .knownAlcoholicDrinksPerDay
        ).toBe(3);

        expect(
          result
            .cocktailCompositionKnown
        ).toBe(false);

        expect(
          result
            .alcoholicDrinksPerDay
        ).toBeNull();
      }
    );

    it(
      "resuelve el consumo cuando conoce toda la composición",
      () => {
        const result =
          resolveAlcoholConsumption({
            beer: 2,
            wine: 1,
            cocktail: 3,

            alcoholicCocktail: 2,
            nonAlcoholicCocktail: 1,
          });

        expect(
          result
            .knownAlcoholicDrinksPerDay
        ).toBe(5);

        expect(
          result
            .cocktailCompositionKnown
        ).toBe(true);

        expect(
          result
            .alcoholicDrinksPerDay
        ).toBe(5);
      }
    );

    it(
      "rechaza una composición que no coincide con el total legacy",
      () => {
        const result =
          resolveAlcoholConsumption({
            beer: 2,
            wine: 1,
            cocktail: 3,

            alcoholicCocktail: 1,
            nonAlcoholicCocktail: 1,
          });

        expect(
          result
            .cocktailCompositionKnown
        ).toBe(false);

        expect(
          result
            .alcoholicDrinksPerDay
        ).toBeNull();
      }
    );

    it(
      "considera conocida una composición de cero cócteles",
      () => {
        const result =
          resolveAlcoholConsumption({
            beer: 2,
            wine: 1,
            cocktail: 0,

            alcoholicCocktail: 0,
            nonAlcoholicCocktail: 0,
          });

        expect(
          result
            .cocktailCompositionKnown
        ).toBe(true);

        expect(
          result
            .alcoholicDrinksPerDay
        ).toBe(3);
      }
    );
  }
);

it(
  "considera conocida la composición cuando no hay cócteles aunque el reparto sea null",
  () => {
    const result =
      resolveAlcoholConsumption({
        beer: 16,
        wine: 0,
        cocktail: 0,
        alcoholicCocktail: null,
        nonAlcoholicCocktail: null,
      });

    expect(
      result.cocktailCompositionKnown
    ).toBe(true);

    expect(
      result.alcoholicDrinksPerDay
    ).toBe(16);
  }
);
