"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import ProgressBar from "@/components/ProgressBar";

import {
  getCruiseLine,
} from "@/data/cruiseLines";

import {
  getAllPackages,
} from "@/lib/packageService";

import {
  getPackageOperationalRules,
} from "@/lib/packageRules";

import {
  filterAdultCatalogPackages,
} from "@/lib/adultPackageFilter";

import {
  useStore,
} from "@/lib/store";

function formatCurrency(
  amount: number,
  currency: string
): string {
  try {
    return new Intl.NumberFormat(
      "es-ES",
      {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(amount);
  } catch {
    return `${amount.toFixed(
      2
    )} ${currency}`;
  }
}

export default function ReviewPage() {
  const router =
    useRouter();

  const {
    data,
    hydrated,
  } = useStore();

  /*
   * NAVIERA ACTIVA
   *
   * Review ya no conoce ninguna
   * compañía ni packageKey concreto.
   */
  const cruiseLine =
    getCruiseLine(
      data.cruiseLine
    );

  /*
   * PAQUETES DINÁMICOS
   *
   * Cualquier paquete registrado
   * para la naviera activa aparecerá
   * automáticamente en Review.
   */
  const packages =
    getAllPackages(
      data.cruiseLine
    );

  const operationalRules =
    getPackageOperationalRules({
      cruiseLine:
        data.cruiseLine,

      market:
        data.market ?? null,

      sailingDate:
        data.sailingDate ?? null,
    });

  /*
   * Review resume únicamente los paquetes
   * que participan en el flujo adulto.
   *
   * El catálogo completo sigue disponible
   * en Prices y en las capas de evidencia.
   */
  const adultPackages =
    filterAdultCatalogPackages(
      packages,
      operationalRules
    );

  const drinks = [
    {
      label: "Café",
      icon: "☕",
      value: data.coffee,
    },
    {
      label: "Agua",
      icon: "💧",
      value: data.water,
    },
    {
      label: "Refrescos",
      icon: "🥤",
      value: data.soda,
    },
    {
      label: "Cerveza",
      icon: "🍺",
      value: data.beer,
    },
    {
      label: "Vino",
      icon: "🍷",
      value: data.wine,
    },
    {
      label: "Cócteles",
      icon: "🍸",
      value: data.cocktail,
    },
  ];

  const activeDrinks =
    drinks.filter(
      (drink) =>
        drink.value > 0
    );

  const totalDrinksPerDay =
    activeDrinks.reduce(
      (
        total,
        drink
      ) =>
        total +
        drink.value,
      0
    );

  const preferences = [
    data.alcoholicCocktails &&
      "Cócteles con alcohol",

    data.nonAlcoholicCocktails &&
      "Cócteles sin alcohol",

    data.premiumCocktails &&
      "Cócteles premium",

    data.bottledBeer &&
      "Cerveza embotellada",

    data.premiumSpirits &&
      "Destilados premium",

    data.bottledWaterDailyAllowance &&
    !data.bottledWaterUnlimited &&
      "Una botella de agua diaria",

    data.bottledWaterUnlimited &&
      "Agua embotellada sin límite",
  ].filter(Boolean) as string[];

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="font-medium text-slate-600">
          Recuperando tu análisis...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 pb-24 sm:px-6 sm:py-10 sm:pb-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-5 shadow-lg sm:p-10">
        <ProgressBar
          currentStep={6}
          totalSteps={6}
        />

        {/* CABECERA */}

        <div className="mt-2 sm:mt-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Paso 6 de 6
          </p>

          <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            Revisa tu análisis
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Comprueba los datos antes
            de ver la recomendación.
          </p>
        </div>

        {/* NAVIERA */}

        <section className="mt-6 rounded-2xl border border-slate-200 p-4 sm:mt-8 sm:p-5">
          <p className="text-sm text-slate-500">
            🚢 Naviera
          </p>

          <p className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
            {cruiseLine.name}
          </p>
        </section>

        {/* DATOS BÁSICOS */}

        <section className="mt-4 rounded-2xl border border-slate-200 p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            <div className="min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-slate-500">
                  🗓️ Duración
                </p>

                <Link
                  href="/wizard"
                  className="shrink-0 text-xs font-semibold text-sky-700 hover:text-sky-900 sm:text-sm"
                >
                  Editar
                </Link>
              </div>

              <p className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
                {data.days}{" "}
                {data.days === 1
                  ? "día"
                  : "días"}
              </p>
            </div>

            <div className="min-w-0 border-l border-slate-200 pl-4 sm:pl-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-slate-500">
                  👥 Viajeros
                </p>

                <Link
                  href="/wizard/people"
                  className="shrink-0 text-xs font-semibold text-sky-700 hover:text-sky-900 sm:text-sm"
                >
                  Editar
                </Link>
              </div>

              <p className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
                {data.people}{" "}
                {data.people === 1
                  ? "persona"
                  : "personas"}
              </p>
            </div>
          </div>
        </section>

        {/* CONSUMO */}

        <section className="mt-4 rounded-2xl border border-slate-200 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-slate-900">
                🍹 Consumo diario
              </h2>

              <p className="mt-2 text-sm leading-5 text-slate-500">
                {totalDrinksPerDay}{" "}
                {totalDrinksPerDay === 1
                  ? "bebida"
                  : "bebidas"}{" "}
                por persona / día
              </p>
            </div>

            <Link
              href="/wizard/consumption"
              className="shrink-0 text-sm font-semibold text-sky-700 hover:text-sky-900"
            >
              Editar
            </Link>
          </div>

          {activeDrinks.length >
          0 ? (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {activeDrinks.map(
                (drink) => (
                  <div
                    key={
                      drink.label
                    }
                    className="rounded-xl bg-slate-50 p-3"
                  >
                    <p className="text-xs leading-5 text-slate-500 sm:text-sm">
                      {
                        drink.icon
                      }{" "}
                      {
                        drink.label
                      }
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {
                        drink.value
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No has indicado consumo
              diario.
            </p>
          )}
        </section>

        {/* PREFERENCIAS */}

        <section className="mt-4 rounded-2xl border border-slate-200 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-bold text-slate-900">
                ⭐ Preferencias
              </h2>

              {preferences.length >
              0 ? (
                <div className="mt-3 space-y-2">
                  {preferences.map(
                    (
                      preference
                    ) => (
                      <p
                        key={
                          preference
                        }
                        className="text-sm leading-5 text-slate-700"
                      >
                        ✓{" "}
                        {
                          preference
                        }
                      </p>
                    )
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-5 text-slate-500">
                  Sin preferencias
                  premium adicionales.
                </p>
              )}
            </div>

            <Link
              href="/wizard/preferences"
              className="shrink-0 text-sm font-semibold text-sky-700 hover:text-sky-900"
            >
              Editar
            </Link>
          </div>
        </section>

        {/* PRECIOS */}

        <section className="mt-4 rounded-2xl border border-slate-200 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900">
                🎟️ Precios de los
                paquetes
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {
                  cruiseLine.name
                }
              </p>
            </div>

            <Link
              href="/wizard/prices"
              className="shrink-0 text-sm font-semibold text-sky-700 hover:text-sky-900"
            >
              Editar
            </Link>
          </div>

          <div className="mt-4 space-y-4">
            {adultPackages.map(
              (pkg) => {
                const customPrice =
                  data
                    .customPackagePrices[
                    pkg.key
                  ] ?? null;

                const hasCustomPrice =
                  typeof customPrice ===
                    "number" &&
                  Number.isFinite(
                    customPrice
                  ) &&
                  customPrice > 0;

                const hasReferencePrice =
                  typeof pkg.pricePerDay ===
                    "number" &&
                  Number.isFinite(
                    pkg.pricePerDay
                  ) &&
                  pkg.pricePerDay >
                    0;

                const displayedPrice =
                  hasCustomPrice
                    ? customPrice
                    : hasReferencePrice
                    ? pkg.pricePerDay
                    : null;

                return (
                  <div
                    key={
                      pkg.key
                    }
                    className="rounded-xl bg-slate-50 p-3 sm:p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800">
                          {
                            pkg.icon
                          }{" "}
                          {
                            pkg.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          por persona /
                          día
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-bold text-slate-900">
                          {displayedPrice !==
                          null
                            ? formatCurrency(
                                displayedPrice,
                                cruiseLine.currency
                              )
                            : "Pendiente"}
                        </p>

                        {hasCustomPrice ? (
                          <p className="mt-1 text-xs font-medium text-sky-700">
                            ✓ Tu reserva
                          </p>
                        ) : hasReferencePrice ? (
                          <p className="mt-1 text-xs font-medium text-amber-700">
                            ⚠ Referencia
                          </p>
                        ) : (
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            Sin precio de
                            referencia
                          </p>
                        )}
                      </div>
                    </div>

                    {!hasCustomPrice &&
                      !hasReferencePrice &&
                      pkg.economicActivation ===
                        "user-price-only" && (
                        <p className="mt-3 text-xs leading-5 text-slate-500">
                          Necesita el
                          precio real de
                          tu reserva para
                          participar en la
                          comparación
                          económica.
                        </p>
                      )}
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* CONFIRMACIÓN */}

        <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900 sm:mt-6">
          💡 Todo listo. DrinkPilot
          utilizará estos datos para
          comparar coste y cobertura.
        </div>

        {/* NAVEGACIÓN */}

        <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4">
          <Link
            href="/wizard/people"
            className="rounded-xl border border-slate-300 px-3 py-4 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:text-base"
          >
            Atrás
          </Link>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/results"
              )
            }
            className="rounded-xl bg-sky-600 px-3 py-4 text-center text-sm font-semibold text-white transition hover:bg-sky-700 active:bg-sky-800 sm:text-base"
          >
            Ver recomendación
          </button>
        </div>
      </div>
    </main>
  );
}