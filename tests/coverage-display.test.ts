import { describe, expect, it } from "vitest";

import { formatCoverageCategoryLabel } from "@/lib/coverageDisplay";

describe("coverage display labels", () => {
  it("distingue un cóctel concreto fuera de la cobertura general", () => {
    expect(
      formatCoverageCategoryLabel("cocktail", "cócteles", {
        coveredCategories: ["alcoholicCocktails"],
      })
    ).toBe("cócteles seleccionados");
  });

  it("mantiene la etiqueta general cuando no hay cobertura específica", () => {
    expect(
      formatCoverageCategoryLabel("cocktail", "cócteles", {
        coveredCategories: [],
      })
    ).toBe("cócteles");
  });
});
