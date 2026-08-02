import { calculateRecommendation } from "@/lib/calculator";
import {
  getAllPackages,
  PackageKey,
} from "@/lib/packageService";

export type ComparisonInput = {
  days: number;
  people: number;

  coffee: number;
  water: number;
  soda: number;
  beer: number;
  wine: number;
  cocktail: number;
};

export type PackageComparisonResult = {
  packageKey: PackageKey;

  packageName: string;

  packagePricePerDay: number;

  packageCost: number;

  drinksCost: number;

  savings: number;

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
   * Solo comparamos paquetes suficientemente
   * verificados para participar en el cálculo.
   *
   * My Drinks Soft queda fuera mientras
   * permanezca con status "pending".
   */

  const packages = getAllPackages().filter(
    (pkg) => pkg.status === "verified"
  );

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
            pkg.drinks.coffee,

          waterPrice:
            pkg.drinks.water,

          sodaPrice:
            pkg.drinks.soda,

          beerPrice:
            pkg.drinks.beer,

          winePrice:
            pkg.drinks.wine,

          cocktailPrice:
            pkg.drinks.cocktail,
        });

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
      };
    });

  /*
   * Ordenamos del paquete económicamente
   * más favorable al menos favorable.
   */

  results.sort(
    (a, b) =>
      b.savings - a.savings
  );

  /*
   * Si ninguno genera ahorro positivo,
   * no recomendamos ningún paquete.
   */

  const bestPackage =
    results.find(
      (pkg) => pkg.savings > 0
    ) ?? null;

  return {
    packages: results,

    bestPackage,

    anyPackageWorthIt:
      bestPackage !== null,
  };
}