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

import {
  onboardPriceKeys,
  type OnboardPriceKey,
} from "@/lib/onboardPriceService";

import {
  createSelectedDrinkPrice,
} from "@/lib/selectedDrinkPrice";

import {
  resolveDrinkPriceSelectionSource,
} from "@/lib/drinkPriceSelectionSource";

import {
  getMscSpecificDrinkPrices,
} from "@/lib/mscSpecificDrinkPriceService";

import {
  getMscDocumentedDrinkPrices,
  resolveMscDocumentedDrinkPriceSelectionForContext,
} from "@/lib/mscDocumentedDrinkPriceService";

const drinkCategoryLabels:
  Record<OnboardPriceKey, string> = {
    coffee: "Café",
    water: "Agua",
    soda: "Refresco",
    beer: "Cerveza",
    wine: "Vino",
    cocktail: "Cóctel",
  };

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
   * Los precios concretos de bebidas
   * deben expresarse en la moneda real
   * utilizada a bordo.
   *
   * Si todavía no la conocemos, no
   * inventamos una a partir del mercado.
   */
  const selectedDrinkCurrency =
    data.onboardCurrency ?? null;

  const selectedDrinkCurrencySymbol =
    selectedDrinkCurrency
      ? getCurrencySymbol(
          selectedDrinkCurrency
        )
      : null;

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
   * Estado visual de precios concretos
   * de bebidas.
   */
  const [
    drinkPriceInputs,
    setDrinkPriceInputs,
  ] = useState<
    Record<OnboardPriceKey, string>
  >(() => {
    return Object.fromEntries(
      onboardPriceKeys.map(
        (category) => {
          const storedPrice =
            data.selectedDrinkPrices[
              category
            ];

          return [
            category,
            storedPrice
              ? String(
                  storedPrice.price
                )
              : "",
          ];
        }
      )
    ) as Record<
      OnboardPriceKey,
      string
    >;
  });

  const [
    selectedDrinkReferenceIds,
    setSelectedDrinkReferenceIds,
  ] = useState<
    Partial<Record<OnboardPriceKey, string>>
  >({});

  const [
    selectedDrinkReferenceSources,
    setSelectedDrinkReferenceSources,
  ] = useState<
    Partial<
      Record<
        OnboardPriceKey,
        "official" | "documented-menu"
      >
    >
  >({});

  const drinkPriceValidations =
    Object.fromEntries(
      onboardPriceKeys.map(
        (category) => [
          category,
          validateOptionalPrice(
            drinkPriceInputs[
              category
            ] ?? "",
            100
          ),
        ]
      )
    ) as Record<
      OnboardPriceKey,
      PriceValidation
    >;

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

  const packagePricesValid =
    Object.values(
      validations
    ).every(
      (validation) =>
        validation.valid
    );

  const drinkPricesValid =
    Object.values(
      drinkPriceValidations
    ).every(
      (validation) =>
        validation.valid
    );

  const canContinue =
    packagePricesValid &&
    drinkPricesValid;

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

  function updateDrinkPriceInput(
    category: OnboardPriceKey,
    value: string
  ) {
    setDrinkPriceInputs(
      (previous) => ({
        ...previous,

        [category]:
          value,
      })
    );

    setSelectedDrinkReferenceIds(
      (previous) => {
        const next = {
          ...previous,
        };

        delete next[category];

        return next;
      }
    );

    setSelectedDrinkReferenceSources(
      (previous) => {
        const next = {
          ...previous,
        };

        delete next[category];

        return next;
      }
    );
  }

  function selectOfficialDrinkReference(
    category: OnboardPriceKey,
    referenceId: string,
    price: number
  ) {
    setDrinkPriceInputs(
      (previous) => ({
        ...previous,

        [category]:
          String(price),
      })
    );

    setSelectedDrinkReferenceIds(
      (previous) => ({
        ...previous,

        [category]:
          referenceId,
      })
    );

    setSelectedDrinkReferenceSources(
      (previous) => ({
        ...previous,

        [category]:
          "official",
      })
    );
  }

  function selectDocumentedDrinkReference(
    category: OnboardPriceKey,
    referenceId: string,
    price: number
  ) {
    setDrinkPriceInputs(
      (previous) => ({
        ...previous,

        [category]:
          String(price),
      })
    );

    setSelectedDrinkReferenceIds(
      (previous) => ({
        ...previous,

        [category]:
          referenceId,
      })
    );

    setSelectedDrinkReferenceSources(
      (previous) => ({
        ...previous,

        [category]:
          "documented-menu",
      })
    );
  }

  function updateOnboardCurrency(
    currency:
      "" | "EUR" | "USD"
  ) {
    const nextCurrency =
      currency === ""
        ? null
        : currency;

    if (
      nextCurrency ===
      data.onboardCurrency
    ) {
      return;
    }

    setData(
      (previous) => ({
        ...previous,

        onboardCurrency:
          nextCurrency,

        /*
         * Un precio concreto depende de su
         * moneda. Si cambia la moneda,
         * descartamos selecciones anteriores
         * para no reinterpretar importes.
         */
        selectedDrinkPrices:
          {},
      })
    );

    setDrinkPriceInputs(
      Object.fromEntries(
        onboardPriceKeys.map(
          (category) => [
            category,
            "",
          ]
        )
      ) as Record<
        OnboardPriceKey,
        string
      >
    );

    setSelectedDrinkReferenceIds(
      {}
    );

    setSelectedDrinkReferenceSources(
      {}
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

    const nextSelectedDrinkPrices =
      Object.fromEntries(
        onboardPriceKeys.flatMap(
          (category) => {
            const validation =
              drinkPriceValidations[
                category
              ];

            if (
              validation.value === null ||
              selectedDrinkCurrency ===
                null
            ) {
              return [];
            }

            const existingPrice =
              data.selectedDrinkPrices[
                category
              ];

            const selectedPrice =
              createSelectedDrinkPrice({
                category,

                price:
                  validation.value,

                currency:
                  selectedDrinkCurrency,

                source:
                  resolveDrinkPriceSelectionSource(
                    selectedDrinkReferenceIds[
                      category
                    ],
                    selectedDrinkReferenceSources[
                      category
                    ] ?? "official"
                  ),
              });

            return selectedPrice
              ? [
                  [
                    category,
                    selectedPrice,
                  ],
                ]
              : [];
          }
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

        selectedDrinkPrices:
          nextSelectedDrinkPrices,
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


        {/* PRECIOS DE BEBIDAS SELECCIONADAS */}

        <section className="mt-8 border-t border-slate-200 pt-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
              Precisión adicional
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
              ¿Conoces el precio de alguna bebida a bordo?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              Es opcional. Si introduces el
              precio real de una bebida,
              DrinkPilot podrá comprobar si
              supera el límite de precio
              incluido por determinados
              paquetes.
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">
              Moneda utilizada a bordo
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Selecciona la moneda real que utiliza tu crucero.
              No la deducimos automáticamente del mercado o de
              la naviera.
            </p>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  updateOnboardCurrency(
                    "EUR"
                  )
                }
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  selectedDrinkCurrency ===
                  "EUR"
                    ? "border-sky-500 bg-sky-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-sky-300"
                }`}
              >
                EUR (€)
              </button>

              <button
                type="button"
                onClick={() =>
                  updateOnboardCurrency(
                    "USD"
                  )
                }
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  selectedDrinkCurrency ===
                  "USD"
                    ? "border-sky-500 bg-sky-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-sky-300"
                }`}
              >
                USD ($)
              </button>

              <button
                type="button"
                onClick={() =>
                  updateOnboardCurrency(
                    ""
                  )
                }
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  selectedDrinkCurrency ===
                  null
                    ? "border-slate-500 bg-slate-700 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                No lo sé
              </button>
            </div>
          </div>

          {selectedDrinkCurrency === null ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Para utilizar precios concretos
              de bebidas necesitamos conocer
              primero la moneda utilizada a
              bordo. No asumiremos una moneda
              automáticamente.
            </div>
          ) : (
            <>
              <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
                Introduce los precios en{" "}
                <strong>
                  {selectedDrinkCurrency}
                </strong>
                . Solo necesitamos las
                categorías que realmente
                conozcas.
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {onboardPriceKeys.map(
                  (category) => {
                    const validation =
                      drinkPriceValidations[
                        category
                      ];

                    const inputValue =
                      drinkPriceInputs[
                        category
                      ] ?? "";

                    const inputId =
                      `drink-price-${category}`;

                    const officialReferences =
                      data.cruiseLine === "msc" &&
                      category === "water" &&
                      selectedDrinkCurrency === "EUR"
                        ? getMscSpecificDrinkPrices(
                            category
                          ).filter(
                            (reference) =>
                              reference.currency ===
                              selectedDrinkCurrency
                          )
                        : [];

                    const documentedCurrency =
                      selectedDrinkCurrency === "EUR" ||
                      selectedDrinkCurrency === "USD"
                        ? selectedDrinkCurrency
                        : undefined;

                    const documentedReferences =
                      data.cruiseLine === "msc" &&
                      documentedCurrency
                        ? getMscDocumentedDrinkPrices({
                            category,
                            currency:
                              documentedCurrency,
                          })
                        : [];

                    const cruiseContext = {
                      cruiseLine:
                        data.cruiseLine,

                      market:
                        data.market,

                      sailingRegion:
                        data.sailingRegion,

                      onboardCurrency:
                        data.onboardCurrency,

                      sailingDate:
                        data.sailingDate,
                    };

                    const contextualDocumentedReferences =
                      documentedReferences
                        .map((reference) => {
                          const selection =
                            resolveMscDocumentedDrinkPriceSelectionForContext(
                              reference.id,
                              cruiseContext
                            );

                          return selection
                            ? {
                                reference,
                                contextRelevance:
                                  selection.contextRelevance,
                              }
                            : null;
                        })
                        .filter(
                          (
                            item
                          ): item is NonNullable<
                            typeof item
                          > => item !== null
                        )
                        .sort((left, right) => {
                          const relevanceOrder = {
                            exact: 0,
                            compatible: 1,
                            mismatch: 2,
                          } as const;

                          return (
                            relevanceOrder[
                              left.contextRelevance
                                .relevance
                            ] -
                            relevanceOrder[
                              right.contextRelevance
                                .relevance
                            ]
                          );
                        });

                    const selectedReferenceId =
                      selectedDrinkReferenceIds[
                        category
                      ];

                    return (
                      <div
                        key={category}
                        className="rounded-2xl border border-slate-200 p-4"
                      >

                        <label
                          htmlFor={inputId}
                          className="block text-sm font-semibold text-slate-900"
                        >
                          {
                            drinkCategoryLabels[
                              category
                            ]
                          }
                        </label>

                        {officialReferences.length > 0 ? (
                          <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">
                              Referencias oficiales MSC
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                              {officialReferences.map(
                                (reference) => {
                                  const isSelected =
                                    selectedReferenceId ===
                                    reference.id;

                                  return (
                                    <button
                                      key={reference.id}
                                      type="button"
                                      onClick={() =>
                                        selectOfficialDrinkReference(
                                          category,
                                          reference.id,
                                          reference.price
                                        )
                                      }
                                      className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                                        isSelected
                                          ? "border-sky-500 bg-sky-600 text-white"
                                          : "border-sky-200 bg-white text-sky-900 hover:border-sky-400"
                                      }`}
                                    >
                                      <span className="block font-semibold">
                                        {reference.productName}
                                      </span>

                                      <span
                                        className={`mt-1 block ${
                                          isSelected
                                            ? "text-sky-100"
                                            : "text-slate-500"
                                        }`}
                                      >
                                        {reference.format} ·{" "}
                                        {formatCurrency(
                                          reference.price,
                                          reference.currency
                                        )}
                                      </span>
                                    </button>
                                  );
                                }
                              )}
                            </div>

                            <p className="mt-2 text-xs leading-5 text-sky-800">
                              Puedes usar una referencia oficial o escribir tu precio real manualmente.
                            </p>
                          </div>
                        ) : null}

                        {contextualDocumentedReferences.some(
                          (item) =>
                            item.contextRelevance.relevance !==
                            "mismatch"
                        ) ? (
                          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                              Precios documentados en menús MSC
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                              {contextualDocumentedReferences
                                .filter(
                                  (item) =>
                                    item.contextRelevance
                                      .relevance !==
                                    "mismatch"
                                )
                                .map(
                                  ({
                                    reference,
                                    contextRelevance,
                                  }) => {
                                    const isSelected =
                                      selectedReferenceId ===
                                      reference.id;

                                    return (
                                      <button
                                        key={reference.id}
                                        type="button"
                                        onClick={() =>
                                          selectDocumentedDrinkReference(
                                            category,
                                            reference.id,
                                            reference.price
                                          )
                                        }
                                        className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                                          isSelected
                                            ? "border-slate-700 bg-slate-800 text-white"
                                            : "border-slate-300 bg-white text-slate-900 hover:border-slate-500"
                                        }`}
                                      >
                                        <span className="block font-semibold">
                                          {reference.productName}
                                        </span>

                                        <span
                                          className={`mt-1 block ${
                                            isSelected
                                              ? "text-slate-200"
                                              : "text-slate-500"
                                          }`}
                                        >
                                          {reference.format
                                            ? `${reference.format} · `
                                            : ""}
                                          {formatCurrency(
                                            reference.price,
                                            reference.currency
                                          )}
                                        </span>

                                        <span
                                          className={`mt-1 block ${
                                            isSelected
                                              ? "text-slate-300"
                                              : "text-slate-500"
                                          }`}
                                        >
                                          {reference.menuName
                                            ? `${reference.menuName} · menú documentado`
                                            : "Menú MSC documentado"}
                                        </span>

                                        <span
                                          className={`mt-1 block font-medium ${
                                            isSelected
                                              ? "text-slate-200"
                                              : contextRelevance.relevance ===
                                                "exact"
                                                ? "text-emerald-700"
                                                : "text-amber-700"
                                          }`}
                                        >
                                          {contextRelevance.relevance ===
                                          "exact"
                                            ? "Contexto coincidente"
                                            : "Compatible · faltan datos"}
                                        </span>
                                      </button>
                                    );
                                  }
                                )}
                            </div>

                            <p className="mt-2 text-xs leading-5 text-slate-600">
                              Precios observados en menús documentados. Solo mostramos referencias sin contradicciones conocidas con el contexto de tu crucero.
                            </p>
                          </div>
                        ) : null}

                        <div className="relative mt-3">
                          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-medium text-slate-500">
                            {
                              selectedDrinkCurrencySymbol
                            }
                          </span>

                          <input
                            id={inputId}
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            value={inputValue}
                            onChange={(event) =>
                              updateDrinkPriceInput(
                                category,
                                event.target.value
                              )
                            }
                            placeholder="Opcional"
                            className={`w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-slate-900 outline-none transition ${
                              validation.valid
                                ? "border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                : "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            }`}
                          />
                        </div>

                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          Precio de una
                          consumición individual.
                        </p>

                        {validation.error ? (
                          <p className="mt-2 text-sm font-medium text-red-600">
                            {
                              validation.error
                            }
                          </p>
                        ) : null}

                        {validation.warning ? (
                          <p className="mt-2 text-sm leading-5 text-amber-700">
                            {
                              validation.warning
                            }
                          </p>
                        ) : null}
                      </div>
                    );
                  }
                )}
              </div>
            </>
          )}
        </section>

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
