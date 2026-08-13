"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import ProgressBar from "@/components/ProgressBar";
import { WizardBrand } from "@/components/Brand";

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

import {
  resolveEconomicDrinkPriceForCurrency,
} from "@/lib/economicDrinkPriceResolution";

import {
  useWizardRouteGuard,
} from "@/lib/useWizardRouteGuard";

import {
  getTotalDrinksPerDay,
} from "@/lib/wizardProgress";
import {
  getMarketLabel,
  getSailingRegionLabel,
} from "@/lib/cruiseContextOptions";

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
  } = useStore();

  const {
    hydrated,
    ready,
  } = useWizardRouteGuard(
    "people"
  );

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

  const economicCurrency =
    data.onboardCurrency
      ?.trim()
      .toUpperCase() ||
    cruiseLine.currency;

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

      sailingRegion:
        data.sailingRegion ?? null,

      onboardCurrency:
        data.onboardCurrency ?? null,

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
    getTotalDrinksPerDay(
      data
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

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="font-medium text-slate-600">
          Comprobando los datos de tu análisis...
        </p>
      </main>
    );
  }

  return (
    <main className="brand-ocean-bg min-h-screen px-4 py-6 pb-24 sm:px-6 sm:py-10 sm:pb-10">
      <div className="dark-app-surface mx-auto w-full max-w-2xl rounded-2xl p-5 sm:p-10">
        <WizardBrand />
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

          <dl className="mt-4 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-slate-500">
                Mercado de la reserva
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">
                {getMarketLabel(data.market)}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-slate-500">
                Región de navegación
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">
                {getSailingRegionLabel(data.sailingRegion)}
              </dd>
            </div>
          </dl>
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

              <p className="mt-2 text-base font-bold leading-6 text-slate-900 sm:text-lg">
                {data.adults} {data.adults === 1 ? "adulto" : "adultos"}
                {data.minors > 0 && (
                  <> · {data.minors} {data.minors === 1 ? "menor" : "menores"}</>
                )}
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
                  customPrice !== null;

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
                    ? customPrice.price
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
                                hasCustomPrice
                                  ? customPrice.currency
                                  : cruiseLine.currency
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

        {/* PRECIOS DE BEBIDAS */}

        <section className="mt-4 rounded-2xl border border-slate-200 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900">
                🥤 Precios de bebidas
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Precios individuales seleccionados y su uso en el cálculo.
              </p>
            </div>

            <Link
              href="/wizard/prices"
              className="shrink-0 text-sm font-semibold text-sky-700 hover:text-sky-900"
            >
              Editar
            </Link>
          </div>

          {Object.keys(
            data.selectedDrinkPrices
          ).length > 0 ? (
            <div className="mt-4 space-y-3">
              {Object.entries(
                data.selectedDrinkPrices
              ).map(
                ([
                  category,
                  selectedPrice,
                ]) => {
                  if (!selectedPrice) {
                    return null;
                  }

                  const drink =
                    drinks.find(
                      (item) =>
                        item.label ===
                        ({
                          coffee: "Café",
                          water: "Agua",
                          soda: "Refrescos",
                          beer: "Cerveza",
                          wine: "Vino",
                          cocktail: "Cócteles",
                        } as Record<
                          string,
                          string
                        >)[category]
                    );

                  const sourceLabel =
                    selectedPrice.source ===
                    "official"
                      ? "Información oficial"
                      : selectedPrice.source ===
                        "documented-menu"
                      ? "Información documentada"
                      : "Precio introducido por ti";

                  const relevanceLabel =
                    selectedPrice.source ===
                      "documented-menu" &&
                    selectedPrice.contextRelevance ===
                      "exact"
                      ? "Contexto coincidente"
                      : selectedPrice.source ===
                          "documented-menu" &&
                        selectedPrice.contextRelevance ===
                          "compatible"
                      ? "Compatible · faltan datos"
                      : null;

                  const isEconomicallyUsable =
                    resolveEconomicDrinkPriceForCurrency(
                      selectedPrice,
                      economicCurrency
                    ) !== null;

                  return (
                    <div
                      key={category}
                      className="rounded-xl bg-slate-50 p-3 sm:p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800">
                            {drink?.icon ??
                              "🥤"}{" "}
                            {drink?.label ??
                              category}
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {sourceLabel}
                          </p>

                          {relevanceLabel ? (
                            <p
                              className={`mt-1 text-xs font-medium ${
                                selectedPrice.contextRelevance ===
                                "exact"
                                  ? "text-emerald-700"
                                  : "text-amber-700"
                              }`}
                            >
                              {relevanceLabel}
                            </p>
                          ) : null}

                          <p
                            className={`mt-1 text-xs font-semibold ${
                              isEconomicallyUsable
                                ? "text-emerald-700"
                                : "text-amber-700"
                            }`}
                          >
                            {isEconomicallyUsable
                              ? "Apto para el cálculo económico"
                              : "Solo informativo · no participa todavía en el cálculo económico"}
                          </p>
                        </div>

                        <p className="shrink-0 font-bold text-slate-900">
                          {formatCurrency(
                            selectedPrice.price,
                            selectedPrice.currency
                          )}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-5 text-slate-500">
              No has indicado precios individuales de bebidas.
            </p>
          )}
        </section>

        {/* CONFIRMACIÓN */}

        <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900 sm:mt-6">
          💡 Todo listo. DrinkPilot solo
          incorporará al cálculo los
          precios con moneda y evidencia
          compatibles. Las demás
          referencias se conservarán como
          información, sin alterar los
          importes.
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
