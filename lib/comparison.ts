import { calculateRecommendation } from "@/lib/calculator";

import {
  calculatePackageCoverage,
  CoverageCategory,
} from "@/lib/coverage";

import {
  getAllPackages,
  PackageKey,
} from "@/lib/packageService";

import { costaOnboardPriceValues } from "@/data/onboardPrices";

export type ComparisonInput = {
  days: number;
  people: number;

  coffee: number;
  water: number;
  soda: number;
  beer: number;
  wine: number;
  cocktail: number;

  /*
   * Preferencias premium.
   *
   * Son opcionales temporalmente para mantener
   * compatibilidad con llamadas existentes.
   *
   * Si no llegan, se consideran false.
   */
  premiumCocktails?: boolean;
  bottledBeer?: boolean;
  premiumSpirits?: boolean;
  bottledWaterUnlimited?: boolean;
};

export type PackageComparisonResult = {
  packageKey: PackageKey;

  packageName: string;

  packagePricePerDay: number;

  packageCost: number;

  drinksCost: number;

  savings: number;

  dailyDrinkCost: number;

  dailyMargin: number;

  savingsPercentage: number;

  recommended: boolean;

  recommendationLevel:
    | "not-worth-it"
    | "very-close"
    | "worth-considering"
    | "worth-it"
    | "strongly-worth-it";

  breakEvenDrinksPerDay: number;

  /*
   * Cobertura
   */

  coverageScore: number;

  fullyCovered: boolean;

  coveredCategories: CoverageCategory[];

  uncoveredCategories: CoverageCategory[];
};

export type ComparisonResult = {
  packages: PackageComparisonResult[];

  bestPackage: PackageComparisonResult | null;

  anyPackageWorthIt: boolean;
};

export function compareDrinkPackages(
  input: ComparisonInput
): ComparisonResult {
  /*
   * Solo comparamos paquetes habilitados
   * para cálculo.
   */
  const packages = getAllPackages().filter(
    (pkg) => pkg.status === "verified"
  );

  /*
   * COBERTURA
   *
   * Evaluamos:
   *
   * - bebidas consumidas
   * - preferencias premium
   *
   * Si una preferencia todavía no ha sido
   * enviada por alguna pantalla antigua,
   * utilizamos false.
   */
  const coverageResults =
    calculatePackageCoverage({
      coffee: input.coffee,
      water: input.water,
      soda: input.soda,
      beer: input.beer,
      wine: input.wine,
      cocktail: input.cocktail,

      premiumCocktails:
        input.premiumCocktails ?? false,

      bottledBeer:
        input.bottledBeer ?? false,

      premiumSpirits:
        input.premiumSpirits ?? false,

      bottledWaterUnlimited:
        input.bottledWaterUnlimited ?? false,
    });

  /*
   * RESULTADO ECONÓMICO
   *
   * Todos los paquetes utilizan exactamente
   * los mismos precios de bebidas por separado.
   */
  const results: PackageComparisonResult[] =
    packages.map((pkg) => {
      const calculation =
        calculateRecommendation({
          days: input.days,
          people: input.people,

          packagePricePerDay:
            pkg.pricePerDay,

          coffee: input.coffee,
          water: input.water,
          soda: input.soda,
          beer: input.beer,
          wine: input.wine,
          cocktail: input.cocktail,

          coffeePrice:
            costaOnboardPriceValues.coffee,

          waterPrice:
            costaOnboardPriceValues.water,

          sodaPrice:
            costaOnboardPriceValues.soda,

          beerPrice:
            costaOnboardPriceValues.beer,

          winePrice:
            costaOnboardPriceValues.wine,

          cocktailPrice:
            costaOnboardPriceValues.cocktail,
        });

      const coverage =
        coverageResults.find(
          (result) =>
            result.packageKey === pkg.key
        );

      return {
        packageKey:
          pkg.key as PackageKey,

        packageName:
          pkg.name,

        packagePricePerDay:
          pkg.pricePerDay,

        packageCost:
          calculation.packageCost,

        drinksCost:
          calculation.drinksCost,

        savings:
          calculation.savings,

        dailyDrinkCost:
          calculation.dailyDrinkCost,

        dailyMargin:
          calculation.dailyMargin,

        savingsPercentage:
          calculation.savingsPercentage,

        recommended:
          calculation.recommended,

        recommendationLevel:
          calculation.recommendationLevel,

        breakEvenDrinksPerDay:
          calculation.breakEvenDrinksPerDay,

        coverageScore:
          coverage?.coverageScore ?? 0,

        fullyCovered:
          coverage?.fullyCovered ?? false,

        coveredCategories:
          coverage?.coveredCategories ?? [],

        uncoveredCategories:
          coverage?.uncoveredCategories ?? [],
      };
    });

  /*
   * ORDEN
   *
   * Por ahora mantenemos el orden económico:
   * mayor ahorro primero.
   *
   * La cobertura actúa como requisito para
   * poder convertirse en bestPackage.
   */
  results.sort(
    (a, b) =>
      b.savings - a.savings
  );

  /*
   * MEJOR PAQUETE
   *
   * Para ser recomendado tiene que:
   *
   * 1. generar ahorro;
   * 2. cubrir completamente las categorías
   *    y preferencias indicadas.
   */
  const bestPackage =
    results.find(
      (pkg) =>
        pkg.savings > 0 &&
        pkg.fullyCovered
    ) ?? null;

  return {
    packages: results,

    bestPackage,

    anyPackageWorthIt:
      bestPackage !== null,
  };
}