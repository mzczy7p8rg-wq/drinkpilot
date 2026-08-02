"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useStore } from "@/lib/store";
import ProgressBar from "@/components/ProgressBar";

export default function ReviewPage() {
  const router = useRouter();

  const { data, hydrated } = useStore();

  const totalDrinksPerDay =
    data.coffee +
    data.water +
    data.soda +
    data.beer +
    data.wine +
    data.cocktail;

  const premiumPreferences = [
    {
      label: "Cócteles premium",
      selected: data.premiumCocktails,
    },
    {
      label: "Cerveza embotellada",
      selected: data.bottledBeer,
    },
    {
      label: "Destilados premium",
      selected: data.premiumSpirits,
    },
    {
      label: "Agua embotellada sin límite",
      selected: data.bottledWaterUnlimited,
    },
  ].filter((preference) => preference.selected);

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
          currentStep={5}
          totalSteps={5}
        />

        <h1 className="text-3xl font-bold text-slate-900">
          Revisa tu análisis
        </h1>

        <p className="mt-3 text-slate-500">
          Comprueba los datos antes de que DrinkPilot compare
          automáticamente los paquetes disponibles.
        </p>

        {/* CRUCERO */}

        <section className="mt-8 rounded-2xl border border-slate-200 p-5">

          <div className="flex items-start justify-between gap-4">

            <div>
              <h2 className="font-bold text-slate-900">
                🚢 Tu crucero
              </h2>

              <p className="mt-3 text-slate-700">
                <strong>{data.days}</strong>{" "}
                {data.days === 1 ? "día" : "días"}
                {" · "}
                <strong>{data.people}</strong>{" "}
                {data.people === 1
                  ? "persona"
                  : "personas"}
              </p>
            </div>

            <Link
              href="/wizard"
              className="text-sm font-semibold text-sky-700 hover:text-sky-900"
            >
              Editar
            </Link>

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

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm text-slate-500">
                    ☕ Café
                  </p>
                  <p className="mt-1 font-bold">
                    {data.coffee}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm text-slate-500">
                    💧 Agua
                  </p>
                  <p className="mt-1 font-bold">
                    {data.water}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm text-slate-500">
                    🥤 Refrescos
                  </p>
                  <p className="mt-1 font-bold">
                    {data.soda}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm text-slate-500">
                    🍺 Cerveza
                  </p>
                  <p className="mt-1 font-bold">
                    {data.beer}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm text-slate-500">
                    🍷 Vino
                  </p>
                  <p className="mt-1 font-bold">
                    {data.wine}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm text-slate-500">
                    🍸 Cócteles
                  </p>
                  <p className="mt-1 font-bold">
                    {data.cocktail}
                  </p>
                </div>

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

              {premiumPreferences.length > 0 ? (
                <div className="mt-3 space-y-2">

                  {premiumPreferences.map(
                    (preference) => (
                      <p
                        key={preference.label}
                        className="text-sm text-slate-700"
                      >
                        ✓ {preference.label}
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

                  <div>
                    <p className="font-medium text-slate-800">
                      My Drinks
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      por persona / día
                    </p>
                  </div>

                  {data.myDrinksCustomPrice !== null ? (
                    <div className="text-right">

                      <p className="font-bold text-slate-900">
                        {data.myDrinksCustomPrice.toFixed(2)} €
                      </p>

                      <p className="mt-1 text-xs font-medium text-sky-700">
                        ✓ Precio de tu reserva
                      </p>

                    </div>
                  ) : (
                    <div className="text-right">

                      <p className="font-bold text-slate-900">
                        34.00 €
                      </p>

                      <p className="mt-1 text-xs font-medium text-amber-700">
                        ⚠ Precio de referencia
                      </p>

                    </div>
                  )}

                </div>

                <div className="border-t border-slate-100 pt-4">

                  <div className="flex items-center justify-between gap-4">

                    <div>
                      <p className="font-medium text-slate-800">
                        My Drinks Plus
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        por persona / día
                      </p>
                    </div>

                    {data.myDrinksPlusCustomPrice !== null ? (
                      <div className="text-right">

                        <p className="font-bold text-slate-900">
                          {data.myDrinksPlusCustomPrice.toFixed(2)} €
                        </p>

                        <p className="mt-1 text-xs font-medium text-sky-700">
                          ✓ Precio de tu reserva
                        </p>

                      </div>
                    ) : (
                      <div className="text-right">

                        <p className="font-bold text-slate-900">
                          46.00 €
                        </p>

                        <p className="mt-1 text-xs font-medium text-amber-700">
                          ⚠ Precio de referencia
                        </p>

                      </div>
                    )}

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

        {/* PERSONAS */}

        <section className="mt-4 rounded-2xl border border-slate-200 p-5">

          <div className="flex items-start justify-between gap-4">

            <div>

              <h2 className="font-bold text-slate-900">
                👥 Viajeros
              </h2>

              <p className="mt-3 text-slate-700">
                <strong>{data.people}</strong>{" "}
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

        </section>

        {/* INFORMACIÓN */}

        <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
          💡 DrinkPilot utilizará estos datos para comparar
          automáticamente economía y cobertura de los paquetes.
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