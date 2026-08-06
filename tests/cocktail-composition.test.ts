import {
  describe,
  expect,
  it,
} from "vitest";

import {
  updateCocktailComposition,
} from "@/lib/cocktailComposition";

describe(
  "cocktail composition",
  () => {
    it(
      "permite completar exactamente el total",
      () => {
        expect(
          updateCocktailComposition(
            4,
            {
              alcoholicCocktail: 3,
              nonAlcoholicCocktail: 0,
            },
            "nonAlcoholicCocktail",
            1
          )
        ).toEqual({
          alcoholicCocktail: 3,
          nonAlcoholicCocktail: 1,
        });
      }
    );

    it(
      "impide superar el total al aumentar sin alcohol",
      () => {
        expect(
          updateCocktailComposition(
            4,
            {
              alcoholicCocktail: 3,
              nonAlcoholicCocktail: 1,
            },
            "nonAlcoholicCocktail",
            2
          )
        ).toEqual({
          alcoholicCocktail: 3,
          nonAlcoholicCocktail: 1,
        });
      }
    );

    it(
      "impide superar el total al aumentar con alcohol",
      () => {
        expect(
          updateCocktailComposition(
            4,
            {
              alcoholicCocktail: 1,
              nonAlcoholicCocktail: 2,
            },
            "alcoholicCocktail",
            3
          )
        ).toEqual({
          alcoholicCocktail: 2,
          nonAlcoholicCocktail: 2,
        });
      }
    );

    it(
      "permite una composición incompleta",
      () => {
        expect(
          updateCocktailComposition(
            4,
            {
              alcoholicCocktail: 1,
              nonAlcoholicCocktail: 0,
            },
            "nonAlcoholicCocktail",
            2
          )
        ).toEqual({
          alcoholicCocktail: 1,
          nonAlcoholicCocktail: 2,
        });
      }
    );

    it(
      "normaliza valores negativos",
      () => {
        expect(
          updateCocktailComposition(
            4,
            {
              alcoholicCocktail: 2,
              nonAlcoholicCocktail: 1,
            },
            "alcoholicCocktail",
            -1
          )
        ).toEqual({
          alcoholicCocktail: 0,
          nonAlcoholicCocktail: 1,
        });
      }
    );
  }
);
