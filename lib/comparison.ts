import { calculateRecommendation } from "@/lib/calculator";
import type { AdultConsumptionProfile } from "@/lib/adultConsumptionProfiles";
import { calculateAdultProfileGroupRecommendation } from "@/lib/adultProfileGroupCalculation";

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
  onboardPriceKeys,
  type CalculationOnboardPriceValues,
  type OnboardPriceConsumptionValues,
  type OnboardPriceKey,
  type PartialOnboardPriceValues,
} from "@/lib/onboardPriceService";

import {
  getPackageOperationalRules,
  type PackageOperationalRules,
} from "@/lib/packageRules";

import {
  resolvePackageChargeUnits,
} from "@/lib/packageChargeUnits";


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
  resolveEffectiveDrinkPrices,
} from "@/lib/economicDrinkPriceResolution";

import {
  type CustomPackagePrice,
} from "@/lib/customPackagePrice";
import {
  resolveEconomicPackage,
  type ResolvedEconomicPackage,
} from "@/lib/economicPackageResolution";

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

import {
  getCostaDocumentedDrinkPriceById,
  resolveCostaDocumentedPackageCoverage,
} from "@/lib/costaDocumentedDrinkPriceService";

import {
  getMscDocumentedDrinkPriceById,
  resolveMscDocumentedPackageCoverage,
} from "@/lib/mscDocumentedDrinkPriceService";

export type PriceSource =
  | "user"
  | "reference"
  | "included";

export type EconomicComparisonStatus =
  | "complete"
  | "partial-calculable"
  | "partial-unknown";

export type ComparisonInput = {
  /*
   * Naviera que debe utilizar
   * el motor.
   *
   * Se mantiene opcional por compatibilidad;
   * Costa continúa siendo el valor por
   * defecto cuando no se proporciona.
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

  cruiseNights: number;
  people: number;

  coffee: number;
  water: number;
  soda: number;
  juice?: number;
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
    | CustomPackagePrice
    | number
    | null
    | undefined
  >;

  includedPackageKey?: string | null;


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

        referenceId?:
          string | null;
      }
    >
  >;

  documentedDrinkQuantities?:
    Record<string, number>;

  adultConsumptionProfiles?: readonly AdultConsumptionProfile[];
};

export type PackageComparisonResult = {
  packageKey: PackageKey;

  packageName: string;

  currency: string;

  /*
   * Precio realmente utilizado
   * en el cálculo.
   */
  packagePricePerChargeUnit: number;

  priceSource: PriceSource;

  /*
   * Precio de referencia DrinkPilot.
   *
   * null = no existe actualmente
   * una referencia suficientemente
   * fiable para ese paquete.
   */
  referencePricePerChargeUnit:
    number | null;

  packageCost: number;

  drinksCost: number;

  savings: number;

  effectiveSavings:
    number | null;

  documentedProductAdditionalCost:
    number;

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

  currency:
    string | null;

  dailyImpact:
    PackageThresholdConsumptionImpact;

  cruiseImpact:
    PackageThresholdCruiseImpact;
};

export type ComparisonResult = {
  /*
   * Moneda común de la cesta económica.
   * Todos los importes base se expresan
   * en este código ISO.
   */
  economicCurrency: string;

  /*
   * Cesta efectiva utilizada por todos los
   * cálculos económicos y por la UI.
   */
  economicDrinkPrices:
    PartialOnboardPriceValues;

  /*
   * Cesta numérica final utilizada por el
   * calculador. Incluye precios ponderados de
   * productos documentados elegidos por el usuario.
   */
  calculationDrinkPrices:
    CalculationOnboardPriceValues | null;

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
   * el crucero. Puede ajustar o volver
   * desconocido el ahorro efectivo.
   */
  thresholdCruiseImpacts:
    PackageThresholdCruiseImpactResult[];

  /*
   * Resolución del consumo alcohólico
   * diario conocido.
   *
   * No modifica por sí sola el cálculo:
   * alimenta la evaluación posterior de
   * las reglas operativas.
   */
  alcoholConsumption:
    AlcoholConsumptionResolution;

  /*
   * Impacto estructurado de las reglas
   * operativas sobre el consumo conocido.
   * La comparación puede utilizar una
   * incertidumbre económica demostrada
   * para calificar el ahorro efectivo.
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
    PackageThresholdCruiseImpact,

  operationalEconomicImpact?:
    PackageOperationalRuleImpact[
      "economicImpact"
    ],

  documentedProductAdditionalCost = 0,

  documentedProductCoverageFullyResolved = false
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
   * LÍMITE DIARIO DE ALCOHOL
   *
   * Solo cerramos el ahorro efectivo
   * cuando conocemos tanto el exceso como
   * la política económica aplicable.
   *
   * El coste permanece sin cuantificar:
   * no sabemos qué bebidas concretas se
   * consumen después de alcanzar el límite
   * ni el importe exacto de las propinas.
   */
  if (
    operationalEconomicImpact
      ?.status ===
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
    thresholdAdditionalCost -
    documentedProductAdditionalCost;

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

  if (
    documentedProductCoverageFullyResolved
  ) {
    return {
      status: "complete",
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

type EffectiveSavingsCandidate = {
  fullyCovered: boolean;

  effectiveSavings:
    number | null;
};

function resolveRecommendationLevelFromDailyMargin(
  dailyMargin: number
): PackageComparisonResult["recommendationLevel"] {
  if (dailyMargin <= 0) return "not-worth-it";
  if (dailyMargin < 3) return "very-close";
  if (dailyMargin < 8) return "worth-considering";
  if (dailyMargin < 15) return "worth-it";
  return "strongly-worth-it";
}

export function findBestPackageByEffectiveSavings<
  Candidate extends
    EffectiveSavingsCandidate,
>(
  packages: Candidate[]
): Candidate | null {
  let bestPackage: Candidate | null = null;

  for (const pkg of packages) {
    if (
      !pkg.fullyCovered ||
      pkg.effectiveSavings === null ||
      pkg.effectiveSavings <= 0
    ) {
      continue;
    }

    if (
      bestPackage === null ||
      pkg.effectiveSavings >
        (bestPackage.effectiveSavings ??
          -Infinity)
    ) {
      bestPackage = pkg;
    }
  }

  return bestPackage;
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

  const economicCurrency =
    input.onboardCurrency
      ?.trim()
      .toUpperCase() ||
    cruiseLine.currency;

  /*
   * REGLAS OPERATIVAS
   *
   * Construimos el contexto real recibido
   * desde el wizard.
   *
   * La mayoría de reglas continúan siendo
   * descriptivas.
   *
   * Algunas reglas explícitamente modeladas
   * pueden participar en el cálculo económico,
   * como la política de unidades facturables
   * del paquete.
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
   * Este valor alimenta la evaluación
   * posterior de límites operativos.
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
   * El resultado conserva el detalle
   * descriptivo; la comparación económica
   * decide después si debe utilizarlo.
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
  const categorySelectedDrinkConsumptions:
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

              referenceId:
                selectedPrice?.referenceId,
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

              referenceId:
                drink.referenceId,
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

  const categoryConsumptionPerDay = {
    coffee: input.coffee,
    water: input.water,
    soda: input.soda,
    juice: input.juice ?? 0,
    beer: input.beer,
    wine: input.wine,
    cocktail: input.cocktail,
  } satisfies Record<OnboardPriceKey, number>;

  /*
   * Las selecciones documentadas expresan
   * variedad o preferencia relativa, no
   * consumiciones adicionales. El total
   * diario sigue viniendo exclusivamente
   * del paso de consumo.
   */
  const validDocumentedSelections =
    Object.entries(
      input.documentedDrinkQuantities ?? {}
    ).flatMap(
      ([referenceId, selectionWeight]) => {
              const reference =
                activeCruiseLine === "costa"
                  ? getCostaDocumentedDrinkPriceById(
                      referenceId
                    )
                  : getMscDocumentedDrinkPriceById(
                      referenceId
                    );

              if (
                !reference ||
                !Number.isSafeInteger(selectionWeight) ||
                selectionWeight <= 0
              ) {
                return [];
              }

              return [{ reference, selectionWeight }];
            }
          );

  const documentedSelectionWeightByCategory =
    validDocumentedSelections.reduce(
      (totals, selection) => ({
        ...totals,
        [selection.reference.category]:
          (totals[
            selection.reference.category
          ] ?? 0) + selection.selectionWeight,
      }),
      {} as Partial<Record<OnboardPriceKey, number>>
    );

  const documentedDrinkConsumptions:
    SelectedDrinkConsumption[] =
      validDocumentedSelections.flatMap(
        ({ reference, selectionWeight }) => {
              const totalCategoryWeight =
                documentedSelectionWeightByCategory[
                  reference.category
                ] ?? 0;

              const quantityPerDay =
                totalCategoryWeight > 0
                  ? (categoryConsumptionPerDay[
                      reference.category
                    ] *
                      selectionWeight) /
                    totalCategoryWeight
                  : 0;

              if (quantityPerDay <= 0) {
                return [];
              }

              const drink =
                createSelectedDrinkPrice({
                  category: reference.category,
                  price: reference.price,
                  currency: reference.currency,
                  source: "documented-menu",
                  referenceId: reference.id,
                  /*
                   * La cantidad documentada es una elección
                   * explícita del usuario dentro de la carta,
                   * no una referencia aplicada automáticamente.
                   */
                  contextRelevance: "exact",
                });

              return drink
                ? [{ drink, quantityPerDay }]
                : [];
            }
          );

  const documentedCategories =
    new Set(
      validDocumentedSelections.map(
        (selection) =>
          selection.reference.category
      )
    );

  const selectedDrinkConsumptions = [
    ...categorySelectedDrinkConsumptions.filter(
      (consumption) =>
        !documentedCategories.has(
          consumption.drink.category
        )
    ),
    ...documentedDrinkConsumptions,
  ];

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

            currency:
              operationalRule
                .drinkPriceThresholdCurrency,

            dailyImpact,

            cruiseImpact:
              evaluatePackageThresholdCruiseImpact({
                dailyImpact,

                cruiseNights:
                  input.cruiseNights,

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
  const referenceDrinkPrices =
    economicCurrency ===
    cruiseLine.currency
      ? (cruiseLine.onboardPriceValues as
          PartialOnboardPriceValues)
      : (Object.fromEntries(
          onboardPriceKeys.map(
            (category) => [
              category,
              null,
            ]
          )
        ) as PartialOnboardPriceValues);

  const economicDrinkPrices =
    resolveEffectiveDrinkPrices(
      referenceDrinkPrices,
      input.selectedDrinkPrices ?? {},
      economicCurrency
    );

  const onboardPriceConsumption:
    OnboardPriceConsumptionValues = {
    coffee:
      input.coffee,

    water:
      input.water,

    soda:
      input.soda,

    juice:
      input.juice ?? 0,

    beer:
      input.beer,

    wine:
      input.wine,

    cocktail:
      input.cocktail,
  };

  const calculationDrinkPriceEntries =
    onboardPriceKeys.map(
            (category) => {
              const categoryQuantity =
                onboardPriceConsumption[category] ?? 0;

              const documentedForCategory =
                documentedDrinkConsumptions.filter(
                  (consumption) =>
                    consumption.drink.category ===
                    category
                );

              const documentedQuantity =
                documentedForCategory.reduce(
                  (total, consumption) =>
                    total +
                    consumption.quantityPerDay,
                  0
                );

              if (
                categoryQuantity <= 0
              ) {
                return [category, 0] as const;
              }

              if (
                documentedQuantity <= 0 ||
                documentedQuantity >
                  categoryQuantity
              ) {
                return [
                  category,
                  economicDrinkPrices[category],
                ] as const;
              }

              const documentedCost =
                documentedForCategory.reduce(
                  (total, consumption) =>
                    total +
                    consumption.drink.price *
                      consumption.quantityPerDay,
                  0
                );

              const genericQuantity =
                categoryQuantity -
                documentedQuantity;

              const genericPrice =
                economicDrinkPrices[category];

              if (
                genericQuantity > 0 &&
                (typeof genericPrice !== "number" ||
                  genericPrice <= 0)
              ) {
                return [category, null] as const;
              }

              return [
                category,
                (documentedCost +
                  genericQuantity *
                    (genericPrice ?? 0)) /
                  categoryQuantity,
              ] as const;
            }
          );

  const calculationDrinkPrices =
    calculationDrinkPriceEntries.some(
      ([, price]) =>
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price < 0
    )
      ? null
      : (Object.fromEntries(
          calculationDrinkPriceEntries
        ) as CalculationOnboardPriceValues);

  const economicDataAvailable =
    calculationDrinkPrices !==
    null;

  const missingOnboardPriceKeys =
    calculationDrinkPriceEntries.flatMap(
      ([category, price]) =>
        (onboardPriceConsumption[category] ?? 0) > 0 &&
        (typeof price !== "number" ||
          !Number.isFinite(price) ||
          price <= 0)
          ? [category]
          : []
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
          input.customPackagePrices,
          input.includedPackageKey,
          economicCurrency
        )
      )
      .filter(
        (
          result
        ): result is ResolvedEconomicPackage =>
          result !== null &&
          result.resolvedPrice.currency
            .trim()
            .toUpperCase() ===
            economicCurrency
              .trim()
              .toUpperCase()
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

        juice:
          input.juice ?? 0,

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

        selectedDrinkReferenceIds:
          Object.fromEntries(
            onboardPriceKeys.flatMap(
              (category) => {
                const referenceIds =
                  selectedDrinkConsumptions.flatMap(
                    (consumption) =>
                      consumption.drink.category ===
                        category &&
                      consumption.drink.referenceId
                        ? [consumption.drink.referenceId]
                        : []
                  );

                return referenceIds.length > 0
                  ? [[category, referenceIds]]
                  : [];
              }
            )
          ),
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
    calculationDrinkPrices ===
    null
  ) {
    return {
      economicCurrency,

      economicDrinkPrices,

      calculationDrinkPrices,

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
      economicPackages.flatMap(
        ({
          pkg,
          packageKey,
          referencePrice,
          resolvedPrice,
        }) => {
          const operationalRule =
            operationalRules.find(
              (rule) =>
                rule.packageKey ===
                packageKey
            );

          const packageChargeUnitPolicy =
            operationalRule
              ?.packageChargeUnitPolicy ??
            "unknown";

          const packageChargeUnits =
            resolvePackageChargeUnits({
              cruiseNights:
                input.cruiseNights,

              packageChargeUnitPolicy:
                packageChargeUnitPolicy,
            });

          /*
           * Con la entrada canónica en noches no
           * fabricamos una equivalencia económica
           * para políticas todavía desconocidas.
           * El paquete conserva su cobertura, pero
           * queda fuera de la comparación monetaria.
           */
          if (
            packageChargeUnits.status !==
              "resolved"
          ) {
            return [];
          }

          const commonCalculationInput = {
              cruiseNights:
                input.cruiseNights,

              packageChargeUnits:
                packageChargeUnits
                  .chargeUnits,

              packagePricePerChargeUnit:
                resolvedPrice.price,

              /*
               * Todos los cálculos utilizan
               * la misma cesta económica.
               */
              coffeePrice:
                calculationDrinkPrices
                  .coffee,

              waterPrice:
                calculationDrinkPrices
                  .water,

              juicePrice:
                calculationDrinkPrices
                  .juice,

              sodaPrice:
                calculationDrinkPrices
                  .soda,

              beerPrice:
                calculationDrinkPrices
                  .beer,

              winePrice:
                calculationDrinkPrices
                  .wine,

              cocktailPrice:
                calculationDrinkPrices
                  .cocktail,
            };

          const profileCalculation =
            input.adultConsumptionProfiles?.length
              ? calculateAdultProfileGroupRecommendation({
                  ...commonCalculationInput,
                  profiles: input.adultConsumptionProfiles,
                })
              : null;

          const calculation = profileCalculation
            ? {
                packageCost: profileCalculation.packageCost,
                drinksCost: profileCalculation.drinksCost,
                savings: profileCalculation.savings,
                dailyDrinkCost: profileCalculation.dailyDrinkCostPerAdult,
                dailyMargin: profileCalculation.dailyMarginPerAdult,
                savingsPercentage: profileCalculation.savingsPercentage,
                recommended: profileCalculation.recommended,
                breakEvenDrinksPerDay:
                  profileCalculation.breakEvenDrinksPerDayPerAdult,
              }
            : calculateRecommendation({
                ...commonCalculationInput,
                people: input.people,
                coffee: input.coffee,
                water: input.water,
                soda: input.soda,
                juice: input.juice ?? 0,
                beer: input.beer,
                wine: input.wine,
                cocktail: input.cocktail,
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

          const operationalEconomicImpact =
            operationalRuleImpacts.find(
              (impact) =>
                impact.packageKey ===
                packageKey
            )?.economicImpact;

          const documentedProductAdditionalCost =
            selectedDrinkConsumptions.reduce(
                  (total, consumption) => {
                    const referenceId =
                      consumption.drink.referenceId;

                    if (!referenceId) {
                      return total;
                    }

                    const productCoverage =
                      activeCruiseLine === "costa"
                        ? resolveCostaDocumentedPackageCoverage(
                            referenceId,
                            packageKey
                          )
                        : resolveMscDocumentedPackageCoverage(
                            referenceId,
                            packageKey
                          );

                    return productCoverage?.status ===
                      "notIncluded"
                      ? total +
                          consumption.drink.price *
                            consumption.quantityPerDay *
                            input.cruiseNights *
                            input.people
                      : total;
                  },
                  0
                );

          const documentedProductCoverageFullyResolved =
            Boolean(coverage) &&
            coverage!.uncoveredCategories.length > 0 &&
            coverage!.uncoveredCategories.every(
              (category) => {
                const priceCategory =
                  category as OnboardPriceKey;

                const consumptions =
                  documentedDrinkConsumptions.filter(
                    (consumption) =>
                      consumption.drink.category ===
                      priceCategory
                  );

                const allocatedQuantity =
                  consumptions.reduce(
                    (total, consumption) =>
                      total +
                      consumption.quantityPerDay,
                    0
                  );

                return (
                  allocatedQuantity ===
                    onboardPriceConsumption[
                      priceCategory
                    ] &&
                  consumptions.some(
                    (consumption) =>
                      consumption.drink.referenceId &&
                      (activeCruiseLine === "costa"
                        ? resolveCostaDocumentedPackageCoverage(
                            consumption.drink.referenceId,
                            packageKey
                          )
                        : resolveMscDocumentedPackageCoverage(
                            consumption.drink.referenceId,
                            packageKey
                          ))?.status ===
                        "notIncluded"
                  )
                );
              }
            );

          const economicComparison =
            resolveEconomicComparison(
              coverage,
              calculation.savings,
              thresholdImpact,
              operationalEconomicImpact,
              documentedProductAdditionalCost,
              documentedProductCoverageFullyResolved
            );

          /*
           * MÉTRICAS DIARIAS EFECTIVAS
           *
           * calculator.ts resuelve la economía
           * base del paquete.
           *
           * Si posteriormente conocemos un coste
           * adicional de threshold, las métricas
           * que mostramos al usuario deben contar
           * la misma historia que effectiveSavings.
           */
          const economicMultiplier =
            input.cruiseNights *
            input.people;

          const effectiveDailyMargin =
            economicComparison
              .effectiveSavings !==
                null &&
            economicMultiplier > 0
              ? economicComparison
                  .effectiveSavings /
                economicMultiplier
              : calculation
                  .dailyMargin;

          const thresholdAdditionalCostTotal =
            thresholdImpact?.status ===
                "quantified" &&
              thresholdImpact
                .additionalCostTotal !==
                null
              ? thresholdImpact
                  .additionalCostTotal
              : 0;

          const thresholdAdditionalCostPerPersonDay =
            economicMultiplier > 0
              ? thresholdAdditionalCostTotal /
                economicMultiplier
              : 0;

          const documentedProductAdditionalCostPerPersonDay =
            economicMultiplier > 0
              ? documentedProductAdditionalCost /
                economicMultiplier
              : 0;

          /*
           * Valor diario que realmente aporta
           * el patrón de bebidas frente al paquete
           * después de descontar los cargos por
           * superar thresholds conocidos.
           */
          const effectiveDailyDrinkValue =
            calculation
              .dailyDrinkCost -
            thresholdAdditionalCostPerPersonDay -
            documentedProductAdditionalCostPerPersonDay;

          const effectiveAverageDrinkValue =
            totalDrinksPerDay > 0
              ? effectiveDailyDrinkValue /
                totalDrinksPerDay
              : 0;

          const effectivePackageCostPerPersonDay =
            economicMultiplier > 0
              ? calculation
                  .packageCost /
                economicMultiplier
              : 0;

          const effectiveBreakEvenDrinksPerDay =
            economicComparison
              .effectiveSavings !==
                null &&
            effectiveAverageDrinkValue > 0
              ? effectivePackageCostPerPersonDay /
                effectiveAverageDrinkValue
              : calculation
                  .breakEvenDrinksPerDay;

          return [{
            packageKey,

            packageName:
              pkg.name,

            currency:
              resolvedPrice.currency,

            packagePricePerChargeUnit:
              resolvedPrice.price,

            priceSource:
              resolvedPrice.source,

            referencePricePerChargeUnit:
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

            documentedProductAdditionalCost,

            economicComparisonStatus:
              economicComparison
                .status,

            dailyDrinkCost:
              calculation.dailyDrinkCost,

            dailyMargin:
              effectiveDailyMargin,

            savingsPercentage:
              economicComparison.effectiveSavings !==
                null &&
              calculation.drinksCost > 0
                ? (economicComparison.effectiveSavings /
                    calculation.drinksCost) *
                  100
                : calculation.savingsPercentage,

            recommended:
              economicComparison.effectiveSavings !==
              null
                ? economicComparison.effectiveSavings >
                  0
                : calculation.recommended,

            recommendationLevel:
              resolveRecommendationLevelFromDailyMargin(
                effectiveDailyMargin
              ),

            breakEvenDrinksPerDay:
              effectiveBreakEvenDrinksPerDay,

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
          }];
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
    economicCurrency,

    economicDrinkPrices,

    calculationDrinkPrices,

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
