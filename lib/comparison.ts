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

import {
  createSelectedDrinkPrice,
  type SelectedDrinkPriceSource,
  type SelectedDrinkPriceContextRelevance,
} from "@/lib/selectedDrinkPrice";

import {
  resolveEconomicDrinkPrice,
} from "@/lib/economicDrinkPriceResolution";

import type {
  SelectedDrinkConsumption,
} from "@/lib/selectedDrinkConsumption";

import {
  evaluatePackageThresholdConsumptionImpact,
  type PackageThresholdConsumptionImpact,
} from "@/lib/packageThresholdConsumptionImpact";

import {
  evaluatePackageThresholdCruiseImpact,
  type PackageThresholdCruiseImpact,
} from "@/lib/packageThresholdCruiseImpact";

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

  sailingRegion?: string | null;

  onboardCurrency?: string | null;

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


  /*
   * Precios concretos seleccionados
   * por categoría.
   *
   * Su ausencia significa que todavía
   * no podemos evaluar económicamente
   * un threshold de precio.
   */
  selectedDrinkPrices?: Partial<
    Record<
      OnboardPriceKey,
      {
        category?:
          OnboardPriceKey;

        price:
          number | null | undefined;

        currency:
          string | null | undefined;

        source?:
          SelectedDrinkPriceSource;

        contextRelevance?:
          SelectedDrinkPriceContextRelevance;
      }
    >
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

export type PackageThresholdCruiseImpactResult = {
  packageKey:
    PackageKey;

  packageName:
    string;

  dailyImpact:
    PackageThresholdConsumptionImpact;

  cruiseImpact:
    PackageThresholdCruiseImpact;
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
   * Impacto del threshold durante todo
   * el crucero, separado del cálculo
   * económico principal.
   */
  thresholdCruiseImpacts:
    PackageThresholdCruiseImpactResult[];

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
export function resolveEconomicComparison(
  coverage:
    | {
        fullyCovered: boolean;

        uncoveredCategories:
          CoverageCategory[];
      }
    | undefined,

  savings: number,

  thresholdImpact?:
    PackageThresholdCruiseImpact
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
   * THRESHOLD ECONÓMICO
   *
   * known-unquantified:
   * sabemos que existen consumiciones
   * afectadas, pero todavía no podemos
   * conocer su coste adicional real.
   *
   * Por tanto, tampoco podemos afirmar
   * un ahorro efectivo definitivo.
   */
  if (
    thresholdImpact?.status ===
      "known-unquantified"
  ) {
    return {
      status:
        "partial-unknown",

      effectiveSavings:
        null,
    };
  }

  /*
   * Si el impacto está cuantificado,
   * descontamos únicamente el coste
   * adicional demostrado.
   *
   * savings permanece intacto como
   * ahorro económico base.
   */
  const thresholdAdditionalCost =
    thresholdImpact?.status ===
      "quantified" &&
    thresholdImpact
      .additionalCostTotal !== null
      ? thresholdImpact
          .additionalCostTotal
      : 0;

  const thresholdAdjustedSavings =
    savings -
    thresholdAdditionalCost;

  /*
   * Cobertura completa:
   * el ahorro efectivo incorpora cualquier
   * coste de threshold ya cuantificado.
   */
  if (
    coverage.fullyCovered
  ) {
    return {
      status:
        "complete",

      effectiveSavings:
        thresholdAdjustedSavings,
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

export function findBestPackageByEffectiveSavings(
  packages: PackageComparisonResult[]
): PackageComparisonResult | null {
  return (
    packages.find(
      (pkg) =>
        pkg.fullyCovered &&
        pkg.effectiveSavings !== null &&
        pkg.effectiveSavings > 0
    ) ?? null
  );
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

      sailingRegion:
        input.sailingRegion ?? null,

      onboardCurrency:
        input.onboardCurrency ?? null,

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
   * BEBIDAS CON PRECIO EXPLÍCITO
   *
   * No utilizamos los precios medios de
   * la naviera como sustituto de una bebida
   * concreta seleccionada por el usuario.
   */
  const selectedDrinkConsumptions:
    SelectedDrinkConsumption[] = (
      [
        ["coffee", input.coffee],
        ["water", input.water],
        ["soda", input.soda],
        ["beer", input.beer],
        ["wine", input.wine],
        ["cocktail", input.cocktail],
      ] as const
    )
      .map(
        ([category, quantityPerDay]) => {
          if (
            !Number.isFinite(
              quantityPerDay
            ) ||
            quantityPerDay <= 0
          ) {
            return null;
          }

          const selectedPrice =
            input
              .selectedDrinkPrices
              ?.[category];

          const drink =
            createSelectedDrinkPrice({
              category,

              price:
                selectedPrice?.price,

              currency:
                selectedPrice?.currency,

              source:
                selectedPrice?.source,

              contextRelevance:
                selectedPrice?.contextRelevance,
            });

          if (!drink) {
            return null;
          }

          const economicPrice =
            resolveEconomicDrinkPrice(
              drink
            );

          if (economicPrice === null) {
            return null;
          }

          const economicDrink =
            createSelectedDrinkPrice({
              category,

              price:
                economicPrice,

              currency:
                drink.currency,

              source:
                drink.source,

              contextRelevance:
                drink.contextRelevance,
            });

          if (!economicDrink) {
            return null;
          }

          return {
            drink:
              economicDrink,

            quantityPerDay,
          };
        }
      )
      .filter(
        (
          item
        ): item is SelectedDrinkConsumption =>
          item !== null
      );

  const hasSelectedDrinkPriceInput =
    input.selectedDrinkPrices !==
    undefined;

  const totalDrinksPerDay =
    input.coffee +
    input.water +
    input.soda +
    input.beer +
    input.wine +
    input.cocktail;

  const economicallyResolvedDrinksPerDay =
    selectedDrinkConsumptions.reduce(
      (
        total,
        consumption
      ) =>
        total +
        consumption.quantityPerDay,
      0
    );

  /*
   * Puede existir consumo real aunque una
   * referencia seleccionada no sea admisible
   * como evidencia económica.
   *
   * En ese caso no concluimos "none":
   * el impacto económico sigue siendo unknown.
   */
  const hasUnresolvedEconomicDrinkConsumption =
    hasSelectedDrinkPriceInput &&
    economicallyResolvedDrinksPerDay <
      totalDrinksPerDay;

  /*
   * IMPACTO ECONÓMICO DEL THRESHOLD
   *
   * Se mantiene separado de savings,
   * drinksCost y recommended.
   */
  const thresholdCruiseImpacts:
    PackageThresholdCruiseImpactResult[] =
      operationalRules.map(
        (operationalRule) => {
          const dailyImpact:
            PackageThresholdConsumptionImpact =
              hasSelectedDrinkPriceInput &&
              !hasUnresolvedEconomicDrinkConsumption
                ? evaluatePackageThresholdConsumptionImpact(
                    operationalRule,
                    selectedDrinkConsumptions
                  )
                : {
                    status:
                      "unknown",

                    items: [],

                    totalDrinksPerDay,

                    drinksAboveThresholdPerDay:
                      null,

                      drinksExcludedFromCoveragePerDay:
                        null,

                    additionalCostPerDay:
                      null,
                  };

          return {
            packageKey:
              operationalRule
                .packageKey,

            packageName:
              operationalRule
                .packageName,

            dailyImpact,

            cruiseImpact:
              evaluatePackageThresholdCruiseImpact({
                dailyImpact,

                days:
                  input.days,

                people:
                  input.people,
              }),
          };
        }
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


      thresholdCruiseImpacts,

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

          const thresholdImpact =
            thresholdCruiseImpacts.find(
              (impact) =>
                impact.packageKey ===
                packageKey
            )?.cruiseImpact;

          const economicComparison =
            resolveEconomicComparison(
              coverage,
              calculation.savings,
              thresholdImpact
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
   * ORDEN ECONÓMICO
   *
   * Priorizamos comparaciones cuyo ahorro
   * efectivo puede calcularse.
   *
   * effectiveSavings === null significa
   * que existe incertidumbre económica y
   * no debe ganar frente a una alternativa
   * cuantificada.
   */
  results.sort(
    (a, b) => {
      const aEffective =
        a.effectiveSavings;

      const bEffective =
        b.effectiveSavings;

      if (
        aEffective !== null &&
        bEffective !== null
      ) {
        return (
          bEffective -
          aEffective
        );
      }

      if (aEffective !== null) {
        return -1;
      }

      if (bEffective !== null) {
        return 1;
      }

      /*
       * Si ambos son inciertos,
       * savings continúa siendo útil
       * como criterio secundario.
       */
      return (
        b.savings -
        a.savings
      );
    }
  );

  /*
   * RECOMENDACIÓN FINAL
   *
   * Para ser recomendado:
   *
   * 1. cobertura completa;
   * 2. ahorro efectivo conocido;
   * 3. ahorro efectivo positivo.
   */
  const bestPackage =
    findBestPackageByEffectiveSavings(
      results
    );

  return {
    economicDataAvailable:
      true,

    missingOnboardPriceKeys,

    coveragePackages:
      coverageResults,

    operationalRules,


  thresholdCruiseImpacts,

  alcoholConsumption,


  operationalRuleImpacts,


  packages:
      results,

    bestPackage,

    anyPackageWorthIt:
      bestPackage !== null,
  };
}
