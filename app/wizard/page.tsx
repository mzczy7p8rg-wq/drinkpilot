"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useStore } from "@/lib/store";
import ProgressBar from "@/components/ProgressBar";

export default function WizardPage() {
  const router = useRouter();

  const { data, setData } = useStore();

  const [days, setDays] = useState(
    data.days > 0
      ? String(data.days)
      : ""
  );

  const parsedDays = Number(days);

  const isValid =
    days.trim() !== "" &&
    Number.isInteger(parsedDays) &&
    parsedDays > 0;

  function handleContinue() {
    if (!isValid) {
      return;
    }

    setData((prev) => ({
      ...prev,
      days: parsedDays,
    }));

    router.push("/wizard/consumption");
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-xl rounded-2xl bg-white p-10 shadow-lg">

        <ProgressBar
          currentStep={1}
          totalSteps={6}
        />

        <h1 className="text-3xl font-bold text-slate-900">
          ¿Cuántos días dura tu crucero?
        </h1>

        <p className="mt-3 text-slate-500">
          Esto nos ayudará a calcular tu consumo total
          y comparar los paquetes disponibles.
        </p>

        <input
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          value={days}
          onChange={(event) =>
            setDays(event.target.value)
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              isValid
            ) {
              handleContinue();
            }
          }}
          placeholder="Ej. 7"
          className="mt-8 w-full rounded-xl border border-slate-300 p-4 text-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        />

        {days !== "" && !isValid && (
          <p className="mt-3 text-sm font-medium text-red-600">
            Introduce un número entero de días mayor que 0.
          </p>
        )}

        <button
          type="button"
          disabled={!isValid}
          onClick={handleContinue}
          className={`mt-8 w-full rounded-xl py-4 text-center font-semibold transition ${
            isValid
              ? "bg-sky-600 text-white hover:bg-sky-700"
              : "cursor-not-allowed bg-slate-300 text-slate-500"
          }`}
        >
          Continuar
        </button>

      </div>
    </main>
  );
}