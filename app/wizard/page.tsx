"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";

import {
  getAllCruiseLines,
} from "@/data/cruiseLines";

import {
  isIsoSailingDate,
  type CruiseContext,
} from "@/lib/cruiseContext";

import {
  resolveSelectedDrinkPricesAfterCruiseLineChange,
  resolveSelectedDrinkPricesForCruiseContext,
} from "@/lib/selectedDrinkPriceContext";

import {
  useStore,
} from "@/lib/store";

import {
  MAX_CRUISE_DAYS,
  isValidCruiseDays,
} from "@/lib/wizardNumberValidation";
import {
  marketOptions,
  sailingRegionOptions,
} from "@/lib/cruiseContextOptions";

import ProgressBar from "@/components/ProgressBar";
import { WizardBrand } from "@/components/Brand";

function WizardForm() {
  const router =
    useRouter();

  const {
    data,
    setData,
  } = useStore();

  const cruiseLines =
    getAllCruiseLines();

  const [
    selectedCruiseLine,
    setSelectedCruiseLine,
  ] = useState(
    data.cruiseLine
  );

  const [
    showCruiseChangeNotice,
    setShowCruiseChangeNotice,
  ] = useState(false);

  const [
    days,
    setDays,
  ] = useState(
    data.days > 0
      ? String(
          data.days
        )
      : ""
  );

  /*
   * FECHA DE SALIDA
   *
   * Sigue siendo opcional.
   *
   * Cuando exista podremos utilizarla
   * para resolver reglas dependientes
   * de la fecha de navegación.
   */
  const [
    sailingDate,
    setSailingDate,
  ] = useState(
    data.sailingDate ?? ""
  );

  const [market, setMarket] = useState(
    data.market ?? ""
  );

  const [sailingRegion, setSailingRegion] = useState(
    data.sailingRegion ?? ""
  );

  const parsedDays =
    Number(days);

  const isValidDays =
    days.trim() !== "" &&
    isValidCruiseDays(
      parsedDays
    );

  /*
   * Vacío = válido porque todavía
   * permitimos continuar sin fecha.
   */
  const isValidSailingDate =
    sailingDate === "" ||
    isIsoSailingDate(
      sailingDate
    );

  const isValid =
    Boolean(
      selectedCruiseLine
    ) &&
    isValidDays &&
    isValidSailingDate;

  function handleContinue() {
    if (!isValid) {
      return;
    }

    setData(
      (previous) => {
        /*
         * Si el usuario cambia de naviera,
         * borramos precios personalizados
         * antiguos para evitar mezclar
         * packageKeys de compañías
         * diferentes.
         */
        const cruiseLineChanged =
          previous.cruiseLine !==
          selectedCruiseLine;

        const nextCruiseContext:
          CruiseContext = {
          cruiseLine:
            selectedCruiseLine,

          /*
           * Todavía no inferimos el mercado
           * de la reserva a partir de la
           * naviera.
           *
           * El market de cruiseLines es
           * informativo y no necesariamente
           * coincide con el mercado real
           * de compra del usuario.
           */
          market:
            market === ""
              ? null
              : market,

          sailingRegion:
            sailingRegion === ""
              ? null
              : sailingRegion,

          onboardCurrency:
            cruiseLineChanged
              ? null
              : previous.onboardCurrency,

          sailingDate:
            sailingDate === ""
              ? null
              : sailingDate,
        };

        const pricesAfterCruiseLineChange =
          resolveSelectedDrinkPricesAfterCruiseLineChange({
            previousCruiseLine:
              previous.cruiseLine,

            nextCruiseLine:
              selectedCruiseLine,

            selectedDrinkPrices:
              previous.selectedDrinkPrices,
          });

        return {
          ...previous,

          ...nextCruiseContext,

          days:
            parsedDays,

          /*
           * El consumo pertenece al análisis
           * realizado para la naviera activa.
           *
           * Al cambiar de compañía no debemos
           * arrastrarlo al nuevo contexto.
           */
          ...(cruiseLineChanged
            ? {
                coffee: 0,
                water: 0,
                soda: 0,
                beer: 0,
                wine: 0,
                cocktail: 0,

                alcoholicCocktail:
                  null,

                nonAlcoholicCocktail:
                  null,
              }
            : {}),

          customPackagePrices:
            cruiseLineChanged
              ? {}
              : previous
                  .customPackagePrices,

          packagePriceCurrency:
            cruiseLineChanged
              ? null
              : previous
                  .packagePriceCurrency,

          selectedDrinkPrices:
            resolveSelectedDrinkPricesForCruiseContext({
              cruiseContext:
                nextCruiseContext,

              selectedDrinkPrices:
                pricesAfterCruiseLineChange,
            }),
        };
      }
    );

    router.push(
      "/wizard/consumption"
    );
  }

  return (
    <main className="brand-ocean-bg min-h-screen px-3 py-3 sm:px-6 sm:py-8 lg:flex lg:items-center lg:justify-center">
      <div className="dark-app-surface mx-auto w-full max-w-6xl overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]">
        <div className="px-5 pt-5 sm:px-8 sm:pt-7">
          <WizardBrand />
        </div>

        <div className="grid lg:grid-cols-[13rem_minmax(0,1fr)]">
          <aside className="hidden border-r border-slate-200/80 bg-sky-50/70 px-5 py-8 lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Tu análisis
            </p>

            <ol className="mt-5 grid gap-1" aria-label="Progreso del análisis">
              {["Viajeros", "Crucero", "Consumo", "Preferencias", "Precios", "Revisión"].map(
                (step, index) => {
                  const stepNumber = index + 1;
                  const isCurrent = stepNumber === 2;
                  const isComplete = stepNumber < 2;

                  return (
                    <li
                      key={step}
                      aria-current={isCurrent ? "step" : undefined}
                    >
                      <Link
                        href={isComplete ? "/wizard/people" : "#"}
                        aria-disabled={!isComplete}
                        onClick={(event) => {
                          if (!isComplete) {
                            event.preventDefault();
                          }
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                          isCurrent
                            ? "bg-white font-semibold text-slate-900 shadow-sm"
                            : isComplete
                              ? "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                              : "cursor-default text-slate-500"
                        }`}
                      >
                        <span
                          className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-bold ${
                            isCurrent
                              ? "bg-sky-600 text-white shadow-sm shadow-sky-200"
                              : isComplete
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-200/80 text-slate-500"
                          }`}
                        >
                          {isComplete ? "✓" : stepNumber}
                        </span>
                        {step}
                      </Link>
                    </li>
                  );
                }
              )}
            </ol>
          </aside>

          <div className="px-5 pb-7 sm:px-10 sm:pb-10 lg:px-14 lg:pb-12">
            <div className="lg:hidden">
              <ProgressBar
                currentStep={2}
                totalSteps={6}
              />
            </div>

        {/* CABECERA */}

        <div className="mt-2 max-w-3xl sm:mt-0 lg:mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">
            Paso 2 de 6 · Tu crucero
          </p>

          <h1 className="mt-3 text-3xl font-bold leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-5xl">
            ¿Con quién navegas?
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
            Elige la naviera y añade solo los datos que conozcas.
            DrinkPilot ajustará el análisis sin asumir información.
          </p>
        </div>

        {/* NAVIERA */}

        <section className="mt-7 sm:mt-8">
          <p
            id="cruise-line-label"
            className="text-sm font-semibold text-slate-700"
          >
            Naviera
          </p>

          <div
            role="group"
            aria-labelledby="cruise-line-label"
            className="mt-3 grid gap-3 sm:grid-cols-2"
          >
            {cruiseLines.map(
              (cruiseLine) => {
                const isSelected =
                  selectedCruiseLine ===
                  cruiseLine.id;

                const hasCompletePrices =
                  Object.values(
                    cruiseLine
                      .onboardPriceValues
                  ).every(
                    (price) =>
                      typeof price ===
                        "number" &&
                      Number.isFinite(
                        price
                      ) &&
                      price > 0
                  );

                return (
                  <button
                    key={
                      cruiseLine.id
                    }
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      if (
                        selectedCruiseLine !== cruiseLine.id
                      ) {
                        setShowCruiseChangeNotice(true);
                      }

                      setSelectedCruiseLine(
                        cruiseLine.id
                      );
                    }}
                    className={`relative min-h-40 rounded-2xl border p-5 text-left transition duration-200 ${
                      isSelected
                        ? "border-sky-400 bg-gradient-to-br from-sky-50 to-cyan-50/60 shadow-[0_12px_30px_rgba(14,165,233,0.12)] ring-1 ring-sky-200"
                        : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">
                          🚢{" "}
                          {
                            cruiseLine.name
                          }
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Región de
                          referencia:{" "}
                          {
                            cruiseLine.market
                          }
                        </p>
                      </div>

                      <span
                        className={`grid h-7 min-w-7 place-items-center rounded-full px-2 text-xs font-semibold ${
                          isSelected
                            ? "bg-sky-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isSelected
                          ? "✓"
                          : "Elegir"}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-xs leading-5">
                      <p className="flex items-center gap-2 font-medium text-emerald-700">
                        <span aria-hidden="true">✓</span>
                        Información del paquete disponible
                      </p>

                      <p
                        className={`flex items-center gap-2 font-medium ${
                          hasCompletePrices
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }`}
                      >
                        <span aria-hidden="true">
                          {hasCompletePrices ? "✓" : "!"}
                        </span>

                        {hasCompletePrices
                          ? "Precios disponibles"
                          : "Algunos precios están pendientes"}
                      </p>
                    </div>
                  </button>
                );
              }
            )}
          </div>

          {showCruiseChangeNotice && (
            <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/80 p-4 text-sm leading-6 text-sky-900">
              💡 Has cambiado de naviera. Mantendremos tus preferencias
              y actualizaremos los datos propios del crucero.
            </div>
          )}
        </section>

        {/* DURACIÓN */}

        <section className="mt-7 sm:max-w-sm">
          <label
            htmlFor="cruiseDays"
            className="text-sm font-semibold text-slate-700"
          >
            Duración del crucero
          </label>

          <div className="relative mt-2">
            <input
              id="cruiseDays"
              type="number"
              min="1"
              max={MAX_CRUISE_DAYS}
              step="1"
              inputMode="numeric"
              value={
                days
              }
              aria-invalid={days !== "" && !isValidDays}
              aria-describedby={
                days !== "" && !isValidDays
                  ? "cruiseDaysError"
                  : undefined
              }
              onChange={(
                event
              ) =>
                setDays(
                  event.target.value
                )
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                    "Enter" &&
                  isValid
                ) {
                  handleContinue();
                }
              }}
              placeholder="Ej. 7"
              className={`w-full rounded-2xl border bg-white px-4 py-4 pr-20 text-xl font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 ${
                days !== "" &&
                !isValidDays
                  ? "border-red-300 focus:ring-2 focus:ring-red-400"
                  : "border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
              }`}
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
              días
            </span>
          </div>

          {days !== "" &&
            !isValidDays && (
              <p
                id="cruiseDaysError"
                className="mt-3 text-sm font-medium text-red-600"
              >
                Introduce un número
                entero de días entre 1
                y {MAX_CRUISE_DAYS}.
              </p>
            )}
        </section>

        {/* CONTEXTO OPCIONAL */}

        <section className="mt-8 border-t border-slate-200 pt-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">
                Datos del crucero
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Nos ayudan a ajustar mejor el análisis.
              </p>
            </div>

            <span className="text-xs font-medium text-slate-400">
              Opcional
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label
                htmlFor="bookingMarket"
                className="text-sm font-semibold text-slate-700"
              >
                Mercado de la reserva
              </label>

              <select
                id="bookingMarket"
                value={market}
                onChange={(event) => setMarket(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
              >
                <option value="">No lo sé</option>
                {marketOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="sailingRegion"
                className="text-sm font-semibold text-slate-700"
              >
                Región de navegación
              </label>

              <select
                id="sailingRegion"
                value={sailingRegion}
                onChange={(event) => setSailingRegion(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
              >
                <option value="">No lo sé</option>
                {sailingRegionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* FECHA DE SALIDA */}

        <section className="mt-6 max-w-sm">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="sailingDate"
              className="text-sm font-semibold text-slate-700"
            >
              Fecha de salida
            </label>

            <span className="text-xs font-medium text-slate-400">
              Opcional
            </span>
          </div>

          <input
            id="sailingDate"
            type="date"
            value={
              sailingDate
            }
            onChange={(
              event
            ) =>
              setSailingDate(
                event.target.value
              )
            }
            className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3.5 text-base font-semibold text-slate-900 outline-none transition ${
              !isValidSailingDate
                ? "border-red-300 focus:ring-2 focus:ring-red-400"
                : "border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
            }`}
          />

          {sailingDate !== "" && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setSailingDate("")}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 active:bg-sky-100"
              >
                Quitar fecha
              </button>
            </div>
          )}

          {!isValidSailingDate && (
            <p className="mt-3 text-sm font-medium text-red-600">
              Introduce una fecha de
              salida válida.
            </p>
          )}

          <div className="mt-4 rounded-2xl bg-sky-50/70 p-4">
            <p className="text-sm leading-6 text-slate-600">
              💡 La fecha nos permitirá
              aplicar correctamente
              condiciones que puedan
              cambiar según la temporada
              o versión del paquete.
              Puedes dejarla vacía si
              todavía no la conoces.
            </p>
          </div>
        </section>

        {/* CONTINUAR */}

        <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:justify-end">
          <Link
            href="/wizard/people"
            className="rounded-2xl border border-slate-300 px-5 py-4 text-center text-base font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Atrás
          </Link>

          <button
            type="button"
            disabled={
              !isValid
            }
            onClick={
              handleContinue
            }
            className={`rounded-2xl px-5 py-4 text-center text-base font-semibold shadow-sm transition sm:min-w-48 sm:px-8 ${
              isValid
                ? "bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-sky-200 hover:from-sky-700 hover:to-cyan-600 active:from-sky-800"
                : "cursor-not-allowed bg-slate-300 text-slate-500"
            }`}
          >
            Continuar →
          </button>
        </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function WizardPage() {
  const { hydrated } =
    useStore();

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="font-medium text-slate-600">
          Recuperando tu análisis...
        </p>
      </main>
    );
  }

  return <WizardForm />;
}
