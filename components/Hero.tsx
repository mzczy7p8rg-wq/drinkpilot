"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { hasValidCruiseStep } from "@/lib/wizardProgress";

export default function Hero() {
  const {
    data,
    hydrated,
    resetData,
  } = useStore();

  const canResumeAnalysis =
    hydrated &&
    hasValidCruiseStep(data);

  return (
    <section className="max-w-3xl text-center">

      <div className="text-6xl mb-6">🚢</div>

      <h1 className="text-5xl font-bold text-slate-900">
        DrinkPilot
      </h1>

      <p className="mt-6 text-xl text-slate-600">
        Descubre si el paquete de bebidas realmente merece la pena.
      </p>

      <p className="mt-2 text-slate-500">
        Análisis personalizado en menos de un minuto.
      </p>

      <aside className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-left text-sm leading-6 text-slate-600">
        <p className="font-semibold text-slate-800">
          DrinkPilot ofrece una estimación orientativa.
        </p>

        <p className="mt-1">
          Los precios reales pueden variar según la naviera, la ruta, la fecha,
          los impuestos, las propinas y las condiciones a bordo.
        </p>
      </aside>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/wizard"
          onNavigate={resetData}
          className="inline-block rounded-xl bg-sky-600 px-8 py-4 text-white font-semibold hover:bg-sky-700 transition"
        >
          Empezar análisis
        </Link>

        {canResumeAnalysis && (
          <Link
            href="/wizard"
            className="inline-block rounded-xl border border-sky-200 bg-white px-8 py-4 font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-50"
          >
            Continuar análisis
          </Link>
        )}
      </div>

    </section>
  );
}
