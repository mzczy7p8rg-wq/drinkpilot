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
    <section className="w-full max-w-6xl overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/95 shadow-[0_30px_90px_rgba(15,55,88,0.16)] backdrop-blur sm:rounded-[2rem]">
      <div className="border-b border-slate-100 px-6 py-5 sm:px-9 sm:py-7">
        <BrandHeader prominent />
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,.85fr)]">
        <div className="px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
            Tu copiloto de bebidas a bordo
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[.98] tracking-[-0.055em] text-[#0B1F3A] sm:text-6xl lg:text-7xl">
            El paquete correcto, sin navegar a ciegas.
          </h1>

          <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-600 sm:text-xl">
            Compara consumo, cobertura y precios de tu crucero en menos de un minuto.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/wizard/people"
              onNavigate={resetData}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-8 py-4 font-semibold text-white shadow-lg shadow-sky-200 transition hover:from-sky-700 hover:to-cyan-600"
            >
              Empezar análisis →
            </Link>

            {canResumeAnalysis && (
              <Link
                href="/wizard"
                className="inline-flex items-center justify-center rounded-2xl border border-sky-200 bg-white px-8 py-4 font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-50"
              >
                Continuar análisis
              </Link>
            )}
          </div>
        </div>

        <aside className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50/70 to-white px-6 py-9 sm:px-10 sm:py-12 lg:flex lg:flex-col lg:justify-center lg:px-12">
          <div aria-hidden="true" className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-200/40 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-cyan-200/40 blur-3xl" />

          <div className="relative rounded-3xl border border-white bg-white/90 p-6 shadow-[0_20px_50px_rgba(14,116,144,0.12)]">
            <p className="text-sm font-bold text-[#0B1F3A]">Una respuesta clara para tu crucero</p>
            <div className="mt-5 grid gap-3">
              {[
                ["01", "Indica quién viaja"],
                ["02", "Elige naviera y contexto"],
                ["03", "Recibe tu comparación"],
              ].map(([number, label]) => (
                <div key={number} className="flex items-center gap-4 rounded-2xl bg-sky-50/80 p-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-600 text-xs font-bold text-white">
                    {number}
                  </span>
                  <span className="font-semibold text-slate-700">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-sm leading-6 text-emerald-900">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-xs font-bold text-white">✓</span>
            <p><strong>Estimación transparente.</strong> Nunca asumimos precios, mercados o condiciones que no conozcamos.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
