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
   * Ahorro que podemos considerar
   * realmente comparable teniendo
   * en cuenta la cobertura.
   *
   * null = no podemos calcularlo
   * con precisión.
   */
  effectiveSavings:
    number | null;

  /*
   * Calidad de la comparación
   * económica.
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
 * Determina si un precio personalizado
 * puede utilizarse de forma segura.
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
 * SEGURIDAD ECONÓMICA DEL PAQUETE
 *
 * Un paquete solo puede entrar en
 * comparison.ts cuando:
 *
 * 1. está habilitado;
 * 2. su precio no está pendiente;
 * 3. dispone de un precio de referencia
 *    finito y mayor que 0.
 *
 * Esta protección evita que un paquete
 * como My Drinks Soft pueda entrar
 * accidentalmente con precio 0 €.
 */
function isPackageEligibleForEconomicComparison(
  pkg: ReturnType<
    typeof getAllPackages
  >[number]
): boolean {
  /*
   * Comprobamos primero el estado del precio
   * antes de estrechar el tipo mediante status.
   *
   * Esto además mantiene la protección frente
   * a futuros paquetes que pudieran quedar
   * habilitados accidentalmente con precio
   * todavía pendiente.
   */
  if (
    pkg.priceStatus === "pending"
  ) {
    return false;
  }

  if (
    pkg.status !== "verified"
  ) {
    return false;
  }

  return (
    Number.isFinite(
      pkg.pricePerDay
    ) &&
    pkg.pricePerDay > 0
  );
}

/*
 * Devuelve el precio que debe usar
 * cada paquete.
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
    price: referencePrice,
    source: "reference",
  };
}

/*
 * Categorías sin cantidad diaria
 * ni precio unitario específico.
 *
 * Si alguna queda fuera,
 * no podemos conocer con precisión
 * el coste adicional.
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
   * Sin cobertura disponible,
   * la comparación no puede
   * considerarse completa.
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
   * Cobertura completa:
   *
   * el ahorro bruto coincide con
   * el ahorro económico comparable.
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
   * Si falta una categoría cuyo
   * coste no podemos cuantificar,
   * el ahorro final es desconocido.
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
   * Reservado para futuras
   * categorías cuantificables
   * no cubiertas.
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
   * Solo participan paquetes
   * económicamente seguros.
   */
  const packages =
    getAllPackages().filter(
      isPackageEligibleForEconomicComparison
    );

  /*
   * La cobertura continúa trabajando
   * únicamente con paquetes habilitados.
   *
   * My Drinks Soft puede analizarse
   * separadamente mediante el modo
   * preview de coverage.ts.
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

  const results:
    PackageComparisonResult[] =
      packages.map((pkg) => {
        const packageKey =
          pkg.key as PackageKey;

        const resolvedPrice =
          resolvePackagePrice(
            packageKey,
            pkg.pricePerDay,
            input
          );

        /*
         * Segunda protección.
         *
         * resolvePackagePrice nunca
         * debería producir un valor
         * inválido porque los precios
         * personalizados ya se validan.
         *
         * Aun así mantenemos aquí
         * la lógica simple y segura.
         */
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
            pkg.pricePerDay,

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
            economicComparison.status,

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
    packages: results,

    bestPackage,

    anyPackageWorthIt:
      bestPackage !== null,
  };
}