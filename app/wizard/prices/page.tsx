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
      error: "El precio debe ser mayor que 0 €.",
      warning: null,
    };
  }

  if (parsed > highPriceThreshold) {
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
  const { data, setData } = useStore();

  const [myDrinksPrice, setMyDrinksPrice] = useState(
    data.myDrinksCustomPrice !== null
      ? String(data.myDrinksCustomPrice)
      : ""
  );

  const [myDrinksPlusPrice, setMyDrinksPlusPrice] = useState(
    data.myDrinksPlusCustomPrice !== null
      ? String(data.myDrinksPlusCustomPrice)
      : ""
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
    myDrinksValidation.valid &&
    myDrinksPlusValidation.valid;

  function savePrices() {
    if (!canContinue) {
      return;
    }

    setData((prev) => ({
      ...prev,

      myDrinksCustomPrice:
        myDrinksValidation.value,

      myDrinksPlusCustomPrice:
        myDrinksPlusValidation.value,
    }));
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-10 shadow-lg">

        <ProgressBar
          currentStep={4}
          totalSteps={6}
        />

        <h1 className="text-3xl font-bold text-slate-900">
          ¿Tienes el precio de tu reserva?
        </h1>

        <p className="mt-3 text-slate-500">
          Si Costa ya te muestra un precio para los paquetes,
          introdúcelo aquí para mejorar la precisión del análisis.
        </p>

        <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
          💡 Este paso es opcional. Si dejas los campos vacíos,
          DrinkPilot utilizará sus precios de referencia.
        </div>

        <div className="mt-8 space-y-6">

          {/* MY DRINKS */}

          <div>
            <label
              htmlFor="myDrinksPrice"
              className="block font-semibold text-slate-900"
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
                value={myDrinksPrice}
                onChange={(event) =>
                  setMyDrinksPrice(
                    event.target.value
                  )
                }
                placeholder="Ej. 38.50"
                className={`w-full rounded-xl border p-4 pr-14 text-lg focus:outline-none focus:ring-2 ${
                  myDrinksValidation.error
                    ? "border-red-300 focus:ring-red-400"
                    : "border-slate-300 focus:ring-sky-500"
                }`}
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">
                €
              </span>
            </div>

            {myDrinksValidation.error && (
              <p className="mt-2 text-sm font-medium text-red-600">
                {myDrinksValidation.error}
              </p>
            )}

            {myDrinksValidation.warning && (
              <p className="mt-2 text-sm font-medium text-amber-700">
                ⚠️ {myDrinksValidation.warning}
              </p>
            )}

            {!myDrinksValidation.error &&
              !myDrinksValidation.warning && (
                <p className="mt-2 text-xs text-slate-500">
                  Si queda vacío: DrinkPilot usará
                  34,00 € / día como referencia.
                </p>
              )}
          </div>

          {/* MY DRINKS PLUS */}

          <div>
            <label
              htmlFor="myDrinksPlusPrice"
              className="block font-semibold text-slate-900"
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
                value={myDrinksPlusPrice}
                onChange={(event) =>
                  setMyDrinksPlusPrice(
                    event.target.value
                  )
                }
                placeholder="Ej. 49.90"
                className={`w-full rounded-xl border p-4 pr-14 text-lg focus:outline-none focus:ring-2 ${
                  myDrinksPlusValidation.error
                    ? "border-red-300 focus:ring-red-400"
                    : "border-slate-300 focus:ring-sky-500"
                }`}
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">
                €
              </span>
            </div>

            {myDrinksPlusValidation.error && (
              <p className="mt-2 text-sm font-medium text-red-600">
                {myDrinksPlusValidation.error}
              </p>
            )}

            {myDrinksPlusValidation.warning && (
              <p className="mt-2 text-sm font-medium text-amber-700">
                ⚠️ {myDrinksPlusValidation.warning}
              </p>
            )}

            {!myDrinksPlusValidation.error &&
              !myDrinksPlusValidation.warning && (
                <p className="mt-2 text-xs text-slate-500">
                  Si queda vacío: DrinkPilot usará
                  46,00 € / día como referencia.
                </p>
              )}
          </div>

        </div>

        <div className="mt-8 rounded-xl bg-slate-100 p-4 text-sm leading-6 text-slate-600">
          Los precios que introduzcas se utilizarán únicamente
          para este análisis y tendrán prioridad sobre los valores
          de referencia.
        </div>

        <div className="mt-10 flex gap-4">

          <Link
            href="/wizard/preferences"
            className="flex-1 rounded-xl border border-slate-300 py-4 text-center font-semibold transition hover:bg-slate-100"
          >
            Atrás
          </Link>

          {canContinue ? (
            <Link
              href="/wizard/people"
              onClick={savePrices}
              className="flex-1 rounded-xl bg-sky-600 py-4 text-center font-semibold text-white transition hover:bg-sky-700"
            >
              Continuar
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex-1 cursor-not-allowed rounded-xl bg-slate-300 py-4 text-center font-semibold text-slate-500"
            >
              Continuar
            </button>
          )}

        </div>

      </div>
    </main>
  );
}