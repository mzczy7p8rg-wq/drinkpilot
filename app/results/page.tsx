"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useStore } from "@/lib/store";
import { calculateRecommendation } from "@/lib/calculator";
import { compareDrinkPackages } from "@/lib/comparison";
import { CoverageCategory } from "@/lib/coverage";
import { buildRecommendationExplanation } from "@/lib/recommendationExplanation";
import { costaOnboardPriceValues } from "@/data/onboardPrices";

import DataConfidencePanel from "@/components/DataConfidencePanel";

const coverageLabels: Record<CoverageCategory, string> = {
  coffee: "café",
  water: "agua",
  soda: "refrescos",
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
    hydrated,
    resetData,
  } = useStore();

  const totalDrinksPerDay =
    data.coffee +
    data.water +
    data.soda +
    data.beer +
    data.wine +
    data.cocktail;

  const selectedPremiumPreferences = [
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

  const customPricesUsed = [
    data.myDrinksCustomPrice,
    data.myDrinksPlusCustomPrice,
  ].filter(
    (price) =>
      typeof price === "number" &&
      price > 0
  ).length;

  const hasValidDays =
    Number.isInteger(data.days) &&
    data.days > 0;

  const hasValidConsumption =
    totalDrinksPerDay > 0;

  const hasValidPeople =
    Number.isInteger(data.people) &&
    data.people > 0;

  const isComplete =
    hasValidDays &&
    hasValidConsumption &&
    hasValidPeople;

  /*
   * PROTECCIÓN DE RUTAS
   */
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!hasValidDays) {
      router.replace("/wizard");
      return;
    }

    if (!hasValidConsumption) {
      router.replace("/wizard/consumption");
      return;
    }

    if (!hasValidPeople) {
      router.replace("/wizard/people");
    }
  }, [
    hydrated,
    hasValidDays,
    hasValidConsumption,
    hasValidPeople,
    router,
  ]);

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

  if (!isComplete) {
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
   * COSTE BASE DE BEBIDAS
   */
  const baseline = calculateRecommendation({
    days: data.days,
    people: data.people,

    packagePricePerDay: 0,

    coffee: data.coffee,
    water: data.water,
    soda: data.soda,
    beer: data.beer,
    wine: data.wine,
    cocktail: data.cocktail,

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

  /*
   * COMPARACIÓN
   */
  const comparison = compareDrinkPackages({
    days: data.days,
    people: data.people,

    coffee: data.coffee,
    water: data.water,
    soda: data.soda,
    beer: data.beer,
    wine: data.wine,
    cocktail: data.cocktail,

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

    myDrinksCustomPrice:
      data.myDrinksCustomPrice,

    myDrinksPlusCustomPrice:
      data.myDrinksPlusCustomPrice,
  });

  const bestPackage =
    comparison.bestPackage;

  /*
   * EXPLICACIÓN
   */
  const explanation =
    buildRecommendationExplanation(comparison);

  const explanationStyles = {
    positive: {
      container:
        "border-green-300 bg-green-50",
      icon: "🟢",
      title: "text-green-900",
      accent: "text-green-800",
    },

    warning: {
      container:
        "border-amber-300 bg-amber-50",
      icon: "🟠",
      title: "text-amber-950",
      accent: "text-amber-900",
    },

    neutral: {
      container:
        "border-slate-300 bg-slate-50",
      icon: "🔵",
      title: "text-slate-900",
      accent: "text-slate-700",
    },
  } as const;

  const explanationStyle =
    explanationStyles[explanation.tone];

  const consumptionRows = [
    {
      key: "coffee",
      label: "☕ Café",
      quantity: data.coffee,
      price: costaOnboardPriceValues.coffee,
      total: baseline.coffeeCost,
    },
    {
      key: "water",
      label: "💧 Agua",
      quantity: data.water,
      price: costaOnboardPriceValues.water,
      total: baseline.waterCost,
    },
    {
      key: "soda",
      label: "🥤 Refrescos",
      quantity: data.soda,
      price: costaOnboardPriceValues.soda,
      total: baseline.sodaCost,
    },
    {
      key: "beer",
      label: "🍺 Cervezas",
      quantity: data.beer,
      price: costaOnboardPriceValues.beer,
      total: baseline.beerCost,
    },
    {
      key: "wine",
      label: "🍷 Vinos",
      quantity: data.wine,
      price: costaOnboardPriceValues.wine,
      total: baseline.wineCost,
    },
    {
      key: "cocktail",
      label: "🍸 Cócteles",
      quantity: data.cocktail,
      price: costaOnboardPriceValues.cocktail,
      total: baseline.cocktailCost,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 px-4 pt-6 pb-28 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">

        <div className="rounded-2xl bg-white p-5 shadow-xl sm:rounded-3xl sm:p-10">

          {/* CABECERA */}

          <h1 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">
            🍹 Tu recomendación DrinkPilot
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-6 text-slate-500 sm:text-base">
            Hemos comparado automáticamente los paquetes disponibles
            según tu consumo, preferencias y precios disponibles.
          </p>

          {/* EXPLICACIÓN PRINCIPAL */}

          <div
            className={`mt-6 rounded-2xl border p-5 text-center sm:mt-8 sm:p-8 ${explanationStyle.container}`}
          >
            <div className="text-4xl">
              {explanationStyle.icon}
            </div>

            <h2
              className={`mt-3 text-2xl font-bold sm:text-3xl ${explanationStyle.title}`}
            >
              {explanation.title}
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-700 sm:text-lg">
              {explanation.summary}
            </p>

            <div className="mx-auto mt-5 max-w-2xl rounded-xl bg-white/70 p-4 text-left sm:mt-6 sm:p-5">

              <p
                className={`font-semibold leading-6 ${explanationStyle.accent}`}
              >
                {explanation.reason}
              </p>

              {explanation.secondaryReason && (
                <p className="mt-3 leading-6 text-slate-700">
                  {explanation.secondaryReason}
                </p>
              )}

            </div>

            {bestPackage ? (
              <>
                <p className="mt-6 text-4xl font-bold text-sky-600 sm:mt-7 sm:text-5xl">
                  {bestPackage.savings.toFixed(2)} €
                </p>

                <p className="mt-2 text-sm text-slate-600 sm:text-base">
                  de ahorro estimado durante el crucero
                </p>

                <div className="mx-auto mt-5 max-w-sm rounded-xl bg-white/70 p-4">

                  <p className="text-sm text-slate-600">
                    Cobertura de tu perfil
                  </p>

                  <p className="mt-1 text-2xl font-bold text-green-800">
                    {bestPackage.coverageScore.toFixed(0)} %
                  </p>

                  {bestPackage.fullyCovered && (
                    <p className="mt-1 text-sm font-semibold text-green-700">
                      ✓ Cubre todas las categorías y preferencias indicadas
                    </p>
                  )}

                </div>
              </>
            ) : (
              <>
                <p className="mt-6 text-4xl font-bold text-sky-600 sm:mt-7 sm:text-5xl">
                  {baseline.drinksCost.toFixed(2)} €
                </p>

                <p className="mt-2 text-sm text-slate-600 sm:text-base">
                  coste estimado pagando las bebidas por separado
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
                {data.days}
              </p>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                días
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-center shadow-sm sm:p-5">
              <p className="text-sm text-slate-500 sm:text-base">
                👥 Personas
              </p>

              <p className="mt-2 text-2xl font-bold sm:text-3xl">
                {data.people}
              </p>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                pasajeros
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-center shadow-sm sm:p-5">
              <p className="text-sm text-slate-500 sm:text-base">
                🍹 Consumo
              </p>

              <p className="mt-2 text-2xl font-bold sm:text-3xl">
                {totalDrinksPerDay}
              </p>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                bebidas / día
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-center shadow-sm sm:p-5">
              <p className="text-sm text-slate-500 sm:text-base">
                ⭐ Premium
              </p>

              <p className="mt-2 text-2xl font-bold sm:text-3xl">
                {selectedPremiumPreferences}
              </p>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                preferencias
              </p>
            </div>

            <div className="col-span-2 rounded-2xl bg-slate-50 p-4 text-center shadow-sm sm:col-span-1 sm:p-5">
              <p className="text-sm text-slate-500 sm:text-base">
                🎟️ Precios reales
              </p>

              <p className="mt-2 text-2xl font-bold sm:text-3xl">
                {customPricesUsed}
              </p>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                introducidos
              </p>
            </div>

          </div>

          {/* COSTE SIN PAQUETE */}

          <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white sm:p-6">

            <p className="text-sm text-slate-300">
              Coste estimado pagando las bebidas por separado
            </p>

            <p className="mt-2 text-3xl font-bold sm:text-4xl">
              {baseline.drinksCost.toFixed(2)} €
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
                  ⚖️ Comparativa de paquetes
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Comparamos economía y cobertura utilizando los precios
                  de tu reserva cuando los has proporcionado.
                </p>

              </div>

              {bestPackage ? (
                <span className="self-start rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
                  Mejor opción: {bestPackage.packageName}
                </span>
              ) : (
                <span className="self-start rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-800">
                  Sin opción completa con ahorro
                </span>
              )}

            </div>

            <div className="mt-5 grid gap-4 md:mt-6 md:grid-cols-2">

              {comparison.packages.map((pkg) => {
                const isBest =
                  bestPackage?.packageKey ===
                  pkg.packageKey;

                const usesUserPrice =
                  pkg.priceSource === "user";

                return (
                  <div
                    key={pkg.packageKey}
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
                          {pkg.packageName}
                        </p>

                        <p className="mt-1 font-bold text-slate-900 sm:text-lg">
                          {pkg.packagePricePerDay.toFixed(2)} €
                          {" "}por persona / día
                        </p>

                        {usesUserPrice ? (
                          <div className="mt-2">

                            <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
                              ✓ Precio de tu reserva
                            </span>

                            {pkg.packagePricePerDay !==
                              pkg.referencePricePerDay && (
                              <p className="mt-2 text-xs text-slate-500">
                                Referencia DrinkPilot:{" "}
                                {pkg.referencePricePerDay.toFixed(2)} €
                                {" "}/ día
                              </p>
                            )}

                          </div>
                        ) : (
                          <span className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                            ⚠ Precio de referencia
                          </span>
                        )}

                      </div>

                      {isBest && (
                        <span className="self-start rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
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
                            {pkg.coverageScore.toFixed(0)} %
                          </p>

                        </div>

                        <div className="sm:text-right">

                          {pkg.fullyCovered ? (
                            <p className="font-semibold text-green-800">
                              ✓ Cubre todo lo solicitado
                            </p>
                          ) : (
                            <p className="font-semibold text-amber-800">
                              ⚠️ Cobertura parcial
                            </p>
                          )}

                        </div>

                      </div>

                      {pkg.coveredCategories.length > 0 && (
                        <p className="mt-3 text-sm leading-6 text-slate-700">
                          <strong>
                            Cubre:
                          </strong>{" "}
                          {pkg.coveredCategories
                            .map(
                              (category) =>
                                coverageLabels[category]
                            )
                            .join(", ")}
                        </p>
                      )}

                      {pkg.uncoveredCategories.length > 0 && (
                        <p className="mt-2 text-sm font-medium leading-6 text-amber-900">
                          <strong>
                            No cubre:
                          </strong>{" "}
                          {pkg.uncoveredCategories
                            .map(
                              (category) =>
                                coverageLabels[category]
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
                          {pkg.packageCost.toFixed(2)} €
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Bebidas aparte
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                          {pkg.drinksCost.toFixed(2)} €
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          {pkg.economicComparisonStatus === "complete"
                            ? "Diferencia"
                            : "Diferencia teórica"}
                        </p>

                        <p
                          className={`mt-1 text-lg font-bold sm:text-xl ${
                            pkg.savings > 0
                              ? "text-green-700"
                              : pkg.savings < 0
                              ? "text-red-700"
                              : "text-slate-700"
                          }`}
                        >
                          {pkg.savings > 0 ? "+" : ""}
                          {pkg.savings.toFixed(2)} €
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          {pkg.economicComparisonStatus === "complete"
                            ? "Ahorro estimado"
                            : "Ahorro teórico"}
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                          {pkg.savingsPercentage > 0
                            ? `${pkg.savingsPercentage.toFixed(1)} %`
                            : "0 %"}
                        </p>
                      </div>

                    </div>

                    {/* CALIDAD DE LA COMPARACIÓN ECONÓMICA */}

                    {pkg.economicComparisonStatus === "complete" ? (
                      <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3">

                        <p className="text-sm font-semibold text-green-800">
                          ✓ Comparación económica completa
                        </p>

                        <p className="mt-1 text-xs leading-5 text-green-800">
                          El paquete cubre todo lo que has indicado,
                          por lo que el ahorro mostrado puede compararse
                          directamente con pagar las bebidas por separado.
                        </p>

                      </div>
                    ) : pkg.economicComparisonStatus === "partial-unknown" ? (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">

                        <p className="text-sm font-semibold text-amber-900">
                          ⚠️ Ahorro teórico
                        </p>

                        <p className="mt-1 text-xs leading-5 text-amber-900">
                          Este importe no incluye el posible coste adicional
                          de las preferencias que el paquete no cubre.
                          Por eso no debe interpretarse como un ahorro final.
                        </p>

                        {pkg.uncoveredCategories.length > 0 && (
                          <p className="mt-2 text-xs leading-5 text-amber-900">
                            <strong>
                              Fuera del cálculo:
                            </strong>{" "}
                            {pkg.uncoveredCategories
                              .map(
                                (category) =>
                                  coverageLabels[category]
                              )
                              .join(", ")}
                            .
                          </p>
                        )}

                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-3">

                        <p className="text-sm font-semibold text-sky-900">
                          ℹ️ Comparación económica parcial
                        </p>

                        <p className="mt-1 text-xs leading-5 text-sky-900">
                          Parte del consumo queda fuera del paquete.
                          El ahorro final puede variar al añadir ese coste.
                        </p>

                      </div>
                    )}
                    {/* DATOS ADICIONALES */}

                    <div className="mt-5 border-t border-slate-200 pt-4">

                      <p className="text-sm leading-6 text-slate-600">
                        Margen diario:{" "}
                        <strong
                          className={
                            pkg.dailyMargin > 0
                              ? "text-green-700"
                              : "text-red-700"
                          }
                        >
                          {pkg.dailyMargin > 0 ? "+" : ""}
                          {pkg.dailyMargin.toFixed(2)} €
                        </strong>{" "}
                        por persona
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Punto de equilibrio:{" "}
                        <strong>
                          {pkg.breakEvenDrinksPerDay.toFixed(1)}
                        </strong>{" "}
                        bebidas por persona / día
                      </p>

                    </div>

                  </div>
                );
              })}

            </div>

            {/* EXPLICACIÓN RESUMIDA */}

            <div
              className={`mt-6 rounded-xl border p-4 text-sm leading-6 sm:p-5 ${explanationStyle.container}`}
            >

              <strong className={explanationStyle.title}>
                {explanation.title}
              </strong>

              <p className="mt-2 text-slate-700">
                {explanation.summary}
              </p>

              {explanation.secondaryReason && (
                <p className="mt-2 text-slate-600">
                  {explanation.secondaryReason}
                </p>
              )}

            </div>

          </div>

          {/* ORIGEN DE LOS PRECIOS */}

          {customPricesUsed > 0 && (
            <div className="mt-8 rounded-2xl border border-sky-200 bg-sky-50 p-4 sm:p-5">

              <h3 className="font-semibold text-sky-950">
                🎟️ Precios de tu reserva
              </h3>

              <p className="mt-2 text-sm leading-6 text-sky-900">
                Has proporcionado{" "}
                <strong>
                  {customPricesUsed}
                </strong>{" "}
                {customPricesUsed === 1
                  ? "precio real"
                  : "precios reales"}.
                DrinkPilot les ha dado prioridad sobre sus precios
                de referencia al calcular la recomendación.
              </p>

            </div>
          )}

          {/* CALIDAD DE DATOS */}

          <div className="mt-8">
            <DataConfidencePanel />
          </div>

          {/* CONSUMO */}

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 sm:mt-10">

            <div className="bg-slate-800 px-4 py-4 font-bold text-white sm:px-6">
              📊 Tu consumo estimado
            </div>

            {/* VERSIÓN MÓVIL */}

<div className="divide-y divide-slate-200 sm:hidden">
  {consumptionRows.map((row) => (
    <div
      key={row.key}
      className="p-4"
    >
      <p className="text-lg font-bold text-slate-900">
        {row.label}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">

        {/* CANTIDAD */}

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">
            Cantidad / día
          </p>

          <p className="mt-1 text-base font-bold text-slate-900">
            {row.quantity}
          </p>
        </div>

        {/* PRECIO + TOTAL */}

        <div className="rounded-lg bg-slate-50 p-3">

          <p className="text-xs text-slate-500">
            Precio ref.
          </p>

          <p className="mt-1 text-base font-bold text-slate-900">
            {row.price.toFixed(2)} €
          </p>

          <div className="mt-3 border-t border-slate-200 pt-3">

            <p className="text-xs font-semibold text-sky-700">
              Total crucero
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900">
              {row.total.toFixed(2)} €
            </p>

          </div>

        </div>

      </div>
    </div>
  ))}
</div>

            {/* VERSIÓN TABLET / ESCRITORIO */}

            <div className="hidden sm:block">

              <table className="w-full">

                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-3 text-left">
                      Bebida
                    </th>

                    <th className="p-3 text-center">
                      Cantidad/día
                    </th>

                    <th className="p-3 text-center">
                      Precio ref.
                    </th>

                    <th className="p-3 text-right">
                      Total crucero
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {consumptionRows.map((row) => (
                    <tr
                      key={row.key}
                      className="border-t"
                    >
                      <td className="p-3">
                        {row.label}
                      </td>

                      <td className="p-3 text-center">
                        {row.quantity}
                      </td>

                      <td className="p-3 text-center">
                        {row.price.toFixed(2)} €
                      </td>

                      <td className="p-3 text-right font-semibold">
                        {row.total.toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>

            </div>

          </div>

          {/* REINICIO */}

          <button
            type="button"
            onClick={() => {
              resetData();
              router.push("/");
            }}
            className="mt-8 block w-full rounded-xl bg-sky-600 py-4 text-center text-base font-semibold text-white transition hover:bg-sky-700 sm:mt-10 sm:text-lg"
          >
            Empezar de nuevo
          </button>

        </div>
      </div>
    </main>
  );
}