"use client";

import Link from "next/link";
import { useState } from "react";

import { useStore } from "@/lib/store";
import DrinkCounter from "@/components/DrinkCounter";
import ProgressBar from "@/components/ProgressBar";
import { WizardBrand } from "@/components/Brand";

import {
  updateOptionalCocktailComposition,
} from "@/lib/cocktailComposition";

import {
  useWizardRouteGuard,
} from "@/lib/useWizardRouteGuard";

import {
  hasValidConsumptionValues,
} from "@/lib/wizardProgress";
import type { AdultConsumptionProfile } from "@/lib/adultConsumptionProfiles";

export default function ConsumptionPage() {
  const { data, setData } = useStore();
  const [activeAdultIndex, setActiveAdultIndex] = useState(0);

  const { ready } =
    useWizardRouteGuard(
      "cruise"
    );

  const activeProfile =
    data.adultConsumptionProfiles[activeAdultIndex] ??
    data.adultConsumptionProfiles[0];

  const updateActiveProfile = (
    update: (profile: AdultConsumptionProfile) => AdultConsumptionProfile
  ) => {
    setData((prev) => ({
      ...prev,
      adultConsumptionProfiles: prev.adultConsumptionProfiles.map(
        (profile, index) =>
          index === activeAdultIndex ? update(profile) : profile
      ),
    }));
  };

  const totalDrinksPerDay = activeProfile
    ? activeProfile.coffee +
      activeProfile.water +
      activeProfile.soda +
      activeProfile.juice +
      activeProfile.beer +
      activeProfile.wine +
      activeProfile.cocktail
    : 0;

  const hasValidConsumption =
    data.adultConsumptionProfiles.length === data.adults &&
    data.adultConsumptionProfiles.every((profile) =>
      hasValidConsumptionValues({
        ...profile,
        people: data.people,
        cruiseNights: data.cruiseNights,
      })
    );

  const hasCocktails =
    (activeProfile?.cocktail ?? 0) > 0;

  const waterLabel =
    data.cruiseLine === "msc"
      ? "💧 Agua no embotellada incluida"
      : "💧 Agua";

  const accessibleWaterLabel =
    data.cruiseLine === "msc"
      ? "Agua no embotellada incluida"
      : "Agua";

  const hasCocktailComposition =
    activeProfile?.alcoholicCocktail !== null &&
    activeProfile?.nonAlcoholicCocktail !== null;

  const cocktailCompositionTotal =
    (activeProfile?.alcoholicCocktail ?? 0) +
    (activeProfile?.nonAlcoholicCocktail ?? 0);

  const isCocktailCompositionValid =
    hasCocktailComposition &&
    cocktailCompositionTotal ===
      activeProfile?.cocktail;

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
      <div className="dark-app-surface mx-auto w-full max-w-2xl rounded-2xl p-5 sm:p-10">
        <WizardBrand />
        <ProgressBar
          currentStep={3}
          totalSteps={6}
        />

        {/* CABECERA */}

        <div className="mt-2 sm:mt-0">

          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Paso 3 de 6
          </p>

          <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            ¿Qué bebidas consumes al día?
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Indica por separado el consumo medio de cada adulto y día.
          </p>

        </div>

        {/* AYUDA */}

        <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-sky-900 sm:mt-6">
          💡 Selecciona un adulto y registra solo lo que consume esa persona en un día habitual.
        </div>

        <div className="mt-6" aria-label="Perfiles de consumo por adulto">
          <p className="text-sm font-semibold text-slate-700">
            ¿De quién es este consumo?
          </p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {data.adultConsumptionProfiles.map((profile, index) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => setActiveAdultIndex(index)}
                aria-pressed={index === activeAdultIndex}
                className={`shrink-0 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  index === activeAdultIndex
                    ? "border-sky-700 bg-sky-700 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {profile.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTADORES */}

        <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">

          <DrinkCounter
            label="☕ Cafés"
            accessibleLabel="Cafés"
            value={activeProfile?.coffee ?? 0}
            onChange={(value) =>
              updateActiveProfile((prev) => ({
                ...prev,
                coffee: Math.max(0, value),
              }))
            }
          />

          <DrinkCounter
            label={waterLabel}
            accessibleLabel={accessibleWaterLabel}
            value={activeProfile?.water ?? 0}
            onChange={(value) =>
              updateActiveProfile((prev) => ({
                ...prev,
                water: Math.max(0, value),
              }))
            }
          />

          {data.cruiseLine === "msc" && (
            <p className="px-1 text-sm leading-6 text-slate-500">
              Si prefieres agua embotellada, indícalo en el siguiente paso como una preferencia independiente.
            </p>
          )}

          <DrinkCounter
            label="🥤 Refrescos"
            accessibleLabel="Refrescos"
            value={activeProfile?.soda ?? 0}
            onChange={(value) =>
              updateActiveProfile((prev) => ({
                ...prev,
                soda: Math.max(0, value),
              }))
            }
          />

          <DrinkCounter
            label="🍺 Cervezas"
            accessibleLabel="Cervezas"
            value={activeProfile?.beer ?? 0}
            onChange={(value) =>
              updateActiveProfile((prev) => ({
                ...prev,
                beer: Math.max(0, value),
              }))
            }
          />

          <DrinkCounter
            label="🧃 Zumos"
            accessibleLabel="Zumos"
            value={activeProfile?.juice ?? 0}
            onChange={(value) =>
              updateActiveProfile((prev) => ({
                ...prev,
                juice: Math.max(0, value),
              }))
            }
          />

          <DrinkCounter
            label="🍷 Vinos"
            accessibleLabel="Vinos"
            value={activeProfile?.wine ?? 0}
            onChange={(value) =>
              updateActiveProfile((prev) => ({
                ...prev,
                wine: Math.max(0, value),
              }))
            }
          />

          <DrinkCounter
            label="🍸 Cócteles"
            accessibleLabel="Cócteles"
            value={activeProfile?.cocktail ?? 0}
            onChange={(value) =>
              updateActiveProfile((prev) => ({
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
                    {activeProfile?.cocktail ?? 0}
                  </strong>{" "}
                  {activeProfile?.cocktail === 1
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
                    activeProfile?.alcoholicCocktail ??
                    0
                  }
                  max={activeProfile?.cocktail ?? 0}
                  onChange={(value) =>
                    updateActiveProfile((prev) => {
                      const composition =
                        updateOptionalCocktailComposition(
                          prev.cocktail,
                          {
                            alcoholicCocktail:
                              prev.alcoholicCocktail,

                            nonAlcoholicCocktail:
                              prev.nonAlcoholicCocktail,
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
                    activeProfile?.nonAlcoholicCocktail ??
                    0
                  }
                  max={activeProfile?.cocktail ?? 0}
                  onChange={(value) =>
                    updateActiveProfile((prev) => {
                      const composition =
                        updateOptionalCocktailComposition(
                          prev.cocktail,
                          {
                            alcoholicCocktail:
                              prev.alcoholicCocktail,

                            nonAlcoholicCocktail:
                              prev.nonAlcoholicCocktail,
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

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Si no quieres repartir los cócteles, deja ambos valores en 0.
              </p>

              {hasCocktailComposition && (
                <div
                  className={`mt-4 rounded-xl border p-3 text-sm ${
                    isCocktailCompositionValid
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                  }`}
                >
                  {isCocktailCompositionValid
                    ? `✓ Reparto completo: ${cocktailCompositionTotal} de ${activeProfile?.cocktail ?? 0}.`
                    : `El reparto suma ${cocktailCompositionTotal} de ${activeProfile?.cocktail ?? 0}. Ajusta las cantidades si quieres completar el reparto.`}
                </div>
              )}
            </div>
          )}

        </div>

        {/* TOTAL */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center sm:p-5">

          <p className="text-sm font-medium text-slate-500">
            Consumo diario de {activeProfile?.label ?? "este adulto"}
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

        {totalDrinksPerDay === 0 && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-center">
            <p className="text-sm font-medium text-green-800">
              ✓ Cero también es válido. Puedes continuar aunque no consumas ninguna de estas bebidas.
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
              hasValidConsumption
                ? "/wizard/preferences"
                : "#"
            }
            onClick={(event) => {
              if (!hasValidConsumption) {
                event.preventDefault();
                return;
              }

              setData((prev) => ({
                ...prev,
                consumptionConfirmed: true,
                adultConsumptionProfiles: prev.adultConsumptionProfiles.map(
                  (profile) => ({ ...profile, consumptionConfirmed: true })
                ),
              }));
            }}
            className={`rounded-xl px-3 py-4 text-center text-sm font-semibold transition sm:text-base ${
              hasValidConsumption
                ? "bg-sky-700 text-white hover:bg-sky-800 active:bg-sky-800"
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
