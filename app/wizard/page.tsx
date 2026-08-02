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
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-5 shadow-lg sm:p-10">

        <ProgressBar
          currentStep={1}
          totalSteps={6}
        />

        <div className="mt-2 sm:mt-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Paso 1 de 6
          </p>

          <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            ¿Cuántos días dura tu crucero?
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Esto nos ayudará a calcular tu consumo total
            y comparar los paquetes disponibles.
          </p>
        </div>

        <div className="mt-7 sm:mt-8">

          <label
            htmlFor="cruiseDays"
            className="text-sm font-semibold text-slate-700"
          >
            Duración del crucero
          </label>

          <div className="relative mt-2">
            <input
              id="cruiseDays"
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
              className={`w-full rounded-xl border bg-white px-4 py-4 pr-20 text-xl font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 ${
                days !== "" && !isValid
                  ? "border-red-300 focus:ring-2 focus:ring-red-400"
                  : "border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
              }`}
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
              días
            </span>
          </div>

          {days !== "" && !isValid && (
            <p className="mt-3 text-sm font-medium text-red-600">
              Introduce un número entero de días mayor que 0.
            </p>
          )}

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-sm leading-6 text-slate-600">
              💡 Introduce la duración total que aparece
              en tu reserva.
            </p>
          </div>

        </div>

        <button
          type="button"
          disabled={!isValid}
          onClick={handleContinue}
          className={`mt-7 w-full rounded-xl py-4 text-center text-base font-semibold transition sm:mt-8 ${
            isValid
              ? "bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800"
              : "cursor-not-allowed bg-slate-300 text-slate-500"
          }`}
        >
          Continuar
        </button>

      </div>
    </main>
  );
}