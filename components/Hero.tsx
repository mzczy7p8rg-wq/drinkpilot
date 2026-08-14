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
    <section className="relative w-full max-w-6xl overflow-hidden rounded-[1.75rem] border border-white/90 bg-white/78 shadow-[0_35px_90px_rgba(31,93,137,0.16)] backdrop-blur-2xl sm:rounded-[2.25rem]">
      <div aria-hidden="true" className="absolute -right-28 -top-32 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-200/20 blur-3xl" />

      <div className="relative border-b border-sky-950/8 px-6 py-5 sm:px-9 sm:py-7">
        <BrandHeader prominent inverse />
      </div>

      <div className="relative grid lg:grid-cols-[minmax(0,1.12fr)_minmax(20rem,.88fr)]">
        <div className="px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-sky-700">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
            Tu copiloto de bebidas a bordo
          </p>

          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[.98] tracking-[-0.055em] text-[#071d36] sm:text-6xl lg:text-7xl">
            El paquete correcto,
            <span className="block bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              sin navegar a ciegas.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-600 sm:text-xl">
            Compara consumo, cobertura y precios de tu crucero en menos de un minuto.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/wizard/people"
              onNavigate={resetData}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 px-8 py-4 font-semibold text-white shadow-[0_14px_30px_rgba(2,132,199,0.25)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(2,132,199,0.32)]"
            >
              Empezar análisis →
            </Link>

            {canResumeAnalysis && (
              <Link
                href="/wizard"
                className="inline-flex items-center justify-center rounded-2xl border border-sky-200 bg-white/75 px-8 py-4 font-semibold text-sky-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white"
              >
                Continuar análisis
              </Link>
            )}
          </div>
        </div>

        <aside className="relative overflow-hidden border-t border-sky-950/8 bg-gradient-to-br from-[#e9f7ff]/90 via-[#f5fbff]/95 to-white/80 px-6 py-9 sm:px-10 sm:py-12 lg:flex lg:flex-col lg:justify-center lg:border-l lg:border-t-0 lg:px-12">
          <div aria-hidden="true" className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-200/45 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-cyan-200/45 blur-3xl" />

          <div className="relative rounded-3xl border border-white bg-white/72 p-6 shadow-[0_20px_50px_rgba(31,93,137,0.1)] backdrop-blur-xl">
            <p className="text-sm font-bold text-[#071d36]">Una respuesta clara para tu crucero</p>
            <div className="mt-5 grid gap-3">
              {[
                ["01", "Indica quién viaja"],
                ["02", "Elige naviera y contexto"],
                ["03", "Recibe tu comparación"],
              ].map(([number, label]) => (
                <div key={number} className="flex items-center gap-4 rounded-2xl border border-sky-950/6 bg-white/78 p-4 shadow-sm">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 text-xs font-bold text-white shadow-sm">
                    {number}
                  </span>
                  <span className="font-semibold text-slate-700">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/75 p-4 text-sm leading-6 text-emerald-800 shadow-sm">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs font-bold text-white">✓</span>
            <p><strong>Estimación transparente.</strong> Nunca asumimos precios, mercados o condiciones que no conozcamos.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
