import { costaMetadata } from "@/data/metadata";
import { costaOnboardPrices } from "@/data/onboardPrices";

export default function DataConfidencePanel() {
  const referenceDrinkPrices = Object.values(
    costaOnboardPrices
  ).filter(
    (drink) => drink.status === "reference"
  );

  const allDrinkPricesAreReference =
    referenceDrinkPrices.length ===
    Object.keys(costaOnboardPrices).length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">
          🔎 Calidad de los datos
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          DrinkPilot distingue entre información verificada
          sobre los paquetes y precios utilizados únicamente
          como referencia para realizar la estimación.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">

        {/* INFORMACIÓN VERIFICADA */}

        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              ✅
            </span>

            <h4 className="font-bold text-green-900">
              Información verificada
            </h4>
          </div>

          <ul className="mt-4 space-y-3 text-sm leading-6 text-green-950">
            <li>
              <strong>
                Inclusiones de los paquetes
              </strong>
              <br />
              Contrastadas con información oficial de
              Costa Cruceros.
            </li>

            <li>
              <strong>
                Restricciones y condiciones
              </strong>
              <br />
              Revisadas frente a la documentación
              utilizada por DrinkPilot.
            </li>
          </ul>

          <div className="mt-5 border-t border-green-200 pt-4 text-xs leading-5 text-green-900">
            <p>
              Inclusiones verificadas:
              {" "}
              <strong>
                {costaMetadata.verification.inclusionsLastVerified}
              </strong>
            </p>

            <p className="mt-1">
              Restricciones verificadas:
              {" "}
              <strong>
                {costaMetadata.verification.restrictionsLastVerified}
              </strong>
            </p>
          </div>
        </div>

        {/* PRECIOS DE REFERENCIA */}

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              ⚠️
            </span>

            <h4 className="font-bold text-amber-950">
              Precios de referencia
            </h4>
          </div>

          <ul className="mt-4 space-y-3 text-sm leading-6 text-amber-950">
            <li>
              <strong>
                Precio diario de los paquetes
              </strong>
              <br />
              Es orientativo y puede variar según crucero,
              tarifa, mercado y momento de compra.
            </li>

            <li>
              <strong>
                Precios individuales de bebidas
              </strong>
              <br />
              Se utilizan para estimar cuánto costaría
              pagar el consumo por separado.
            </li>
          </ul>

          <div className="mt-5 border-t border-amber-200 pt-4 text-xs leading-5 text-amber-900">
            <p>
              Estado precios de paquetes:
              {" "}
              <strong>
                {costaMetadata.verification.packagePricesStatus ===
                "reference"
                  ? "Referencia"
                  : costaMetadata.verification.packagePricesStatus}
              </strong>
            </p>

            <p className="mt-1">
              Estado precios de bebidas:
              {" "}
              <strong>
                {allDrinkPricesAreReference
                  ? "Referencia"
                  : costaMetadata.verification.individualDrinkPricesStatus}
              </strong>
            </p>
          </div>
        </div>

      </div>

      {/* PRECIOS UTILIZADOS */}

      <div className="mt-6 rounded-xl bg-slate-50 p-5">
        <p className="font-semibold text-slate-900">
          Precios de bebidas utilizados en esta estimación
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">

          {Object.values(costaOnboardPrices).map(
            (drink) => (
              <div
                key={drink.name}
                className="rounded-lg border border-slate-200 bg-white p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-800">
                    {drink.icon} {drink.name}
                  </span>

                  <span className="font-bold text-slate-900">
                    {drink.price.toFixed(2)} €
                  </span>
                </div>

                <p className="mt-2 text-xs font-medium text-amber-700">
                  Precio de referencia
                </p>
              </div>
            )
          )}

        </div>
      </div>

      {/* FUENTE */}

      <div className="mt-6 border-t border-slate-200 pt-5">
        <p className="text-sm font-semibold text-slate-900">
          Fuente principal
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Costa Cruceros — información oficial de paquetes
          de bebidas para el mercado de{" "}
          {costaMetadata.market}.
        </p>

        <a
          href={costaMetadata.sources.officialDrinksPage}
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
        una información marcada como verificada no significa
        que el precio mostrado sea oficial. DrinkPilot verifica
        por separado la existencia, inclusiones y condiciones
        de los paquetes y el grado de confianza de sus precios.
      </div>
    </section>
  );
}