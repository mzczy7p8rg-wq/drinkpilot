"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useStore } from "@/lib/store";
import { calculateRecommendation } from "@/lib/calculator";
import { compareDrinkPackages } from "@/lib/comparison";
import { getAllPackages } from "@/lib/packageService";

export default function ResultsPage() {
  const router = useRouter();

  const {
    data,
    hydrated,
    resetData,
  } = useStore();

  const packages = getAllPackages();

  const selectedPackage = packages.find(
    (pkg) =>
      pkg.key === data.packageKey &&
      pkg.status === "verified"
  );

  const totalDrinksPerDay =
    data.coffee +
    data.water +
    data.soda +
    data.beer +
    data.wine +
    data.cocktail;

  const hasValidDays =
    Number.isInteger(data.days) &&
    data.days > 0;

  const hasValidPackage =
    Boolean(selectedPackage);

  const hasValidConsumption =
    totalDrinksPerDay > 0;

  const hasValidPeople =
    Number.isInteger(data.people) &&
    data.people > 0;

  const isComplete =
    hasValidDays &&
    hasValidPackage &&
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

    if (!hasValidPackage) {
      router.replace("/wizard/package");
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
    hasValidPackage,
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

  if (!isComplete || !selectedPackage) {
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

  const result = calculateRecommendation({
    days: data.days,
    people: data.people,

    packagePricePerDay:
      selectedPackage.pricePerDay,

    coffee: data.coffee,
    water: data.water,
    soda: data.soda,
    beer: data.beer,
    wine: data.wine,
    cocktail: data.cocktail,

    coffeePrice:
      selectedPackage.drinks.coffee,

    waterPrice:
      selectedPackage.drinks.water,

    sodaPrice:
      selectedPackage.drinks.soda,

    beerPrice:
      selectedPackage.drinks.beer,

    winePrice:
      selectedPackage.drinks.wine,

    cocktailPrice:
      selectedPackage.drinks.cocktail,
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
  });

  const recommendation =
    (() => {
      switch (result.recommendationLevel) {
        case "not-worth-it":
          return {
            icon: "🔴",
            title: "No parece compensar",
            description:
              "Con el consumo que has indicado, pagar las bebidas por separado sería más económico.",
            className:
              "border-red-200 bg-red-50",
          };

        case "very-close":
          return {
            icon: "🟠",
            title: "La diferencia es muy ajustada",
            description:
              "El paquete podría ahorrar algo de dinero, pero el margen es pequeño.",
            className:
              "border-orange-200 bg-orange-50",
          };

        case "worth-considering":
          return {
            icon: "🟡",
            title: "Puede compensarte",
            description:
              "Tu consumo estimado supera el precio del paquete con un margen razonable.",
            className:
              "border-yellow-200 bg-yellow-50",
          };

        case "worth-it":
          return {
            icon: "🟢",
            title: "El paquete compensa",
            description:
              "Tu patrón de consumo indica un ahorro estimado significativo.",
            className:
              "border-green-200 bg-green-50",
          };

        case "strongly-worth-it":
          return {
            icon: "🟢",
            title: "El paquete compensa claramente",
            description:
              "Tu consumo estimado está claramente por encima del coste diario del paquete.",
            className:
              "border-green-300 bg-green-100",
          };
      }
    })();

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-4xl">

        <div className="rounded-3xl bg-white p-10 shadow-xl">

          <h1 className="text-center text-4xl font-bold text-slate-900">
            🍹 Resultado de tu análisis
          </h1>

          <p className="mt-3 text-center text-slate-500">
            Basado en el consumo diario que nos has indicado.
          </p>

          {/* RECOMENDACIÓN */}

          <div
            className={`mt-8 rounded-2xl border p-8 text-center ${recommendation.className}`}
          >
            <div className="text-4xl">
              {recommendation.icon}
            </div>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              {recommendation.title}
            </h2>

            <p className="mt-3 text-xl font-semibold">
              {selectedPackage.name}
            </p>

            <p className="mx-auto mt-4 max-w-2xl text-slate-700">
              {recommendation.description}
            </p>

            <p className="mt-6 text-5xl font-bold text-sky-600">
              {Math.abs(result.savings).toFixed(2)} €
            </p>

            <p className="mt-2 text-slate-600">
              {result.savings >= 0
                ? "de ahorro estimado durante el crucero"
                : "más barato pagando las bebidas por separado"}
            </p>
          </div>

          {/* RESUMEN */}

          <div className="mt-10 grid gap-5 md:grid-cols-3">

            <div className="rounded-2xl bg-slate-50 p-6 shadow-sm">
              <p className="text-slate-500">
                💰 Paquete
              </p>

              <p className="mt-2 text-3xl font-bold">
                {result.packageCost.toFixed(2)} €
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 shadow-sm">
              <p className="text-slate-500">
                🍹 Bebidas por separado
              </p>

              <p className="mt-2 text-3xl font-bold">
                {result.drinksCost.toFixed(2)} €
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 shadow-sm">
              <p className="text-slate-500">
                📈 Diferencia
              </p>

              <p
                className={`mt-2 text-3xl font-bold ${
                  result.savings >= 0
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {result.savings >= 0 ? "+" : ""}
                {result.savings.toFixed(2)} €
              </p>
            </div>

          </div>

          {/* ANÁLISIS DIARIO */}

          <div className="mt-6 grid gap-5 md:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500">
                Consumo estimado
              </p>

              <p className="mt-2 text-2xl font-bold">
                {result.dailyDrinkCost.toFixed(2)} €
              </p>

              <p className="mt-1 text-sm text-slate-500">
                por persona / día
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500">
                Precio del paquete
              </p>

              <p className="mt-2 text-2xl font-bold">
                {selectedPackage.pricePerDay.toFixed(2)} €
              </p>

              <p className="mt-1 text-sm text-slate-500">
                por persona / día
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500">
                Margen diario
              </p>

              <p
                className={`mt-2 text-2xl font-bold ${
                  result.dailyMargin >= 0
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {result.dailyMargin >= 0 ? "+" : ""}
                {result.dailyMargin.toFixed(2)} €
              </p>

              <p className="mt-1 text-sm text-slate-500">
                por persona / día
              </p>
            </div>

          </div>

          {/* PORCENTAJE */}

          <div className="mt-6 rounded-2xl bg-slate-900 p-6 text-white">
            <p className="text-sm text-slate-300">
              Ahorro estimado frente a pagar las bebidas por separado
            </p>

            <p className="mt-2 text-3xl font-bold">
              {result.savingsPercentage > 0
                ? `${result.savingsPercentage.toFixed(1)} %`
                : "0 %"}
            </p>
          </div>

          {/* AVISO DE PRECIOS */}

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="font-semibold text-amber-900">
              ℹ️ Estimación de referencia
            </h3>

            <p className="mt-2 text-sm leading-6 text-amber-900">
              El ahorro mostrado utiliza precios orientativos para estimar
              cuánto costaría comprar las bebidas por separado. Los precios
              reales a bordo y el coste del paquete pueden variar según el
              crucero, la tarifa, el mercado y el momento de compra.
            </p>

            <p className="mt-2 text-sm leading-6 text-amber-900">
              Comprueba siempre el precio definitivo en tu reserva o en
              MyCosta antes de contratar el paquete.
            </p>
          </div>

          {/* COMPARATIVA DE PAQUETES */}

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  ⚖️ Comparativa de paquetes
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Hemos aplicado exactamente tu mismo patrón de consumo,
                  número de pasajeros y duración del crucero a todos los
                  paquetes disponibles.
                </p>
              </div>

              {comparison.bestPackage ? (
                <span className="shrink-0 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
                  Mejor opción: {comparison.bestPackage.packageName}
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-800">
                  Ningún paquete compensa
                </span>
              )}

            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">

              {comparison.packages.map((pkg) => {
                const isBest =
                  comparison.bestPackage?.packageKey ===
                  pkg.packageKey;

                const isCurrent =
                  data.packageKey === pkg.packageKey;

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
                        <p className="text-lg font-bold text-slate-900">
                          {pkg.packageName}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {pkg.packagePricePerDay.toFixed(2)} €
                          {" "}por persona / día
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">

                        {isBest && (
                          <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                            Mejor opción
                          </span>
                        )}

                        {isCurrent && (
                          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
                            Tu selección
                          </span>
                        )}

                      </div>

                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4">

                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Coste paquete
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-900">
                          {pkg.packageCost.toFixed(2)} €
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
                          Margen diario
                        </p>

                        <p
                          className={`mt-1 font-semibold ${
                            pkg.dailyMargin > 0
                              ? "text-green-700"
                              : pkg.dailyMargin < 0
                              ? "text-red-700"
                              : "text-slate-700"
                          }`}
                        >
                          {pkg.dailyMargin > 0 ? "+" : ""}
                          {pkg.dailyMargin.toFixed(2)} €
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Ahorro estimado
                        </p>

                        <p className="mt-1 font-semibold text-slate-900">
                          {pkg.savingsPercentage > 0
                            ? `${pkg.savingsPercentage.toFixed(1)} %`
                            : "0 %"}
                        </p>
                      </div>

                    </div>

                    <div className="mt-5 border-t border-slate-200 pt-4">

                      <p className="text-sm text-slate-600">
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

            {comparison.bestPackage ? (
              <div className="mt-6 rounded-xl bg-green-100 p-4 text-sm leading-6 text-green-900">
                <strong>
                  Según tu consumo, {comparison.bestPackage.packageName} es
                  la opción económicamente más favorable.
                </strong>{" "}
                La comparación utiliza exactamente los mismos datos para todos
                los paquetes.
              </div>
            ) : (
              <div className="mt-6 rounded-xl bg-slate-100 p-4 text-sm leading-6 text-slate-700">
                <strong>
                  Con el consumo indicado no encontramos ningún paquete que
                  genere ahorro.
                </strong>{" "}
                Pagar las bebidas por separado sería la opción económicamente
                más favorable según esta estimación.
              </div>
            )}

          </div>

          {/* DESGLOSE */}

          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200">

            <div className="bg-slate-800 px-6 py-4 font-bold text-white">
              📊 Desglose del consumo
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
                      {selectedPackage.drinks.coffee.toFixed(2)} €
                    </td>

                    <td className="pr-4 text-right font-semibold">
                      {result.coffeeCost.toFixed(2)} €
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
                      {selectedPackage.drinks.water.toFixed(2)} €
                    </td>

                    <td className="pr-4 text-right font-semibold">
                      {result.waterCost.toFixed(2)} €
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
                      {selectedPackage.drinks.soda.toFixed(2)} €
                    </td>

                    <td className="pr-4 text-right font-semibold">
                      {result.sodaCost.toFixed(2)} €
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
                      {selectedPackage.drinks.beer.toFixed(2)} €
                    </td>

                    <td className="pr-4 text-right font-semibold">
                      {result.beerCost.toFixed(2)} €
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
                      {selectedPackage.drinks.wine.toFixed(2)} €
                    </td>

                    <td className="pr-4 text-right font-semibold">
                      {result.wineCost.toFixed(2)} €
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
                      {selectedPackage.drinks.cocktail.toFixed(2)} €
                    </td>

                    <td className="pr-4 text-right font-semibold">
                      {result.cocktailCost.toFixed(2)} €
                    </td>
                  </tr>

                </tbody>

              </table>

            </div>
          </div>

          {/* PUNTO DE EQUILIBRIO */}

          <div className="mt-8 rounded-2xl bg-sky-50 p-6">
            <h3 className="text-xl font-bold">
              🎯 Punto de equilibrio
            </h3>

            <p className="mt-3 leading-7">
              Con tu combinación habitual de bebidas, el paquete empieza a
              compensar aproximadamente a partir de{" "}
              <strong>
                {result.breakEvenDrinksPerDay.toFixed(1)}
              </strong>{" "}
              bebidas por persona y día.
            </p>
          </div>

          {/* REINICIO */}

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