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

  /*
   * Precio real de My Drinks Soft
   * introducido por el usuario.
   *
   * Soft no dispone actualmente
   * de un precio de referencia fiable.
   */
  myDrinksSoftCustomPrice?:
    | number
    | null;

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

  /*
   * Precio realmente utilizado
   * en el cálculo.
   */
  packagePricePerDay: number;

  priceSource: PriceSource;

  /*
   * Precio de referencia DrinkPilot.
   *
   * null = no existe actualmente
   * una referencia suficientemente
   * fiable para ese paquete.
   *
   * Este es el caso de My Drinks Soft.
   */
  referencePricePerDay:
    number | null;

  packageCost: number;

  drinksCost: number;

  savings: number;

  /*
   * Ahorro económicamente comparable.
   *
   * null = no puede calcularse con
   * suficiente precisión.
   */
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
 * Paquete resuelto para poder
 * participar en el cálculo económico.
 */
type ResolvedEconomicPackage = {
  pkg: AllPackage;

  packageKey: PackageKey;

  /*
   * Soft no tiene referencia:
   * null.
   *
   * My Drinks / Plus sí tienen
   * referencia numérica.
   */
  referencePrice:
    number | null;

  resolvedPrice: {
    price: number;

    source: PriceSource;
  };
};

/*
 * Comprueba que un precio
 * introducido por el usuario
 * puede utilizarse.
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
 * Obtiene el precio personalizado
 * correspondiente a cada paquete.
 */
function getCustomPrice(
  packageKey: PackageKey,
  input: ComparisonInput
):
  | number
  | null
  | undefined {
  if (
    packageKey ===
    "myDrinksSoft"
  ) {
    return (
      input.myDrinksSoftCustomPrice
    );
  }

  if (
    packageKey ===
    "myDrinks"
  ) {
    return (
      input.myDrinksCustomPrice
    );
  }

  if (
    packageKey ===
    "myDrinksPlus"
  ) {
    return (
      input.myDrinksPlusCustomPrice
    );
  }

  return null;
}

/*
 * Decide si un paquete puede
 * participar en la comparación
 * económica y qué precio utilizar.
 */
function resolveEconomicPackage(
  pkg: AllPackage,
  input: ComparisonInput
):
  | ResolvedEconomicPackage
  | null {
  const packageKey =
    pkg.key as PackageKey;

  const customPrice =
    getCustomPrice(
      packageKey,
      input
    );

  /*
   * MY DRINKS SOFT
   *
   * Solo puede participar cuando
   * el usuario introduce un precio
   * real válido.
   *
   * Nunca utilizamos un precio
   * de referencia inventado.
   */
  if (
    packageKey ===
    "myDrinksSoft"
  ) {
    if (
      pkg.existenceStatus !==
      "verified"
    ) {
      return null;
    }

    if (
      !isValidCustomPrice(
        customPrice
      )
    ) {
      return null;
    }

    return {
      pkg,

      packageKey,

      referencePrice:
        null,

      resolvedPrice: {
        price:
          customPrice,

        source:
          "user",
      },
    };
  }

  /*
   * MY DRINKS / MY DRINKS PLUS
   *
   * Mantienen la política
   * económica normal.
   */
  if (
    pkg.economicEligibility !==
    "eligible"
  ) {
    return null;
  }

  if (
    pkg.status !==
    "verified"
  ) {
    return null;
  }

  /*
   * Deben disponer de precio
   * de referencia numérico.
   */
  if (
    typeof pkg.pricePerDay !==
      "number" ||
    !Number.isFinite(
      pkg.pricePerDay
    ) ||
    pkg.pricePerDay <= 0
  ) {
    return null;
  }

  /*
   * El precio real de la reserva
   * tiene prioridad.
   */
  if (
    isValidCustomPrice(
      customPrice
    )
  ) {
    return {
      pkg,

      packageKey,

      referencePrice:
        pkg.pricePerDay,

      resolvedPrice: {
        price:
          customPrice,

        source:
          "user",
      },
    };
  }

  /*
   * Sin precio personalizado:
   * utilizamos referencia.
   */
  return {
    pkg,

    packageKey,

    referencePrice:
      pkg.pricePerDay,

    resolvedPrice: {
      price:
        pkg.pricePerDay,

      source:
        "reference",
    },
  };
}

/*
 * Categorías cuya falta de cobertura
 * impide calcular un ahorro económico
 * efectivo con precisión.
 *
 * Actualmente no disponemos de una
 * cantidad diaria + precio unitario
 * suficientemente definidos para
 * calcular su coste adicional.
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

/*
 * Determina la calidad real
 * de la comparación económica.
 */
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
   * Sin cobertura disponible
   * no podemos confiar en
   * el ahorro económico.
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
   * el ahorro bruto puede
   * considerarse ahorro efectivo.
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
   * coste adicional desconocemos,
   * no podemos dar un ahorro
   * efectivo.
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
   * categorías no cubiertas
   * pero cuantificables.
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
   * Resolvemos primero qué paquetes
   * pueden participar realmente.
   *
   * Soft solo aparecerá aquí cuando
   * haya precio válido del usuario.
   */
  const economicPackages =
    getAllPackages()
      .map((pkg) =>
        resolveEconomicPackage(
          pkg,
          input
        )
      )
      .filter(
        (
          result
        ): result is ResolvedEconomicPackage =>
          result !== null
      );

  /*
   * Si Soft entra económicamente,
   * necesitamos que coverage.ts
   * permita analizar también ese
   * paquete pendiente.
   */
  const softIsActive =
    economicPackages.some(
      (result) =>
        result.packageKey ===
        "myDrinksSoft"
    );

  /*
   * COBERTURA
   */
  const coverageResults =
    calculatePackageCoverage(
      {
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
      },
      {
        includePendingPackages:
          softIsActive,
      }
    );

  /*
   * RESULTADOS
   */
  const results:
    PackageComparisonResult[] =
      economicPackages.map(
        ({
          pkg,
          packageKey,
          referencePrice,
          resolvedPrice,
        }) => {
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
        }
      );

  /*
   * Orden económico:
   * mayor ahorro primero.
   */
  results.sort(
    (a, b) =>
      b.savings -
      a.savings
  );

  /*
   * RECOMENDACIÓN FINAL
   *
   * Para ser recomendado:
   *
   * 1. ahorro positivo;
   * 2. cobertura completa.
   *
   * My Drinks Soft puede ganar
   * únicamente cuando:
   *
   * - el usuario introduce precio;
   * - cubre completamente el perfil;
   * - produce ahorro positivo.
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