"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useStore } from "@/lib/store";
import { calculateRecommendation } from "@/lib/calculator";
import { compareDrinkPackages } from "@/lib/comparison";
import { CoverageCategory } from "@/lib/coverage";
import { buildRecommendationExplanation } from "@/lib/recommendationExplanation";
import { costaOnboardPriceValues } from "@/data/onboardPrices";

const coverageLabels: Record<CoverageCategory, string> = {
  coffee: "café",
  water: "agua",
  soda: "refrescos",
  beer: "cerveza",
  wine: "vino",
  cocktail: "cócteles",
  premiumCocktails: "cócteles premium",
  bottledBeer: "cerveza embotellada",
  premiumSpirits: "destilados premium",
  bottledWaterUnlimited: "agua embotellada sin límite",
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
    data.bottledWaterUnlimited,
  ].filter(Boolean).length;

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

    bottledWaterUnlimited:
      data.bottledWaterUnlimited,
  });

  const bestPackage =
    comparison.bestPackage;

  /*
   * Explicación automática de la recomendación.
   *
   * Esta capa NO modifica la decisión del motor.
   * Solo explica por qué se ha llegado a ella.
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

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-4xl">

        <div className="rounded-3xl bg-white p-10 shadow-xl">

          <h1 className="text-center text-4xl font-bold text-slate-900">
            🍹 Tu recomendación DrinkPilot
          </h1>

          <p className="mt-3 text-center text-slate-500">
            Hemos comparado automáticamente los paquetes disponibles
            según tu consumo y tus preferencias.
          </p>

          {/* EXPLICACIÓN PRINCIPAL */}

          <div
            className={`mt-8 rounded-2xl border p-8 text-center ${explanationStyle.container}`}
          >
            <div className="text-4xl">
              {explanationStyle.icon}
            </div>

            <h2
              className={`mt-3 text-3xl font-bold ${explanationStyle.title}`}
            >
              {explanation.title}
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-lg leading-7 text-slate-700">
              {explanation.summary}
            </p>

            <div className="mx-auto mt-6 max-w-2xl rounded-xl bg-white/70 p-5 text-left">
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
                <p className="mt-7 text-5xl font-bold text-sky-600">
                  {bestPackage.savings.toFixed(2)} €
                </p>

                <p className="mt-2 text-slate-600">
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
                <p className="mt-7 text-5xl font-bold text-sky-600">
                  {baseline.drinksCost.toFixed(2)} €
                </p>

                <p className="mt-2 text-slate-600">
                  coste estimado pagando las bebidas por separado
                </p>
              </>
            )}
          </div>

          {/* RESUMEN DEL PERFIL */}

          <div className="mt-10 grid gap-5 md:grid-cols-4">

            <div className="rounded-2xl bg-slate-50 p-6 text-center shadow-sm">
              <p className="text-slate-500">
                🗓️ Duración
              </p>

              <p className="mt-2 text-3xl font-bold">
                {data.days}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                días
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 text-center shadow-sm">
              <p className="text-slate-500">
                👥 Personas
              </p>

              <p className="mt-2 text-3xl font-bold">
                {data.people}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                pasajeros
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 text-center shadow-sm">
              <p className="text-slate-500">
                🍹 Consumo
              </p>

              <p className="mt-2 text-3xl font-bold">
                {totalDrinksPerDay}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                bebidas / persona / día
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 text-center shadow-sm">
              <p className="text-slate-500">
                ⭐ Premium
              </p>

              <p className="mt-2 text-3xl font-bold">
                {selectedPremiumPreferences}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                preferencias
              </p>
            </div>

          </div>

          {/* COSTE SIN PAQUETE */}

          <div className="mt-6 rounded-2xl bg-slate-900 p-6 text-white">

            <p className="text-sm text-slate-300">
              Coste estimado pagando las bebidas por separado
            </p>

            <p className="mt-2 text-4xl font-bold">
              {baseline.drinksCost.toFixed(2)} €
            </p>

            <p className="mt-2 text-sm text-slate-300">
              durante todo el crucero
            </p>

          </div>

          {/* COMPARATIVA */}

          <div className="mt-10 rounded-2xl border border-slate-200 p-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  ⚖️ Comparativa de paquetes
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Comparamos economía y cobertura de las bebidas
                  y preferencias que has indicado.
                </p>
              </div>

              {bestPackage ? (
                <span className="shrink-0 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
                  Mejor opción: {bestPackage.packageName}
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-800">
                  Sin opción completa con ahorro
                </span>
              )}

            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">

              {comparison.packages.map((pkg) => {
                const isBest =
                  bestPackage?.packageKey ===
                  pkg.packageKey;

                return (
                  <div
                    key={pkg.packageKey}
                    className={`rounded-2xl border p-5 ${
                      isBest
                        ? "border-green-300 bg-green-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <p className="text-xl font-bold text-slate-900">
                          {pkg.packageName}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {pkg.packagePricePerDay.toFixed(2)} €
                          {" "}por persona / día
                        </p>
                      </div>

                      {isBest && (
                        <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                          Mejor opción
                        </span>
                      )}

                    </div>

                    <div
                      className={`mt-5 rounded-xl border p-4 ${
                        pkg.fullyCovered
                          ? "border-green-200 bg-green-100"
                          : "border-amber-200 bg-amber-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Cobertura
                          </p>

                          <p className="mt-1 text-2xl font-bold text-slate-900">
                            {pkg.coverageScore.toFixed(0)} %
                          </p>
                        </div>

                        <div className="text-right">

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
                        <p className="mt-3 text-sm text-slate-700">
                          <strong>Cubre:</strong>{" "}
                          {pkg.coveredCategories
                            .map(
                              (category) =>
                                coverageLabels[category]
                            )
                            .join(", ")}
                        </p>
                      )}

                      {pkg.uncoveredCategories.length > 0 && (
                        <p className="mt-2 text-sm font-medium text-amber-900">
                          <strong>No cubre:</strong>{" "}
                          {pkg.uncoveredCategories
                            .map(
                              (category) =>
                                coverageLabels[category]
                            )
                            .join(", ")}
                        </p>
                      )}

                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4">

                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Coste paquete
                        </p>

                        <p className="mt-1 text-xl font-bold">
                          {pkg.packageCost.toFixed(2)} €
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Bebidas aparte
                        </p>

                        <p className="mt-1 text-xl font-bold">
                          {pkg.drinksCost.toFixed(2)} €
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Diferencia
                        </p>

                        <p
                          className={`mt-1 text-xl font-bold ${
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
                          Ahorro estimado
                        </p>

                        <p className="mt-1 text-xl font-bold">
                          {pkg.savingsPercentage > 0
                            ? `${pkg.savingsPercentage.toFixed(1)} %`
                            : "0 %"}
                        </p>
                      </div>

                    </div>

                    <div className="mt-5 border-t border-slate-200 pt-4">

                      <p className="text-sm text-slate-600">
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

                      <p className="mt-2 text-sm text-slate-600">
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
              className={`mt-6 rounded-xl border p-5 text-sm leading-6 ${explanationStyle.container}`}
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

          {/* AVISO */}

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">

            <h3 className="font-semibold text-amber-900">
              ℹ️ Estimación de referencia
            </h3>

            <p className="mt-2 text-sm leading-6 text-amber-900">
              DrinkPilot utiliza precios orientativos de bebidas
              y paquetes para realizar esta comparación.
              Los precios reales pueden variar según crucero,
              tarifa, mercado y momento de compra.
            </p>

            <p className="mt-2 text-sm leading-6 text-amber-900">
              Comprueba siempre el precio definitivo en tu reserva
              o en MyCosta antes de contratar un paquete.
            </p>

          </div>

          {/* TABLA DE CONSUMO */}

          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200">

            <div className="bg-slate-800 px-6 py-4 font-bold text-white">
              📊 Tu consumo estimado
            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[600px]">

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

                  <tr className="border-t">
                    <td className="p-3">
                      ☕ Café
                    </td>

                    <td className="text-center">
                      {data.coffee}
                    </td>

                    <td className="text-center">
                      {costaOnboardPriceValues.coffee.toFixed(2)} €
                    </td>

                    <td className="pr-4 text-right font-semibold">
                      {baseline.coffeeCost.toFixed(2)} €
                    </td>
                  </tr>

                  <tr className="border-t">
                    <td className="p-3">
                      💧 Agua
                    </td>

                    <td className="text-center">
                      {data.water}
                    </td>

                    <td className="text-center">
                      {costaOnboardPriceValues.water.toFixed(2)} €
                    </td>

                    <td className="pr-4 text-right font-semibold">
                      {baseline.waterCost.toFixed(2)} €
                    </td>
                  </tr>

                  <tr className="border-t">
                    <td className="p-3">
                      🥤 Refrescos
                    </td>

                    <td className="text-center">
                      {data.soda}
                    </td>

                    <td className="text-center">
                      {costaOnboardPriceValues.soda.toFixed(2)} €
                    </td>

                    <td className="pr-4 text-right font-semibold">
                      {baseline.sodaCost.toFixed(2)} €
                    </td>
                  </tr>

                  <tr className="border-t">
                    <td className="p-3">
                      🍺 Cervezas
                    </td>

                    <td className="text-center">
                      {data.beer}
                    </td>

                    <td className="text-center">
                      {costaOnboardPriceValues.beer.toFixed(2)} €
                    </td>

                    <td className="pr-4 text-right font-semibold">
                      {baseline.beerCost.toFixed(2)} €
                    </td>
                  </tr>

                  <tr className="border-t">
                    <td className="p-3">
                      🍷 Vinos
                    </td>

                    <td className="text-center">
                      {data.wine}
                    </td>

                    <td className="text-center">
                      {costaOnboardPriceValues.wine.toFixed(2)} €
                    </td>

                    <td className="pr-4 text-right font-semibold">
                      {baseline.wineCost.toFixed(2)} €
                    </td>
                  </tr>

                  <tr className="border-t">
                    <td className="p-3">
                      🍸 Cócteles
                    </td>

                    <td className="text-center">
                      {data.cocktail}
                    </td>

                    <td className="text-center">
                      {costaOnboardPriceValues.cocktail.toFixed(2)} €
                    </td>

                    <td className="pr-4 text-right font-semibold">
                      {baseline.cocktailCost.toFixed(2)} €
                    </td>
                  </tr>

                </tbody>

              </table>

            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              resetData();
              router.push("/");
            }}
            className="mt-10 block w-full rounded-xl bg-sky-600 py-4 text-center text-lg font-semibold text-white transition hover:bg-sky-700"
          >
            Empezar de nuevo
          </button>

        </div>
      </div>
    </main>
  );
}