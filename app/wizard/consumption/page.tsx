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
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-5 shadow-lg sm:p-10">

        <ProgressBar
          currentStep={2}
          totalSteps={6}
        />

        {/* CABECERA */}

        <div className="mt-2 sm:mt-0">

          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Paso 2 de 6
          </p>

          <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            ¿Cuántas bebidas consumes al día?
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Indica el consumo aproximado de una persona durante
            un día normal del crucero.
          </p>

        </div>

        {/* AYUDA */}

        <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-sky-900 sm:mt-6">
          💡 Introduce las bebidas que consumirías aunque
          no contrataras ningún paquete.
        </div>

        {/* CONTADORES */}

        <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">

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

        {/* TOTAL */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center sm:p-5">

          <p className="text-sm font-medium text-slate-500">
            Consumo diario estimado
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-900">
            {totalDrinksPerDay}
          </p>

          <p className="mt-1 text-sm font-medium text-slate-600">
            {totalDrinksPerDay === 1
              ? "bebida"
              : "bebidas"}{" "}
            por persona / día
          </p>

        </div>

        {!hasConsumption && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
            <p className="text-sm font-medium text-amber-800">
              Añade al menos una bebida para continuar.
            </p>
          </div>
        )}

        {/* NAVEGACIÓN */}

        <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4">

          <Link
            href="/wizard"
            className="rounded-xl border border-slate-300 px-3 py-4 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:text-base"
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
            className={`rounded-xl px-3 py-4 text-center text-sm font-semibold transition sm:text-base ${
              hasConsumption
                ? "bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800"
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