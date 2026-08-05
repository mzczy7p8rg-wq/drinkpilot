"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import ProgressBar from "@/components/ProgressBar";

import {
  getCruiseLine,
} from "@/data/cruiseLines";

import {
  getAllPackages,
} from "@/lib/packageService";

import {
  useStore,
} from "@/lib/store";

type PriceValidation = {
  valid: boolean;
  value: number | null;
  error: string | null;
  warning: string | null;
};

function validateOptionalPrice(
  rawValue: string,
  highPriceThreshold: number
): PriceValidation {
  const trimmed =
    rawValue.trim();

  if (trimmed === "") {
    return {
      valid: true,
      value: null,
      error: null,
      warning: null,
    };
  }

  const parsed =
    Number(trimmed);

  if (
    !Number.isFinite(parsed)
  ) {
    return {
      valid: false,
      value: null,
      error:
        "Introduce un precio válido.",
      warning: null,
    };
  }

  if (parsed <= 0) {
    return {
      valid: false,
      value: null,
      error:
        "El precio debe ser mayor que 0.",
      warning: null,
    };
  }

  if (
    parsed >
    highPriceThreshold
  ) {
    return {
      valid: true,
      value: parsed,
      error: null,
      warning:
        "Este precio parece bastante alto. Puedes continuar si es el importe real que aparece en tu reserva.",
    };
  }

  return {
    valid: true,
    value: parsed,
    error: null,
    warning: null,
  };
}

function getHighPriceThreshold(
  referencePrice:
    number | null
): number {
  /*
   * Si existe referencia permitimos
   * un margen amplio antes de mostrar
   * aviso.
   *
   * Si no existe referencia usamos
   * un límite visual conservador.
   *
   * El aviso NO bloquea continuar.
   */
  if (
    typeof referencePrice ===
      "number" &&
    Number.isFinite(
      referencePrice
    ) &&
    referencePrice > 0
  ) {
    return Math.max(
      100,
      referencePrice * 2.5
    );
  }

  return 100;
}

function getCurrencySymbol(
  currency: string
): string {
  try {
    const parts =
      new Intl.NumberFormat(
        "es-ES",
        {
          style: "currency",
          currency,
          currencyDisplay:
            "narrowSymbol",
        }
      ).formatToParts(0);

    return (
      parts.find(
        (part) =>
          part.type ===
          "currency"
      )?.value ?? currency
    );
  } catch {
    return currency;
  }
}

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

export default function PricesPage() {
  const {
    data,
    setData,
  } = useStore();

  /*
   * NAVIERA ACTIVA
   */
  const cruiseLine =
    getCruiseLine(
      data.cruiseLine
    );

  /*
   * PAQUETES DINÁMICOS
   *
   * La página ya no conoce
   * packageKeys concretos.
   */
  const packages =
    getAllPackages(
      data.cruiseLine
    );

  const currencySymbol =
    getCurrencySymbol(
      cruiseLine.currency
    );

  /*
   * Estado visual de inputs.
   *
   * packageKey -> texto introducido
   */
  const [
    priceInputs,
    setPriceInputs,
  ] = useState<
    Record<string, string>
  >(() => {
    return Object.fromEntries(
      packages.map(
        (pkg) => {
          const storedPrice =
            data.customPackagePrices[
              pkg.key
            ];

          return [
            pkg.key,

            typeof storedPrice ===
              "number" &&
            Number.isFinite(
              storedPrice
            ) &&
            storedPrice > 0
              ? String(
                  storedPrice
                )
              : "",
          ];
        }
      )
    );
  });

  /*
   * Validación dinámica por paquete.
   */
  const validations =
    Object.fromEntries(
      packages.map(
        (pkg) => [
          pkg.key,

          validateOptionalPrice(
            priceInputs[
              pkg.key
            ] ?? "",

            getHighPriceThreshold(
              pkg.pricePerDay
            )
          ),
        ]
      )
    ) as Record<
      string,
      PriceValidation
    >;

  const canContinue =
    Object.values(
      validations
    ).every(
      (validation) =>
        validation.valid
    );

  function updatePriceInput(
    packageKey: string,
    value: string
  ) {
    setPriceInputs(
      (previous) => ({
        ...previous,

        [packageKey]:
          value,
      })
    );
  }

  function savePrices() {
    if (!canContinue) {
      return;
    }

    const nextPrices =
      Object.fromEntries(
        packages.map(
          (pkg) => [
            pkg.key,

            validations[
              pkg.key
            ]?.value ??
              null,
          ]
        )
      );

    setData(
      (previous) => ({
        ...previous,

        customPackagePrices: {
          ...previous
            .customPackagePrices,

          ...nextPrices,
        },
      })
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-5 shadow-lg sm:p-10">
        <ProgressBar
          currentStep={4}
          totalSteps={6}
        />

        {/* CABECERA */}

        <div className="mt-2 sm:mt-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Paso 4 de 6
          </p>

          <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            ¿Tienes el precio de tu
            reserva?
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Si{" "}
            <strong>
              {cruiseLine.name}
            </strong>{" "}
            ya te muestra un precio
            para sus paquetes,
            introdúcelo aquí para
            mejorar la precisión del
            análisis.
          </p>
        </div>

        {/* EXPLICACIÓN */}

        <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-sky-900 sm:mt-6">
          💡 Este paso es opcional.
          Los paquetes con precio de
          referencia pueden utilizarlo
          cuando no introduces el
          precio de tu reserva. Los
          paquetes sin referencia fiable
          solo podrán entrar en la
          comparación económica cuando
          proporciones un precio real.
        </div>

        {/* PAQUETES */}

        <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
          {packages.map(
            (pkg) => {
              const validation =
                validations[
                  pkg.key
                ];

              const inputValue =
                priceInputs[
                  pkg.key
                ] ?? "";

              const hasReferencePrice =
                typeof pkg.pricePerDay ===
                  "number" &&
                Number.isFinite(
                  pkg.pricePerDay
                ) &&
                pkg.pricePerDay >
                  0;

              const requiresUserPrice =
                pkg.economicActivation ===
                "user-price-only";

              const isEconomicallyDisabled =
                pkg.economicActivation ===
                "disabled";

              const inputId =
                `package-price-${pkg.key}`;

              return (
                <div
                  key={
                    pkg.key
                  }
                  className={`rounded-2xl border p-4 sm:p-5 ${
                    requiresUserPrice
                      ? "border-sky-200 bg-sky-50/50"
                      : "border-slate-200"
                  }`}
                >
                  {/* CABECERA PAQUETE */}

                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <label
                        htmlFor={
                          inputId
                        }
                        className="block text-base font-semibold text-slate-900 sm:text-lg"
                      >
                        {
                          pkg.icon
                        }{" "}
                        {
                          pkg.name
                        }
                      </label>

                      <p className="mt-1 text-sm text-slate-500">
                        Precio por
                        persona y día
                      </p>
                    </div>

                    {!hasReferencePrice ? (
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                        Sin precio de
                        referencia
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        Referencia{" "}
                        {formatCurrency(
                          pkg.pricePerDay as number,
                          cruiseLine.currency
                        )}{" "}
                        / día
                      </span>
                    )}
                  </div>

                  {/* INPUT / ESTADO DESHABILITADO */}

                  {isEconomicallyDisabled ? (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-100 p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xl">
                          ℹ️
                        </span>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            No incluido en el análisis adulto
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            Este paquete está registrado para mostrar su existencia y cobertura, pero no participa actualmente en la comparación económica de adultos.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative mt-3">
                      <input
                        id={
                          inputId
                        }
                        type="number"
                        min="0.01"
                        step="0.01"
                        inputMode="decimal"
                        value={
                          inputValue
                        }
                        onChange={(
                          event
                        ) =>
                          updatePriceInput(
                            pkg.key,
                            event
                              .target
                              .value
                          )
                        }
                        placeholder={
                          hasReferencePrice
                            ? `Ej. ${(
                                pkg.pricePerDay as number
                              ).toFixed(
                                2
                              )}`
                            : "Introduce el precio"
                        }
                        className={`w-full rounded-xl border bg-white px-4 py-4 pr-14 text-lg font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 ${
                          validation
                            ?.error
                            ? "border-red-300 focus:ring-2 focus:ring-red-400"
                            : "border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
                        }`}
                      />

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">
                        {
                          currencySymbol
                        }
                      </span>
                    </div>
                  )}

                  {/* ERROR */}

                  {!isEconomicallyDisabled &&
                    validation
                      ?.error && (
                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
                      <p className="text-sm font-medium text-red-700">
                        {
                          validation.error
                        }
                      </p>
                    </div>
                  )}

                  {/* WARNING */}

                  {!isEconomicallyDisabled &&
                    validation
                      ?.warning && (
                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                      <p className="text-sm font-medium leading-6 text-amber-800">
                        ⚠️{" "}
                        {
                          validation.warning
                        }
                      </p>
                    </div>
                  )}

                  {/* AYUDA */}

                  {!isEconomicallyDisabled &&
                    !validation
                      ?.error &&
                    !validation
                      ?.warning && (
                      <>
                        {requiresUserPrice ? (
                          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                            <p className="text-xs leading-5 text-slate-600">
                              Si queda
                              vacío, este
                              paquete
                              continuará
                              fuera de la
                              comparación
                              económica
                              porque no
                              dispone de
                              una
                              referencia
                              suficientemente
                              fiable.
                            </p>
                          </div>
                        ) : hasReferencePrice ? (
                          <p className="mt-3 text-xs leading-5 text-slate-500">
                            Si queda
                            vacío,
                            DrinkPilot
                            utilizará{" "}
                            {formatCurrency(
                              pkg.pricePerDay as number,
                              cruiseLine.currency
                            )}{" "}
                            / día como
                            referencia.
                          </p>
                        ) : (
                          <p className="mt-3 text-xs leading-5 text-slate-500">
                            No existe un
                            precio de
                            referencia
                            disponible
                            para este
                            paquete.
                          </p>
                        )}
                      </>
                    )}

                  {/* NOTA DE DATOS */}

                  {pkg.priceNote && (
                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      {
                        pkg.priceNote
                      }
                    </p>
                  )}
                </div>
              );
            }
          )}
        </div>

        {/* PRIVACIDAD / PRIORIDAD */}

        <div className="mt-6 rounded-xl bg-slate-100 p-4 text-sm leading-6 text-slate-600 sm:mt-8">
          Los precios que
          introduzcas se utilizarán
          únicamente para este análisis
          y tendrán prioridad sobre los
          valores de referencia
          disponibles.
        </div>

        {/* NAVEGACIÓN */}

        <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4">
          <Link
            href="/wizard/preferences"
            className="rounded-xl border border-slate-300 px-3 py-4 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:text-base"
          >
            Atrás
          </Link>

          {canContinue ? (
            <Link
              href="/wizard/people"
              onClick={
                savePrices
              }
              className="rounded-xl bg-sky-600 px-3 py-4 text-center text-sm font-semibold text-white transition hover:bg-sky-700 active:bg-sky-800 sm:text-base"
            >
              Continuar
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-xl bg-slate-300 px-3 py-4 text-center text-sm font-semibold text-slate-500 sm:text-base"
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </main>
  );
}