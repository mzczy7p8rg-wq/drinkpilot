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

export type EconomicComparisonStatus =
  | "complete"
  | "partial-calculable"
  | "partial-unknown";

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
  bottledWaterDailyAllowance?: boolean;
  bottledWaterUnlimited?: boolean;

  myDrinksCustomPrice?: number | null;
  myDrinksPlusCustomPrice?: number | null;
};

export type PackageComparisonResult = {
  packageKey: PackageKey;

  packageName: string;

  packagePricePerDay: number;

  priceSource: PriceSource;

  referencePricePerDay: number;

  packageCost: number;

  drinksCost: number;

  savings: number;

  /*
   * Ahorro que podemos considerar realmente
   * comparable teniendo en cuenta la cobertura.
   *
   * null = no podemos calcularlo con precisión.
   */
  effectiveSavings: number | null;

  /*
   * Calidad de la comparación económica.
   */
  economicComparisonStatus:
    EconomicComparisonStatus;

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

function isValidCustomPrice(
  value: number | null | undefined
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

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

/*
 * Categorías premium que actualmente
 * no tienen una cantidad diaria ni un
 * precio unitario asociado.
 *
 * Si alguna de ellas queda fuera,
 * no podemos calcular el coste real
 * adicional de forma fiable.
 */
const nonQuantifiedCategories:
  CoverageCategory[] = [
    "premiumCocktails",
    "bottledBeer",
    "premiumSpirits",
    "bottledWaterDailyAllowance",
    "bottledWaterUnlimited",
  ];

function resolveEconomicComparison(
  coverage:
    | {
        fullyCovered: boolean;
        uncoveredCategories:
          CoverageCategory[];
      }
    | undefined,
  savings: number
): {
  status: EconomicComparisonStatus;
  effectiveSavings: number | null;
} {
  /*
   * Sin datos de cobertura no consideramos
   * la comparación suficientemente fiable.
   */
  if (!coverage) {
    return {
      status: "partial-unknown",
      effectiveSavings: null,
    };
  }

  /*
   * Cobertura completa:
   * el ahorro bruto coincide con el ahorro
   * económico realmente comparable.
   */
  if (coverage.fullyCovered) {
    return {
      status: "complete",
      effectiveSavings: savings,
    };
  }

  /*
   * Si falta alguna preferencia premium
   * no cuantificada, desconocemos cuánto
   * tendría que pagar el usuario aparte.
   */
  const hasUnknownUncoveredCategory =
    coverage.uncoveredCategories.some(
      (category) =>
        nonQuantifiedCategories.includes(
          category
        )
    );

  if (hasUnknownUncoveredCategory) {
    return {
      status: "partial-unknown",
      effectiveSavings: null,
    };
  }

  /*
   * Preparado para un futuro escenario
   * donde existan categorías cuantificadas
   * no cubiertas.
   *
   * Por ahora no tenemos paquetes verificados
   * que entren aquí, así que mantenemos
   * effectiveSavings en null hasta calcular
   * explícitamente su coste adicional.
   */
  return {
    status: "partial-calculable",
    effectiveSavings: null,
  };
}

export function compareDrinkPackages(
  input: ComparisonInput
): ComparisonResult {
  const packages = getAllPackages().filter(
    (pkg) => pkg.status === "verified"
  );

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

      bottledWaterDailyAllowance:
        input.bottledWaterDailyAllowance ?? false,

      bottledWaterUnlimited:
        input.bottledWaterUnlimited ?? false,
    });

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

      const economicComparison =
        resolveEconomicComparison(
          coverage,
          calculation.savings
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

        effectiveSavings:
          economicComparison.effectiveSavings,

        economicComparisonStatus:
          economicComparison.status,

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
   * Conservamos el orden económico actual.
   *
   * No cambiamos todavía la experiencia
   * de resultados ni la elección final.
   */
  results.sort(
    (a, b) =>
      b.savings - a.savings
  );

  /*
   * La regla de recomendación permanece
   * exactamente igual:
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