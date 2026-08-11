"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { hasValidCruiseStep } from "@/lib/wizardProgress";
import { BrandHeader } from "@/components/Brand";

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
    <section className="w-full max-w-4xl text-left">
      <BrandHeader prominent />

      <div className="mt-14 max-w-3xl sm:mt-20">
        <div className="mb-6 h-1 w-24 rounded-full bg-sky-500" />

        <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.045em] text-[#0B1F3A] sm:text-7xl">
          ¿Te compensa el paquete de bebidas?
        </h1>
      </div>

      <p className="mt-8 text-xl font-medium leading-8 text-slate-700 sm:text-2xl">
        Descúbrelo en menos de un minuto con{" "}
        <span className="font-bold text-sky-500">DrinkPilot</span>.
      </p>

      <aside className="mt-9 max-w-3xl rounded-2xl border border-sky-100 bg-white/90 p-5 text-sm leading-6 text-slate-600 shadow-sm shadow-sky-100/70 backdrop-blur">
        <p className="font-semibold text-slate-800">
          DrinkPilot ofrece una estimación orientativa.
        </p>

        <p className="mt-1">
          Los precios reales pueden variar según la naviera, la ruta, la fecha,
          los impuestos, las propinas y las condiciones a bordo.
        </p>
      </aside>

      <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row">
        <Link
          href="/wizard/people"
          onNavigate={resetData}
          className="inline-block rounded-xl bg-sky-500 px-9 py-4 font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-600"
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
