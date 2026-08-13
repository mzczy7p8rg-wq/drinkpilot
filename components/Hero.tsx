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
    <section className="w-full max-w-6xl overflow-hidden rounded-[1.75rem] border border-sky-300/20 bg-[#081d33] shadow-[0_30px_90px_rgba(0,0,0,0.4)] sm:rounded-[2rem]">
      <div className="border-b border-white/10 bg-[#071a2f] px-6 py-5 sm:px-9 sm:py-7">
        <BrandHeader prominent inverse />
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,.85fr)]">
        <div className="px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
            Tu copiloto de bebidas a bordo
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
            El paquete correcto, sin navegar a ciegas.
          </h1>

          <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-300 sm:text-xl">
            Compara consumo, cobertura y precios de tu crucero en menos de un minuto.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/wizard/people"
              onNavigate={resetData}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-sky-700 to-cyan-700 px-8 py-4 font-semibold text-white shadow-lg shadow-sky-200 transition hover:from-sky-800 hover:to-cyan-800"
            >
              Empezar análisis →
            </Link>

            {canResumeAnalysis && (
              <Link
                href="/wizard"
                className="inline-flex items-center justify-center rounded-2xl border border-sky-300/40 bg-white/10 px-8 py-4 font-semibold text-sky-100 transition hover:border-sky-300/70 hover:bg-white/15"
              >
                Continuar análisis
              </Link>
            )}
          </div>
        </div>

        <aside className="relative overflow-hidden border-t border-white/10 bg-gradient-to-br from-[#0c2b49] via-[#0a3452] to-[#081d33] px-6 py-9 sm:px-10 sm:py-12 lg:flex lg:flex-col lg:justify-center lg:border-l lg:border-t-0 lg:px-12">
          <div aria-hidden="true" className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-200/40 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-cyan-200/40 blur-3xl" />

          <div className="relative rounded-3xl border border-sky-200/20 bg-white/10 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)] backdrop-blur">
            <p className="text-sm font-bold text-white">Una respuesta clara para tu crucero</p>
            <div className="mt-5 grid gap-3">
              {[
                ["01", "Indica quién viaja"],
                ["02", "Elige naviera y contexto"],
                ["03", "Recibe tu comparación"],
              ].map(([number, label]) => (
                <div key={number} className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-700 text-xs font-bold text-white">
                    {number}
                  </span>
                  <span className="font-semibold text-slate-100">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-5 flex items-start gap-3 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-100">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-700 text-xs font-bold text-white">✓</span>
            <p><strong>Estimación transparente.</strong> Nunca asumimos precios, mercados o condiciones que no conozcamos.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
