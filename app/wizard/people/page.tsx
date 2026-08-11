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
  useWizardRouteGuard,
} from "@/lib/useWizardRouteGuard";

const MIN_VISIBLE_PEOPLE = 1;
const MAX_VISIBLE_PEOPLE = 10;

function PeopleForm() {
  const router = useRouter();

  const { data, setData } = useStore();

  const [people, setPeople] = useState(() => {
    const initialPeople = Number.isSafeInteger(data.people)
      ? data.people
      : MIN_VISIBLE_PEOPLE;

    return String(
      Math.min(
        MAX_VISIBLE_PEOPLE,
        Math.max(MIN_VISIBLE_PEOPLE, initialPeople)
      )
    );
  });

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
    <main className="brand-ocean-bg min-h-screen px-4 py-6 sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-5 shadow-lg sm:p-10">
        <WizardBrand />
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

          <p className="text-sm font-semibold text-slate-700">
            Número de viajeros
          </p>

          <div className="mt-4 flex items-center justify-center gap-5">
            <button
              type="button"
              aria-label="Disminuir personas"
              disabled={parsedPeople <= MIN_VISIBLE_PEOPLE}
              onClick={() =>
                setPeople(
                  String(
                    Math.max(
                      MIN_VISIBLE_PEOPLE,
                      parsedPeople - 1
                    )
                  )
                )
              }
              className="h-14 w-14 rounded-xl border border-slate-300 text-2xl font-bold text-slate-700 transition hover:bg-slate-100 active:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              −
            </button>

            <div
              aria-label="Cantidad de personas"
              className="flex h-20 w-28 flex-col items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-slate-900"
            >
              <span className="text-3xl font-bold">
                {people}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {parsedPeople === 1 ? "persona" : "personas"}
              </span>
            </div>

            <button
              type="button"
              aria-label="Aumentar personas"
              disabled={parsedPeople >= MAX_VISIBLE_PEOPLE}
              onClick={() =>
                setPeople(
                  String(
                    Math.min(
                      MAX_VISIBLE_PEOPLE,
                      parsedPeople + 1
                    )
                  )
                )
              }
              className="h-14 w-14 rounded-xl border border-slate-300 text-2xl font-bold text-slate-700 transition hover:bg-slate-100 active:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          </div>

          <p className="mt-3 text-center text-sm text-slate-500">
            Selecciona entre 1 y 10 personas.
          </p>

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
