"use client";

import {
  getCruiseLine,
} from "@/data/cruiseLines";

import {
  useStore,
} from "@/lib/store";

import {
  getAllPackages,
} from "@/lib/packageService";

import type {
  ComparisonResult,
} from "@/lib/comparison";

import {
  formatCurrency,
} from "@/lib/currencyFormatting";

import {
  resolveDrinkPriceDataConfidence,
  resolvePackageDataConfidence,
  type DrinkPriceConfidenceSource,
  type PackageEconomicConfidenceStatus,
  type PackagePriceConfidenceSource,
} from "@/lib/dataConfidenceResolution";

type ConfidenceLevel =
  | "verified"
  | "partial"
  | "reference"
  | "pending";

type ConfidenceBadgeProps = {
  level: ConfidenceLevel;

  label?: string;
};

function ConfidenceBadge({
  level,
  label,
}: ConfidenceBadgeProps) {
  const config = {
    verified: {
      label: "Verificado",
      className:
        "bg-green-100 text-green-800",
    },

    partial: {
      label: "Verificación parcial",
      className:
        "bg-sky-100 text-sky-800",
    },

    reference: {
      label: "Referencia",
      className:
        "bg-amber-100 text-amber-800",
    },

    pending: {
      label: "Pendiente",
      className:
        "bg-slate-200 text-slate-700",
    },
  } as const;

  const current =
    config[level];

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${current.className}`}
    >
      {label ?? current.label}
    </span>
  );
}

function getPackageConfidenceLevel(
  inclusionsStatus: string
): ConfidenceLevel {
  if (
    inclusionsStatus ===
    "verified"
  ) {
    return "verified";
  }

  if (
    inclusionsStatus ===
    "partial-verified"
  ) {
    return "partial";
  }

  return "pending";
}

function getEconomicConfidenceLevel(
  status:
    PackageEconomicConfidenceStatus
): ConfidenceLevel {
  if (status === "available") {
    return "verified";
  }

  if (
    status ===
      "waiting-drink-prices" ||
    status ===
      "currency-mismatch"
  ) {
    return "partial";
  }

  return "pending";
}

function getEconomicStatusLabel(
  status:
    PackageEconomicConfidenceStatus
): string {
  if (status === "available") {
    return "Disponible";
  }

  if (
    status ===
    "waiting-drink-prices"
  ) {
    return "Precio preparado";
  }

  if (
    status ===
    "currency-mismatch"
  ) {
    return "Monedas distintas";
  }

  if (status === "disabled") {
    return "No participa";
  }

  return "Pendiente";
}

function getPackagePriceSourceLabel(
  source:
    PackagePriceConfidenceSource
): string {
  if (source === "user") {
    return "Precio introducido por ti";
  }

  if (source === "reference") {
    return "Precio de referencia";
  }

  return "Precio pendiente";
}

function getDrinkPriceSourceLabel(
  source:
    DrinkPriceConfidenceSource
): string {
  if (source === "user") {
    return "Precio introducido por ti";
  }

  if (source === "official") {
    return "Referencia oficial seleccionada";
  }

  if (
    source ===
    "documented-menu"
  ) {
    return "Menú documentado seleccionado";
  }

  if (source === "reference") {
    return "Precio de referencia";
  }

  return "Precio pendiente";
}

type DataConfidencePanelProps = {
  comparison:
    Pick<
      ComparisonResult,
      | "economicCurrency"
      | "economicDrinkPrices"
      | "economicDataAvailable"
      | "packages"
    >;
};

export default function DataConfidencePanel({
  comparison,
}: DataConfidencePanelProps) {
  const {
    data,
  } = useStore();

  /*
   * NAVIERA ACTIVA
   *
   * El panel ya no importa directamente
   * datos de ninguna compañía concreta.
   */
  const cruiseLine =
    getCruiseLine(
      data.cruiseLine
    );

  const metadata =
    cruiseLine.metadata;

  const onboardPrices =
    cruiseLine.onboardPrices;

  const packages =
    getAllPackages(
      data.cruiseLine
    );

  const packageRows =
    packages.map((pkg) => {
      const customPrice =
        data.customPackagePrices[pkg.key];

      return {
        pkg,

        confidence:
          resolvePackageDataConfidence({
          economicActivation:
            pkg.economicActivation,

          customPrice:
            customPrice?.price,

          referencePrice:
            pkg.pricePerDay,

          packageCurrency:
            customPrice?.currency ?? pkg.currency,

          economicCurrency:
            comparison.economicCurrency,

          economicDataAvailable:
            comparison.economicDataAvailable,

          comparedPackage:
            comparison.packages.find(
              (result) =>
                result.packageKey ===
                pkg.key
            ),
          }),
      };
    });

  const drinkPriceRows =
    resolveDrinkPriceDataConfidence({
      economicDrinkPrices:
        comparison.economicDrinkPrices,

      economicCurrency:
        comparison.economicCurrency,

      selectedDrinkPrices:
        data.selectedDrinkPrices,
    });

  const availableDrinkPriceCount =
    drinkPriceRows.filter(
      (row) => row.price !== null
    ).length;

  const packagePriceStatus =
    comparison.packages.length > 0
      ? "Aplicados en la comparación"
      : packageRows.some(
          ({ confidence }) =>
            confidence.pricePerDay !==
            null
        )
        ? "Precios disponibles; comparación pendiente"
        : "Pendiente";

  const drinkPriceStatus =
    comparison.economicDataAvailable
      ? "Precios necesarios disponibles"
      : availableDrinkPriceCount > 0
        ? `${availableDrinkPriceCount} de ${drinkPriceRows.length} disponibles`
        : "Pendiente";

  const verifiedPackages =
    packages.filter(
      (pkg) =>
        pkg.existenceStatus ===
          "verified" &&
        pkg.inclusionsStatus ===
          "verified"
    );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      {/* CABECERA */}

      <div>
        <h3 className="text-xl font-bold text-slate-900">
          🔎 Calidad de los datos
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          DrinkPilot separa la
          existencia e inclusiones de
          cada paquete, la fiabilidad de
          sus precios y su posibilidad
          de participar en la
          comparación económica.
        </p>
      </div>

      <details className="group mt-5">
        <summary className="cursor-pointer list-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-sky-700 transition hover:border-sky-200 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
          <span className="flex items-center justify-between gap-3">
            <span>
              Ver detalle de calidad de los datos
            </span>

            <span
              aria-hidden="true"
              className="transition group-open:rotate-180"
            >
              ↓
            </span>
          </span>
        </summary>

        <div className="mt-6">
      {/* RESUMEN */}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {/* DATOS VERIFICADOS */}

        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">
                ✅
              </span>

              <h4 className="font-bold text-green-900">
                Datos verificados
              </h4>
            </div>

            <ConfidenceBadge
              level="verified"
            />
          </div>

          <ul className="mt-4 space-y-3 text-sm leading-6 text-green-950">
            {verifiedPackages.map(
              (pkg) => (
                <li key={pkg.id}>
                  <strong>
                    {pkg.name}
                  </strong>

                  <br />

                  Existencia e inclusiones
                  verificadas.
                </li>
              )
            )}

            <li>
              <strong>
                Restricciones
              </strong>

              <br />

              Contrastadas con la
              documentación utilizada
              por DrinkPilot.
            </li>
          </ul>

          <div className="mt-5 border-t border-green-200 pt-4 text-xs leading-5 text-green-900">
            <p>
              Inclusiones revisadas:{" "}
              <strong>
                {
                  metadata
                    .verification
                    .inclusionsLastVerified
                }
              </strong>
            </p>

            <p className="mt-1">
              Restricciones revisadas:{" "}
              <strong>
                {
                  metadata
                    .verification
                    .restrictionsLastVerified
                }
              </strong>
            </p>
          </div>
        </div>

        {/* ESTADO ECONÓMICO */}

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">
                ⚠️
              </span>

              <h4 className="font-bold text-amber-950">
                Estado económico
              </h4>
            </div>

            <ConfidenceBadge
              level="reference"
            />
          </div>

          <ul className="mt-4 space-y-3 text-sm leading-6 text-amber-950">
            <li>
              <strong>
                Precio diario de los
                paquetes
              </strong>

              <br />

              Los precios introducidos
              por ti tienen prioridad.
              Las referencias solo se
              utilizan cuando son
              aplicables.
            </li>

            <li>
              <strong>
                Precios individuales
              </strong>

              <br />

              Solo aparecen como
              utilizados cuando forman
              parte de la cesta económica
              resuelta.
            </li>
          </ul>

          <div className="mt-5 border-t border-amber-200 pt-4 text-xs leading-5 text-amber-900">
            <p>
              Estado paquetes:{" "}
              <strong>
                {packagePriceStatus}
              </strong>
            </p>

            <p className="mt-1">
              Estado bebidas:{" "}
              <strong>
                {drinkPriceStatus}
              </strong>
            </p>
          </div>
        </div>
      </div>

      {/* ESTADO POR PAQUETE */}

      <div className="mt-6">
        <div>
          <h4 className="font-bold text-slate-900">
            Estado de cada paquete
          </h4>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            La cobertura y el precio se
            verifican por separado.
          </p>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {packageRows.map(
            ({
              pkg,
              confidence,
            }) => {
              const packageConfidence =
                getPackageConfidenceLevel(
                  pkg.inclusionsStatus
                );

              const economicConfidence =
                getEconomicConfidenceLevel(
                  confidence.economicStatus
                );

              return (
                <div
                  key={pkg.id}
                  className={`rounded-xl border p-5 ${
                    packageConfidence ===
                    "verified"
                      ? "border-green-200 bg-green-50"
                      : packageConfidence ===
                        "partial"
                      ? "border-sky-200 bg-sky-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  {/* CABECERA */}

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">
                        {
                          pkg.icon
                        }{" "}
                        {
                          pkg.name
                        }
                      </p>

                      {!pkg.includesAlcohol && (
                        <p className="mt-1 text-xs font-medium text-slate-600">
                          Sin alcohol
                        </p>
                      )}
                    </div>

                    <ConfidenceBadge
                      level={
                        packageConfidence
                      }
                    />
                  </div>

                  {/* ESTADO */}

                  <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                    <div>
                      <p className="font-semibold text-slate-900">
                        Existencia
                      </p>

                      <p>
                        {pkg.existenceStatus ===
                        "verified"
                          ? "Verificada."
                          : "Pendiente de verificación."}
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        Inclusiones
                      </p>

                      <p>
                        {pkg.inclusionsStatus ===
                        "verified"
                          ? "Verificadas."
                          : pkg.inclusionsStatus ===
                            "partial-verified"
                          ? "Verificadas parcialmente mediante la evidencia disponible."
                          : "Pendientes de verificación."}
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        Precio
                      </p>

                      {confidence.pricePerDay !==
                      null ? (
                        <p>
                          {formatCurrency(
                            confidence.pricePerDay,
                            confidence.currency
                          )}{" "}
                          / día.
                          <span className="mt-1 block text-xs text-slate-500">
                            {getPackagePriceSourceLabel(
                              confidence.priceSource
                            )}
                          </span>
                        </p>
                      ) : (
                        <p>Precio pendiente.</p>
                      )}
                    </div>
                  </div>

                  {/* COMPARACIÓN ECONÓMICA */}

                  <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-700">
                        Comparación
                        económica
                      </span>

                      <ConfidenceBadge
                        level={
                          economicConfidence
                        }
                        label={getEconomicStatusLabel(
                          confidence.economicStatus
                        )}
                      />
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-600">
                      {
                        confidence
                          .economicExplanation
                      }
                    </p>
                  </div>

                  {/* NOTA */}

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
      </div>

      {/* PRECIOS UTILIZADOS */}

      <div className="mt-6 rounded-xl bg-slate-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-900">
              Precios de bebidas
              utilizados
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              Valores empleados para
              estimar el coste de pagar
              las bebidas por separado.
            </p>
          </div>

          <ConfidenceBadge
            level={
              comparison.economicDataAvailable
                ? "verified"
                : "pending"
            }
            label={
              comparison.economicDataAvailable
                ? "Datos necesarios completos"
                : "Faltan precios necesarios"
            }
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {drinkPriceRows.map(
            (row) => {
              const drink =
                onboardPrices[
                  row.category
                ];

              return (
                <div
                  key={row.category}
                  className="rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-800">
                      {
                        drink.icon
                      }{" "}
                      {
                        drink.name
                      }
                    </span>

                    <span className="font-bold text-slate-900">
                      {row.price !== null
                        ? formatCurrency(
                            row.price,
                            row.currency
                          )
                        : "Pendiente"}
                    </span>
                  </div>

                  <p
                    className={`mt-2 text-xs font-medium ${
                      row.price !== null
                        ? row.source ===
                          "user"
                          ? "text-sky-700"
                          : "text-amber-700"
                        : "text-slate-500"
                    }`}
                  >
                    {getDrinkPriceSourceLabel(
                      row.source
                    )}
                  </p>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* CÓMO INTERPRETAR */}

      <div className="mt-6 rounded-xl border border-slate-200 p-5">
        <h4 className="font-bold text-slate-900">
          Cómo interpretar estos datos
        </h4>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <ConfidenceBadge
              level="verified"
            />

            <p className="mt-2 text-xs leading-5 text-slate-600">
              Información respaldada por
              la documentación oficial
              utilizada por DrinkPilot.
            </p>
          </div>

          <div>
            <ConfidenceBadge
              level="partial"
            />

            <p className="mt-2 text-xs leading-5 text-slate-600">
              Existe evidencia suficiente
              para mostrar el dato, pero
              todavía quedan elementos por
              confirmar.
            </p>
          </div>

          <div>
            <ConfidenceBadge
              level="reference"
            />

            <p className="mt-2 text-xs leading-5 text-slate-600">
              Valor orientativo utilizado
              para realizar la estimación.
            </p>
          </div>

          <div>
            <ConfidenceBadge
              level="pending"
            />

            <p className="mt-2 text-xs leading-5 text-slate-600">
              Información que todavía no
              participa automáticamente en
              el cálculo o la
              recomendación.
            </p>
          </div>
        </div>
      </div>

      {/* FUENTE */}

      <div className="mt-6 border-t border-slate-200 pt-5">
        <p className="text-sm font-semibold text-slate-900">
          Fuente principal
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {
            cruiseLine.name
          }{" "}
          — información oficial de
          paquetes de bebidas para el
          mercado de{" "}
          {
            metadata.market
          }.
        </p>

        <a
          href={
            metadata.sources
              .officialDrinksPage
          }
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-semibold text-sky-700 hover:text-sky-800"
        >
          Consultar fuente oficial ↗
        </a>
      </div>

      {/* DISCLAIMER */}

      <div className="mt-5 rounded-xl bg-slate-100 p-4 text-xs leading-5 text-slate-600">
        <strong>
          Importante:
        </strong>{" "}
        que la existencia o las
        inclusiones de un paquete estén
        verificadas no significa que su
        precio sea oficial o fijo.
        DrinkPilot evalúa por separado la
        cobertura, las condiciones y la
        fiabilidad económica de cada dato.
      </div>
        </div>
      </details>
    </section>
  );
}
