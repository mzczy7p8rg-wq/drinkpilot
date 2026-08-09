import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveStoredCocktailConsumption,
} from "@/lib/cocktailConsumptionStorage";

describe(
  "cocktail consumption storage migration",
  () => {
    it(
      "mantiene desconocida la composición de una sesión legacy",
      () => {
        expect(
          resolveStoredCocktailConsumption({
            cocktail: 3,
          })
        ).toEqual({
          cocktail: 3,

          alcoholicCocktail:
            null,

          nonAlcoholicCocktail:
            null,
        });
      }
    );

    it(
      "conserva una composición V2 completa",
      () => {
        expect(
          resolveStoredCocktailConsumption({
            cocktail: 3,

            alcoholicCocktail: 2,

            nonAlcoholicCocktail: 1,
          })
        ).toEqual({
          cocktail: 3,

          alcoholicCocktail: 2,

          nonAlcoholicCocktail: 1,
        });
      }
    );

    it(
      "conserva una composición V2 parcial sin inventar el resto",
      () => {
        expect(
          resolveStoredCocktailConsumption({
            cocktail: 3,

            alcoholicCocktail: 2,
          })
        ).toEqual({
          cocktail: 3,

          alcoholicCocktail: 2,

          nonAlcoholicCocktail:
            null,
        });
      }
    );

    it(
      "descarta cantidades opcionales inválidas",
      () => {
        expect(
          resolveStoredCocktailConsumption({
            cocktail: 3,

            alcoholicCocktail: -1,

            nonAlcoholicCocktail:
              "1",
          })
        ).toEqual({
          cocktail: 3,

          alcoholicCocktail:
            null,

          nonAlcoholicCocktail:
            null,
        });
      }
    );

    it(
      "utiliza el fallback legacy cuando cocktail no es válido",
      () => {
        expect(
          resolveStoredCocktailConsumption(
            {
              cocktail: "3",
            },
            2
          )
        ).toEqual({
          cocktail: 2,

          alcoholicCocktail:
            null,

          nonAlcoholicCocktail:
            null,
        });
      }
    );

    it(
      "descarta cantidades decimales que el wizard no puede generar",
      () => {
        expect(
          resolveStoredCocktailConsumption(
            {
              cocktail: 2.5,

              alcoholicCocktail:
                1.5,

              nonAlcoholicCocktail:
                1,
            },
            2
          )
        ).toEqual({
          cocktail: 2,

          alcoholicCocktail:
            null,

          nonAlcoholicCocktail:
            1,
        });
      }
    );

    it(
      "descarta enteros fuera del rango seguro",
      () => {
        const unsafeInteger =
          Number.MAX_SAFE_INTEGER + 1;

        expect(
          resolveStoredCocktailConsumption(
            {
              cocktail: unsafeInteger,
              alcoholicCocktail:
                unsafeInteger,
              nonAlcoholicCocktail: 1,
            },
            unsafeInteger
          )
        ).toEqual({
          cocktail: 0,
          alcoholicCocktail: null,
          nonAlcoholicCocktail: null,
        });
      }
    );

    it(
      "descarta una categoría que supera el total de cócteles",
      () => {
        expect(
          resolveStoredCocktailConsumption({
            cocktail: 3,
            alcoholicCocktail: 4,
          })
        ).toEqual({
          cocktail: 3,
          alcoholicCocktail: null,
          nonAlcoholicCocktail: null,
        });
      }
    );

    it(
      "descarta un reparto completo cuya suma supera el total",
      () => {
        expect(
          resolveStoredCocktailConsumption({
            cocktail: 3,
            alcoholicCocktail: 2,
            nonAlcoholicCocktail: 2,
          })
        ).toEqual({
          cocktail: 3,
          alcoholicCocktail: null,
          nonAlcoholicCocktail: null,
        });
      }
    );
  }
);
