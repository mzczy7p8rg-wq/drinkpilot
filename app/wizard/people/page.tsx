"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useStore } from "@/lib/store";
import ProgressBar from "@/components/ProgressBar";

export default function PeoplePage() {
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
    Number.isInteger(parsedPeople) &&
    parsedPeople > 0;

  function handleResults() {
    if (!isValid) {
      return;
    }

    setData((prev) => ({
      ...prev,
      people: parsedPeople,
    }));

    router.push("/results");
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-xl rounded-2xl bg-white p-10 shadow-lg">

        <ProgressBar
          currentStep={4}
          totalSteps={4}
        />

        <h1 className="text-3xl font-bold text-slate-900">
          ¿Cuántas personas viajarán?
        </h1>

        <p className="mt-3 text-slate-500">
          Calcularemos el coste total y compararemos
          automáticamente los paquetes disponibles.
        </p>

        <input
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          value={people}
          onChange={(event) =>
            setPeople(event.target.value)
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              isValid
            ) {
              handleResults();
            }
          }}
          className="mt-8 w-full rounded-xl border border-slate-300 p-4 text-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        />

        {people !== "" && !isValid && (
          <p className="mt-3 text-sm font-medium text-red-600">
            Introduce un número entero de personas mayor que 0.
          </p>
        )}

        <div className="mt-8 rounded-xl bg-sky-50 p-4 text-sm text-sky-900">
          💡 DrinkPilot combinará tu consumo y tus preferencias
          para comparar automáticamente los paquetes disponibles.
        </div>

        <div className="mt-8 flex gap-4">

          <button
            type="button"
            onClick={() =>
              router.push("/wizard/preferences")
            }
            className="flex-1 rounded-xl border border-slate-300 py-4 text-center font-semibold transition hover:bg-slate-100"
          >
            Atrás
          </button>

          <button
            type="button"
            disabled={!isValid}
            onClick={handleResults}
            className={`flex-1 rounded-xl py-4 text-center font-semibold transition ${
              isValid
                ? "bg-sky-600 text-white hover:bg-sky-700"
                : "cursor-not-allowed bg-slate-300 text-slate-500"
            }`}
          >
            Ver recomendación
          </button>

        </div>

      </div>
    </main>
  );
}