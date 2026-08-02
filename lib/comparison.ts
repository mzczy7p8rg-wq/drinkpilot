import { calculateRecommendation } from "@/lib/calculator";
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
   * Solo participan paquetes habilitados
   * para cálculo.
   *
   * My Drinks Soft queda fuera mientras
   * continúe con status "pending".
   */
  const packages = getAllPackages().filter(
    (pkg) => pkg.status === "verified"
  );

  /*
   * MUY IMPORTANTE:
   *
   * Todas las opciones se comparan utilizando
   * exactamente los mismos precios de bebidas
   * por separado.
   *
   * El coste del café, agua, cerveza, etc.
   * no depende del paquete analizado.
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
      };
    });

  /*
   * Ordenamos de mayor a menor ahorro.
   */
  results.sort(
    (a, b) =>
      b.savings - a.savings
  );

  /*
   * Solo existe "mejor paquete" si alguno
   * produce realmente un ahorro positivo.
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