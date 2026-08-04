"use client";

import { useState } from "react";
import Link from "next/link";

import { useStore } from "@/lib/store";
import ProgressBar from "@/components/ProgressBar";

type PriceValidation = {
  valid: boolean;
  value: number | null;
  error: string | null;
  warning: string | null;
};

function validateOptionalPrice(
  rawValue: string,
  highPriceThreshold: number
): PriceValidation {
  const trimmed = rawValue.trim();

  if (trimmed === "") {
    return {
      valid: true,
      value: null,
      error: null,
      warning: null,
    };
  }

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed)) {
    return {
      valid: false,
      value: null,
      error: "Introduce un precio válido.",
      warning: null,
    };
  }

  if (parsed <= 0) {
    return {
      valid: false,
      value: null,
      error:
        "El precio debe ser mayor que 0 €.",
      warning: null,
    };
  }

  if (
    parsed >
    highPriceThreshold
  ) {
    return {
      valid: true,
      value: parsed,
      error: null,
      warning:
        "Este precio parece bastante alto. Puedes continuar si es el importe real que aparece en tu reserva.",
    };
  }

  return {
    valid: true,
    value: parsed,
    error: null,
    warning: null,
  };
}

export default function PricesPage() {
  const { data, setData } =
    useStore();

  /*
   * MODELO UNIVERSAL
   *
   * Prices ya utiliza únicamente
   * customPackagePrices.
   */
  const storedSoftPrice =
    data.customPackagePrices
      .myDrinksSoft ??
    null;

  const storedMyDrinksPrice =
    data.customPackagePrices
      .myDrinks ??
    null;

  const storedPlusPrice =
    data.customPackagePrices
      .myDrinksPlus ??
    null;

  const [
    myDrinksSoftPrice,
    setMyDrinksSoftPrice,
  ] = useState(
    storedSoftPrice !== null
      ? String(storedSoftPrice)
      : ""
  );

  const [
    myDrinksPrice,
    setMyDrinksPrice,
  ] = useState(
    storedMyDrinksPrice !== null
      ? String(storedMyDrinksPrice)
      : ""
  );

  const [
    myDrinksPlusPrice,
    setMyDrinksPlusPrice,
  ] = useState(
    storedPlusPrice !== null
      ? String(storedPlusPrice)
      : ""
  );

  const myDrinksSoftValidation =
    validateOptionalPrice(
      myDrinksSoftPrice,
      60
    );

  const myDrinksValidation =
    validateOptionalPrice(
      myDrinksPrice,
      80
    );

  const myDrinksPlusValidation =
    validateOptionalPrice(
      myDrinksPlusPrice,
      100
    );

  const canContinue =
    myDrinksSoftValidation.valid &&
    myDrinksValidation.valid &&
    myDrinksPlusValidation.valid;

  function savePrices() {
    if (!canContinue) {
      return;
    }

    setData((prev) => ({
      ...prev,

      customPackagePrices: {
        ...prev.customPackagePrices,

        myDrinksSoft:
          myDrinksSoftValidation.value,

        myDrinks:
          myDrinksValidation.value,

        myDrinksPlus:
          myDrinksPlusValidation.value,
      },
    }));
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-5 shadow-lg sm:p-10">
        <ProgressBar
          currentStep={4}
          totalSteps={6}
        />

        <div className="mt-2 sm:mt-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Paso 4 de 6
          </p>

          <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            ¿Tienes el precio de tu
            reserva?
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Si Costa ya te muestra un
            precio para los paquetes,
            introdúcelo aquí para mejorar
            la precisión del análisis.
          </p>
        </div>

        <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-sky-900 sm:mt-6">
          💡 Este paso es opcional.
          My Drinks y My Drinks Plus
          pueden utilizar precios de
          referencia. My Drinks Soft
          solo podrá entrar en la
          comparación económica si
          introduces el precio real de
          tu reserva.
        </div>

        <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
          {/* MY DRINKS SOFT */}

          <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <label
                  htmlFor="myDrinksSoftPrice"
                  className="block text-base font-semibold text-slate-900 sm:text-lg"
                >
                  🥤 My Drinks Soft
                </label>

                <p className="mt-1 text-sm text-slate-500">
                  Precio por persona y día
                </p>
              </div>

              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                Sin precio de referencia
              </span>
            </div>

            <div className="relative mt-3">
              <input
                id="myDrinksSoftPrice"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={
                  myDrinksSoftPrice
                }
                onChange={(event) =>
                  setMyDrinksSoftPrice(
                    event.target.value
                  )
                }
                placeholder="Ej. 25.00"
                className={`w-full rounded-xl border bg-white px-4 py-4 pr-14 text-lg font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 ${
                  myDrinksSoftValidation.error
                    ? "border-red-300 focus:ring-2 focus:ring-red-400"
                    : "border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
                }`}
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">
                €
              </span>
            </div>

            {myDrinksSoftValidation.error && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-medium text-red-700">
                  {
                    myDrinksSoftValidation.error
                  }
                </p>
              </div>
            )}

            {myDrinksSoftValidation.warning && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-medium leading-6 text-amber-800">
                  ⚠️{" "}
                  {
                    myDrinksSoftValidation.warning
                  }
                </p>
              </div>
            )}

            {!myDrinksSoftValidation.error &&
              !myDrinksSoftValidation.warning && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs leading-5 text-slate-600">
                    Si queda vacío,
                    My Drinks Soft
                    continuará fuera de
                    la comparación
                    económica.
                  </p>
                </div>
              )}
          </div>

          {/* MY DRINKS */}

          <div className="rounded-2xl border border-slate-200 p-4 sm:p-5">
            <label
              htmlFor="myDrinksPrice"
              className="block text-base font-semibold text-slate-900 sm:text-lg"
            >
              🍹 My Drinks
            </label>

            <p className="mt-1 text-sm text-slate-500">
              Precio por persona y día
            </p>

            <div className="relative mt-3">
              <input
                id="myDrinksPrice"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={
                  myDrinksPrice
                }
                onChange={(event) =>
                  setMyDrinksPrice(
                    event.target.value
                  )
                }
                placeholder="Ej. 38.50"
                className={`w-full rounded-xl border bg-white px-4 py-4 pr-14 text-lg font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 ${
                  myDrinksValidation.error
                    ? "border-red-300 focus:ring-2 focus:ring-red-400"
                    : "border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
                }`}
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">
                €
              </span>
            </div>

            {myDrinksValidation.error && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-medium text-red-700">
                  {
                    myDrinksValidation.error
                  }
                </p>
              </div>
            )}

            {myDrinksValidation.warning && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-medium leading-6 text-amber-800">
                  ⚠️{" "}
                  {
                    myDrinksValidation.warning
                  }
                </p>
              </div>
            )}

            {!myDrinksValidation.error &&
              !myDrinksValidation.warning && (
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Si queda vacío:
                  DrinkPilot usará
                  34,00 € / día como
                  referencia.
                </p>
              )}
          </div>

          {/* MY DRINKS PLUS */}

          <div className="rounded-2xl border border-slate-200 p-4 sm:p-5">
            <label
              htmlFor="myDrinksPlusPrice"
              className="block text-base font-semibold text-slate-900 sm:text-lg"
            >
              🍸 My Drinks Plus
            </label>

            <p className="mt-1 text-sm text-slate-500">
              Precio por persona y día
            </p>

            <div className="relative mt-3">
              <input
                id="myDrinksPlusPrice"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={
                  myDrinksPlusPrice
                }
                onChange={(event) =>
                  setMyDrinksPlusPrice(
                    event.target.value
                  )
                }
                placeholder="Ej. 49.90"
                className={`w-full rounded-xl border bg-white px-4 py-4 pr-14 text-lg font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 ${
                  myDrinksPlusValidation.error
                    ? "border-red-300 focus:ring-2 focus:ring-red-400"
                    : "border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
                }`}
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">
                €
              </span>
            </div>

            {myDrinksPlusValidation.error && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-medium text-red-700">
                  {
                    myDrinksPlusValidation.error
                  }
                </p>
              </div>
            )}

            {myDrinksPlusValidation.warning && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-medium leading-6 text-amber-800">
                  ⚠️{" "}
                  {
                    myDrinksPlusValidation.warning
                  }
                </p>
              </div>
            )}

            {!myDrinksPlusValidation.error &&
              !myDrinksPlusValidation.warning && (
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Si queda vacío:
                  DrinkPilot usará
                  46,00 € / día como
                  referencia.
                </p>
              )}
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-slate-100 p-4 text-sm leading-6 text-slate-600 sm:mt-8">
          Los precios que introduzcas se
          utilizarán únicamente para este
          análisis y tendrán prioridad
          sobre los valores de referencia
          disponibles.
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4">
          <Link
            href="/wizard/preferences"
            className="rounded-xl border border-slate-300 px-3 py-4 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:text-base"
          >
            Atrás
          </Link>

          {canContinue ? (
            <Link
              href="/wizard/people"
              onClick={savePrices}
              className="rounded-xl bg-sky-600 px-3 py-4 text-center text-sm font-semibold text-white transition hover:bg-sky-700 active:bg-sky-800 sm:text-base"
            >
              Continuar
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-xl bg-slate-300 px-3 py-4 text-center text-sm font-semibold text-slate-500 sm:text-base"
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </main>
  );
}