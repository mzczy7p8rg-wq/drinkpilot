"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useStore } from "@/lib/store";
import ProgressBar from "@/components/ProgressBar";
import { WizardBrand } from "@/components/Brand";

import {
  isValidTravelerCount,
} from "@/lib/wizardNumberValidation";
import {
  hasValidConsumptionStep,
  hasValidCruiseStep,
} from "@/lib/wizardProgress";

const MIN_VISIBLE_PEOPLE = 1;
const MAX_VISIBLE_PEOPLE = 10;

function PeopleForm() {
  const router = useRouter();

  const { data, setData } = useStore();

  const [adults, setAdults] = useState(() => {
    const initialPeople = Number.isSafeInteger(data.adults) && data.adults > 0
      ? data.adults
      : Number.isSafeInteger(data.people)
      ? data.people
      : MIN_VISIBLE_PEOPLE;

    return String(
      Math.min(
        MAX_VISIBLE_PEOPLE,
        Math.max(MIN_VISIBLE_PEOPLE, initialPeople)
      )
    );
  });

  const [minors, setMinors] = useState(() =>
    String(Number.isSafeInteger(data.minors) ? data.minors : 0)
  );

  const parsedAdults = Number(adults);
  const parsedMinors = Number(minors);

  const isReturningFromAnalysis =
    hasValidCruiseStep(data) && hasValidConsumptionStep(data);

  const isValid =
    adults.trim() !== "" && isValidTravelerCount(parsedAdults) &&
    Number.isSafeInteger(parsedMinors) && parsedMinors >= 0 && parsedMinors <= 10;

  function handleReview() {
    if (!isValid) {
      return;
    }

    setData((prev) => ({
      ...prev,
      people: parsedAdults,
      adults: parsedAdults,
      minors: parsedMinors,
    }));

    router.push(isReturningFromAnalysis ? "/wizard/review" : "/wizard");
  }

  return (
    <main className="brand-ocean-bg min-h-screen px-3 py-3 sm:px-6 sm:py-8 lg:flex lg:items-center lg:justify-center">
      <div className="dark-app-surface mx-auto w-full max-w-6xl overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]">
        <div className="px-5 pt-5 sm:px-8 sm:pt-7">
          <WizardBrand />
        </div>

        <div className="grid lg:grid-cols-[13rem_minmax(0,1fr)]">
          <aside className="hidden border-r border-slate-200/80 bg-sky-50/70 px-5 py-8 lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Tu análisis</p>
            <ol className="mt-5 grid gap-1" aria-label="Progreso del análisis">
              {["Viajeros", "Crucero", "Consumo", "Preferencias", "Precios", "Revisión"].map((step, index) => (
                <li
                  key={step}
                  aria-current={index === 0 ? "step" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                    index === 0 ? "bg-white font-semibold text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                >
                  <span className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-bold ${
                    index === 0 ? "bg-sky-700 text-white shadow-sm shadow-sky-200" : "bg-slate-200/80 text-slate-500"
                  }`}>
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </aside>

          <div className="px-5 pb-7 sm:px-10 sm:pb-10 lg:px-14 lg:pb-12">
            <div className="lg:hidden">
              <ProgressBar currentStep={1} totalSteps={6} />
            </div>

        <div className="mt-2 max-w-3xl sm:mt-0 lg:mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">
            Paso 1 de 6 · Viajeros
          </p>

          <h1 className="mt-3 text-3xl font-bold leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-5xl">
            ¿Quién viaja?
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
            Indica adultos y menores para aplicar correctamente precios y condiciones.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <section className="rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50/60 p-5 sm:p-6">

          <p className="text-sm font-semibold text-slate-700">
            Adultos
          </p>

          <div className="mt-4 flex items-center justify-center gap-5">
            <button
              type="button"
              aria-label="Disminuir adultos"
              disabled={parsedAdults <= MIN_VISIBLE_PEOPLE}
              onClick={() =>
                setAdults(
                  String(
                    Math.max(
                      MIN_VISIBLE_PEOPLE,
                      parsedAdults - 1
                    )
                  )
                )
              }
              className="h-12 w-12 rounded-2xl border border-sky-200 bg-white text-2xl font-bold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 active:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              −
            </button>

            <div
              aria-label="Cantidad de adultos"
              className="flex h-24 w-28 flex-col items-center justify-center rounded-3xl bg-white text-slate-900 shadow-sm"
            >
              <span className="text-3xl font-bold">
                {adults}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {parsedAdults === 1 ? "adulto" : "adultos"}
              </span>
            </div>

            <button
              type="button"
              aria-label="Aumentar adultos"
              disabled={parsedAdults >= MAX_VISIBLE_PEOPLE}
              onClick={() =>
                setAdults(
                  String(
                    Math.min(
                      MAX_VISIBLE_PEOPLE,
                      parsedAdults + 1
                    )
                  )
                )
              }
              className="h-12 w-12 rounded-2xl border border-sky-200 bg-white text-2xl font-bold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 active:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          </div>

          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 sm:p-6">
          <p className="text-sm font-semibold text-slate-700">Menores</p>
          <div className="mt-4 flex items-center justify-center gap-5">
            <button type="button" aria-label="Disminuir menores" disabled={parsedMinors <= 0}
              onClick={() => setMinors(String(Math.max(0, parsedMinors - 1)))}
              className="h-12 w-12 rounded-2xl border border-slate-200 bg-white text-2xl font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-40">−</button>
            <div aria-label="Cantidad de menores" className="flex h-24 w-28 flex-col items-center justify-center rounded-3xl bg-white shadow-sm">
              <span className="text-3xl font-bold">{minors}</span>
              <span className="text-xs text-slate-500">{parsedMinors === 1 ? "menor" : "menores"}</span>
            </div>
            <button type="button" aria-label="Aumentar menores" disabled={parsedMinors >= 10}
              onClick={() => setMinors(String(Math.min(10, parsedMinors + 1)))}
              className="h-12 w-12 rounded-2xl border border-slate-200 bg-white text-2xl font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-40">+</button>
          </div>
          </section>

        </div>

        <div className="mt-5 flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-sm leading-6 text-emerald-900 sm:mt-6">
          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-700 text-xs font-bold text-white">✓</span>
          <p>El cálculo económico usa el número de adultos. Guardamos los menores
          por separado porque sus condiciones pueden variar según la naviera.
          </p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4">

          <button
            type="button"
            onClick={() =>
              router.push(isReturningFromAnalysis ? "/wizard/prices" : "/")
            }
            className="rounded-2xl border border-slate-300 px-3 py-4 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:text-base"
          >
            Atrás
          </button>

          <button
            type="button"
            disabled={!isValid}
            onClick={handleReview}
            className={`rounded-2xl px-3 py-4 text-center text-sm font-semibold shadow-sm transition sm:text-base ${
              isValid
                ? "bg-gradient-to-r from-sky-700 to-cyan-700 text-white shadow-sky-200 hover:from-sky-800 hover:to-cyan-800"
                : "cursor-not-allowed bg-slate-300 text-slate-500"
            }`}
          >
            Continuar →
          </button>

        </div>

          </div>
        </div>
      </div>
    </main>
  );
}

export default function PeoplePage() {
  const { hydrated } = useStore();
  const ready = true;

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="font-medium text-slate-600">
          Recuperando tu análisis...
        </p>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="font-medium text-slate-600">
          Comprobando los datos de tu análisis...
        </p>
      </main>
    );
  }

  return <PeopleForm />;
}
