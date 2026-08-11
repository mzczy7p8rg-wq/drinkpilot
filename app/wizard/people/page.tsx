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
    <main className="brand-ocean-bg min-h-screen px-4 py-6 sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-5 shadow-lg sm:p-10">
        <WizardBrand />
        <ProgressBar
          currentStep={1}
          totalSteps={6}
        />

        <div className="mt-2 sm:mt-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Paso 1 de 6
          </p>

          <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            ¿Quién viaja?
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Separa adultos y menores para ajustar mejor el análisis.
          </p>
        </div>

        <div className="mt-7 sm:mt-8">

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
              className="h-14 w-14 rounded-xl border border-slate-300 text-2xl font-bold text-slate-700 transition hover:bg-slate-100 active:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              −
            </button>

            <div
              aria-label="Cantidad de adultos"
              className="flex h-20 w-28 flex-col items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-slate-900"
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
              className="h-14 w-14 rounded-xl border border-slate-300 text-2xl font-bold text-slate-700 transition hover:bg-slate-100 active:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          </div>

          <p className="mt-7 text-sm font-semibold text-slate-700">Menores</p>
          <div className="mt-4 flex items-center justify-center gap-5">
            <button type="button" aria-label="Disminuir menores" disabled={parsedMinors <= 0}
              onClick={() => setMinors(String(Math.max(0, parsedMinors - 1)))}
              className="h-14 w-14 rounded-xl border border-slate-300 text-2xl font-bold text-slate-700 disabled:opacity-40">−</button>
            <div aria-label="Cantidad de menores" className="flex h-20 w-28 flex-col items-center justify-center rounded-2xl border border-sky-200 bg-sky-50">
              <span className="text-3xl font-bold">{minors}</span>
              <span className="text-xs text-slate-500">{parsedMinors === 1 ? "menor" : "menores"}</span>
            </div>
            <button type="button" aria-label="Aumentar menores" disabled={parsedMinors >= 10}
              onClick={() => setMinors(String(Math.min(10, parsedMinors + 1)))}
              className="h-14 w-14 rounded-xl border border-slate-300 text-2xl font-bold text-slate-700 disabled:opacity-40">+</button>
          </div>

        </div>

        <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-sky-900 sm:mt-6">
          💡 El cálculo económico usa el número de adultos. Guardamos los menores
          por separado porque sus condiciones pueden variar según la naviera.
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4">

          <button
            type="button"
            onClick={() =>
              router.push(isReturningFromAnalysis ? "/wizard/prices" : "/")
            }
            className="rounded-xl border border-slate-300 px-3 py-4 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:text-base"
          >
            Atrás
          </button>

          <button
            type="button"
            disabled={!isValid}
            onClick={handleReview}
            className={`rounded-xl px-3 py-4 text-center text-sm font-semibold transition sm:text-base ${
              isValid
                ? "bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800"
                : "cursor-not-allowed bg-slate-300 text-slate-500"
            }`}
          >
            Continuar
          </button>

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
