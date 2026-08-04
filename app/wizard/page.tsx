"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  getAllCruiseLines,
} from "@/data/cruiseLines";

import {
  useStore,
} from "@/lib/store";

import ProgressBar from "@/components/ProgressBar";

export default function WizardPage() {
  const router =
    useRouter();

  const {
    data,
    setData,
  } = useStore();

  const cruiseLines =
    getAllCruiseLines();

  const [
    selectedCruiseLine,
    setSelectedCruiseLine,
  ] = useState(
    data.cruiseLine
  );

  const [
    days,
    setDays,
  ] = useState(
    data.days > 0
      ? String(
          data.days
        )
      : ""
  );

  const parsedDays =
    Number(days);

  const isValidDays =
    days.trim() !== "" &&
    Number.isInteger(
      parsedDays
    ) &&
    parsedDays > 0;

  const isValid =
    Boolean(
      selectedCruiseLine
    ) &&
    isValidDays;

  function handleContinue() {
    if (!isValid) {
      return;
    }

    setData(
      (previous) => {
        /*
         * Si el usuario cambia de naviera,
         * borramos precios personalizados
         * antiguos para evitar mezclar
         * packageKeys de compañías
         * diferentes.
         */
        const cruiseLineChanged =
          previous.cruiseLine !==
          selectedCruiseLine;

        return {
          ...previous,

          cruiseLine:
            selectedCruiseLine,

          days:
            parsedDays,

          customPackagePrices:
            cruiseLineChanged
              ? {}
              : previous
                  .customPackagePrices,
        };
      }
    );

    router.push(
      "/wizard/consumption"
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-5 shadow-lg sm:p-10">
        <ProgressBar
          currentStep={1}
          totalSteps={6}
        />

        {/* CABECERA */}

        <div className="mt-2 sm:mt-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Paso 1 de 6
          </p>

          <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            Cuéntanos tu crucero
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Selecciona tu naviera e
            introduce la duración total
            de la reserva.
          </p>
        </div>

        {/* NAVIERA */}

        <section className="mt-7 sm:mt-8">
          <p className="text-sm font-semibold text-slate-700">
            Naviera
          </p>

          <div className="mt-3 grid gap-3">
            {cruiseLines.map(
              (cruiseLine) => {
                const isSelected =
                  selectedCruiseLine ===
                  cruiseLine.id;

                const hasCompletePrices =
                  Object.values(
                    cruiseLine
                      .onboardPriceValues
                  ).every(
                    (price) =>
                      typeof price ===
                        "number" &&
                      Number.isFinite(
                        price
                      ) &&
                      price > 0
                  );

                return (
                  <button
                    key={
                      cruiseLine.id
                    }
                    type="button"
                    onClick={() =>
                      setSelectedCruiseLine(
                        cruiseLine.id
                      )
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">
                          🚢{" "}
                          {
                            cruiseLine.name
                          }
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Mercado:{" "}
                          {
                            cruiseLine.market
                          }
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isSelected
                            ? "bg-sky-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isSelected
                          ? "Seleccionada"
                          : "Seleccionar"}
                      </span>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-slate-600">
                      {hasCompletePrices
                        ? "Comparación económica y cobertura disponibles."
                        : "Cobertura disponible. La comparación económica puede estar limitada por datos de precios pendientes."}
                    </p>
                  </button>
                );
              }
            )}
          </div>
        </section>

        {/* DURACIÓN */}

        <section className="mt-7">
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
              value={
                days
              }
              onChange={(
                event
              ) =>
                setDays(
                  event.target.value
                )
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                    "Enter" &&
                  isValid
                ) {
                  handleContinue();
                }
              }}
              placeholder="Ej. 7"
              className={`w-full rounded-xl border bg-white px-4 py-4 pr-20 text-xl font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 ${
                days !== "" &&
                !isValidDays
                  ? "border-red-300 focus:ring-2 focus:ring-red-400"
                  : "border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
              }`}
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
              días
            </span>
          </div>

          {days !== "" &&
            !isValidDays && (
              <p className="mt-3 text-sm font-medium text-red-600">
                Introduce un número
                entero de días mayor
                que 0.
              </p>
            )}

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-sm leading-6 text-slate-600">
              💡 Introduce la duración
              total que aparece en tu
              reserva.
            </p>
          </div>
        </section>

        {/* CONTINUAR */}

        <button
          type="button"
          disabled={
            !isValid
          }
          onClick={
            handleContinue
          }
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