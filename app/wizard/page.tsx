"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import ProgressBar from "@/components/ProgressBar";

export default function WizardPage() {
  const { data, setData } = useStore();

  const [days, setDays] = useState(
    data.days === 0 ? "" : String(data.days)
  );

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-2xl bg-white p-10 shadow-lg">

        <ProgressBar currentStep={1} totalSteps={6} />

        <h1 className="text-3xl font-bold text-slate-900">
          ¿Cuántos días dura tu crucero?
        </h1>

        <p className="mt-3 text-slate-500">
          Esto nos ayudará a calcular tu consumo total.
        </p>

        <input
          type="number"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          placeholder="Ej. 7"
          className="mt-8 w-full rounded-xl border border-slate-300 p-4 text-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        />

        <Link
          href="/wizard/package"
          onClick={() =>
            setData((prev) => ({
              ...prev,
              days: Number(days),
            }))
          }
          className="mt-8 block w-full rounded-xl bg-sky-600 py-4 text-center font-semibold text-white transition hover:bg-sky-700"
        >
          Continuar
        </Link>

      </div>
    </main>
  );
}