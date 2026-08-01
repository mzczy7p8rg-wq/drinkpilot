"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import DrinkCounter from "@/components/DrinkCounter";
import ProgressBar from "@/components/ProgressBar";

export default function ConsumptionPage() {
  const { data, setData } = useStore();

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-10 shadow-lg">

        <ProgressBar currentStep={3} totalSteps={4} />

        <h1 className="text-3xl font-bold text-slate-900">
          ¿Cuántas bebidas consumes al día?
        </h1>

        <p className="mt-3 text-slate-500">
          Indica un consumo aproximado para cada tipo de bebida.
        </p>

        <div className="mt-8 space-y-4">

          <DrinkCounter
            label="☕ Cafés"
            value={data.coffee}
            onChange={(value) =>
              setData((prev) => ({
                ...prev,
                coffee: value,
              }))
            }
          />

          <DrinkCounter
            label="💧 Agua"
            value={data.water}
            onChange={(value) =>
              setData((prev) => ({
                ...prev,
                water: value,
              }))
            }
          />

          <DrinkCounter
            label="🥤 Refrescos"
            value={data.soda}
            onChange={(value) =>
              setData((prev) => ({
                ...prev,
                soda: value,
              }))
            }
          />

          <DrinkCounter
            label="🍺 Cervezas"
            value={data.beer}
            onChange={(value) =>
              setData((prev) => ({
                ...prev,
                beer: value,
              }))
            }
          />

          <DrinkCounter
            label="🍷 Vinos"
            value={data.wine}
            onChange={(value) =>
              setData((prev) => ({
                ...prev,
                wine: value,
              }))
            }
          />

          <DrinkCounter
            label="🍸 Cócteles"
            value={data.cocktail}
            onChange={(value) =>
              setData((prev) => ({
                ...prev,
                cocktail: value,
              }))
            }
          />

        </div>

        <div className="mt-10 flex gap-4">

          <Link
            href="/wizard/package"
            className="flex-1 rounded-xl border border-slate-300 py-4 text-center font-semibold hover:bg-slate-100"
          >
            Atrás
          </Link>

          <Link
            href="/wizard/people"
            onClick={() =>
              setData((prev) => ({
                ...prev,
                drinksPerDay:
                  prev.coffee +
                  prev.water +
                  prev.soda +
                  prev.beer +
                  prev.wine +
                  prev.cocktail,
              }))
            }
            className="flex-1 rounded-xl bg-sky-600 py-4 text-center font-semibold text-white transition hover:bg-sky-700"
          >
            Continuar
          </Link>

        </div>

      </div>
    </main>
  );
}