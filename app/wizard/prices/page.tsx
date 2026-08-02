"use client";

import { useState } from "react";
import Link from "next/link";

import { useStore } from "@/lib/store";
import ProgressBar from "@/components/ProgressBar";

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

  function parseOptionalPrice(value: string) {
    if (value.trim() === "") {
      return null;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return null;
    }

    return parsed;
  }

  function savePrices() {
    setData((prev) => ({
      ...prev,

      myDrinksCustomPrice:
        parseOptionalPrice(myDrinksPrice),

      myDrinksPlusCustomPrice:
        parseOptionalPrice(myDrinksPlusPrice),
    }));
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-10 shadow-lg">

        <ProgressBar
          currentStep={4}
          totalSteps={5}
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
                min="0"
                step="0.01"
                inputMode="decimal"
                value={myDrinksPrice}
                onChange={(event) =>
                  setMyDrinksPrice(event.target.value)
                }
                placeholder="Ej. 38.50"
                className="w-full rounded-xl border border-slate-300 p-4 pr-14 text-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">
                €
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Si queda vacío: DrinkPilot usará 34,00 € / día como referencia.
            </p>
          </div>

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
                min="0"
                step="0.01"
                inputMode="decimal"
                value={myDrinksPlusPrice}
                onChange={(event) =>
                  setMyDrinksPlusPrice(event.target.value)
                }
                placeholder="Ej. 49.90"
                className="w-full rounded-xl border border-slate-300 p-4 pr-14 text-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">
                €
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Si queda vacío: DrinkPilot usará 46,00 € / día como referencia.
            </p>
          </div>

        </div>

        <div className="mt-8 rounded-xl bg-slate-100 p-4 text-sm leading-6 text-slate-600">
          Los precios que introduzcas se utilizarán únicamente para
          este análisis y tendrán prioridad sobre los valores de referencia.
        </div>

        <div className="mt-10 flex gap-4">

          <Link
            href="/wizard/preferences"
            className="flex-1 rounded-xl border border-slate-300 py-4 text-center font-semibold transition hover:bg-slate-100"
          >
            Atrás
          </Link>

          <Link
            href="/wizard/people"
            onClick={savePrices}
            className="flex-1 rounded-xl bg-sky-600 py-4 text-center font-semibold text-white transition hover:bg-sky-700"
          >
            Continuar
          </Link>

        </div>

      </div>
    </main>
  );
}