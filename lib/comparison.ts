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

  nonAlcoholicCocktails?: boolean;

  premiumCocktails?: boolean;

  bottledBeer?: boolean;

  premiumSpirits?: boolean;

  bottledWaterDailyAllowance?: boolean;

  bottledWaterUnlimited?: boolean;

  myDrinksCustomPrice?:
    | number
    | null;

  myDrinksPlusCustomPrice?:
    | number
    | null;
};

export type PackageComparisonResult = {
  packageKey: PackageKey;

  packageName: string;

  packagePricePerDay: number;

  priceSource: PriceSource;

  /*
   * Todo paquete que llega al motor
   * económico tiene obligatoriamente
   * un precio numérico.
   */
  referencePricePerDay: number;

  packageCost: number;

  drinksCost: number;

  savings: number;

  effectiveSavings:
    number | null;

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

  coveredCategories:
    CoverageCategory[];

  uncoveredCategories:
    CoverageCategory[];
};

export type ComparisonResult = {
  packages:
    PackageComparisonResult[];

  bestPackage:
    PackageComparisonResult | null;

  anyPackageWorthIt: boolean;
};

/*
 * Unión completa de paquetes
 * disponibles en la capa de datos.
 */
type AllPackage =
  ReturnType<
    typeof getAllPackages
  >[number];

/*
 * Extraemos únicamente los paquetes
 * declarados explícitamente como
 * económicamente elegibles.
 *
 * Actualmente:
 * - My Drinks
 * - My Drinks Plus
 *
 * My Drinks Soft queda fuera.
 */
type EconomicPackage =
  Extract<
    AllPackage,
    {
      economicEligibility:
        "eligible";
    }
  >;

/*
 * Valida un precio personalizado
 * introducido por el usuario.
 */
function isValidCustomPrice(
  value:
    | number
    | null
    | undefined
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

/*
 * SEGURIDAD ECONÓMICA
 *
 * Utilizamos variables ensanchadas
 * deliberadamente para evitar que
 * TypeScript convierta las comprobaciones
 * defensivas en comparaciones imposibles
 * debido a los literales `as const`.
 */
function isPackageEligibleForEconomicComparison(
  pkg: AllPackage
): pkg is EconomicPackage {
  const economicEligibility:
    string =
      pkg.economicEligibility;

  const priceStatus:
    string =
      pkg.priceStatus;

  const packageStatus:
    string =
      pkg.status;

  const pricePerDay:
    number | null =
      pkg.pricePerDay;

  return (
    economicEligibility ===
      "eligible" &&

    priceStatus !==
      "pending" &&

    packageStatus ===
      "verified" &&

    typeof pricePerDay ===
      "number" &&

    Number.isFinite(
      pricePerDay
    ) &&

    pricePerDay > 0
  );
}

/*
 * Selecciona precio real de reserva
 * cuando existe.
 *
 * Si no, utiliza el precio de
 * referencia del paquete.
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
    packageKey ===
      "myDrinks" &&

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
    packageKey ===
      "myDrinksPlus" &&

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
    price:
      referencePrice,

    source:
      "reference",
  };
}

/*
 * Categorías cuyo coste adicional
 * no podemos cuantificar todavía.
 *
 * Si una queda fuera del paquete,
 * el ahorro mostrado es teórico
 * y no puede considerarse ahorro
 * económico final.
 */
const nonQuantifiedCategories:
  CoverageCategory[] = [
    "nonAlcoholicCocktails",

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
  status:
    EconomicComparisonStatus;

  effectiveSavings:
    number | null;
} {
  /*
   * Sin cobertura no existe una
   * comparación económica fiable.
   */
  if (!coverage) {
    return {
      status:
        "partial-unknown",

      effectiveSavings:
        null,
    };
  }

  /*
   * Cobertura completa.
   */
  if (
    coverage.fullyCovered
  ) {
    return {
      status:
        "complete",

      effectiveSavings:
        savings,
    };
  }

  /*
   * Detectamos categorías cuyo
   * coste adicional desconocemos.
   */
  const hasUnknownUncoveredCategory =
    coverage
      .uncoveredCategories
      .some(
        (category) =>
          nonQuantifiedCategories
            .includes(category)
      );

  if (
    hasUnknownUncoveredCategory
  ) {
    return {
      status:
        "partial-unknown",

      effectiveSavings:
        null,
    };
  }

  /*
   * Preparado para futuras
   * categorías cuantificables.
   */
  return {
    status:
      "partial-calculable",

    effectiveSavings:
      null,
  };
}

export function compareDrinkPackages(
  input: ComparisonInput
): ComparisonResult {
  /*
   * SOLO PAQUETES ECONÓMICAMENTE
   * HABILITADOS.
   *
   * El type guard garantiza además
   * que pricePerDay es number.
   */
  const packages =
    getAllPackages().filter(
      isPackageEligibleForEconomicComparison
    );

  /*
   * COBERTURA
   */
  const coverageResults =
    calculatePackageCoverage({
      coffee:
        input.coffee,

      water:
        input.water,

      soda:
        input.soda,

      beer:
        input.beer,

      wine:
        input.wine,

      cocktail:
        input.cocktail,

      nonAlcoholicCocktails:
        input.nonAlcoholicCocktails ??
        false,

      premiumCocktails:
        input.premiumCocktails ??
        false,

      bottledBeer:
        input.bottledBeer ??
        false,

      premiumSpirits:
        input.premiumSpirits ??
        false,

      bottledWaterDailyAllowance:
        input.bottledWaterDailyAllowance ??
        false,

      bottledWaterUnlimited:
        input.bottledWaterUnlimited ??
        false,
    });

  /*
   * RESULTADOS ECONÓMICOS
   */
  const results:
    PackageComparisonResult[] =
      packages.map((pkg) => {
        const packageKey =
          pkg.key as PackageKey;

        /*
         * Gracias al type guard,
         * este valor es siempre number.
         */
        const referencePrice =
          pkg.pricePerDay;

        const resolvedPrice =
          resolvePackagePrice(
            packageKey,

            referencePrice,

            input
          );

        const calculation =
          calculateRecommendation({
            days:
              input.days,

            people:
              input.people,

            packagePricePerDay:
              resolvedPrice.price,

            coffee:
              input.coffee,

            water:
              input.water,

            soda:
              input.soda,

            beer:
              input.beer,

            wine:
              input.wine,

            cocktail:
              input.cocktail,

            coffeePrice:
              costaOnboardPriceValues
                .coffee,

            waterPrice:
              costaOnboardPriceValues
                .water,

            sodaPrice:
              costaOnboardPriceValues
                .soda,

            beerPrice:
              costaOnboardPriceValues
                .beer,

            winePrice:
              costaOnboardPriceValues
                .wine,

            cocktailPrice:
              costaOnboardPriceValues
                .cocktail,
          });

        const coverage =
          coverageResults.find(
            (result) =>
              result.packageKey ===
              packageKey
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
            referencePrice,

          packageCost:
            calculation.packageCost,

          drinksCost:
            calculation.drinksCost,

          savings:
            calculation.savings,

          effectiveSavings:
            economicComparison
              .effectiveSavings,

          economicComparisonStatus:
            economicComparison
              .status,

          dailyDrinkCost:
            calculation.dailyDrinkCost,

          dailyMargin:
            calculation.dailyMargin,

          savingsPercentage:
            calculation
              .savingsPercentage,

          recommended:
            calculation.recommended,

          recommendationLevel:
            calculation
              .recommendationLevel,

          breakEvenDrinksPerDay:
            calculation
              .breakEvenDrinksPerDay,

          coverageScore:
            coverage
              ?.coverageScore ?? 0,

          fullyCovered:
            coverage
              ?.fullyCovered ?? false,

          coveredCategories:
            coverage
              ?.coveredCategories ??
            [],

          uncoveredCategories:
            coverage
              ?.uncoveredCategories ??
            [],
        };
      });

  /*
   * Mayor ahorro primero.
   */
  results.sort(
    (a, b) =>
      b.savings -
      a.savings
  );

  /*
   * RECOMENDACIÓN
   *
   * Para ser recomendado:
   *
   * 1. ahorro positivo;
   * 2. cobertura completa.
   */
  const bestPackage =
    results.find(
      (pkg) =>
        pkg.savings > 0 &&
        pkg.fullyCovered
    ) ?? null;

  return {
    packages:
      results,

    bestPackage,

    anyPackageWorthIt:
      bestPackage !== null,
  };
}