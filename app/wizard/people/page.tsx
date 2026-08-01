"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import ProgressBar from "@/components/ProgressBar";

export default function PeoplePage() {
  const { data, setData } = useStore();

  const [people, setPeople] = useState(
    data.people > 0 ? String(data.people) : "1"
  );

  const parsedPeople = Number(people);

  const isValid =
    Number.isInteger(parsedPeople) &&
    parsedPeople > 0;

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-xl rounded-2xl bg-white p-10 shadow-lg">

        <ProgressBar currentStep={4} totalSteps={4} />

        <h1 className="text-3xl font-bold text-slate-900">
          ¿Cuántas personas viajarán?
        </h1>

        <p className="mt-3 text-slate-500">
          Calcularemos el coste total del paquete para todos los pasajeros.
        </p>

        <input
          type="number"
          min="1"
          step="1"
          value={people}
          onChange={(e) => setPeople(e.target.value)}
          className="mt-8 w-full rounded-xl border border-slate-300 p-4 text-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        />

        {!isValid && people !== "" && (
          <p className="mt-3 text-sm font-medium text-red-600">
            Introduce un número válido de personas mayor que 0.
          </p>
        )}

        <div className="mt-8 flex gap-4">

          <Link
            href="/wizard/consumption"
            className="flex-1 rounded-xl border border-slate-300 py-4 text-center font-semibold hover:bg-slate-100"
          >
            Atrás
          </Link>

          <Link
            href={isValid ? "/results" : "#"}
            onClick={(event) => {
              if (!isValid) {
                event.preventDefault();
                return;
              }

              setData((prev) => ({
                ...prev,
                people: parsedPeople,
              }));
            }}
            className={`flex-1 rounded-xl py-4 text-center font-semibold transition ${
              isValid
                ? "bg-sky-600 text-white hover:bg-sky-700"
                : "pointer-events-none bg-slate-300 text-slate-500"
            }`}
          >
            Ver resultado
          </Link>

        </div>

      </div>
    </main>
  );
}