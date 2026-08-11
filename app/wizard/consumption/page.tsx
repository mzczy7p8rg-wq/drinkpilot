"use client";

import Link from "next/link";

import { useStore } from "@/lib/store";
import DrinkCounter from "@/components/DrinkCounter";
import ProgressBar from "@/components/ProgressBar";
import { WizardBrand } from "@/components/Brand";

import {
  updateCocktailComposition,
} from "@/lib/cocktailComposition";

import {
  useWizardRouteGuard,
} from "@/lib/useWizardRouteGuard";

import {
  getTotalDrinksPerDay,
  hasValidConsumptionStep,
} from "@/lib/wizardProgress";

export default function ConsumptionPage() {
  const { data, setData } = useStore();

  const { ready } =
    useWizardRouteGuard(
      "cruise"
    );

  const totalDrinksPerDay =
    getTotalDrinksPerDay(
      data
    );

  const hasConsumption =
    hasValidConsumptionStep(
      data
    );

  const hasCocktails =
    data.cocktail > 0;

  const hasCocktailComposition =
    data.alcoholicCocktail !== null &&
    data.nonAlcoholicCocktail !== null;

  const cocktailCompositionTotal =
    (data.alcoholicCocktail ?? 0) +
    (data.nonAlcoholicCocktail ?? 0);

  const isCocktailCompositionValid =
    hasCocktailComposition &&
    cocktailCompositionTotal ===
      data.cocktail;

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="font-medium text-slate-600">
          Comprobando los datos de tu análisis...
        </p>
      </main>
    );
  }

  return (
    <main className="brand-ocean-bg min-h-screen px-4 py-6 sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-5 shadow-lg sm:p-10">
        <WizardBrand />
        <ProgressBar
          currentStep={2}
          totalSteps={6}
        />

        {/* CABECERA */}

        <div className="mt-2 sm:mt-0">

          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Paso 2 de 6
          </p>

          <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            ¿Cuántas bebidas consumes al día?
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Indica el consumo aproximado de una persona durante
            un día normal del crucero.
          </p>

        </div>

        {/* AYUDA */}

        <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-sky-900 sm:mt-6">
          💡 Introduce las bebidas que consumirías aunque
          no contrataras ningún paquete.
        </div>

        {/* CONTADORES */}

        <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">

          <DrinkCounter
            label="☕ Cafés"
            accessibleLabel="Cafés"
            value={data.coffee}
            onChange={(value) =>
              setData((prev) => ({
                ...prev,
                coffee: Math.max(0, value),
              }))
            }
          />

          <DrinkCounter
            label="💧 Agua"
            accessibleLabel="Agua"
            value={data.water}
            onChange={(value) =>
              setData((prev) => ({
                ...prev,
                water: Math.max(0, value),
              }))
            }
          />

          <DrinkCounter
            label="🥤 Refrescos"
            accessibleLabel="Refrescos"
            value={data.soda}
            onChange={(value) =>
              setData((prev) => ({
                ...prev,
                soda: Math.max(0, value),
              }))
            }
          />

          <DrinkCounter
            label="🍺 Cervezas"
            accessibleLabel="Cervezas"
            value={data.beer}
            onChange={(value) =>
              setData((prev) => ({
                ...prev,
                beer: Math.max(0, value),
              }))
            }
          />

          <DrinkCounter
            label="🍷 Vinos"
            accessibleLabel="Vinos"
            value={data.wine}
            onChange={(value) =>
              setData((prev) => ({
                ...prev,
                wine: Math.max(0, value),
              }))
            }
          />

          <DrinkCounter
            label="🍸 Cócteles"
            accessibleLabel="Cócteles"
            value={data.cocktail}
            onChange={(value) =>
              setData((prev) => ({
                ...prev,

                cocktail:
                  Math.max(0, value),

                /*
                 * Si cambia el total,
                 * el reparto anterior
                 * deja de ser fiable.
                 */
                alcoholicCocktail:
                  null,

                nonAlcoholicCocktail:
                  null,
              }))
            }
          />

          {hasCocktails && (
            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 sm:p-5">
              <div>
                <p className="font-semibold text-slate-900">
                  ¿Qué tipo de cócteles consumes?
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Opcional. Reparte tus{" "}
                  <strong>
                    {data.cocktail}
                  </strong>{" "}
                  {data.cocktail === 1
                    ? "cóctel"
                    : "cócteles"}{" "}
                  entre las dos categorías.
                </p>
              </div>

              <div className="mt-4 space-y-3">
                <DrinkCounter
                  label="🍸 Con alcohol"
                  accessibleLabel="Cócteles con alcohol"
                  value={
                    data.alcoholicCocktail ??
                    0
                  }
                  max={data.cocktail}
                  onChange={(value) =>
                    setData((prev) => {
                      const composition =
                        updateCocktailComposition(
                          prev.cocktail,
                          {
                            alcoholicCocktail:
                              prev
                                .alcoholicCocktail ??
                              0,

                            nonAlcoholicCocktail:
                              prev
                                .nonAlcoholicCocktail ??
                              0,
                          },
                          "alcoholicCocktail",
                          value
                        );

                      return {
                        ...prev,
                        ...composition,
                      };
                    })
                  }
                />

                <DrinkCounter
                  label="🍹 Sin alcohol"
                  accessibleLabel="Cócteles sin alcohol"
                  value={
                    data.nonAlcoholicCocktail ??
                    0
                  }
                  max={data.cocktail}
                  onChange={(value) =>
                    setData((prev) => {
                      const composition =
                        updateCocktailComposition(
                          prev.cocktail,
                          {
                            alcoholicCocktail:
                              prev
                                .alcoholicCocktail ??
                              0,

                            nonAlcoholicCocktail:
                              prev
                                .nonAlcoholicCocktail ??
                              0,
                          },
                          "nonAlcoholicCocktail",
                          value
                        );

                      return {
                        ...prev,
                        ...composition,
                      };
                    })
                  }
                />
              </div>

              {hasCocktailComposition && (
                <div
                  className={`mt-4 rounded-xl border p-3 text-sm ${
                    isCocktailCompositionValid
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                  }`}
                >
                  {isCocktailCompositionValid
                    ? `✓ Reparto completo: ${cocktailCompositionTotal} de ${data.cocktail}.`
                    : `El reparto suma ${cocktailCompositionTotal} de ${data.cocktail}. Ajusta las cantidades si quieres completar la composición.`}
                </div>
              )}
            </div>
          )}

        </div>

        {/* TOTAL */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center sm:p-5">

          <p className="text-sm font-medium text-slate-500">
            Consumo diario estimado
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-900">
            {totalDrinksPerDay}
          </p>

          <p className="mt-1 text-sm font-medium text-slate-600">
            {totalDrinksPerDay === 1
              ? "bebida"
              : "bebidas"}{" "}
            por persona / día
          </p>

        </div>

        {!hasConsumption && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
            <p className="text-sm font-medium text-amber-800">
              Añade al menos una bebida para continuar.
            </p>
          </div>
        )}

        {/* NAVEGACIÓN */}

        <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4">

          <Link
            href="/wizard"
            className="rounded-xl border border-slate-300 px-3 py-4 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:text-base"
          >
            Atrás
          </Link>

          <Link
            href={
              hasConsumption
                ? "/wizard/preferences"
                : "#"
            }
            onClick={(event) => {
              if (!hasConsumption) {
                event.preventDefault();
              }
            }}
            className={`rounded-xl px-3 py-4 text-center text-sm font-semibold transition sm:text-base ${
              hasConsumption
                ? "bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800"
                : "pointer-events-none bg-slate-300 text-slate-500"
            }`}
          >
            Continuar
          </Link>

        </div>

      </div>
    </main>
  );
}
