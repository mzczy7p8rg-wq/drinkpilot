"use client";

import Link from "next/link";

import { useStore } from "@/lib/store";
import ProgressBar from "@/components/ProgressBar";

type PreferenceCardProps = {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function PreferenceCard({
  title,
  description,
  checked,
  onChange,
}: PreferenceCardProps) {
  return (
    <label
      className={`block cursor-pointer rounded-2xl border p-5 transition ${
        checked
          ? "border-sky-500 bg-sky-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-sky-300"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-900">
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
            onChange(event.target.checked)
          }
          className="mt-1 h-5 w-5 accent-sky-600"
        />
      </div>
    </label>
  );
}

export default function PreferencesPage() {
  const { data, setData } = useStore();

  const selectedPreferences =
    [
      data.premiumCocktails,
      data.bottledBeer,
      data.premiumSpirits,
      data.bottledWaterUnlimited,
    ].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-10 shadow-lg">

        <ProgressBar
          currentStep={3}
          totalSteps={4}
        />

        <h1 className="text-3xl font-bold text-slate-900">
          ¿Qué extras valoras a bordo?
        </h1>

        <p className="mt-3 text-slate-500">
          Estas preferencias son opcionales.
          Nos ayudan a distinguir mejor entre
          un paquete estándar y uno premium.
        </p>

        <div className="mt-6 rounded-xl bg-sky-50 p-4 text-sm leading-6 text-sky-900">
          💡 No marques una opción solo porque
          “suene mejor”. Marca únicamente lo que
          realmente valorarías durante el crucero.
        </div>

        <div className="mt-8 space-y-4">

          <PreferenceCard
            title="🍸 Cócteles premium"
            description="Valoras una selección más amplia de cócteles y opciones premium."
            checked={data.premiumCocktails}
            onChange={(checked) =>
              setData((prev) => ({
                ...prev,
                premiumCocktails: checked,
              }))
            }
          />

          <PreferenceCard
            title="🍺 Cerveza embotellada"
            description="Prefieres disponer también de cerveza embotellada además de las opciones básicas."
            checked={data.bottledBeer}
            onChange={(checked) =>
              setData((prev) => ({
                ...prev,
                bottledBeer: checked,
              }))
            }
          />

          <PreferenceCard
            title="🥃 Destilados premium"
            description="Te interesan marcas de mayor gama o una selección más amplia de destilados."
            checked={data.premiumSpirits}
            onChange={(checked) =>
              setData((prev) => ({
                ...prev,
                premiumSpirits: checked,
              }))
            }
          />

          <PreferenceCard
            title="💧 Agua embotellada sin límite"
            description="Valoras especialmente tener acceso amplio a agua embotellada durante el crucero."
            checked={data.bottledWaterUnlimited}
            onChange={(checked) =>
              setData((prev) => ({
                ...prev,
                bottledWaterUnlimited: checked,
              }))
            }
          />

        </div>

        <div className="mt-6 rounded-xl bg-slate-100 p-4 text-center">

          <p className="text-sm text-slate-500">
            Preferencias seleccionadas
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {selectedPreferences}
          </p>

          {selectedPreferences === 0 && (
            <p className="mt-1 text-sm text-slate-500">
              Sin preferencias premium
            </p>
          )}

        </div>

        <div className="mt-10 flex gap-4">

          <Link
            href="/wizard/consumption"
            className="flex-1 rounded-xl border border-slate-300 py-4 text-center font-semibold transition hover:bg-slate-100"
          >
            Atrás
          </Link>

          <Link
            href="/wizard/people"
            className="flex-1 rounded-xl bg-sky-600 py-4 text-center font-semibold text-white transition hover:bg-sky-700"
          >
            Continuar
          </Link>

        </div>

      </div>
    </main>
  );
}