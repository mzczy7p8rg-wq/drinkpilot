import {
  getAllPackages,
  PackageKey,
} from "@/lib/packageService";

export type CoverageInput = {
  coffee: number;
  water: number;
  soda: number;
  beer: number;
  wine: number;

  /*
   * Categoría legacy.
   *
   * Sigue representando el consumo de
   * cócteles introducido actualmente
   * en el wizard.
   */
  cocktail: number;

  /*
   * Nuevas categorías de Coverage v2.
   *
   * Son opcionales para mantener compatibilidad
   * con todo el flujo actual.
   */
  alcoholicCocktails?: boolean;
  nonAlcoholicCocktails?: boolean;

  premiumCocktails: boolean;
  bottledBeer: boolean;
  premiumSpirits: boolean;
  bottledWaterUnlimited: boolean;
};

export type CoverageCategory =
  | "coffee"
  | "water"
  | "soda"
  | "beer"
  | "wine"

  /*
   * Legacy.
   */
  | "cocktail"

  /*
   * Coverage v2.
   */
  | "alcoholicCocktails"
  | "nonAlcoholicCocktails"

  | "premiumCocktails"
  | "bottledBeer"
  | "premiumSpirits"
  | "bottledWaterUnlimited";

export type PackageCoverageResult = {
  packageKey: PackageKey;

  packageName: string;

  requestedCategories:
    CoverageCategory[];

  coveredCategories:
    CoverageCategory[];

  uncoveredCategories:
    CoverageCategory[];

  coverageScore: number;

  fullyCovered: boolean;
};

export function calculatePackageCoverage(
  input: CoverageInput
): PackageCoverageResult[] {
  const packages =
    getAllPackages().filter(
      (pkg) =>
        pkg.status === "verified"
    );

  const requestedCategories:
    CoverageCategory[] = [];

  if (input.coffee > 0) {
    requestedCategories.push(
      "coffee"
    );
  }

  if (input.water > 0) {
    requestedCategories.push(
      "water"
    );
  }

  if (input.soda > 0) {
    requestedCategories.push(
      "soda"
    );
  }

  if (input.beer > 0) {
    requestedCategories.push(
      "beer"
    );
  }

  if (input.wine > 0) {
    requestedCategories.push(
      "wine"
    );
  }

  /*
   * Flujo actual.
   *
   * No cambiamos todavía el significado
   * de los datos existentes.
   */
  if (input.cocktail > 0) {
    requestedCategories.push(
      "cocktail"
    );
  }

  /*
   * Nuevas categorías.
   *
   * Solo participan si algún consumidor
   * futuro del motor las envía explícitamente.
   */
  if (input.alcoholicCocktails) {
    requestedCategories.push(
      "alcoholicCocktails"
    );
  }

  if (input.nonAlcoholicCocktails) {
    requestedCategories.push(
      "nonAlcoholicCocktails"
    );
  }

  if (input.premiumCocktails) {
    requestedCategories.push(
      "premiumCocktails"
    );
  }

  if (input.bottledBeer) {
    requestedCategories.push(
      "bottledBeer"
    );
  }

  if (input.premiumSpirits) {
    requestedCategories.push(
      "premiumSpirits"
    );
  }

  if (
    input.bottledWaterUnlimited
  ) {
    requestedCategories.push(
      "bottledWaterUnlimited"
    );
  }

  return packages.map(
    (pkg) => {
      const coveredCategories =
        requestedCategories.filter(
          (category) =>
            pkg.coverage[
              category
            ] === true
        );

      const uncoveredCategories =
        requestedCategories.filter(
          (category) =>
            pkg.coverage[
              category
            ] !== true
        );

      const coverageScore =
        requestedCategories.length > 0
          ? (
              coveredCategories.length /
              requestedCategories.length
            ) * 100
          : 0;

      return {
        packageKey:
          pkg.key as PackageKey,

        packageName:
          pkg.name,

        requestedCategories,

        coveredCategories,

        uncoveredCategories,

        coverageScore,

        fullyCovered:
          uncoveredCategories.length ===
          0,
      };
    }
  );
}