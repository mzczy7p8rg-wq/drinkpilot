"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useStore } from "@/lib/store";
import ProgressBar from "@/components/ProgressBar";

import {
  MAX_TRAVELERS,
  isValidTravelerCount,
} from "@/lib/wizardNumberValidation";

import {
  useWizardRouteGuard,
} from "@/lib/useWizardRouteGuard";

function PeopleForm() {
  const router = useRouter();

  const { data, setData } = useStore();

  const [people, setPeople] = useState(
    data.people > 0
      ? String(data.people)
      : "1"
  );

  const parsedPeople = Number(people);

  const isValid =
    people.trim() !== "" &&
    isValidTravelerCount(
      parsedPeople
    );

  function handleReview() {
    if (!isValid) {
      return;
    }

    setData((prev) => ({
      ...prev,
      people: parsedPeople,
    }));

    router.push("/wizard/review");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-5 shadow-lg sm:p-10">

        <ProgressBar
          currentStep={5}
          totalSteps={6}
        />

        <div className="mt-2 sm:mt-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Paso 5 de 6
          </p>

          <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            ¿Cuántas personas viajarán?
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Calcularemos el coste total y compararemos
            automáticamente los paquetes disponibles.
          </p>
        </div>

        <div className="mt-7 sm:mt-8">

          <label
            htmlFor="people"
            className="text-sm font-semibold text-slate-700"
          >
            Número de viajeros
          </label>

          <div className="relative mt-2">
            <input
              id="people"
              type="number"
              min="1"
              max={MAX_TRAVELERS}
              step="1"
              inputMode="numeric"
              value={people}
              aria-invalid={people !== "" && !isValid}
              aria-describedby={
                people !== "" && !isValid
                  ? "peopleError"
                  : undefined
              }
              onChange={(event) =>
                setPeople(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  isValid
                ) {
                  handleReview();
                }
              }}
              className={`w-full rounded-xl border bg-white px-4 py-4 pr-24 text-xl font-semibold text-slate-900 outline-none transition ${
                people !== "" && !isValid
                  ? "border-red-300 focus:ring-2 focus:ring-red-400"
                  : "border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
              }`}
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
              personas
            </span>
          </div>

          {people !== "" && !isValid && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
              <p
                id="peopleError"
                className="text-sm font-medium text-red-700"
              >
                Introduce un número entero de personas entre 1 y {MAX_TRAVELERS}.
              </p>
            </div>
          )}

        </div>

        <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-sky-900 sm:mt-6">
          💡 DrinkPilot combinará consumo, preferencias
          y los precios de tu reserva cuando los hayas
          proporcionado.
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4">

          <button
            type="button"
            onClick={() =>
              router.push("/wizard/prices")
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
            Revisar análisis
          </button>

        </div>

      </div>
    </main>
  );
}

export default function PeoplePage() {
  const {
    hydrated,
    ready,
  } = useWizardRouteGuard(
    "consumption"
  );

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
