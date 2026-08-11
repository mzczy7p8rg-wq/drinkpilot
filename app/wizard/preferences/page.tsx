"use client";

import Link from "next/link";

import { useStore } from "@/lib/store";
import ProgressBar from "@/components/ProgressBar";
import { WizardBrand } from "@/components/Brand";

import {
  useWizardRouteGuard,
} from "@/lib/useWizardRouteGuard";

type PreferenceCardProps = {
  title: string;
  description: string;
  checked: boolean;
  onChange: (
    checked: boolean
  ) => void;
};

function PreferenceCard({
  title,
  description,
  checked,
  onChange,
}: PreferenceCardProps) {
  return (
    <label
      className={`block cursor-pointer rounded-2xl border p-4 transition sm:p-5 ${
        checked
          ? "border-sky-500 bg-sky-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-sky-300"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-base font-semibold text-slate-900 sm:text-lg">
            {title}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        <input
          type="checkbox"
          checked={checked}
          onChange={(event) =>
            onChange(
              event.target.checked
            )
          }
          className="mt-1 h-6 w-6 shrink-0 accent-sky-600"
        />
      </div>
    </label>
  );
}

export default function PreferencesPage() {
  const { data, setData } =
    useStore();

  const { ready } =
    useWizardRouteGuard(
      "consumption"
    );

  /*
   * Agua ilimitada implica internamente
   * también cobertura diaria, pero para
   * el usuario cuenta como una sola
   * preferencia de agua.
   */
  const selectedPreferences = [
    data.alcoholicCocktails,
    data.nonAlcoholicCocktails,
    data.premiumCocktails,
    data.bottledBeer,
    data.premiumSpirits,

    data.bottledWaterUnlimited ||
      data.bottledWaterDailyAllowance,
  ].filter(Boolean).length;

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
          currentStep={4}
          totalSteps={6}
        />

        <div className="mt-2 sm:mt-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Paso 4 de 6
          </p>

          <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            ¿Qué te gustaría tener incluido?
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Este paso es opcional. Marca solo lo que sea importante para ti.
          </p>
        </div>

        <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-sky-900 sm:mt-6">
          💡 Si no tienes preferencias, puedes continuar sin marcar nada.
        </div>

        <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
          <PreferenceCard
            title="🍸 Cócteles con alcohol"
            description="Valoras que el paquete incluya cócteles y combinados con alcohol."
            checked={
              data.alcoholicCocktails
            }
            onChange={(checked) =>
              setData((prev) => ({
                ...prev,

                alcoholicCocktails:
                  checked,
              }))
            }
          />

          <PreferenceCard
            title="🍹 Cócteles sin alcohol"
            description="Valoras disponer de cócteles y combinados sin alcohol incluidos en el paquete."
            checked={
              data.nonAlcoholicCocktails
            }
            onChange={(checked) =>
              setData((prev) => ({
                ...prev,

                nonAlcoholicCocktails:
                  checked,
              }))
            }
          />

          <PreferenceCard
            title="🍺 Cerveza embotellada"
            description="Prefieres disponer también de cerveza embotellada además de las opciones básicas."
            checked={
              data.bottledBeer
            }
            onChange={(checked) =>
              setData((prev) => ({
                ...prev,

                bottledBeer:
                  checked,
              }))
            }
          />

          <details className="rounded-2xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-semibold text-slate-800">
              Opciones específicas (opcional)
            </summary>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Ábrelo solo si buscas bebidas de gama superior.
            </p>
            <div className="mt-4 space-y-3">
              <PreferenceCard
                title="🍸 Cócteles premium"
                description="Quieres una selección más amplia de cócteles."
                checked={data.premiumCocktails}
                onChange={(checked) =>
                  setData((prev) => ({ ...prev, premiumCocktails: checked }))
                }
              />
              <PreferenceCard
                title="🥃 Destilados premium"
                description="Te interesan marcas de gama superior."
                checked={data.premiumSpirits}
                onChange={(checked) =>
                  setData((prev) => ({ ...prev, premiumSpirits: checked }))
                }
              />
            </div>
          </details>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
            <div className="mb-3">
              <p className="font-semibold text-slate-900">
                💧 Agua embotellada
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Distingue entre disponer
                de una botella diaria y
                necesitar acceso sin
                límite.
              </p>
            </div>

            <div className="space-y-3">
              <PreferenceCard
                title="Una botella de agua diaria"
                description="Te resulta suficiente disponer al menos de una botella de agua embotellada incluida cada día."
                checked={
                  data.bottledWaterDailyAllowance
                }
                onChange={(checked) =>
                  setData((prev) => ({
                    ...prev,

                    bottledWaterDailyAllowance:
                      checked,

                    bottledWaterUnlimited:
                      checked
                        ? prev.bottledWaterUnlimited
                        : false,
                  }))
                }
              />

              <PreferenceCard
                title="Agua embotellada sin límite"
                description="Valoras disponer de agua embotellada ampliamente durante el crucero, sin limitarte a una asignación diaria."
                checked={
                  data.bottledWaterUnlimited
                }
                onChange={(checked) =>
                  setData((prev) => ({
                    ...prev,

                    bottledWaterUnlimited:
                      checked,

                    bottledWaterDailyAllowance:
                      checked
                        ? true
                        : prev.bottledWaterDailyAllowance,
                  }))
                }
              />
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-sm font-medium text-slate-500">
            Preferencias seleccionadas
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-900">
            {selectedPreferences}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {selectedPreferences === 0
              ? "Sin preferencias adicionales"
              : selectedPreferences ===
                1
              ? "preferencia adicional"
              : "preferencias adicionales"}
          </p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4">
          <Link
            href="/wizard/consumption"
            className="rounded-xl border border-slate-300 px-3 py-4 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:text-base"
          >
            Atrás
          </Link>

          <Link
            href="/wizard/prices"
            className="rounded-xl bg-sky-600 px-3 py-4 text-center text-sm font-semibold text-white transition hover:bg-sky-700 active:bg-sky-800 sm:text-base"
          >
            Continuar
          </Link>
        </div>
      </div>
    </main>
  );
}
