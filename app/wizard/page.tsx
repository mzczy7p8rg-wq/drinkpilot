"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

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
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-5 shadow-lg sm:p-10">
        <ProgressBar
          currentStep={1}
          totalSteps={6}
        />

        {/* CABECERA */}

        <div className="mt-2 sm:mt-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Paso 1 de 6
          </p>

          <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            Cuéntanos tu crucero
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Selecciona tu naviera,
            introduce la duración y añade
            el contexto que conozcas de tu
            reserva y navegación.
          </p>
        </div>

        {/* NAVIERA */}

        <section className="mt-7 sm:mt-8">
          <p className="text-sm font-semibold text-slate-700">
            Naviera
          </p>

          <div className="mt-3 grid gap-3">
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
                    className={`rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
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
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isSelected
                            ? "bg-sky-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isSelected
                          ? "Seleccionada"
                          : "Seleccionar"}
                      </span>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-slate-600">
                      {hasCompletePrices
                        ? "Comparación económica y cobertura disponibles."
                        : "Cobertura disponible. La comparación económica puede estar limitada por datos de precios pendientes."}
                    </p>
                  </button>
                );
              }
            )}
          </div>

          {showCruiseChangeNotice && (
            <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
              💡 Cambio de naviera

              <br />

              Tus preferencias personales se mantienen.

              <br />

              Al continuar actualizaremos únicamente los datos específicos del crucero:
              <br />
              • consumo de bebidas
              <br />
              • precios personalizados
              <br />
              • condiciones del paquete
            </div>
          )}
        </section>

        {/* DURACIÓN */}

        <section className="mt-7">
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
              className={`w-full rounded-xl border bg-white px-4 py-4 pr-20 text-xl font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 ${
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

        <section className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">
                Contexto del crucero
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Ayuda a aplicar condiciones específicas sin deducir datos de la naviera.
              </p>
            </div>

            <span className="text-xs font-medium text-slate-400">
              Opcional
            </span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
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
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
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

        <section className="mt-7">
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
            className={`mt-2 w-full rounded-xl border bg-white px-4 py-4 text-base font-semibold text-slate-900 outline-none transition ${
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

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
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

        <button
          type="button"
          disabled={
            !isValid
          }
          onClick={
            handleContinue
          }
          className={`mt-7 w-full rounded-xl py-4 text-center text-base font-semibold transition sm:mt-8 ${
            isValid
              ? "bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800"
              : "cursor-not-allowed bg-slate-300 text-slate-500"
          }`}
        >
          Continuar
        </button>
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
