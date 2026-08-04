"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useStore } from "@/lib/store";
import ProgressBar from "@/components/ProgressBar";

export default function ReviewPage() {
  const router = useRouter();

  const {
    data,
    hydrated,
  } = useStore();

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

  const activeDrinks =
    drinks.filter(
      (drink) =>
        drink.value > 0
    );

  const totalDrinksPerDay =
    activeDrinks.reduce(
      (
        total,
        drink
      ) =>
        total +
        drink.value,
      0
    );

  const preferences = [
    data.nonAlcoholicCocktails &&
      "Cócteles sin alcohol",

    data.premiumCocktails &&
      "Cócteles premium",

    data.bottledBeer &&
      "Cerveza embotellada",

    data.premiumSpirits &&
      "Destilados premium",

    data.bottledWaterDailyAllowance &&
    !data.bottledWaterUnlimited &&
      "Una botella de agua diaria",

    data.bottledWaterUnlimited &&
      "Agua embotellada sin límite",
  ].filter(Boolean) as string[];

  /*
   * PRECIOS GENÉRICOS
   *
   * Review deja de depender
   * de los campos legacy del Store.
   */
  const softPrice =
    data.customPackagePrices
      .myDrinksSoft ??
    null;

  const myDrinksPrice =
    data.customPackagePrices
      .myDrinks ??
    null;

  const myDrinksPlusPrice =
    data.customPackagePrices
      .myDrinksPlus ??
    null;

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <p className="font-medium text-slate-600">
          Recuperando tu análisis...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 pb-24 sm:px-6 sm:py-10 sm:pb-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-5 shadow-lg sm:p-10">
        <ProgressBar
          currentStep={6}
          totalSteps={6}
        />

        {/* CABECERA */}

        <div className="mt-2 sm:mt-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Paso 6 de 6
          </p>

          <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            Revisa tu análisis
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Comprueba los datos antes
            de ver la recomendación.
          </p>
        </div>

        {/* DATOS BÁSICOS */}

        <section className="mt-6 rounded-2xl border border-slate-200 p-4 sm:mt-8 sm:p-5">
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            <div className="min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-slate-500">
                  🚢 Duración
                </p>

                <Link
                  href="/wizard"
                  className="shrink-0 text-xs font-semibold text-sky-700 hover:text-sky-900 sm:text-sm"
                >
                  Editar
                </Link>
              </div>

              <p className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
                {data.days}{" "}
                {data.days === 1
                  ? "día"
                  : "días"}
              </p>
            </div>

            <div className="min-w-0 border-l border-slate-200 pl-4 sm:pl-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-slate-500">
                  👥 Viajeros
                </p>

                <Link
                  href="/wizard/people"
                  className="shrink-0 text-xs font-semibold text-sky-700 hover:text-sky-900 sm:text-sm"
                >
                  Editar
                </Link>
              </div>

              <p className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
                {data.people}{" "}
                {data.people === 1
                  ? "persona"
                  : "personas"}
              </p>
            </div>
          </div>
        </section>

        {/* CONSUMO */}

        <section className="mt-4 rounded-2xl border border-slate-200 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-slate-900">
                🍹 Consumo diario
              </h2>

              <p className="mt-2 text-sm leading-5 text-slate-500">
                {totalDrinksPerDay}{" "}
                {totalDrinksPerDay === 1
                  ? "bebida"
                  : "bebidas"}{" "}
                por persona / día
              </p>
            </div>

            <Link
              href="/wizard/consumption"
              className="shrink-0 text-sm font-semibold text-sky-700 hover:text-sky-900"
            >
              Editar
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {activeDrinks.map(
              (drink) => (
                <div
                  key={drink.label}
                  className="rounded-xl bg-slate-50 p-3"
                >
                  <p className="text-xs leading-5 text-slate-500 sm:text-sm">
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
        </section>

        {/* PREFERENCIAS */}

        <section className="mt-4 rounded-2xl border border-slate-200 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-bold text-slate-900">
                ⭐ Preferencias
              </h2>

              {preferences.length >
              0 ? (
                <div className="mt-3 space-y-2">
                  {preferences.map(
                    (
                      preference
                    ) => (
                      <p
                        key={
                          preference
                        }
                        className="text-sm leading-5 text-slate-700"
                      >
                        ✓{" "}
                        {
                          preference
                        }
                      </p>
                    )
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-5 text-slate-500">
                  Sin preferencias
                  premium adicionales.
                </p>
              )}
            </div>

            <Link
              href="/wizard/preferences"
              className="shrink-0 text-sm font-semibold text-sky-700 hover:text-sky-900"
            >
              Editar
            </Link>
          </div>
        </section>

        {/* PRECIOS */}

        <section className="mt-4 rounded-2xl border border-slate-200 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-bold text-slate-900">
              🎟️ Precios de los
              paquetes
            </h2>

            <Link
              href="/wizard/prices"
              className="shrink-0 text-sm font-semibold text-sky-700 hover:text-sky-900"
            >
              Editar
            </Link>
          </div>

          <div className="mt-4 space-y-4">
            {/* MY DRINKS SOFT */}

            <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">
                    My Drinks Soft
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    por persona /
                    día
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-slate-900">
                    {softPrice !==
                    null
                      ? `${softPrice.toFixed(
                          2
                        )} €`
                      : "Pendiente"}
                  </p>

                  <p
                    className={`mt-1 text-xs font-medium ${
                      softPrice !==
                      null
                        ? "text-sky-700"
                        : "text-slate-500"
                    }`}
                  >
                    {softPrice !==
                    null
                      ? "✓ Tu reserva"
                      : "Sin precio de referencia"}
                  </p>
                </div>
              </div>
            </div>

            {/* MY DRINKS */}

            <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">
                    My Drinks
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    por persona /
                    día
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-slate-900">
                    {myDrinksPrice !==
                    null
                      ? `${myDrinksPrice.toFixed(
                          2
                        )} €`
                      : "34.00 €"}
                  </p>

                  <p
                    className={`mt-1 text-xs font-medium ${
                      myDrinksPrice !==
                      null
                        ? "text-sky-700"
                        : "text-amber-700"
                    }`}
                  >
                    {myDrinksPrice !==
                    null
                      ? "✓ Tu reserva"
                      : "⚠ Referencia"}
                  </p>
                </div>
              </div>
            </div>

            {/* MY DRINKS PLUS */}

            <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">
                    My Drinks Plus
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    por persona /
                    día
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-slate-900">
                    {myDrinksPlusPrice !==
                    null
                      ? `${myDrinksPlusPrice.toFixed(
                          2
                        )} €`
                      : "46.00 €"}
                  </p>

                  <p
                    className={`mt-1 text-xs font-medium ${
                      myDrinksPlusPrice !==
                      null
                        ? "text-sky-700"
                        : "text-amber-700"
                    }`}
                  >
                    {myDrinksPlusPrice !==
                    null
                      ? "✓ Tu reserva"
                      : "⚠ Referencia"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONFIRMACIÓN */}

        <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900 sm:mt-6">
          💡 Todo listo. DrinkPilot
          utilizará estos datos para
          comparar coste y cobertura.
        </div>

        {/* NAVEGACIÓN */}

        <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4">
          <Link
            href="/wizard/people"
            className="rounded-xl border border-slate-300 px-3 py-4 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:text-base"
          >
            Atrás
          </Link>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/results"
              )
            }
            className="rounded-xl bg-sky-600 px-3 py-4 text-center text-sm font-semibold text-white transition hover:bg-sky-700 active:bg-sky-800 sm:text-base"
          >
            Ver recomendación
          </button>
        </div>
      </div>
    </main>
  );
}