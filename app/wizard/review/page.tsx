"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useStore } from "@/lib/store";
import ProgressBar from "@/components/ProgressBar";

export default function ReviewPage() {
  const router = useRouter();
  const { data, hydrated } = useStore();

  const drinks = [
    {
      label: "Café",
      icon: "☕",
      value: data.coffee,
    },
    {
      label: "Agua",
      icon: "💧",
      value: data.water,
    },
    {
      label: "Refrescos",
      icon: "🥤",
      value: data.soda,
    },
    {
      label: "Cerveza",
      icon: "🍺",
      value: data.beer,
    },
    {
      label: "Vino",
      icon: "🍷",
      value: data.wine,
    },
    {
      label: "Cócteles",
      icon: "🍸",
      value: data.cocktail,
    },
  ];

  const activeDrinks = drinks.filter(
    (drink) => drink.value > 0
  );

  const totalDrinksPerDay =
    activeDrinks.reduce(
      (total, drink) =>
        total + drink.value,
      0
    );

  const preferences = [
    data.premiumCocktails &&
      "Cócteles premium",

    data.bottledBeer &&
      "Cerveza embotellada",

    data.premiumSpirits &&
      "Destilados premium",

    data.bottledWaterUnlimited &&
      "Agua embotellada sin límite",
  ].filter(Boolean) as string[];

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <p className="font-medium text-slate-600">
          Recuperando tu análisis...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-10 shadow-lg">

        <ProgressBar
          currentStep={6}
          totalSteps={6}
        />

        <h1 className="text-3xl font-bold text-slate-900">
          Revisa tu análisis
        </h1>

        <p className="mt-3 text-slate-500">
          Comprueba los datos antes de ver
          la recomendación.
        </p>

        {/* DATOS BÁSICOS */}

        <section className="mt-8 rounded-2xl border border-slate-200 p-5">

          <div className="grid gap-5 sm:grid-cols-2">

            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-sm text-slate-500">
                  🚢 Duración
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {data.days}{" "}
                  {data.days === 1
                    ? "día"
                    : "días"}
                </p>
              </div>

              <Link
                href="/wizard"
                className="text-sm font-semibold text-sky-700 hover:text-sky-900"
              >
                Editar
              </Link>

            </div>

            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-sm text-slate-500">
                  👥 Viajeros
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {data.people}{" "}
                  {data.people === 1
                    ? "persona"
                    : "personas"}
                </p>
              </div>

              <Link
                href="/wizard/people"
                className="text-sm font-semibold text-sky-700 hover:text-sky-900"
              >
                Editar
              </Link>

            </div>

          </div>

        </section>

        {/* CONSUMO */}

        <section className="mt-4 rounded-2xl border border-slate-200 p-5">

          <div className="flex items-start justify-between gap-4">

            <div className="flex-1">

              <h2 className="font-bold text-slate-900">
                🍹 Consumo diario
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {totalDrinksPerDay}{" "}
                {totalDrinksPerDay === 1
                  ? "bebida"
                  : "bebidas"}{" "}
                por persona / día
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">

                {activeDrinks.map(
                  (drink) => (
                    <div
                      key={drink.label}
                      className="rounded-xl bg-slate-50 p-3"
                    >
                      <p className="text-sm text-slate-500">
                        {drink.icon}{" "}
                        {drink.label}
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {drink.value}
                      </p>
                    </div>
                  )
                )}

              </div>

            </div>

            <Link
              href="/wizard/consumption"
              className="text-sm font-semibold text-sky-700 hover:text-sky-900"
            >
              Editar
            </Link>

          </div>

        </section>

        {/* PREFERENCIAS */}

        <section className="mt-4 rounded-2xl border border-slate-200 p-5">

          <div className="flex items-start justify-between gap-4">

            <div>

              <h2 className="font-bold text-slate-900">
                ⭐ Preferencias
              </h2>

              {preferences.length > 0 ? (
                <div className="mt-3 space-y-2">

                  {preferences.map(
                    (preference) => (
                      <p
                        key={preference}
                        className="text-sm text-slate-700"
                      >
                        ✓ {preference}
                      </p>
                    )
                  )}

                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  Sin preferencias premium adicionales.
                </p>
              )}

            </div>

            <Link
              href="/wizard/preferences"
              className="text-sm font-semibold text-sky-700 hover:text-sky-900"
            >
              Editar
            </Link>

          </div>

        </section>

        {/* PRECIOS */}

        <section className="mt-4 rounded-2xl border border-slate-200 p-5">

          <div className="flex items-start justify-between gap-4">

            <div className="flex-1">

              <h2 className="font-bold text-slate-900">
                🎟️ Precios de los paquetes
              </h2>

              <div className="mt-4 space-y-4">

                <div className="flex items-center justify-between gap-4">

                  <span className="font-medium text-slate-800">
                    My Drinks
                  </span>

                  <div className="text-right">

                    <p className="font-bold text-slate-900">
                      {data.myDrinksCustomPrice !== null
                        ? `${data.myDrinksCustomPrice.toFixed(2)} €`
                        : "34.00 €"}
                    </p>

                    <p
                      className={`mt-1 text-xs font-medium ${
                        data.myDrinksCustomPrice !== null
                          ? "text-sky-700"
                          : "text-amber-700"
                      }`}
                    >
                      {data.myDrinksCustomPrice !== null
                        ? "✓ Precio de tu reserva"
                        : "⚠ Precio de referencia"}
                    </p>

                  </div>

                </div>

                <div className="border-t border-slate-100 pt-4">

                  <div className="flex items-center justify-between gap-4">

                    <span className="font-medium text-slate-800">
                      My Drinks Plus
                    </span>

                    <div className="text-right">

                      <p className="font-bold text-slate-900">
                        {data.myDrinksPlusCustomPrice !== null
                          ? `${data.myDrinksPlusCustomPrice.toFixed(2)} €`
                          : "46.00 €"}
                      </p>

                      <p
                        className={`mt-1 text-xs font-medium ${
                          data.myDrinksPlusCustomPrice !== null
                            ? "text-sky-700"
                            : "text-amber-700"
                        }`}
                      >
                        {data.myDrinksPlusCustomPrice !== null
                          ? "✓ Precio de tu reserva"
                          : "⚠ Precio de referencia"}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            <Link
              href="/wizard/prices"
              className="text-sm font-semibold text-sky-700 hover:text-sky-900"
            >
              Editar
            </Link>

          </div>

        </section>

        {/* CONFIRMACIÓN */}

        <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
          💡 Todo listo. DrinkPilot utilizará
          estos datos para comparar coste y cobertura.
        </div>

        {/* NAVEGACIÓN */}

        <div className="mt-10 flex gap-4">

          <Link
            href="/wizard/people"
            className="flex-1 rounded-xl border border-slate-300 py-4 text-center font-semibold transition hover:bg-slate-100"
          >
            Atrás
          </Link>

          <button
            type="button"
            onClick={() =>
              router.push("/results")
            }
            className="flex-1 rounded-xl bg-sky-600 py-4 text-center font-semibold text-white transition hover:bg-sky-700"
          >
            Ver recomendación
          </button>

        </div>

      </div>
    </main>
  );
}