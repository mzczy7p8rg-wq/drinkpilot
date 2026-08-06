import { calculateRecommendation } from "@/lib/calculator";

import {
  calculatePackageCoverage,
  CoverageCategory,
  PackageCoverageResult,
} from "@/lib/coverage";

import {
  getAllPackages,
  getDefaultCruiseLine,
  PackageKey,
} from "@/lib/packageService";

import {
  CruiseLineKey,
  getCruiseLine,
} from "@/data/cruiseLines";

import {
  getMissingOnboardPriceKeys,
  hasCompleteOnboardPriceValues,
  type OnboardPriceKey,
  type PartialOnboardPriceValues,
} from "@/lib/onboardPriceService";

import {
  getPackageOperationalRules,
  type PackageOperationalRules,
} from "@/lib/packageRules";

import {
  resolveAlcoholConsumption,
  type AlcoholConsumptionResolution,
} from "@/lib/alcoholConsumption";

import {
  evaluateOperationalRuleImpacts,
  type PackageOperationalRuleImpact,
} from "@/lib/operationalRuleImpact";

export type PriceSource =
  | "user"
  | "reference";

export type EconomicComparisonStatus =
  | "complete"
  | "partial-calculable"
  | "partial-unknown";

export type ComparisonInput = {
  /*
   * Naviera que debe utilizar
   * el motor.
   *
   * Mientras el wizard todavía no
   * permita seleccionarla, Costa
   * continúa siendo el valor por defecto.
   */
  cruiseLine?: CruiseLineKey;

  /*
   * Contexto opcional de la navegación.
   *
   * null/undefined = desconocido.
   *
   * No modifica por sí solo ningún
   * cálculo económico.
   */
  market?: string | null;

  sailingDate?: string | null;

  days: number;
  people: number;

  coffee: number;
  water: number;
  soda: number;
  beer: number;
  wine: number;
  cocktail: number;

  /*
   * Composición V2 de los cócteles.
   *
   * null/undefined = desconocida.
   *
   * Estos valores permiten resolver el
   * consumo alcohólico real sin inferir
   * que todos los cócteles llevan alcohol.
   */
  alcoholicCocktail?: number | null;

  nonAlcoholicCocktail?: number | null;

  alcoholicCocktails?: boolean;

  nonAlcoholicCocktails?: boolean;

  premiumCocktails?: boolean;

  bottledBeer?: boolean;

  premiumSpirits?: boolean;

  bottledWaterDailyAllowance?: boolean;

  bottledWaterUnlimited?: boolean;

  /*
   * Precios reales de paquetes
   * introducidos por el usuario.
   *
   * Contrato universal:
   *
   * packageKey -> precio personalizado
   *
   * El motor no necesita conocer
   * nombres específicos de paquetes
   * de ninguna naviera.
   */
  customPackagePrices?: Record<
    string,
    number | null | undefined
  >;
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
   */
  referencePricePerDay:
    number | null;

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
  /*
   * true = existen precios individuales
   * suficientes para ejecutar el cálculo
   * económico.
   *
   * false = podemos analizar cobertura,
   * pero no ahorro/rentabilidad.
   */
  economicDataAvailable: boolean;

  /*
   * Categorías cuyo precio individual
   * todavía falta.
   */
  missingOnboardPriceKeys:
    OnboardPriceKey[];

  /*
   * Cobertura disponible incluso cuando
   * la comparación económica no puede
   * ejecutarse.
   */
  coveragePackages:
    PackageCoverageResult[];

  /*
   * Reglas operativas resueltas para
   * todos los paquetes de la naviera.
   *
   * Siempre están disponibles aunque
   * falten datos económicos.
   */
  operationalRules:
    PackageOperationalRules[];

  /*
   * Resolución del consumo alcohólico
   * diario conocido.
   *
   * Por ahora es únicamente informativa:
   * no modifica cálculo, cobertura ni
   * recomendación.
   */
  alcoholConsumption:
    AlcoholConsumptionResolution;

  /*
   * Impacto descriptivo de las reglas
   * operativas sobre el consumo conocido.
   *
   * No modifica todavía cobertura,
   * economía ni recomendación.
   */
  operationalRuleImpacts:
    PackageOperationalRuleImpact[];

  packages:
    PackageComparisonResult[];

  bestPackage:
    PackageComparisonResult | null;

  anyPackageWorthIt: boolean;
};

/*
 * Unión completa de paquetes
 * disponibles mediante la capa
 * de servicio.
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
 * correspondiente al packageKey.
 *
 * Esta función es completamente
 * independiente de la naviera.
 */
function getCustomPrice(
  packageKey: PackageKey,
  input: ComparisonInput
):
  | number
  | null
  | undefined {
  return (
    input.customPackagePrices?.[
      packageKey
    ]
  );
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
   * PAQUETES ACTIVABLES SOLO
   * CON PRECIO DEL USUARIO
   *
   * Esta regla ya no depende
   * de ningún packageKey concreto.
   */
  if (
    pkg.economicActivation ===
    "user-price-only"
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
   * PAQUETES NORMALMENTE
   * HABILITADOS.
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
   * Precio real del usuario
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
   * ahorro bruto = ahorro efectivo.
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
   * Si falta una categoría cuyo coste
   * todavía no podemos cuantificar,
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
   * NAVIERA ACTIVA
   *
   * Comparison, Coverage, Packages
   * y Onboard Prices utilizarán
   * exactamente la misma naviera.
   */
  const activeCruiseLine =
    input.cruiseLine ??
    getDefaultCruiseLine();

  /*
   * Configuración completa de
   * la naviera seleccionada.
   */
  const cruiseLine =
    getCruiseLine(
      activeCruiseLine
    );

  /*
   * REGLAS OPERATIVAS
   *
   * Construimos el contexto real recibido
   * desde el wizard.
   *
   * Todavía no utilizamos estas reglas
   * para alterar cálculo, cobertura ni
   * recomendación.
   */
  const operationalRules =
    getPackageOperationalRules({
      cruiseLine:
        activeCruiseLine,

      market:
        input.market ?? null,

      sailingDate:
        input.sailingDate ?? null,
    });

  /*
   * CONSUMO ALCOHÓLICO V2
   *
   * Resolvemos únicamente lo que podemos
   * conocer con certeza.
   *
   * Si la composición de los cócteles no
   * está completa, alcoholicDrinksPerDay
   * permanecerá en null.
   *
   * Todavía no aplicamos límites
   * operativos sobre este valor.
   */
  const alcoholConsumption =
    resolveAlcoholConsumption({
      beer:
        input.beer,

      wine:
        input.wine,

      cocktail:
        input.cocktail,

      alcoholicCocktail:
        input.alcoholicCocktail,

      nonAlcoholicCocktail:
        input.nonAlcoholicCocktail,
    });

  /*
   * IMPACTO DE REGLAS OPERATIVAS
   *
   * Cruzamos las reglas de cada paquete
   * con el consumo alcohólico conocido.
   *
   * El resultado sigue siendo únicamente
   * descriptivo.
   */
  const operationalRuleImpacts =
    evaluateOperationalRuleImpacts(
      alcoholConsumption,
      operationalRules
    );

  /*
   * PRECIOS INDIVIDUALES
   *
   * Algunas navieras pueden estar
   * registradas aunque todavía no
   * dispongamos de una cesta económica
   * completa.
   */
  const onboardPriceValues =
    cruiseLine.onboardPriceValues as
      PartialOnboardPriceValues;

  const economicDataAvailable =
    hasCompleteOnboardPriceValues(
      onboardPriceValues
    );

  const missingOnboardPriceKeys =
    getMissingOnboardPriceKeys(
      onboardPriceValues
    );

  /*
   * PAQUETES
   *
   * Ya no pedimos implícitamente
   * los paquetes de Costa.
   *
   * Utilizamos explícitamente
   * la naviera activa.
   */
  const economicPackages =
    getAllPackages(
      activeCruiseLine
    )
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
   * Si existe un paquete económico
   * activo cuyo estado general sigue
   * pendiente, también debe incluirse
   * en el análisis de cobertura.
   *
   * La regla es universal y no depende
   * de un packageKey concreto.
   */
  const includePendingPackages =
    !economicDataAvailable ||
    economicPackages.some(
      (result) =>
        result.pkg.status ===
        "pending"
    );

  /*
   * COBERTURA
   *
   * Muy importante:
   * pasamos la MISMA naviera utilizada
   * por packages y onboard prices.
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

        alcoholicCocktails:
          input.alcoholicCocktails ??
          false,

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
        cruiseLine:
          activeCruiseLine,

        includePendingPackages,
      }
    );

  /*
   * DATOS ECONÓMICOS INCOMPLETOS
   *
   * No llamamos a calculator.ts con
   * null, 0 ni valores inventados.
   *
   * La cobertura permanece disponible
   * para la UI y para análisis futuros.
   */
  if (
    !economicDataAvailable
  ) {
    return {
      economicDataAvailable:
        false,

      missingOnboardPriceKeys,

      coveragePackages:
        coverageResults,

      operationalRules,

      alcoholConsumption,

      operationalRuleImpacts,

      packages: [],

      bestPackage: null,

      anyPackageWorthIt:
        false,
    };
  }

  /*
   * A partir de aquí el type guard ha
   * confirmado que los seis precios son
   * números válidos.
   */

  /*
   * RESULTADOS ECONÓMICOS
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

              /*
               * Estos precios ya proceden
               * de la naviera activa.
               */
              coffeePrice:
                onboardPriceValues
                  .coffee,

              waterPrice:
                onboardPriceValues
                  .water,

              sodaPrice:
                onboardPriceValues
                  .soda,

              beerPrice:
                onboardPriceValues
                  .beer,

              winePrice:
                onboardPriceValues
                  .wine,

              cocktailPrice:
                onboardPriceValues
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
   * Mayor ahorro primero.
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
   */
  const bestPackage =
    results.find(
      (pkg) =>
        pkg.savings > 0 &&
        pkg.fullyCovered
    ) ?? null;

  return {
    economicDataAvailable:
      true,

    missingOnboardPriceKeys,

    coveragePackages:
      coverageResults,

    operationalRules,

    alcoholConsumption,

    operationalRuleImpacts,

    packages:
      results,

    bestPackage,

    anyPackageWorthIt:
      bestPackage !== null,
  };
}