"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import ProgressBar from "@/components/ProgressBar";

export default function PeoplePage() {
  const { data, setData } = useStore();

  const [people, setPeople] = useState(
    data.people === 0 ? "1" : String(data.people)
  );

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
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
          value={people}
          onChange={(e) => setPeople(e.target.value)}
          className="mt-8 w-full rounded-xl border border-slate-300 p-4 text-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        />

        <div className="mt-8 flex gap-4">
          <Link
            href="/wizard/consumption"
            className="flex-1 rounded-xl border border-slate-300 py-4 text-center font-semibold hover:bg-slate-100"
          >
            Atrás
          </Link>

          <Link
            href="/results"
            onClick={() =>
              setData((prev) => ({
                ...prev,
                people: Number(people),
              }))
            }
            className="flex-1 rounded-xl bg-sky-600 py-4 text-center font-semibold text-white transition hover:bg-sky-700"
          >
            Ver resultado
          </Link>
        </div>

      </div>
    </main>
  );
}