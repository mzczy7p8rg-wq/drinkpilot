"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { getAllPackages } from "@/lib/packageService";
import ProgressBar from "@/components/ProgressBar";

export default function PackagePage() {
  const { data, setData } = useStore();

  const packages = getAllPackages();

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-10 shadow-lg">

        <ProgressBar currentStep={2} totalSteps={4} />

        <h1 className="mt-6 text-3xl font-bold text-slate-900">
          Selecciona tu paquete de bebidas
        </h1>

        <p className="mt-3 text-slate-500">
          Elige el paquete que tienes contratado o el que estás pensando comprar.
        </p>

        <div className="mt-8 space-y-5">

          {packages.map((pkg) => (
            <button
              key={pkg.key}
              type="button"
              onClick={() =>
                setData((prev) => ({
                  ...prev,
                  packageKey: pkg.key,
                  packageName: pkg.name,
                  packagePrice: pkg.pricePerDay,
                }))
              }
              className={`w-full rounded-2xl border p-6 text-left transition-all ${
                data.packageKey === pkg.key
                  ? "border-sky-600 bg-sky-50 shadow-md"
                  : "border-slate-200 hover:border-sky-400 hover:shadow"
              }`}
            >
              <div className="flex items-start justify-between">

                <div>

                  <h2 className="text-2xl font-bold">
                    {pkg.icon} {pkg.name}
                  </h2>

                  <p className="mt-2 text-slate-600">
                    {pkg.description}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2 text-sm text-slate-700">

                    <div>☕ Café</div>

                    <div>
                      {pkg.includesAlcohol ? "🍺 Alcohol" : "🚫 Sin alcohol"}
                    </div>

                    <div>💧 Agua</div>

                    <div>🥤 Refrescos</div>

                    <div>🍷 Vino</div>

                    <div>🍸 Cócteles</div>

                  </div>

                </div>

                <div className="text-right">

                  <div className="text-3xl font-bold text-sky-600">
                    {pkg.pricePerDay}€
                  </div>

                  <div className="text-sm text-slate-500">
                    por persona / día
                  </div>

                  <div className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm">
                    Hasta {pkg.maxDrinkPrice} € por bebida
                  </div>

                </div>

              </div>

            </button>
          ))}

        </div>

        <Link
          href="/wizard/consumption"
          className={`mt-8 block w-full rounded-xl py-4 text-center font-semibold transition ${
            data.packageKey
              ? "bg-sky-600 text-white hover:bg-sky-700"
              : "pointer-events-none bg-slate-300 text-slate-500"
          }`}
        >
          Continuar →
        </Link>

      </div>
    </main>
  );
}