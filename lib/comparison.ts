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

export type PriceSource =
  | "user"
  | "reference";

export type ComparisonInput = {
  days: number;
  people: number;

  coffee: number;
  water: number;
  soda: number;
  beer: number;
  wine: number;
  cocktail: number;

  premiumCocktails?: boolean;
  bottledBeer?: boolean;
  premiumSpirits?: boolean;
  bottledWaterUnlimited?: boolean;

  /*
   * Precios personalizados introducidos
   * por el usuario desde su reserva.
   *
   * null o undefined = usar precio de referencia.
   */
  myDrinksCustomPrice?: number | null;
  myDrinksPlusCustomPrice?: number | null;
};

export type PackageComparisonResult = {
  packageKey: PackageKey;

  packageName: string;

  /*
   * Precio realmente utilizado
   * en el cálculo.
   */
  packagePricePerDay: number;

  /*
   * Indica de dónde procede ese precio.
   */
  priceSource: PriceSource;

  /*
   * Precio de referencia original
   * definido por DrinkPilot.
   */
  referencePricePerDay: number;

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

/*
 * Determina si un precio personalizado
 * puede utilizarse de forma segura.
 */
function isValidCustomPrice(
  value: number | null | undefined
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

/*
 * Devuelve el precio que debe usar cada paquete.
 *
 * Si existe un precio válido de la reserva:
 * → usa precio del usuario
 *
 * Si no:
 * → usa precio de referencia
 */
function resolvePackagePrice(
  packageKey: PackageKey,
  referencePrice: number,
  input: ComparisonInput
): {
  price: number;
  source: PriceSource;
} {
  if (
    packageKey === "myDrinks" &&
    isValidCustomPrice(
      input.myDrinksCustomPrice
    )
  ) {
    return {
      price:
        input.myDrinksCustomPrice,
      source: "user",
    };
  }

  if (
    packageKey === "myDrinksPlus" &&
    isValidCustomPrice(
      input.myDrinksPlusCustomPrice
    )
  ) {
    return {
      price:
        input.myDrinksPlusCustomPrice,
      source: "user",
    };
  }

  return {
    price: referencePrice,
    source: "reference",
  };
}

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
   * Los precios de bebidas por separado
   * permanecen comunes para todos los paquetes.
   *
   * El precio diario del paquete puede venir
   * de:
   *
   * - la reserva del usuario
   * - el precio de referencia
   */
  const results: PackageComparisonResult[] =
    packages.map((pkg) => {
      const packageKey =
        pkg.key as PackageKey;

      const resolvedPrice =
        resolvePackagePrice(
          packageKey,
          pkg.pricePerDay,
          input
        );

      const calculation =
        calculateRecommendation({
          days: input.days,
          people: input.people,

          packagePricePerDay:
            resolvedPrice.price,

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
            result.packageKey === packageKey
        );

      return {
        packageKey,

        packageName:
          pkg.name,

        packagePricePerDay:
          resolvedPrice.price,

        priceSource:
          resolvedPrice.source,

        referencePricePerDay:
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
   * Orden económico:
   * mayor ahorro primero.
   */
  results.sort(
    (a, b) =>
      b.savings - a.savings
  );

  /*
   * Para ser recomendado:
   *
   * 1. ahorro positivo
   * 2. cobertura completa
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