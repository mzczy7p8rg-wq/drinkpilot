"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { calculateRecommendation } from "@/lib/calculator";
import { getPackage, PackageKey } from "@/lib/packageService";

export default function ResultsPage() {
  const { data } = useStore();

  if (!data.packageKey) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-600">
          No se ha seleccionado ningún paquete.
        </p>
      </main>
    );
  }

  const selectedPackage = getPackage(data.packageKey as PackageKey);

  const result = calculateRecommendation({
    days: data.days,
    people: data.people,

    packagePricePerDay: selectedPackage.pricePerDay,

    coffee: data.coffee,
    water: data.water,
    soda: data.soda,
    beer: data.beer,
    wine: data.wine,
    cocktail: data.cocktail,

    coffeePrice: selectedPackage.drinks.coffee,
    waterPrice: selectedPackage.drinks.water,
    sodaPrice: selectedPackage.drinks.soda,
    beerPrice: selectedPackage.drinks.beer,
    winePrice: selectedPackage.drinks.wine,
    cocktailPrice: selectedPackage.drinks.cocktail,
  });

  const savingsColor = result.recommended
    ? result.savings > 150
      ? "bg-green-100 border-green-300"
      : result.savings > 30
      ? "bg-yellow-100 border-yellow-300"
      : "bg-orange-100 border-orange-300"
    : "bg-red-100 border-red-300";

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-6">
      <div className="mx-auto max-w-4xl">

        <div className="rounded-3xl bg-white p-10 shadow-xl">

          <h1 className="text-center text-4xl font-bold">
            🍹 Resultado de tu cálculo
          </h1>

          <p className="mt-3 text-center text-slate-500">
            Basado en el consumo que nos has indicado.
          </p>

          <div className={`mt-8 rounded-2xl border p-8 text-center ${savingsColor}`}>

            <h2 className="text-3xl font-bold">
              {result.recommended
                ? "✅ Recomendamos este paquete"
                : "❌ No recomendamos este paquete"}
            </h2>

            <p className="mt-3 text-xl font-semibold">
              {selectedPackage.name}
            </p>

            <p className="mt-6 text-6xl font-bold text-sky-600">
              {Math.abs(result.savings).toFixed(2)} €
            </p>

            <p className="mt-3 text-lg">
              {result.recommended
                ? "de ahorro estimado"
                : "de diferencia respecto a pagar las bebidas"}
            </p>

          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">

            <div className="rounded-2xl bg-slate-50 p-6 shadow-sm">
              <p className="text-slate-500">💰 Paquete</p>
              <p className="mt-2 text-3xl font-bold">
                {result.packageCost.toFixed(2)} €
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 shadow-sm">
              <p className="text-slate-500">🍹 Consumo</p>
              <p className="mt-2 text-3xl font-bold">
                {result.drinksCost.toFixed(2)} €
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 shadow-sm">
              <p className="text-slate-500">📈 Ahorro</p>
              <p className="mt-2 text-3xl font-bold">
                {result.savings.toFixed(2)} €
              </p>
            </div>

          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 overflow-hidden">

            <div className="bg-slate-800 px-6 py-4 text-white font-bold">
              📊 Desglose del consumo
            </div>

            <table className="w-full">

              <thead className="bg-slate-100">

                <tr>

                  <th className="p-3 text-left">Bebida</th>

                  <th className="p-3 text-center">Cantidad</th>

                  <th className="p-3 text-center">Precio</th>

                  <th className="p-3 text-right">Total crucero</th>

                </tr>

              </thead>

              <tbody>

                <tr className="border-t">
  <td className="p-3">☕ Café</td>
  <td className="text-center">{data.coffee}</td>
  <td className="text-center">
    {selectedPackage.drinks.coffee.toFixed(2)} €
  </td>
  <td className="pr-4 text-right font-semibold">
    {result.coffeeCost.toFixed(2)} €
  </td>
</tr>

<tr className="border-t">
  <td className="p-3">💧 Agua</td>
  <td className="text-center">{data.water}</td>
  <td className="text-center">
    {selectedPackage.drinks.water.toFixed(2)} €
  </td>
  <td className="pr-4 text-right font-semibold">
    {result.waterCost.toFixed(2)} €
  </td>
</tr>

<tr className="border-t">
  <td className="p-3">🥤 Refrescos</td>
  <td className="text-center">{data.soda}</td>
  <td className="text-center">
    {selectedPackage.drinks.soda.toFixed(2)} €
  </td>
  <td className="pr-4 text-right font-semibold">
    {result.sodaCost.toFixed(2)} €
  </td>
</tr>

<tr className="border-t">
  <td className="p-3">🍺 Cervezas</td>
  <td className="text-center">{data.beer}</td>
  <td className="text-center">
    {selectedPackage.drinks.beer.toFixed(2)} €
  </td>
  <td className="pr-4 text-right font-semibold">
    {result.beerCost.toFixed(2)} €
  </td>
</tr>

<tr className="border-t">
  <td className="p-3">🍷 Vinos</td>
  <td className="text-center">{data.wine}</td>
  <td className="text-center">
    {selectedPackage.drinks.wine.toFixed(2)} €
  </td>
  <td className="pr-4 text-right font-semibold">
    {result.wineCost.toFixed(2)} €
  </td>
</tr>

<tr className="border-t">
  <td className="p-3">🍸 Cócteles</td>
  <td className="text-center">{data.cocktail}</td>
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

          <div className="mt-8 rounded-2xl bg-sky-50 p-6">

            <h3 className="text-xl font-bold">
              🎯 Punto de equilibrio
            </h3>

            <p className="mt-3">
              El paquete empieza a compensar a partir de
              <strong>
                {" "}
                {result.breakEvenDrinksPerDay.toFixed(1)}
              </strong>
              {" "}bebidas al día.
            </p>

          </div>

          <Link
            href="/"
            className="mt-10 block rounded-xl bg-sky-600 py-4 text-center text-lg font-semibold text-white hover:bg-sky-700"
          >
            Empezar de nuevo
          </Link>

        </div>

      </div>
    </main>
  );
}