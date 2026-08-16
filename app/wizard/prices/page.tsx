"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import ProgressBar from "@/components/ProgressBar";
import { WizardBrand } from "@/components/Brand";
import CostaIncludedPackageGuidance from "@/components/wizard/CostaIncludedPackageGuidance";

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
  resolveDrinkPriceReferenceSelection,
  resolveDrinkPriceSelectionSource,
} from "@/lib/drinkPriceSelectionSource";

import {
  getMscSpecificDrinkPrices,
} from "@/lib/mscSpecificDrinkPriceService";

import {
  getMscDocumentedDrinkPrices,
  resolveMscDocumentedDrinkPriceSelectionForContext,
} from "@/lib/mscDocumentedDrinkPriceService";

import {
  getCostaDocumentedDrinkPrices,
  resolveCostaDocumentedDrinkPriceSelectionForContext,
} from "@/lib/costaDocumentedDrinkPriceService";

import {
  useWizardRouteGuard,
} from "@/lib/useWizardRouteGuard";

import {
  createCustomPackagePrice,
} from "@/lib/customPackagePrice";
import {
  drinkCategoryLabels,
  getCurrencySymbol,
  getHighPriceThreshold,
  validateOptionalPrice,
  type PriceValidation,
} from "@/lib/wizardPriceForm";
import { formatCurrency } from "@/lib/currencyFormatting";

const packageCoverageLabels = {
  coffee: "cafés",
  water: "agua",
  soda: "refrescos",
  beer: "cerveza",
  wine: "vino",
  cocktail: "cócteles",
  alcoholicCocktails: "cócteles con alcohol",
  nonAlcoholicCocktails: "cócteles sin alcohol",
  premiumCocktails: "cócteles premium",
  bottledBeer: "cerveza embotellada",
  premiumSpirits: "destilados premium",
  bottledWaterUnlimited: "agua embotellada",
} as const;

function getPackageHighlights(pkg: ReturnType<typeof getAllPackages>[number]) {
  return Object.entries(packageCoverageLabels)
    .filter(([key]) => pkg.coverage[key as keyof typeof pkg.coverage] === true)
    .map(([, label]) => label)
    .slice(0, 4);
}

function PricesForm() {
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

  const [packagePriceCurrency, setPackagePriceCurrency] =
    useState(() =>
      data.packagePriceCurrency ??
      Object.values(data.customPackagePrices).find(
        (price) => price !== null
      )?.currency ??
      cruiseLine.currency
    );

  const currencySymbol = getCurrencySymbol(packagePriceCurrency);

  const [includedPackageKey, setIncludedPackageKey] = useState<string | null>(
    data.includedPackageKey ?? null
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

            storedPrice !== null &&
            storedPrice !== undefined
              ? String(
                  storedPrice.price
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
  >(() =>
    resolveDrinkPriceReferenceSelection(
      data.selectedDrinkPrices
    ).referenceIds
  );

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
  >(() =>
    resolveDrinkPriceReferenceSelection(
      data.selectedDrinkPrices
    ).referenceSources
  );

  const [
    documentedDrinkQuantities,
    setDocumentedDrinkQuantities,
  ] = useState(
    data.documentedDrinkQuantities
  );

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
              pkg.pricePerChargeUnit
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

  function toggleDocumentedDrink(
    referenceId: string
  ) {
    const next = {
      ...documentedDrinkQuantities,
    };

    if (
      (documentedDrinkQuantities[
        referenceId
      ] ?? 0) > 0
    ) {
      delete next[referenceId];
    } else {
      next[referenceId] = 1;
    }

    setDocumentedDrinkQuantities(
      next
    );

    /*
     * La selección debe sobrevivir aunque
     * el usuario recargue o navegue antes
     * de pulsar Continuar.
     */
    setData(
      (previous) => ({
        ...previous,
        documentedDrinkQuantities:
          next,
      })
    );
  }

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
    const selectedPrice =
      selectedDrinkCurrency
        ? createSelectedDrinkPrice({
            category,
            price,
            currency:
              selectedDrinkCurrency,
            source: "official",
            referenceId,
          })
        : null;

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

    if (selectedPrice) {
      setData(
        (previous) => ({
          ...previous,
          selectedDrinkPrices: {
            ...previous.selectedDrinkPrices,
            [category]: selectedPrice,
          },
        })
      );
    }
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

        documentedDrinkQuantities:
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

    setDocumentedDrinkQuantities({});
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

            validations[pkg.key]?.value === null
              ? null
              : createCustomPackagePrice({
                  price: validations[pkg.key]?.value,
                  currency: packagePriceCurrency,
                }),
          ]
        )
      );

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

            const referenceId =
              selectedDrinkReferenceIds[
                category
              ];

            const source =
              resolveDrinkPriceSelectionSource(
                referenceId,
                selectedDrinkReferenceSources[
                  category
                ] ?? "official"
              );

            const contextualSelection =
              source === "documented-menu" &&
              referenceId
                ? data.cruiseLine === "costa"
                  ? resolveCostaDocumentedDrinkPriceSelectionForContext(
                      referenceId,
                      cruiseContext
                    )
                  : resolveMscDocumentedDrinkPriceSelectionForContext(
                      referenceId,
                      cruiseContext
                    )
                : null;

            const resolvedRelevance =
              contextualSelection
                ?.contextRelevance
                .relevance;

            const contextRelevance =
              resolvedRelevance === "exact" ||
              resolvedRelevance ===
                "compatible"
                ? resolvedRelevance
                : undefined;

            const selectedPrice =
              createSelectedDrinkPrice({
                category,

                price:
                  validation.value,

                currency:
                  selectedDrinkCurrency,

                source,

                referenceId,

                contextRelevance,
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

        packagePriceCurrency,

        includedPackageKey,

        selectedDrinkPrices:
          nextSelectedDrinkPrices,

        documentedDrinkQuantities,
      })
    );
  }

  return (
    <main className="brand-ocean-bg min-h-screen px-4 py-6 sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-10">
      <div className="dark-app-surface mx-auto w-full max-w-2xl rounded-2xl p-5 sm:p-10">
        <WizardBrand />
        <ProgressBar
          currentStep={5}
          totalSteps={6}
        />

        {/* CABECERA */}

        <div className="mt-2 sm:mt-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Paso 5 de 6
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
          💡 Este paso es opcional. Si conoces el precio de tu reserva,
          añádelo para obtener un resultado más preciso.
        </div>

        {data.cruiseLine === "costa" && (
          <CostaIncludedPackageGuidance />
        )}

        <fieldset className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <legend className="px-1 text-sm font-semibold text-slate-900">
            Moneda del precio de tu reserva
          </legend>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Selecciona la moneda en la que aparece el paquete en tu reserva.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {(["EUR", "USD"] as const).map((currency) => (
              <button
                key={currency}
                type="button"
                aria-pressed={packagePriceCurrency === currency}
                onClick={() => setPackagePriceCurrency(currency)}
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  packagePriceCurrency === currency
                    ? "border-sky-500 bg-sky-700 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-sky-300"
                }`}
              >
                {currency} ({getCurrencySymbol(currency)})
              </button>
            ))}
          </div>
        </fieldset>

        {packagePriceCurrency !== cruiseLine.currency && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <strong>Monedas distintas.</strong>{" "}
            Las referencias se mantienen en su moneda original.
            Los importes que introduzcas se interpretarán como{" "}
            <strong>{packagePriceCurrency}</strong>, la moneda del
            precio de tu reserva. DrinkPilot no realiza conversiones
            automáticas entre monedas.
          </div>
        )}

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
                typeof pkg.pricePerChargeUnit ===
                  "number" &&
                Number.isFinite(
                  pkg.pricePerChargeUnit
                ) &&
                pkg.pricePerChargeUnit >
                  0;

              const requiresUserPrice =
                pkg.economicActivation ===
                "user-price-only";

              const isEconomicallyDisabled =
                pkg.economicActivation ===
                "disabled";

              const inputId =
                `package-price-${pkg.key}`;

              const packageHighlights = getPackageHighlights(pkg);

              const isIncludedInReservation = includedPackageKey === pkg.key;

              return (
                <div
                  key={
                    pkg.key
                  }
                  className="rounded-2xl border border-sky-200/30 bg-white/5 p-4 sm:p-5"
                >
                  {/* CABECERA PAQUETE */}

                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <label
                        htmlFor={
                          inputId
                        }
                        className="block text-base font-semibold text-slate-900"
                      >
                        {
                          pkg.icon
                        }{" "}
                        {
                          pkg.name
                        }
                      </label>

                      <p className="mt-1 text-xs text-slate-500">
                        {includedPackageKey && !isIncludedInReservation
                          ? "Coste del upgrade por adulto y noche"
                          : "Precio por adulto y noche"}
                      </p>

                      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-sky-700">
                        Qué incluye
                      </p>
                      <p className="mt-1 font-semibold leading-6 text-slate-900">
                        {packageHighlights.length > 0
                          ? packageHighlights.join(" · ")
                          : "Consulta las condiciones del paquete"}
                      </p>
                    </div>

                    {!hasReferencePrice ? (
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                        Sin precio de
                        referencia
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        Estimación orientativa{" "}
                        {pkg.currency}{" "}
                        {formatCurrency(
                          pkg.pricePerChargeUnit as number,
                          pkg.currency
                        )}{" "}
                        / noche
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
                    <>
                      <button
                        type="button"
                        aria-pressed={isIncludedInReservation}
                        onClick={() =>
                          setIncludedPackageKey((previous) =>
                            previous === pkg.key ? null : pkg.key
                          )
                        }
                        className={`mt-4 w-full rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                          isIncludedInReservation
                            ? "border-green-500 bg-green-50 text-green-800"
                            : "border-slate-200 bg-white text-slate-700 hover:border-green-300"
                        }`}
                      >
                        {isIncludedInReservation
                          ? "✓ Incluido en mi reserva"
                          : "Ya tengo este paquete incluido"}
                      </button>

                      {isIncludedInReservation ? (
                        <p className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm leading-6 text-green-900">
                          Lo comparamos con coste incremental de 0 €. Podrás ver si conviene mantenerlo o cambiar a otra opción.
                        </p>
                      ) : (
                    <>
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
                        aria-invalid={Boolean(validation?.error)}
                        aria-describedby={
                          validation?.error
                            ? `${inputId}-error`
                            : undefined
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
                                pkg.pricePerChargeUnit as number
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
                      <span
                        aria-label={`Moneda del precio de tu reserva: ${packagePriceCurrency}`}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500"
                      >
                        {
                          currencySymbol
                        }
                      </span>
                    </div>
                    {includedPackageKey ? (
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Introduce solo el suplemento para cambiar desde tu paquete actual.
                      </p>
                    ) : null}
                    </>
                      )}
                    </>
                  )}

                  {/* ERROR */}

                  {!isEconomicallyDisabled &&
                    !isIncludedInReservation &&
                    validation
                      ?.error && (
                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
                      <p
                        id={`${inputId}-error`}
                        className="text-sm font-medium text-red-700"
                      >
                        {
                          validation.error
                        }
                      </p>
                    </div>
                  )}

                  {/* WARNING */}

                  {!isEconomicallyDisabled &&
                    !isIncludedInReservation &&
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
                              pkg.pricePerChargeUnit as number,
                              cruiseLine.currency
                            )}{" "}
                            / noche como
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
                aria-pressed={selectedDrinkCurrency === "EUR"}
                onClick={() =>
                  updateOnboardCurrency(
                    "EUR"
                  )
                }
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  selectedDrinkCurrency ===
                  "EUR"
                    ? "border-sky-500 bg-sky-700 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-sky-300"
                }`}
              >
                EUR (€)
              </button>

              <button
                type="button"
                aria-pressed={selectedDrinkCurrency === "USD"}
                onClick={() =>
                  updateOnboardCurrency(
                    "USD"
                  )
                }
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  selectedDrinkCurrency ===
                  "USD"
                    ? "border-sky-500 bg-sky-700 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-sky-300"
                }`}
              >
                USD ($)
              </button>

              <button
                type="button"
                aria-pressed={selectedDrinkCurrency === null}
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
                      documentedCurrency
                        ? data.cruiseLine === "costa"
                          ? getCostaDocumentedDrinkPrices({
                              category,
                              currency:
                                documentedCurrency,
                            })
                          : getMscDocumentedDrinkPrices({
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
                            data.cruiseLine === "costa"
                              ? resolveCostaDocumentedDrinkPriceSelectionForContext(
                                  reference.id,
                                  cruiseContext
                                )
                              : resolveMscDocumentedDrinkPriceSelectionForContext(
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

                    const availableDocumentedReferences =
                      contextualDocumentedReferences.filter(
                        (item) =>
                          item.contextRelevance
                            .relevance !==
                          "mismatch"
                      );

                    const selectedDocumentedDrinkCount =
                      availableDocumentedReferences.filter(
                        (item) =>
                          (documentedDrinkQuantities[
                            item.reference.id
                          ] ?? 0) > 0
                      ).length;

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
                                      aria-pressed={isSelected}
                                      onClick={() =>
                                        selectOfficialDrinkReference(
                                          category,
                                          reference.id,
                                          reference.price
                                        )
                                      }
                                      className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                                        isSelected
                                          ? "border-sky-500 bg-sky-700 text-white"
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

                        {availableDocumentedReferences.length > 0 ? (
                          <details
                            className="group mt-3 rounded-xl border border-slate-200 bg-slate-50"
                          >
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl p-3 text-left marker:content-none">
                              <span>
                                <span className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
                                  Elegir bebidas del menú documentado
                                </span>

                                <span className="mt-1 block text-xs text-slate-500">
                                  {availableDocumentedReferences.length} opciones de {data.cruiseLine === "costa" ? "Costa" : "MSC"}
                                  {selectedDocumentedDrinkCount > 0
                                    ? ` · ${selectedDocumentedDrinkCount} ${selectedDocumentedDrinkCount === 1 ? "seleccionada" : "seleccionadas"}`
                                    : ""}
                                </span>
                              </span>

                              <span
                                aria-hidden="true"
                                className="text-lg text-slate-500 transition-transform group-open:rotate-180"
                              >
                                ↓
                              </span>
                            </summary>

                            <div className="border-t border-slate-200 p-3">

                            <p className="mt-1 text-xs leading-5 text-slate-600">
                              Marca todas las bebidas que sueles alternar. Tus {data[category]} consumiciones diarias del paso 3 no aumentarán por elegir más variedades.
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                              {availableDocumentedReferences
                                .map(
                                  ({
                                    reference,
                                    contextRelevance,
                                  }) => {
                                    const isSelected =
                                      selectedReferenceId ===
                                      reference.id;

                                    const documentedQuantity =
                                      documentedDrinkQuantities[
                                        reference.id
                                      ] ?? 0;

                                    if (
                                      data.cruiseLine === "costa" ||
                                      data.cruiseLine === "msc"
                                    ) {
                                      return (
                                        <div
                                          key={reference.id}
                                          className={`rounded-lg border px-3 py-2 text-xs ${
                                            documentedQuantity > 0
                                              ? "border-sky-500 bg-sky-50 text-slate-900"
                                              : "border-slate-300 bg-white text-slate-900"
                                          }`}
                                        >
                                          <span className="block font-semibold">
                                            {reference.productName}
                                          </span>

                                          <span className="mt-1 block text-slate-500">
                                            {reference.format
                                              ? `${reference.format} · `
                                              : ""}
                                            {formatCurrency(
                                              reference.price,
                                              reference.currency
                                            )}
                                          </span>

                                          <button
                                            type="button"
                                            aria-pressed={documentedQuantity > 0}
                                            onClick={() =>
                                              toggleDocumentedDrink(
                                                reference.id
                                              )
                                            }
                                            className={`mt-3 w-full rounded-lg border px-3 py-2 font-semibold transition ${
                                              documentedQuantity > 0
                                                ? "border-sky-600 bg-sky-700 text-white"
                                                : "border-slate-300 bg-white text-slate-700 hover:border-sky-400"
                                            }`}
                                          >
                                            {documentedQuantity > 0
                                              ? "✓ Seleccionada"
                                              : "Seleccionar"}
                                          </button>
                                        </div>
                                      );
                                    }

                                    return (
                                      <button
                                        key={reference.id}
                                        type="button"
                                        aria-pressed={isSelected}
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
                                            : "Menú documentado"}
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
                              {data.cruiseLine === "costa"
                                ? "Carta histórica alojada fuera del dominio oficial de Costa. Conservamos su procedencia y no la tratamos como tarifa oficial vigente."
                                : "Carta histórica MSC de marzo de 2023 en EUR. Conservamos su documento y no la tratamos como tarifa oficial vigente."}
                            </p>
                            </div>
                          </details>
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
                            aria-invalid={!validation.valid}
                            aria-describedby={
                              validation.error
                                ? `${inputId}-error`
                                : undefined
                            }
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
                          <p
                            id={`${inputId}-error`}
                            className="mt-2 text-sm font-medium text-red-600"
                          >
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
              href="/wizard/review"
              onClick={
                savePrices
              }
              className="rounded-xl bg-sky-700 px-3 py-4 text-center text-sm font-semibold text-white transition hover:bg-sky-800 active:bg-sky-800 sm:text-base"
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

export default function PricesPage() {
  const {
    hydrated,
    ready,
  } = useWizardRouteGuard(
    "consumption"
  );

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

  return <PricesForm />;
}
