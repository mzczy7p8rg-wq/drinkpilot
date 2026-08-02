import { getAllPackages, PackageKey } from "@/lib/packageService";

export type CoverageInput = {
  coffee: number;
  water: number;
  soda: number;
  beer: number;
  wine: number;
  cocktail: number;

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
  | "cocktail"
  | "premiumCocktails"
  | "bottledBeer"
  | "premiumSpirits"
  | "bottledWaterUnlimited";

export type PackageCoverageResult = {
  packageKey: PackageKey;
  packageName: string;

  requestedCategories: CoverageCategory[];
  coveredCategories: CoverageCategory[];
  uncoveredCategories: CoverageCategory[];

  coverageScore: number;

  fullyCovered: boolean;
};

export function calculatePackageCoverage(
  input: CoverageInput
): PackageCoverageResult[] {
  const packages = getAllPackages().filter(
    (pkg) => pkg.status === "verified"
  );

  /*
   * Categorías realmente relevantes
   * para este usuario.
   *
   * Incluimos tanto:
   * - consumo básico
   * - preferencias premium
   */
  const requestedCategories: CoverageCategory[] = [];

  if (input.coffee > 0) {
    requestedCategories.push("coffee");
  }

  if (input.water > 0) {
    requestedCategories.push("water");
  }

  if (input.soda > 0) {
    requestedCategories.push("soda");
  }

  if (input.beer > 0) {
    requestedCategories.push("beer");
  }

  if (input.wine > 0) {
    requestedCategories.push("wine");
  }

  if (input.cocktail > 0) {
    requestedCategories.push("cocktail");
  }

  if (input.premiumCocktails) {
    requestedCategories.push("premiumCocktails");
  }

  if (input.bottledBeer) {
    requestedCategories.push("bottledBeer");
  }

  if (input.premiumSpirits) {
    requestedCategories.push("premiumSpirits");
  }

  if (input.bottledWaterUnlimited) {
    requestedCategories.push("bottledWaterUnlimited");
  }

  return packages.map((pkg) => {
    const coveredCategories =
      requestedCategories.filter(
        (category) =>
          pkg.coverage[category] === true
      );

    const uncoveredCategories =
      requestedCategories.filter(
        (category) =>
          pkg.coverage[category] !== true
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
        uncoveredCategories.length === 0,
    };
  });
}