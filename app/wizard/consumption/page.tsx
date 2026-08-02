"use client";

import Link from "next/link";

import { useStore } from "@/lib/store";
import DrinkCounter from "@/components/DrinkCounter";
import ProgressBar from "@/components/ProgressBar";

export default function ConsumptionPage() {
  const { data, setData } = useStore();

  const totalDrinksPerDay =
    data.coffee +
    data.water +
    data.soda +
    data.beer +
    data.wine +
    data.cocktail;

  const hasConsumption =
    totalDrinksPerDay > 0;

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-10 shadow-lg">

        <ProgressBar
          currentStep={2}
          totalSteps={5}
        />

        <h1 className="text-3xl font-bold text-slate-900">
          ¿Cuántas bebidas consumes al día?
        </h1>

        <p className="mt-3 text-slate-500">
          Indica el consumo aproximado de una persona durante
          un día normal del crucero.
        </p>

        <div className="mt-6 rounded-xl bg-sky-50 p-4 text-sm text-sky-900">
          💡 Introduce las bebidas que consumirías aunque
          no contrataras ningún paquete.
        </div>

        <div className="mt-8 space-y-4">

          <DrinkCounter
            label="☕ Cafés"
            value={data.coffee}
            onChange={(value) =>
              setData((prev) => ({
                ...prev,
                coffee: Math.max(0, value),
              }))
            }
          />

          <DrinkCounter
            label="💧 Agua"
            value={data.water}
            onChange={(value) =>
              setData((prev) => ({
                ...prev,
                water: Math.max(0, value),
              }))
            }
          />

          <DrinkCounter
            label="🥤 Refrescos"
            value={data.soda}
            onChange={(value) =>
              setData((prev) => ({
                ...prev,
                soda: Math.max(0, value),
              }))
            }
          />

          <DrinkCounter
            label="🍺 Cervezas"
            value={data.beer}
            onChange={(value) =>
              setData((prev) => ({
                ...prev,
                beer: Math.max(0, value),
              }))
            }
          />

          <DrinkCounter
            label="🍷 Vinos"
            value={data.wine}
            onChange={(value) =>
              setData((prev) => ({
                ...prev,
                wine: Math.max(0, value),
              }))
            }
          />

          <DrinkCounter
            label="🍸 Cócteles"
            value={data.cocktail}
            onChange={(value) =>
              setData((prev) => ({
                ...prev,
                cocktail: Math.max(0, value),
              }))
            }
          />

        </div>

        <div className="mt-6 rounded-xl bg-slate-100 p-4 text-center">
          <span className="text-sm text-slate-500">
            Consumo diario estimado
          </span>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {totalDrinksPerDay}{" "}
            {totalDrinksPerDay === 1
              ? "bebida"
              : "bebidas"}
          </p>

          <p className="text-sm text-slate-500">
            por persona / día
          </p>
        </div>

        {!hasConsumption && (
          <p className="mt-4 text-center text-sm font-medium text-amber-700">
            Añade al menos una bebida para continuar.
          </p>
        )}

        <div className="mt-10 flex gap-4">

          <Link
            href="/wizard"
            className="flex-1 rounded-xl border border-slate-300 py-4 text-center font-semibold transition hover:bg-slate-100"
          >
            Atrás
          </Link>

          <Link
            href={
              hasConsumption
                ? "/wizard/preferences"
                : "#"
            }
            onClick={(event) => {
              if (!hasConsumption) {
                event.preventDefault();
                return;
              }

              setData((prev) => ({
                ...prev,
                drinksPerDay:
                  totalDrinksPerDay,
              }));
            }}
            className={`flex-1 rounded-xl py-4 text-center font-semibold transition ${
              hasConsumption
                ? "bg-sky-600 text-white hover:bg-sky-700"
                : "pointer-events-none bg-slate-300 text-slate-500"
            }`}
          >
            Continuar
          </Link>

        </div>

      </div>
    </main>
  );
}