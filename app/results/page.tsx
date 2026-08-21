"use client";

import { useRouter } from "next/navigation";

import { useStore } from "@/lib/store";
import { compareDrinkPackages } from "@/lib/comparison";
import { calculateAdultProfileGroupRecommendation } from "@/lib/adultProfileGroupCalculation";
import { aggregateAdultConsumptionProfiles } from "@/lib/adultConsumptionProfiles";
import { CoverageCategory } from "@/lib/coverage";
import { formatCoverageCategoryLabel } from "@/lib/coverageDisplay";
import { resolveComparisonHeader } from "@/lib/comparisonHeader";
import { formatPackagePricePerChargeUnit } from "@/lib/packagePriceDisplay";
import { buildRecommendationExplanation } from "@/lib/recommendationExplanation";
import { resolveDisplayedEconomicDifference } from "@/lib/economicDifferenceDisplay";

import {
  buildOperationalRuleNotices,
  filterAdultOperationalRuleNotices,
  getOperationalRuleNoticeImpactLabel,
} from "@/lib/operationalRuleExplanation";

import {
  buildOperationalImpactExplanations,
} from "@/lib/operationalImpactExplanation";

import {
  filterAdultPackageItems,
} from "@/lib/adultPackageFilter";

import {
  getCruiseLine,
} from "@/data/cruiseLines";

import DataConfidencePanel from "@/components/DataConfidencePanel";
import ConsumptionSummary from "@/components/results/ConsumptionSummary";
import EconomicOptionsComparison from "@/components/results/EconomicOptionsComparison";
import MinorsCalculationNotice from "@/components/results/MinorsCalculationNotice";
import { WizardBrand } from "@/components/Brand";

import {
  formatCurrency,
  formatSignedCurrency,
} from "@/lib/currencyFormatting";

import {
  resolveEconomicDrinkPriceForCurrency,
} from "@/lib/economicDrinkPriceResolution";

import {
  resolveEconomicComparisonAvailability,
} from "@/lib/packageEconomicAvailability";

import {
  useWizardRouteGuard,
} from "@/lib/useWizardRouteGuard";

import {
  resolveIncludedPackageUpgradeDecision,
} from "@/lib/includedPackageUpgrade";

import {
  buildEconomicOptionsComparison,
} from "@/lib/economicOptionsComparison";

import {
  isBreakEvenAvailable,
} from "@/lib/breakEvenAvailability";

const coverageLabels: Record<
  CoverageCategory,
  string
> = {
  coffee: "café",
  water: "agua",
  soda: "refrescos",
  juice: "zumos",
  beer: "cerveza",
  wine: "vino",
  cocktail: "cócteles",

  alcoholicCocktails:
    "cócteles con alcohol",

  nonAlcoholicCocktails:
    "cócteles sin alcohol",

  premiumCocktails:
    "cócteles premium",

  bottledBeer:
    "cerveza embotellada",

  premiumSpirits:
    "destilados premium",

  bottledWaterDailyAllowance:
    "una botella de agua diaria",

  bottledWaterUnlimited:
    "agua embotellada sin límite",
};

export default function ResultsPage() {
  const router = useRouter();

  const {
    data,
    resetData,
  } = useStore();

  const {
    hydrated,
    ready,
  } = useWizardRouteGuard(
    "people"
  );

  /*
   * NAVIERA ACTIVA
   *
   * Results deja de importar
   * directamente los datos de Costa.
   */
  const cruiseLine =
    getCruiseLine(
      data.cruiseLine
    );

  const profileConsumption = aggregateAdultConsumptionProfiles(
    data.adultConsumptionProfiles
  );
  const totalDrinksPerDay = Object.values(
    profileConsumption.group
  ).reduce((total, quantity) => total + quantity, 0);

  const selectedPremiumPreferences = [
    data.alcoholicCocktails,
    data.nonAlcoholicCocktails,
    data.premiumCocktails,
    data.bottledBeer,
    data.premiumSpirits,

    /*
     * El agua ilimitada implica también
     * la asignación diaria, pero representa
     * una única preferencia del usuario.
     */
    data.bottledWaterUnlimited ||
      data.bottledWaterDailyAllowance,
  ].filter(Boolean).length;

  const waterConsumptionLabel =
    data.cruiseLine === "msc"
      ? "💧 Agua no embotellada (AQUA by MSC)"
      : "💧 Agua";

  /*
   * Conteo universal de precios reales.
   *
   * Ya no depende de nombres de
   * paquetes concretos de Costa.
   */
  const customPricesUsed =
    Object.values(
      data.customPackagePrices
    ).filter(
      (price) =>
        price !== null
    ).length;

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-4xl">
            🍹
          </div>

          <p className="mt-4 font-medium text-slate-700">
            Recuperando tu análisis...
          </p>
        </div>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-4xl">
            🧭
          </div>

          <p className="mt-4 font-medium text-slate-700">
            Comprobando los datos de tu análisis...
          </p>
        </div>
      </main>
    );
  }

  /*
   * COMPARACIÓN
   *
   * Se ejecuta antes del baseline porque
   * algunas navieras pueden tener cobertura
   * verificada sin disponer todavía de una
   * cesta completa de precios individuales.
   */
  const comparison =
    compareDrinkPackages({
      cruiseLine:
        data.cruiseLine,

      market:
        data.market,

      sailingRegion:
        data.sailingRegion,

      onboardCurrency:
        data.onboardCurrency,

      sailingDate:
        data.sailingDate,

      cruiseNights:
        data.cruiseNights ?? 0,

      people:
        data.people,

      coffee: profileConsumption.perAdultAverage.coffee,

      water: profileConsumption.perAdultAverage.water,

      soda: profileConsumption.perAdultAverage.soda,

      juice: profileConsumption.perAdultAverage.juice,

      beer: profileConsumption.perAdultAverage.beer,

      wine: profileConsumption.perAdultAverage.wine,

      cocktail: profileConsumption.perAdultAverage.cocktail,

      alcoholicCocktail:
        data.alcoholicCocktail,

      nonAlcoholicCocktail:
        data.nonAlcoholicCocktail,

      alcoholicCocktails:
        data.alcoholicCocktails,

      nonAlcoholicCocktails:
        data.nonAlcoholicCocktails,

      premiumCocktails:
        data.premiumCocktails,

      bottledBeer:
        data.bottledBeer,

      premiumSpirits:
        data.premiumSpirits,

      bottledWaterDailyAllowance:
        data.bottledWaterDailyAllowance,

      bottledWaterUnlimited:
        data.bottledWaterUnlimited,

      customPackagePrices:
        data.customPackagePrices,

      includedPackageKey:
        data.includedPackageKey,

      selectedDrinkPrices:
        data.selectedDrinkPrices,

      documentedDrinkQuantities:
        data.documentedDrinkQuantities,

      adultConsumptionProfiles:
        data.adultConsumptionProfiles,
    });

  const calculationDrinkPrices =
    comparison.calculationDrinkPrices;

  const economicCurrency =
    comparison.economicCurrency;

  const economicComparisonAvailability =
    resolveEconomicComparisonAvailability({
      economicDrinkPricesAvailable:
        comparison.economicDataAvailable &&
        calculationDrinkPrices !==
          null,

      comparedPackageCount:
        comparison.packages.length,
    });

  /*
   * AVISOS OPERATIVOS
   *
   * Se resuelven antes de cualquier
   * salida temprana para que también
   * estén disponibles cuando solo
   * podemos ofrecer análisis de cobertura.
   */
  const allOperationalNotices =
    buildOperationalRuleNotices(
      comparison.operationalRules
    );

  const allOperationalImpactExplanations =
    buildOperationalImpactExplanations(
      comparison.operationalRuleImpacts
    );

  /*
   * IMPACTO ECONÓMICO DEL THRESHOLD
   *
   * Solo mostramos impactos cuyo efecto
   * durante el crucero ya conocemos.
   *
   * "known-unquantified" significa:
   * sabemos cuántas bebidas quedan
   * por encima del threshold, pero todavía
   * no inventamos un coste adicional.
   */
  const thresholdCruiseImpacts =
    comparison.thresholdCruiseImpacts.filter(
      (item) =>
        (item.cruiseImpact.status ===
          "known-unquantified" ||
          item.cruiseImpact.status ===
            "quantified") &&
        item.cruiseImpact.drinksAboveThreshold !==
          null &&
        item.cruiseImpact.drinksAboveThreshold > 0
    );

  /*
   * DATOS ECONÓMICOS INCOMPLETOS
   *
   * No fabricamos precios ni ejecutamos
   * calculator.ts con valores desconocidos.
   *
   * Seguimos mostrando la cobertura que
   * DrinkPilot sí puede verificar.
   */
  if (
    economicComparisonAvailability !==
      "available" ||
    calculationDrinkPrices ===
      null
  ) {
    const missingDrinkPrices =
      economicComparisonAvailability ===
      "drink-prices-required";

    const adultOperationalNotices =
      filterAdultOperationalRuleNotices(
        allOperationalNotices,
        comparison.operationalRules
      );

    const adultOperationalImpactExplanations =
      filterAdultPackageItems(
        allOperationalImpactExplanations,
        comparison.operationalRules
      );

    const adultCoveragePackages =
      filterAdultPackageItems(
        comparison.coveragePackages,
        comparison.operationalRules
      );

    const adultThresholdCruiseImpacts =
      filterAdultPackageItems(
        thresholdCruiseImpacts,
        comparison.operationalRules
      );

    const missingPriceLabels = {
      coffee: "café",
      water: "agua",
      soda: "refrescos",
      juice: "zumos",
      beer: "cerveza",
      wine: "vino",
      cocktail: "cócteles",
    } as const;

    return (
      <main className="brand-ocean-bg min-h-screen px-4 py-6 pb-28 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <div className="dark-app-surface rounded-2xl p-5 sm:rounded-3xl sm:p-10">
            <WizardBrand />
            <div className="text-center">
              <div className="text-5xl">
                🔎
              </div>

              <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                Análisis de tus paquetes disponibles
              </h1>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                DrinkPilot puede analizar qué paquetes de{" "}
                <strong>
                  {cruiseLine.name}
                </strong>{" "}
                cubren tus preferencias, pero{" "}
                {missingDrinkPrices
                  ? "todavía no dispone de suficientes precios individuales fiables para calcular si el paquete compensa económicamente."
                  : `no tenemos suficientes datos de precio para completar la comparación económica.`}
              </p>
            </div>

            <MinorsCalculationNotice
              cruiseLine={data.cruiseLine}
              minors={data.minors}
            />

            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
              <h2 className="font-bold text-amber-950">
                ⚠️ Comparación económica pendiente
              </h2>

              <p className="mt-2 text-sm leading-6 text-amber-900">
                {missingDrinkPrices
                  ? "Nos faltan algunos datos para completar la comparación:"
                  : "Con los datos disponibles, no hemos podido completar una comparación clara entre paquetes."}
              </p>

              {missingDrinkPrices && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {comparison.missingOnboardPriceKeys.map(
                    (key) => (
                      <span
                        key={key}
                        className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-amber-900"
                      >
                        {
                          missingPriceLabels[
                            key
                          ]
                        }
                      </span>
                    )
                  )}
                </div>
              )}

              <p className="mt-4 text-xs leading-5 text-amber-800">
                {missingDrinkPrices
                  ? "No utilizamos precios cero ni importes inventados para completar estos datos."
                  : "Introduce el precio real de tu reserva cuando corresponda y revisa la moneda operativa. DrinkPilot no convierte ni reinterpreta importes entre monedas."}
              </p>
            </div>

            <section className="mt-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  🎟️ Cobertura de los paquetes
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Esta parte del análisis sí puede realizarse con la información de inclusiones disponible.
                </p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {adultCoveragePackages.map(
                  (pkg) => (
                    <div
                      key={
                        pkg.packageKey
                      }
                      className={`rounded-2xl border p-5 ${
                        pkg.fullyCovered
                          ? "border-green-200 bg-green-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900">
                            {
                              pkg.packageName
                            }
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            Encaja con tus preferencias
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            pkg.fullyCovered
                              ? "bg-green-100 text-green-800"
                              : pkg.unknownCoverageCategories.length > 0
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {pkg.unknownCoverageCategories.length > 0
                            ? "Pendiente"
                            : `${pkg.coverageScore.toFixed(0)} %`}
                        </span>
                      </div>

                      {pkg.fullyCovered ? (
                        <p className="mt-4 text-sm font-semibold text-green-800">
                          ✓ Cubre todas las categorías y preferencias indicadas.
                        </p>
                      ) : (
                        <div className="mt-4">
                          {pkg.uncoveredCategories.length > 0 && (
                            <>
                              <p className="text-sm font-semibold text-slate-700">
                                No cubre:
                              </p>

                              <div className="mt-2 flex flex-wrap gap-2">
                                {pkg.uncoveredCategories.map(
                                  (category) => (
                                    <span
                                      key={category}
                                      className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700"
                                    >
                                      {formatCoverageCategoryLabel(
                                        category,
                                        coverageLabels[category],
                                        pkg
                                      )}
                                    </span>
                                  )
                                )}
                              </div>
                            </>
                          )}

                          {pkg.unknownCoverageCategories.length > 0 && (
                            <>
                              <p className="mt-3 text-sm font-semibold text-amber-800">
                                Cobertura pendiente de confirmar:
                              </p>

                              <div className="mt-2 flex flex-wrap gap-2">
                                {pkg.unknownCoverageCategories.map(
                              (
                                category
                              ) => (
                                <span
                                  key={
                                    category
                                  }
                                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700"
                                >
                                  {
                                    formatCoverageCategoryLabel(
                                      category,
                                      coverageLabels[category],
                                      pkg
                                    )
                                  }
                                </span>
                              )
                            )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </section>

            {adultThresholdCruiseImpacts.length > 0 && (
              <section className="mt-8 rounded-2xl border border-violet-200 bg-violet-50 p-5 sm:p-6">
                <h2 className="text-lg font-bold text-violet-950 sm:text-xl">
                  💶 Impacto del límite de precio
                </h2>

                <p className="mt-2 text-sm leading-6 text-violet-900">
                  Algunos paquetes incluyen bebidas solo hasta un determinado precio por bebida. Con los precios que has introducido podemos detectar cuándo tu consumo previsto supera ese límite.
                </p>

                <div className="mt-4 grid gap-3">
                  {adultThresholdCruiseImpacts.map(
                    (thresholdImpact) => {
                      const affectedDrinks =
                        thresholdImpact
                          .cruiseImpact
                          .drinksAboveThreshold;


                      const excludedDrinks =

                        thresholdImpact

                          .cruiseImpact

                          .drinksExcludedFromCoverage;

                      const thresholdEconomicImpact =
                        thresholdImpact
                          .dailyImpact
                          .items
                          .map(
                            (item) =>
                              item.evaluation
                                .packageImpact
                                .impact
                          )
                          .find(
                            (impact) =>
                              impact.threshold !==
                                null &&
                              impact.thresholdCurrency !==
                                null
                          );

                      const threshold =
                        thresholdEconomicImpact
                          ?.threshold ?? null;

                      const thresholdCurrency =
                        thresholdEconomicImpact
                          ?.thresholdCurrency ?? null;

                      return (
                        <div
                          key={
                            thresholdImpact
                              .packageKey
                          }
                          className="rounded-xl border border-violet-100 bg-white p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {
                                  thresholdImpact
                                    .packageName
                                }
                              </p>

                              {threshold !== null &&
                                thresholdCurrency !==
                                  null && (
                                  <div className="mt-2 inline-flex rounded-lg border border-violet-200 bg-violet-50 px-3 py-2">
                                    <p className="text-sm font-semibold text-violet-900">
                                      Límite incluido:{" "}
                                      {threshold}{" "}
                                      {thresholdCurrency} por bebida
                                    </p>
                                  </div>
                                )}

                              <p className="mt-2 text-sm leading-6 text-slate-700">
                                Según tu consumo y los precios concretos introducidos,{" "}
                                <strong>
                                  {
                                    affectedDrinks
                                  }
                                </strong>{" "}
                                {affectedDrinks ===
                                1
                                  ? "bebida prevista supera"
                                  : "bebidas previstas superan"}{" "}
                                el límite de precio conocido del paquete durante el crucero.
                              </p>

                              {excludedDrinks !== null && excludedDrinks > 0 && (
                                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                  <p className="text-sm font-semibold text-amber-950">
                                    ⚠️ No incluidas:{" "}
                                    {excludedDrinks}{" "}
                                    {excludedDrinks === 1
                                      ? "bebida"
                                      : "bebidas"}
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-amber-900">
                                    Estas bebidas no estarían incluidas porque superan el límite de precio del paquete.
                                  </p>
                                </div>
                              )}
                            </div>

                            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
                              {
                                affectedDrinks
                              }{" "}
                              afectadas
                            </span>
                          </div>

                          <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                              Coste adicional
                            </p>

                            {thresholdImpact
                              .cruiseImpact
                              .status ===
                              "quantified" &&
                            thresholdImpact
                              .cruiseImpact
                              .additionalCostTotal !==
                              null ? (
                              <>
                                <p className="mt-1 text-lg font-bold text-violet-950">
                                  {formatCurrency(
                                    thresholdImpact.cruiseImpact.additionalCostTotal,
                                    thresholdImpact.currency ??
                                      economicCurrency
                                  )}
                                </p>

                                <p className="mt-1 text-sm leading-6 text-amber-900">
                                  Este coste adicional ya está incorporado en el ahorro efectivo utilizado por DrinkPilot para comparar este paquete.
                                </p>
                              </>
                            ) : (
                              <p className="mt-1 text-sm leading-6 text-amber-900">
                                Aún no podemos calcularlo. DrinkPilot no añade un importe al cálculo porque no dispone de información suficiente sobre cómo se cobran las bebidas que superan el límite.
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </section>
            )}

            {adultOperationalImpactExplanations.length > 0 && (
              <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
                <h2 className="text-lg font-bold text-amber-950 sm:text-xl">
                  ⚠️ Impacto en tu patrón de consumo
                </h2>

                <p className="mt-2 text-sm leading-6 text-amber-900">
                  Estas condiciones afectan a tu consumo declarado. Cuando existe una política económica conocida, DrinkPilot refleja la incertidumbre en el ahorro efectivo sin inventar un coste.
                </p>

                <div className="mt-4 grid gap-3">
                  {adultOperationalImpactExplanations.map(
                    (explanation) => (
                      <div
                        key={explanation.id}
                        className="rounded-xl border border-amber-100 bg-white p-4"
                      >
                        <p className="text-sm leading-6 text-slate-700">
                      {
                        explanation
                          .operationalMessage
                      }
                    </p>

                    {explanation
                      .economicMessage && (
                      <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                          💶 Impacto económico
                        </p>

                        <p className="mt-1 text-sm leading-6 text-amber-900">
                          {
                            explanation
                              .economicMessage
                          }
                        </p>
                      </div>
                    )}
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

            {adultOperationalNotices.length > 0 && (
              <details className="group mt-8 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-lg font-bold text-sky-950 marker:content-none sm:text-xl">
                  <span>ℹ️ Condiciones importantes de los paquetes</span>
                  <span className="shrink-0 text-xs font-semibold text-sky-700 group-open:hidden">
                    Ver detalle ↓
                  </span>
                  <span className="hidden shrink-0 text-xs font-semibold text-sky-700 group-open:inline">
                    Ocultar ↑
                  </span>
                </summary>

                <p className="mt-2 text-sm leading-6 text-sky-900">
                  Estas condiciones forman parte de las reglas operativas conocidas. Cuando una de ellas ya modifica la comparación económica, lo indicamos expresamente.
                </p>

                <div className="mt-4 grid gap-3">
                  {adultOperationalNotices.map(
                    (notice) => (
                      <div
                        key={notice.id}
                        className="rounded-xl border border-sky-100 bg-white p-4"
                      >
                        <p className="text-sm leading-6 text-slate-700">
                          {notice.message}
                        </p>

                        {getOperationalRuleNoticeImpactLabel(
                          notice.calculationImpact
                        ) && (
                          <p className="mt-2 text-xs font-semibold text-emerald-700">
                            ✓ {getOperationalRuleNoticeImpactLabel(
                              notice.calculationImpact
                            )}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </details>
            )}

            <div className="mt-8">
              <DataConfidencePanel
                comparison={comparison}
              />
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/wizard/prices"
                  )
                }
                className="rounded-xl border border-slate-300 px-4 py-4 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Revisar precios
              </button>

              <a
                href="/analyses"
                className="rounded-xl border border-sky-300 px-4 py-4 text-center font-semibold text-sky-700 transition hover:bg-sky-50"
              >
                Mis análisis
              </a>

              <a
                href="/wizard/people"
                onClick={resetData}
                className="rounded-xl bg-sky-700 px-4 py-4 text-center font-semibold text-white transition hover:bg-sky-800"
              >
                Nuevo análisis
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * COSTE BASE DE BEBIDAS
   *
   * Utiliza la misma cesta efectiva que
   * el comparador de paquetes.
   */
  const baseline =
    calculateAdultProfileGroupRecommendation({
      cruiseNights:
        data.cruiseNights ?? 0,

      packagePricePerChargeUnit:
        0,

      profiles:
        data.adultConsumptionProfiles,

      coffeePrice:
        calculationDrinkPrices.coffee,

      waterPrice:
        calculationDrinkPrices.water,

      juicePrice:
        calculationDrinkPrices.juice,

      sodaPrice:
        calculationDrinkPrices.soda,

      beerPrice:
        calculationDrinkPrices.beer,

      winePrice:
        calculationDrinkPrices.wine,

      cocktailPrice:
        calculationDrinkPrices.cocktail,
    });

  const bestPackage =
    comparison.bestPackage;

  const economicOptionsComparison =
    buildEconomicOptionsComparison({
      currency: economicCurrency,
      baselineCost: baseline.drinksCost,
      packages: comparison.packages,
    });

  const includedPackageUpgradeDecision =
    resolveIncludedPackageUpgradeDecision(
      comparison.packages,
      data.includedPackageKey
    );

  const comparisonHeader =
    resolveComparisonHeader(
      bestPackage,
      includedPackageUpgradeDecision
    );

  const comparedPackageKeys =
    new Set(
      comparison.packages.map(
        (pkg) =>
          pkg.packageKey
      )
    );

  const adultOperationalNotices =
    filterAdultOperationalRuleNotices(
      allOperationalNotices,
      comparison.operationalRules
    );

  const operationalNotices =
    adultOperationalNotices.filter(
      (notice) => {
        if (bestPackage) {
          return (
            notice.packageKey ===
            bestPackage.packageKey
          );
        }

        return comparedPackageKeys.has(
          notice.packageKey
        );
      }
    );

  const adultOperationalImpactExplanations =
    filterAdultPackageItems(
      allOperationalImpactExplanations,
      comparison.operationalRules
    );

  const economicThresholdCruiseImpacts =
    filterAdultPackageItems(
      thresholdCruiseImpacts,
      comparison.operationalRules
    );

  const operationalImpactExplanations =
    adultOperationalImpactExplanations.filter(
      (impact) => {
        if (bestPackage) {
          return (
            impact.packageKey ===
            bestPackage.packageKey
          );
        }

        return comparedPackageKeys.has(
          impact.packageKey
        );
      }
    );

  /*
   * EXPLICACIÓN
   */
  const explanation =
    buildRecommendationExplanation(
      comparison
    );

  const explanationStyles = {
    positive: {
      container:
        "border-green-300 bg-green-50",
      icon: "🟢",
      title:
        "text-green-900",
      accent:
        "text-green-800",
    },

    warning: {
      container:
        "border-amber-300 bg-amber-50",
      icon: "🟠",
      title:
        "text-amber-950",
      accent:
        "text-amber-900",
    },

    neutral: {
      container:
        "border-slate-300 bg-slate-50",
      icon: "🔵",
      title:
        "text-slate-900",
      accent:
        "text-slate-700",
    },
  } as const;

  const explanationStyle =
    explanationStyles[
      explanation.tone
    ];

  /*
   * TABLA DE CONSUMO
   *
   * Utiliza también la cesta efectiva
   * del comparador.
   */
  const consumptionRows = [
    {
      key: "coffee",

      label:
        "☕ Café",

      quantity:
        profileConsumption.group.coffee,

      price:
        calculationDrinkPrices.coffee,

      total:
        baseline.coffeeCost,
    },

    {
      key: "water",

      label:
        waterConsumptionLabel,

      quantity:
        profileConsumption.group.water,

      price:
        calculationDrinkPrices.water,

      total:
        baseline.waterCost,
    },

    {
      key: "soda",

      label:
        "🥤 Refrescos",

      quantity:
        profileConsumption.group.soda,

      price:
        calculationDrinkPrices.soda,

      total:
        baseline.sodaCost,
    },

    {
      key: "juice",

      label:
        "🧃 Zumos",

      quantity:
        profileConsumption.group.juice,

      price:
        calculationDrinkPrices.juice,

      total:
        baseline.juiceCost,
    },

    {
      key: "beer",

      label:
        "🍺 Cervezas",

      quantity:
        profileConsumption.group.beer,

      price:
        calculationDrinkPrices.beer,

      total:
        baseline.beerCost,
    },

    {
      key: "wine",

      label:
        "🍷 Vinos",

      quantity:
        profileConsumption.group.wine,

      price:
        calculationDrinkPrices.wine,

      total:
        baseline.wineCost,
    },

    {
      key: "cocktail",

      label:
        "🍸 Cócteles",

      quantity:
        profileConsumption.group.cocktail,

      price:
        calculationDrinkPrices.cocktail,

      total:
        baseline.cocktailCost,
    },
  ];

  return (
    <main className="brand-ocean-bg min-h-screen px-4 pt-6 pb-28 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="dark-app-surface rounded-2xl p-5 sm:rounded-3xl sm:p-10">
          {/* CABECERA */}

          <WizardBrand />

          <h1 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">
            Tu recomendación DrinkPilot
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-6 text-slate-500 sm:text-base">
            Hemos comparado
            automáticamente los paquetes
            disponibles según tu consumo,
            preferencias y precios
            disponibles.
          </p>

          <div className="mx-auto mt-5 max-w-2xl rounded-xl border border-sky-200 bg-sky-50 p-4 text-left">
            <p className="font-semibold text-sky-950">
              ℹ️ Estimación personalizada
            </p>
            <p className="mt-1 text-sm leading-6 text-sky-900">
              Los costes y posibles ahorros son estimaciones basadas en los datos que has indicado y en los precios disponibles. Comprueba siempre el precio y las condiciones finales de tu reserva antes de contratar un paquete.
            </p>
          </div>

          <MinorsCalculationNotice
            cruiseLine={data.cruiseLine}
            minors={data.minors}
          />

          {includedPackageUpgradeDecision && (
            <section className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-left sm:mt-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-sky-800">
                Tu paquete actual
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {includedPackageUpgradeDecision.current.packageName} ya está incluido en tu reserva
              </h2>

              {includedPackageUpgradeDecision.status === "upgrade" ? (
                <p className="mt-3 leading-6 text-slate-700">
                  <strong>Mejora a {includedPackageUpgradeDecision.alternative.packageName}.</strong>{" "}
                  Con los precios que has indicado, el cambio supone una mejora estimada de {formatCurrency(includedPackageUpgradeDecision.savingsDifference, includedPackageUpgradeDecision.current.currency)} durante el crucero.
                </p>
              ) : includedPackageUpgradeDecision.status === "keep" ? (
                <p className="mt-3 leading-6 text-slate-700">
                  <strong>Mantén {includedPackageUpgradeDecision.current.packageName}.</strong>{" "}
                  El upgrade a {includedPackageUpgradeDecision.alternative.packageName} costaría aproximadamente {formatCurrency(
                    Math.abs(includedPackageUpgradeDecision.savingsDifference),
                    includedPackageUpgradeDecision.current.currency
                  )} más durante el crucero.
                </p>
              ) : (
                <p className="mt-3 leading-6 text-slate-700">
                  Todavía no podemos cerrar la comparación entre mantenerlo y mejorar. Comprueba el suplemento del upgrade y los precios de las bebidas que quedarían fuera; DrinkPilot no completa importes no confirmados.
                </p>
              )}
            </section>
          )}

          <EconomicOptionsComparison
            comparison={economicOptionsComparison}
          />

          {/* EXPLICACIÓN PRINCIPAL */}

          <div
            className={`mt-6 rounded-2xl border p-5 text-center sm:mt-8 sm:p-8 ${explanationStyle.container}`}
          >
            <div className="text-4xl">
              {
                explanationStyle.icon
              }
            </div>

            {bestPackage && (
              <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-sky-700">
                Recomendación DrinkPilot
              </p>
            )}

            {bestPackage && (
              <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-green-200 bg-white/80 p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-green-700">
                  Tu recomendación
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
                  {bestPackage.packageName}
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  El paquete que mejor encaja contigo es {bestPackage.packageName} porque cubre todas las preferencias diarias que has indicado.
                </p>
              </div>
            )}

            <h2
              className={`mt-3 text-2xl font-bold sm:text-3xl ${explanationStyle.title}`}
            >
              {
                explanation.title
              }
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-700 sm:text-lg">
              {
                explanation.summary
              }
            </p>

            <div className="mx-auto mt-5 max-w-2xl rounded-xl bg-white/70 p-4 text-left sm:mt-6 sm:p-5">
              <p
                className={`font-semibold leading-6 ${explanationStyle.accent}`}
              >
                {
                  explanation.reason
                }
              </p>

              {explanation.secondaryReason && (
                <p className="mt-3 leading-6 text-slate-700">
                  {
                    explanation
                      .secondaryReason
                  }
                </p>
              )}
            </div>

            {bestPackage ? (
              <>
                <p className="mt-6 text-4xl font-bold text-sky-600 sm:mt-7 sm:text-5xl">
                  {formatCurrency(
                    bestPackage.effectiveSavings !== null
                      ? bestPackage.effectiveSavings
                      : bestPackage.savings,
                    bestPackage.currency
                  )}
                </p>

                <p className="mt-2 text-sm text-slate-600 sm:text-base">
                  de mejora estimada a favor del paquete durante el crucero
                </p>

                <div className="mx-auto mt-5 max-w-sm rounded-xl bg-white/70 p-4">
                  <p className="text-sm text-slate-600">
                    Encaja con tus preferencias
                  </p>

                  <p className="mt-1 text-2xl font-bold text-green-800">
                    {bestPackage.coverageScore.toFixed(
                      0
                    )}{" "}
                    %
                  </p>

                  {bestPackage.fullyCovered && (
                    <p className="mt-1 text-sm font-semibold text-green-700">
                      ✓ Cubre todas las
                      categorías y
                      preferencias
                      indicadas
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="mt-6 text-4xl font-bold text-sky-600 sm:mt-7 sm:text-5xl">
                  {formatCurrency(
                    baseline.drinksCost,
                    economicCurrency
                  )}
                </p>

                <p className="mt-2 text-sm text-slate-600 sm:text-base">
                  coste estimado pagando
                  las bebidas por
                  separado
                </p>
              </>
            )}
          </div>

          {/* RESUMEN */}

          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-5">
            <div className="rounded-2xl bg-slate-50 p-4 text-center shadow-sm sm:p-5">
              <p className="text-sm text-slate-500 sm:text-base">
                🗓️ Duración
              </p>

              <p className="mt-2 text-2xl font-bold sm:text-3xl">
                {data.cruiseNights}
              </p>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                noches
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-center shadow-sm sm:p-5">
              <p className="text-sm text-slate-500 sm:text-base">
                👥 Adultos
              </p>

              <p className="mt-2 text-2xl font-bold sm:text-3xl">
                {data.people}
              </p>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                incluidos en el cálculo
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-center shadow-sm sm:p-5">
              <p className="text-sm text-slate-500 sm:text-base">
                🍹 Consumo
              </p>

              <p className="mt-2 text-2xl font-bold sm:text-3xl">
                {
                  totalDrinksPerDay
                }
              </p>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                bebidas / día
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-center shadow-sm sm:p-5">
              <p className="text-sm text-slate-500 sm:text-base">
                ⭐ Premium
              </p>

              <p
                className={`mt-2 font-bold ${
                  selectedPremiumPreferences === 0
                    ? "text-xl text-green-700 sm:text-2xl"
                    : "text-2xl sm:text-3xl"
                }`}
              >
                {selectedPremiumPreferences === 0
                  ? "✓ Sin requisitos"
                  : selectedPremiumPreferences}
              </p>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                {selectedPremiumPreferences === 0
                  ? "premium seleccionados"
                  : selectedPremiumPreferences === 1
                    ? "preferencia"
                    : "preferencias"}
              </p>
            </div>

            <div className="col-span-2 rounded-2xl bg-slate-50 p-4 text-center shadow-sm sm:col-span-1 sm:p-5">
              <p className="text-sm text-slate-500 sm:text-base">
                🎟️ Precios reales
              </p>

              <p className="mt-2 text-2xl font-bold sm:text-3xl">
                {
                  customPricesUsed
                }
              </p>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                introducidos
              </p>
            </div>
          </div>

          {/* COSTE SIN PAQUETE */}

          <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white sm:p-6">
            <p className="text-sm text-slate-300">
              Coste estimado pagando
              las bebidas por separado
            </p>

            <p className="mt-2 text-3xl font-bold sm:text-4xl">
              {formatCurrency(
                baseline.drinksCost,
                economicCurrency
              )}
            </p>

            <p className="mt-2 text-sm text-slate-300">
              durante todo el crucero
            </p>
          </div>

          {/* COMPARATIVA */}

          <div className="mt-8 rounded-2xl border border-slate-200 p-4 sm:mt-10 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  ⚖️ Comparativa de
                  paquetes
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Comparamos economía y
                  cobertura utilizando
                  los precios de tu
                  reserva cuando los has
                  proporcionado. Todos
                  los importes de esta
                  comparación son
                  estimados.
                </p>
              </div>

              <span
                className={`self-start rounded-full px-4 py-2 text-sm font-semibold ${
                  bestPackage ||
                  includedPackageUpgradeDecision?.status === "keep" ||
                  includedPackageUpgradeDecision?.status === "upgrade"
                    ? "bg-green-100 text-green-800"
                    : includedPackageUpgradeDecision?.status ===
                        "insufficient-data"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {comparisonHeader}
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:mt-6 md:grid-cols-2">
              {comparison.packages.map(
                (pkg) => {
                  const isBest =
                    bestPackage
                      ?.packageKey ===
                    pkg.packageKey;

                  const usesUserPrice =
                    pkg.priceSource ===
                    "user";

                  const isIncludedInReservation =
                    pkg.priceSource ===
                    "included";

                  const economicOption =
                    economicOptionsComparison.options.find(
                      (option) =>
                        option.key === pkg.packageKey
                    );

                  const thresholdImpact =
                    comparison.thresholdCruiseImpacts.find(
                      (item) =>
                        item.packageKey ===
                        pkg.packageKey
                    )?.cruiseImpact;

                  const thresholdAdditionalCost =
                    thresholdImpact?.status ===
                      "quantified" &&
                    thresholdImpact.additionalCostTotal !==
                      null
                      ? thresholdImpact.additionalCostTotal
                      : null;

                  const displayedSavings =
                    resolveDisplayedEconomicDifference({
                      effectiveSavings:
                        pkg.effectiveSavings,
                      savings: pkg.savings,
                    });

                  return (
                    <div
                      key={
                        pkg.packageKey
                      }
                      className={`rounded-2xl border p-4 sm:p-5 ${
                        isBest
                          ? "border-green-300 bg-green-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      {/* CABECERA PAQUETE */}

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-lg font-bold text-slate-900 sm:text-xl">
                            {
                              pkg.packageName
                            }
                          </p>

                          <p className="mt-1 font-bold text-slate-900 sm:text-lg">
                            {formatPackagePricePerChargeUnit(
                              pkg.packagePricePerChargeUnit,
                              pkg.currency,
                              isIncludedInReservation
                            )}
                          </p>

                          {isIncludedInReservation ? (
                            <span className="mt-2 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                              ✓ Ya incluido en tu reserva
                            </span>
                          ) : usesUserPrice ? (
                            <div className="mt-2">
                              <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
                                ✓ Precio de
                                tu reserva
                              </span>

                              {pkg.referencePricePerChargeUnit !==
                                null &&
                                pkg.packagePricePerChargeUnit !==
                                  pkg.referencePricePerChargeUnit && (
                                  <p className="mt-2 text-xs text-slate-500">
                                    Referencia
                                    DrinkPilot:{" "}
                                    {formatCurrency(
                                      pkg.referencePricePerChargeUnit,
                                      pkg.currency
                                    )}{" "}
                                    / noche
                                  </p>
                                )}
                            </div>
                          ) : (
                            <span className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                              ⚠ Precio de
                              referencia
                            </span>
                          )}
                        </div>

                        {isBest && (
                          <span className="self-start rounded-full bg-green-700 px-3 py-1 text-xs font-semibold text-white">
                            Mejor opción
                          </span>
                        )}
                      </div>

                      {/* COBERTURA */}

                      <div
                        className={`mt-5 rounded-xl border p-4 ${
                          pkg.fullyCovered
                            ? "border-green-200 bg-green-100"
                            : "border-amber-200 bg-amber-50"
                        }`}
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Cobertura
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-900">
                              {pkg.unknownCoverageCategories.length > 0
                                ? "Pendiente"
                                : `${pkg.coverageScore.toFixed(0)} %`}
                            </p>
                          </div>

                          <div className="sm:text-right">
                            {pkg.fullyCovered ? (
                              <p className="font-semibold text-green-800">
                                ✓ Cubre todo
                                lo solicitado
                              </p>
                            ) : (
                              <p className="font-semibold text-amber-800">
                                ⚠️ Cobertura
                                parcial
                              </p>
                            )}
                          </div>
                        </div>

                        {pkg.coveredCategories
                          .length >
                          0 && (
                          <p className="mt-3 text-sm leading-6 text-slate-700">
                            <strong>
                              Cubre:
                            </strong>{" "}
                            {pkg.coveredCategories
                              .map(
                                (
                                  category
                                ) =>
                                  formatCoverageCategoryLabel(
                                    category,
                                    coverageLabels[category],
                                    pkg
                                  )
                              )
                              .join(
                                ", "
                              )}
                          </p>
                        )}

                        {pkg.uncoveredCategories
                          .length >
                          0 && (
                          <p className="mt-2 text-sm font-medium leading-6 text-amber-900">
                            <strong>
                              No cubre:
                            </strong>{" "}
                            {pkg.uncoveredCategories
                              .map(
                                (
                                  category
                                ) =>
                                  formatCoverageCategoryLabel(
                                    category,
                                    coverageLabels[category],
                                    pkg
                                  )
                              )
                              .join(
                                ", "
                              )}
                          </p>
                        )}

                        {pkg.unknownCoverageCategories.length > 0 && (
                          <p className="mt-2 text-sm font-medium leading-6 text-amber-900">
                            <strong>Cobertura pendiente de confirmar:</strong>{" "}
                            {pkg.unknownCoverageCategories
                              .map((category) =>
                                formatCoverageCategoryLabel(
                                  category,
                                  coverageLabels[category],
                                  pkg
                                )
                              )
                              .join(", ")}
                          </p>
                        )}
                      </div>

                      {/* ECONOMÍA */}

                      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Coste paquete
                          </p>

                          <p className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                            {formatCurrency(
                              pkg.packageCost,
                              pkg.currency
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Fuera del paquete
                          </p>

                          <p className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                            {economicOption?.outsidePackageCost === null ||
                            economicOption?.outsidePackageCost === undefined
                              ? "Pendiente"
                              : formatCurrency(
                                  economicOption.outsidePackageCost,
                                  pkg.currency
                                )}
                          </p>
                        </div>

                        <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-3">
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Diferencia estimada
                          </p>

                          <p
                            className={`mt-1 text-lg font-bold sm:text-xl ${
                              displayedSavings === null
                                ? "text-amber-800"
                                : displayedSavings > 0
                                ? "text-green-700"
                                : displayedSavings < 0
                                ? "text-red-700"
                                : "text-slate-700"
                            }`}
                          >
                            {displayedSavings === null
                              ? "No disponible"
                              : formatSignedCurrency(
                                  displayedSavings,
                                  pkg.currency
                                )}
                          </p>
                        </div>
                      </div>

                      {thresholdAdditionalCost !==
                        null &&
                        thresholdAdditionalCost >
                          0 && (
                          <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                              Coste adicional por límite
                            </p>

                            <p className="mt-1 text-lg font-bold text-violet-950">
                              {formatCurrency(
                                thresholdAdditionalCost,
                                pkg.currency
                              )}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-violet-800">
                              Este importe ya está incluido en el resultado mostrado.
                            </p>
                          </div>
                        )}

                      {/* CALIDAD ECONÓMICA */}

                      {pkg.economicComparisonStatus ===
                      "complete" ? (
                        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3">
                          <p className="text-sm font-semibold text-green-800">
                            ✓ Comparación
                            económica
                            completa
                          </p>

                          <p className="mt-1 text-xs leading-5 text-green-800">
                            {pkg.fullyCovered
                              ? "El paquete cubre todo lo que has indicado, por lo que el resultado mostrado puede compararse directamente con pagar las bebidas por separado."
                              : "Todos los precios necesarios están resueltos. Los costes conocidos de las bebidas que el paquete no cubre ya están incorporados al resultado mostrado."}
                          </p>
                        </div>
                      ) : pkg.economicComparisonStatus ===
                        "partial-unknown" ? (
                        <details className="group mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-amber-900 marker:content-none">
                            <span>⚠️ Cómo interpretar este resultado</span>
                            <span className="text-xs group-open:hidden">Ver detalle ↓</span>
                            <span className="hidden text-xs group-open:inline">Ocultar ↑</span>
                          </summary>

                          <p className="mt-1 text-xs leading-5 text-amber-900">
                            Faltan datos para confirmar toda la cobertura o
                            cuantificar el posible coste adicional. Por eso no
                            debe interpretarse como un resultado final.
                          </p>

                          {pkg.unknownCoverageCategories.length > 0 && (
                            <p className="mt-2 text-xs leading-5 text-amber-900">
                              <strong>Cobertura pendiente:</strong>{" "}
                              {pkg.unknownCoverageCategories
                                .map((category) =>
                                  formatCoverageCategoryLabel(
                                    category,
                                    coverageLabels[category],
                                    pkg
                                  )
                                )
                                .join(", ")}.
                            </p>
                          )}

                          {pkg
                            .uncoveredCategories
                            .length >
                            0 && (
                            <p className="mt-2 text-xs leading-5 text-amber-900">
                              <strong>
                                Fuera del
                                cálculo:
                              </strong>{" "}
                              {pkg.uncoveredCategories
                                .map(
                                  (
                                    category
                                  ) =>
                                    formatCoverageCategoryLabel(
                                      category,
                                      coverageLabels[category],
                                      pkg
                                    )
                                )
                                .join(
                                  ", "
                                )}
                              .
                            </p>
                          )}
                        </details>
                      ) : (
                        <details className="group mt-4 rounded-xl border border-sky-200 bg-sky-50 p-3">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-sky-900 marker:content-none">
                            <span>ℹ️ Comparación económica parcial</span>
                            <span className="text-xs group-open:hidden">Ver detalle ↓</span>
                            <span className="hidden text-xs group-open:inline">Ocultar ↑</span>
                          </summary>

                          <p className="mt-1 text-xs leading-5 text-sky-900">
                            Parte del
                            consumo queda
                            fuera del
                            paquete. El
                            resultado final
                            puede variar al
                            añadir ese
                            coste.
                          </p>
                        </details>
                      )}

                      {/* DATOS ADICIONALES */}

                      <div className="mt-5 border-t border-slate-200 pt-4">
                        <p className="text-sm leading-6 text-slate-600">
                          Margen diario estimado:{" "}
                          <strong
                            className={
                              pkg.dailyMargin >
                              0
                                ? "text-green-700"
                                : "text-red-700"
                            }
                          >
                            {formatSignedCurrency(
                              pkg.dailyMargin,
                              pkg.currency
                            )}
                          </strong>{" "}
                          por persona
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          Punto de equilibrio estimado:{" "}
                          {isBreakEvenAvailable({
                            dailyDrinkCost:
                              pkg.dailyDrinkCost,
                          }) ? (
                            <>
                              <strong>
                                {pkg.breakEvenDrinksPerDay.toFixed(
                                  1
                                )}
                              </strong>{" "}
                              bebidas por
                              persona / día
                            </>
                          ) : (
                            <strong>
                              No disponible con los datos actuales
                            </strong>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* EXPLICACIÓN RESUMIDA */}

            <div
              className={`mt-6 rounded-xl border p-4 text-sm leading-6 sm:p-5 ${explanationStyle.container}`}
            >
              <strong
                className={
                  explanationStyle.title
                }
              >
                {
                  explanation.title
                }
              </strong>

              <p className="mt-2 text-slate-700">
                {
                  explanation.summary
                }
              </p>

              {explanation.secondaryReason && (
                <p className="mt-2 text-slate-600">
                  {
                    explanation
                      .secondaryReason
                  }
                </p>
              )}
            </div>
          </div>

          {/* ORIGEN DE LOS PRECIOS */}

          {customPricesUsed > 0 && (
            <div className="mt-8 rounded-2xl border border-sky-200 bg-sky-50 p-4 sm:p-5">
              <h3 className="font-semibold text-sky-950">
                🎟️ Precios de tu
                reserva
              </h3>

              <p className="mt-2 text-sm leading-6 text-sky-900">
                Has proporcionado{" "}
                <strong>
                  {
                    customPricesUsed
                  }
                </strong>{" "}
                {customPricesUsed ===
                1
                  ? "precio real"
                  : "precios reales"}
                . DrinkPilot les ha
                dado prioridad sobre sus
                precios disponibles al
                calcular la
                recomendación.
              </p>
            </div>
          )}

          {economicThresholdCruiseImpacts.length > 0 && (
            <section className="mt-8 rounded-2xl border border-violet-200 bg-violet-50 p-5 sm:p-6">
              <h2 className="text-lg font-bold text-violet-950 sm:text-xl">
                💶 Impacto del límite de precio
              </h2>

              <p className="mt-2 text-sm leading-6 text-violet-900">
                Algunos paquetes incluyen bebidas solo hasta un determinado precio por bebida. Con los precios que has introducido podemos detectar cuándo tu consumo previsto supera ese límite.
              </p>

              <div className="mt-4 grid gap-3">
                {economicThresholdCruiseImpacts.map(
                  (thresholdImpact) => {
                    const affectedDrinks =
                      thresholdImpact
                        .cruiseImpact
                        .drinksAboveThreshold;


                    const excludedDrinks =

                      thresholdImpact

                        .cruiseImpact

                        .drinksExcludedFromCoverage;

                    const thresholdEconomicImpact =
                      thresholdImpact
                        .dailyImpact
                        .items
                        .map(
                          (item) =>
                            item.evaluation
                              .packageImpact
                              .impact
                        )
                        .find(
                          (impact) =>
                            impact.threshold !==
                              null &&
                            impact.thresholdCurrency !==
                              null
                        );

                    const threshold =
                      thresholdEconomicImpact
                        ?.threshold ?? null;

                    const thresholdCurrency =
                      thresholdEconomicImpact
                        ?.thresholdCurrency ?? null;

                    return (
                      <div
                        key={
                          thresholdImpact
                            .packageKey
                        }
                        className="rounded-xl border border-violet-100 bg-white p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-bold text-slate-900">
                              {
                                thresholdImpact
                                  .packageName
                              }
                            </p>

                            {threshold !== null &&
                              thresholdCurrency !==
                                null && (
                                <div className="mt-2 inline-flex rounded-lg border border-violet-200 bg-violet-50 px-3 py-2">
                                  <p className="text-sm font-semibold text-violet-900">
                                    Límite incluido:{" "}
                                    {threshold}{" "}
                                    {thresholdCurrency} por bebida
                                  </p>
                                </div>
                              )}

                            <p className="mt-2 text-sm leading-6 text-slate-700">
                              Según tu consumo y los precios concretos introducidos,{" "}
                              <strong>
                                {
                                  affectedDrinks
                                }
                              </strong>{" "}
                              {affectedDrinks ===
                              1
                                ? "bebida prevista supera"
                                : "bebidas previstas superan"}{" "}
                              el límite de precio conocido del paquete durante el crucero.
                            </p>

                            {excludedDrinks !== null && excludedDrinks > 0 && (
                              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                <p className="text-sm font-semibold text-amber-950">
                                  ⚠️ Fuera de cobertura:{" "}
                                  {excludedDrinks}{" "}
                                  {excludedDrinks === 1
                                    ? "bebida"
                                    : "bebidas"}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-amber-900">
                                  Estas bebidas no estarían incluidas porque superan el límite de precio del paquete.
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="shrink-0 rounded-lg bg-violet-100 px-3 py-2 text-center">
                            <p className="text-lg font-bold text-violet-950">
                              {
                                affectedDrinks
                              }{" "}
                              afectadas
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Coste adicional
                          </p>

                          {thresholdImpact
                            .cruiseImpact
                            .status ===
                            "quantified" &&
                          thresholdImpact
                            .cruiseImpact
                            .additionalCostTotal !==
                            null ? (
                            <>
                              <p className="mt-1 text-lg font-bold text-violet-950">
                                {formatCurrency(
                                  thresholdImpact.cruiseImpact.additionalCostTotal,
                                  thresholdImpact.currency ??
                                    economicCurrency
                                )}
                              </p>

                              <p className="mt-1 text-sm leading-6 text-slate-700">
                                Este coste adicional ya está incorporado en el ahorro efectivo utilizado por DrinkPilot para comparar este paquete.
                              </p>
                            </>
                          ) : (
                            <p className="mt-1 text-sm leading-6 text-slate-700">
                              Aún no podemos calcularlo. DrinkPilot no añade un importe al cálculo porque no dispone de información suficiente sobre cómo se cobran las bebidas que superan el límite.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          )}

          {/* IMPACTO OPERATIVO PERSONALIZADO */}

          {operationalImpactExplanations.length > 0 && (
            <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
              <h2 className="text-lg font-bold text-amber-950 sm:text-xl">
                ⚠️ Impacto en tu patrón de consumo
              </h2>

              <p className="mt-2 text-sm leading-6 text-amber-900">
                Estas condiciones afectan a tu consumo declarado. Cuando existe una política económica conocida, DrinkPilot refleja la incertidumbre en el ahorro efectivo sin inventar un coste.
              </p>

              <div className="mt-4 grid gap-3">
                {operationalImpactExplanations.map(
                  (explanation) => (
                    <div
                      key={explanation.id}
                      className="rounded-xl border border-amber-100 bg-white p-4"
                    >
                      <p className="text-sm leading-6 text-slate-700">
                      {
                        explanation
                          .operationalMessage
                      }
                    </p>

                    {explanation
                      .economicMessage && (
                      <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                          💶 Impacto económico
                        </p>

                        <p className="mt-1 text-sm leading-6 text-amber-900">
                          {
                            explanation
                              .economicMessage
                          }
                        </p>
                      </div>
                    )}
                    </div>
                  )
                )}
              </div>
            </section>
          )}

          {/* CONDICIONES OPERATIVAS */}

          {operationalNotices.length > 0 && (
            <details className="group mt-8 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-sky-950 marker:content-none sm:text-lg">
                <span>ℹ️ Condiciones importantes del paquete</span>
                <span className="shrink-0 text-xs font-semibold text-sky-700 group-open:hidden">
                  Ver detalle ↓
                </span>
                <span className="hidden shrink-0 text-xs font-semibold text-sky-700 group-open:inline">
                  Ocultar ↑
                </span>
              </summary>

              <p className="mt-2 text-sm leading-6 text-sky-900">
                Ten en cuenta estas condiciones además de la comparación económica.
              </p>

              <div className="mt-4 grid gap-3">
                {operationalNotices.map(
                  (notice) => (
                    <div
                      key={notice.id}
                      className="rounded-xl border border-sky-100 bg-white p-4"
                    >
                      <p className="text-sm leading-6 text-slate-700">
                        {notice.message}
                      </p>

                      {getOperationalRuleNoticeImpactLabel(
                        notice.calculationImpact
                      ) && (
                        <p className="mt-2 text-xs font-semibold text-emerald-700">
                          ✓ {getOperationalRuleNoticeImpactLabel(
                            notice.calculationImpact
                          )}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            </details>
          )}

          {/* PROCEDENCIA DE LOS PRECIOS DE BEBIDAS */}

          {Object.keys(data.selectedDrinkPrices).length > 0 && (
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                🥤 Precios de bebidas seleccionados
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                DrinkPilot distingue qué referencias pueden participar en el
                cálculo económico y cuáles se conservan solo como información.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["coffee", "☕ Café"],
                    ["water", "💧 Agua"],
                    ["soda", "🥤 Refresco"],
                    ["beer", "🍺 Cerveza"],
                    ["wine", "🍷 Vino"],
                    ["cocktail", "🍸 Cóctel"],
                  ] as const
                ).map(([category, label]) => {
                  const selectedPrice =
                    data.selectedDrinkPrices[
                      category
                    ];

                  if (!selectedPrice) {
                    return null;
                  }

                  const sourceLabel =
                    selectedPrice.source ===
                    "documented-menu"
                      ? "Información documentada"
                      : selectedPrice.source ===
                          "official"
                        ? "Información oficial"
                        : "Precio introducido por ti";

                  const isEconomicallyUsable =
                    resolveEconomicDrinkPriceForCurrency(
                      selectedPrice,
                      economicCurrency
                    ) !== null;

                  return (
                    <div
                      key={category}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {label}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {sourceLabel}
                          </p>

                          {selectedPrice.source ===
                            "documented-menu" &&
                            selectedPrice.contextRelevance && (
                              <p
                                className={`mt-1 text-xs font-semibold ${
                                  selectedPrice.contextRelevance ===
                                  "exact"
                                    ? "text-emerald-700"
                                    : "text-amber-700"
                                }`}
                              >
                                {selectedPrice.contextRelevance ===
                                "exact"
                                  ? "Contexto coincidente"
                                  : "Compatible · faltan datos"}
                              </p>
                            )}

                          <p
                            className={`mt-1 text-xs font-semibold ${
                              isEconomicallyUsable
                                ? "text-emerald-700"
                                : "text-amber-700"
                            }`}
                          >
                            {isEconomicallyUsable
                              ? "Apto para el cálculo económico"
                              : "Solo informativo · no participa todavía en el cálculo económico"}
                          </p>
                        </div>

                        <p className="shrink-0 font-bold text-slate-900">
                          {formatCurrency(
                            selectedPrice.price,
                            selectedPrice.currency
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* CALIDAD DE DATOS */}

          <div className="mt-8">
            <DataConfidencePanel
              comparison={comparison}
            />
          </div>

          <ConsumptionSummary
            rows={consumptionRows}
            currency={economicCurrency}
            quantityLabel="Cantidad del grupo / día"
          />

          {/* FEEDBACK BETA */}

          <section className="mt-8 rounded-2xl border border-sky-100 bg-sky-50 p-5 text-center sm:mt-10 sm:p-6">
            <p className="text-2xl" aria-hidden="true">
              🚢
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">
              Gracias por probar DrinkPilot
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
              Tu opinión nos ayuda a mejorar la experiencia antes del lanzamiento.
            </p>
            <a
              href="https://tally.so/r/LZxG1y"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-sky-600 bg-white px-5 py-3.5 font-semibold text-sky-700 transition hover:bg-sky-100 sm:w-auto"
            >
              Enviar opinión
            </a>
          </section>

          {/* REINICIO */}

          <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2">
            <a
              href="/analyses"
              className="rounded-xl border border-sky-300 px-4 py-4 text-center text-base font-semibold text-sky-700 transition hover:bg-sky-50 sm:text-lg"
            >
              Mis análisis
            </a>

            <a
              href="/wizard/people"
              onClick={resetData}
              className="rounded-xl bg-sky-700 py-4 text-center text-base font-semibold text-white transition hover:bg-sky-800 sm:text-lg"
            >
              Empezar de nuevo
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
