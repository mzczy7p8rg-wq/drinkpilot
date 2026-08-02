"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { getAllPackages } from "@/lib/packageService";
import ProgressBar from "@/components/ProgressBar";

export default function PackagePage() {
  const { data, setData } = useStore();

  const packages = getAllPackages();

  const selectedPackage = packages.find(
    (pkg) =>
      pkg.key === data.packageKey &&
      pkg.status === "verified"
  );

  const hasValidPackage = Boolean(selectedPackage);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-10 shadow-lg">
        <ProgressBar currentStep={2} totalSteps={4} />

        <h1 className="mt-6 text-3xl font-bold text-slate-900">
          Selecciona tu paquete de bebidas
        </h1>

        <p className="mt-3 text-slate-500">
          Elige el paquete que tienes contratado o el que estás pensando
          comprar.
        </p>

        <div className="mt-8 space-y-5">
          {packages.map((pkg) => {
            const isVerified = pkg.status === "verified";
            const isSelected = data.packageKey === pkg.key;

            return (
              <button
                key={pkg.key}
                type="button"
                disabled={!isVerified}
                onClick={() => {
                  if (!isVerified) {
                    return;
                  }

                  setData((prev) => ({
                    ...prev,
                    packageKey: pkg.key,
                    packageName: pkg.name,
                    packagePrice: pkg.pricePerDay,
                  }));
                }}
                className={`w-full rounded-2xl border p-6 text-left transition-all ${
                  !isVerified
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 opacity-70"
                    : isSelected
                    ? "border-sky-600 bg-sky-50 shadow-md"
                    : "border-slate-200 hover:border-sky-400 hover:shadow"
                }`}
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold text-slate-900">
                        {pkg.icon} {pkg.name}
                      </h2>

                      {isVerified ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                          Información verificada
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                          Pendiente de verificar
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-slate-600">
                      {pkg.description}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-2 text-sm text-slate-700">
                      <div>☕ Café</div>
                      <div>💧 Agua</div>
                      <div>🥤 Refrescos</div>

                      <div>
                        {pkg.includesAlcohol
                          ? "🍺 Con alcohol"
                          : "🚫 Sin alcohol"}
                      </div>

                      <div>🍷 Vino</div>
                      <div>🍸 Cócteles</div>
                    </div>
                  </div>

                  <div className="sm:w-52 sm:text-right">
                    {pkg.priceStatus === "reference" ? (
                      <>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Precio orientativo
                        </p>

                        <div className="mt-1 text-3xl font-bold text-sky-600">
                          {pkg.pricePerDay.toFixed(2)} €
                        </div>

                        <div className="text-sm text-slate-500">
                          por persona / día
                        </div>

                        <div className="mt-4 rounded-lg bg-amber-50 px-3 py-3 text-sm text-amber-900">
                          El precio real puede variar según crucero, tarifa y
                          momento de compra.
                        </div>
                      </>
                    ) : (
                      <div className="rounded-lg bg-slate-200 px-4 py-3 text-sm font-medium text-slate-600">
                        Precio pendiente de verificación
                      </div>
                    )}
                  </div>
                </div>

                {pkg.priceNote && (
                  <p className="mt-5 border-t border-slate-200 pt-4 text-xs text-slate-500">
                    {pkg.priceNote}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl bg-sky-50 p-4 text-sm text-sky-900">
          ℹ️ DrinkPilot utiliza precios orientativos para realizar la
          estimación. Comprueba siempre el precio definitivo en tu reserva o
          en MyCosta antes de contratar un paquete.
        </div>

        <Link
          href={hasValidPackage ? "/wizard/consumption" : "#"}
          onClick={(event) => {
            if (!hasValidPackage) {
              event.preventDefault();
            }
          }}
          className={`mt-8 block w-full rounded-xl py-4 text-center font-semibold transition ${
            hasValidPackage
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