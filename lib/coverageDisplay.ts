import type { CoverageCategory } from "@/lib/coverage";

type CoverageDisplayPackage = {
  coveredCategories: CoverageCategory[];
};

const specificCocktailCategories: CoverageCategory[] = [
  "alcoholicCocktails",
  "nonAlcoholicCocktails",
  "premiumCocktails",
];

/*
 * Una bebida concreta elegida en la carta puede no estar incluida aunque
 * el paquete cubra la categoría general de cócteles. Evitamos mostrar ambas
 * situaciones como simplemente "cócteles", porque parece contradictorio.
 */
export function formatCoverageCategoryLabel(
  category: CoverageCategory,
  label: string,
  pkg: CoverageDisplayPackage
): string {
  if (
    category === "cocktail" &&
    pkg.coveredCategories.some((coveredCategory) =>
      specificCocktailCategories.includes(coveredCategory)
    )
  ) {
    return "cócteles seleccionados";
  }

  return label;
}
