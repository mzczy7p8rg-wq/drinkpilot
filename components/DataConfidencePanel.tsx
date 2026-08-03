import { costaMetadata } from "@/data/metadata";
import { costaOnboardPrices } from "@/data/onboardPrices";
import { costaPackages } from "@/data/packages";

type ConfidenceLevel =
  | "verified"
  | "partial"
  | "reference"
  | "pending";

type ConfidenceBadgeProps = {
  level: ConfidenceLevel;
};

function ConfidenceBadge({
  level,
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
      {current.label}
    </span>
  );
}

export default function DataConfidencePanel() {
  const referenceDrinkPrices =
    Object.values(
      costaOnboardPrices
    ).filter(
      (drink) =>
        drink.status ===
        "reference"
    );

  const allDrinkPricesAreReference =
    referenceDrinkPrices.length ===
    Object.keys(
      costaOnboardPrices
    ).length;

  const soft =
    costaPackages.myDrinksSoft;

  const myDrinks =
    costaPackages.myDrinks;

  const myDrinksPlus =
    costaPackages.myDrinksPlus;

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

      {/* RESUMEN DE CONFIANZA */}

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
            <li>
              <strong>
                My Drinks
              </strong>
              <br />
              Existencia e inclusiones
              verificadas.
            </li>

            <li>
              <strong>
                My Drinks Plus
              </strong>
              <br />
              Existencia e inclusiones
              verificadas.
            </li>

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
                  costaMetadata
                    .verification
                    .inclusionsLastVerified
                }
              </strong>
            </p>

            <p className="mt-1">
              Restricciones revisadas:{" "}
              <strong>
                {
                  costaMetadata
                    .verification
                    .restrictionsLastVerified
                }
              </strong>
            </p>
          </div>
        </div>

        {/* PRECIOS DE REFERENCIA */}

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">
                ⚠️
              </span>

              <h4 className="font-bold text-amber-950">
                Precios de referencia
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
              Los importes de My Drinks
              y My Drinks Plus son
              orientativos y pueden
              variar según reserva.
            </li>

            <li>
              <strong>
                Precios individuales
              </strong>
              <br />
              Se utilizan para estimar
              cuánto costaría pagar el
              consumo por separado.
            </li>
          </ul>

          <div className="mt-5 border-t border-amber-200 pt-4 text-xs leading-5 text-amber-900">
            <p>
              Estado paquetes:{" "}
              <strong>
                {costaMetadata
                  .verification
                  .packagePricesStatus ===
                "reference"
                  ? "Referencia"
                  : costaMetadata
                      .verification
                      .packagePricesStatus}
              </strong>
            </p>

            <p className="mt-1">
              Estado bebidas:{" "}
              <strong>
                {allDrinkPricesAreReference
                  ? "Referencia"
                  : costaMetadata
                      .verification
                      .individualDrinkPricesStatus}
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
          {/* MY DRINKS SOFT */}

          <div className="rounded-xl border border-sky-200 bg-sky-50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900">
                  {soft.icon}{" "}
                  {soft.name}
                </p>

                <p className="mt-1 text-xs font-medium text-slate-600">
                  Sin alcohol
                </p>
              </div>

              <ConfidenceBadge
                level="partial"
              />
            </div>

            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <div>
                <p className="font-semibold text-slate-900">
                  Existencia
                </p>

                <p>
                  Verificada.
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  Inclusiones
                </p>

                <p>
                  Verificadas
                  parcialmente mediante
                  la evidencia disponible.
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  Precio
                </p>

                <p>
                  Pendiente de
                  verificación.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-700">
                  Comparación económica
                </span>

                <ConfidenceBadge
                  level="pending"
                />
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-600">
                My Drinks Soft está
                identificado, pero no se
                utiliza todavía para
                recomendar el paquete más
                rentable porque no
                disponemos de un precio
                suficientemente fiable.
              </p>
            </div>
          </div>

          {/* MY DRINKS */}

          <div className="rounded-xl border border-green-200 bg-green-50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900">
                  {myDrinks.icon}{" "}
                  {myDrinks.name}
                </p>
              </div>

              <ConfidenceBadge
                level="verified"
              />
            </div>

            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <div>
                <p className="font-semibold text-slate-900">
                  Existencia e
                  inclusiones
                </p>

                <p>
                  Verificadas.
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  Precio utilizado
                </p>

                <p>
                  {
                    myDrinks.pricePerDay
                  }
                  {" € / día "}
                  como referencia.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-green-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-700">
                  Comparación económica
                </span>

                <ConfidenceBadge
                  level="verified"
                />
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-600">
                Habilitado para la
                comparación. Si introduces
                el precio real de tu
                reserva, DrinkPilot lo
                utiliza con prioridad.
              </p>
            </div>
          </div>

          {/* MY DRINKS PLUS */}

          <div className="rounded-xl border border-green-200 bg-green-50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900">
                  {myDrinksPlus.icon}{" "}
                  {myDrinksPlus.name}
                </p>
              </div>

              <ConfidenceBadge
                level="verified"
              />
            </div>

            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <div>
                <p className="font-semibold text-slate-900">
                  Existencia e
                  inclusiones
                </p>

                <p>
                  Verificadas.
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  Precio utilizado
                </p>

                <p>
                  {
                    myDrinksPlus
                      .pricePerDay
                  }
                  {" € / día "}
                  como referencia.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-green-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-700">
                  Comparación económica
                </span>

                <ConfidenceBadge
                  level="verified"
                />
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-600">
                Habilitado para la
                comparación. Si introduces
                el precio real de tu
                reserva, DrinkPilot lo
                utiliza con prioridad.
              </p>
            </div>
          </div>
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
            level="reference"
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {Object.values(
            costaOnboardPrices
          ).map((drink) => (
            <div
              key={drink.name}
              className="rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-800">
                  {drink.icon}{" "}
                  {drink.name}
                </span>

                <span className="font-bold text-slate-900">
                  {drink.price.toFixed(
                    2
                  )}{" "}
                  €
                </span>
              </div>

              <p className="mt-2 text-xs font-medium text-amber-700">
                Precio de referencia
              </p>
            </div>
          ))}
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
              participa en el cálculo o la
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
          Costa Cruceros — información
          oficial de paquetes de bebidas
          para el mercado de{" "}
          {costaMetadata.market}.
        </p>

        <a
          href={
            costaMetadata.sources
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
    </section>
  );
}