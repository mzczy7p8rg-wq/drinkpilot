import { formatCurrency } from "@/lib/currencyFormatting";
import type { EconomicOptionsComparison as EconomicOptionsComparisonModel } from "@/lib/economicOptionsComparison";

const statusLabels = {
  "no-package": "Sin paquete",
  included: "Incluido en tu reserva",
  package: "Paquete",
  upgrade: "Upgrade",
} as const;

export default function EconomicOptionsComparison({
  comparison,
}: {
  comparison: EconomicOptionsComparisonModel;
}) {
  const { bestOption, currency } = comparison;

  if (!bestOption) {
    return null;
  }

  const conclusion =
    bestOption.status === "no-package"
      ? "Pagar las bebidas por separado es la opción más económica."
      : bestOption.status === "included"
        ? `Mantén ${bestOption.name}: es la opción más económica para tu consumo.`
        : bestOption.status === "upgrade"
          ? `Mejora a ${bestOption.name}: es la alternativa con menor coste total.`
          : `${bestOption.name} es la opción más económica para tu consumo.`;

  return (
    <section
      aria-labelledby="economic-options-title"
      className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-4 sm:mt-8 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-800">
            Comparación económica completa
          </p>
          <h2
            id="economic-options-title"
            className="mt-1 text-2xl font-bold text-slate-900"
          >
            Sin paquete, paquetes y upgrades
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            El coste total suma el precio del paquete o suplemento y las bebidas conocidas que quedarían fuera de su cobertura.
          </p>
        </div>

        <span className="self-start rounded-full bg-green-700 px-3 py-2 text-sm font-semibold text-white">
          Mejor coste total
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:hidden">
        {comparison.options.map((option) => {
          const isBest = option.key === bestOption.key;

          return (
            <article
              key={option.key}
              className={`rounded-xl border p-4 ${
                isBest
                  ? "border-green-300 bg-green-50"
                  : "border-sky-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900">{option.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {statusLabels[option.status]}
                  </p>
                </div>
                {isBest && (
                  <span className="rounded-full bg-green-700 px-2 py-1 text-xs font-semibold text-white">
                    Mejor
                  </span>
                )}
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Paquete / suplemento</dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {formatCurrency(option.packageCost, currency)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Fuera del paquete</dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {option.outsidePackageCost === null
                      ? "Pendiente"
                      : formatCurrency(option.outsidePackageCost, currency)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Coste total</dt>
                  <dd className="mt-1 text-lg font-bold text-slate-900">
                    {option.totalCost === null
                      ? "No disponible"
                      : formatCurrency(option.totalCost, currency)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Cobertura</dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {option.coverageScore === null
                      ? "—"
                      : `${option.coverageScore.toFixed(0)} %`}
                  </dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>

      <div className="mt-5 hidden overflow-x-auto rounded-xl border border-sky-200 bg-white md:block">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Opción</th>
              <th className="px-4 py-3 text-right">Paquete / suplemento</th>
              <th className="px-4 py-3 text-right">Fuera del paquete</th>
              <th className="px-4 py-3 text-right">Coste total</th>
              <th className="px-4 py-3 text-right">Cobertura</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {comparison.options.map((option) => {
              const isBest = option.key === bestOption.key;

              return (
                <tr key={option.key} className={isBest ? "bg-green-50" : "bg-white"}>
                  <td className="px-4 py-4">
                    <p className="font-bold text-slate-900">{option.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {statusLabels[option.status]}
                      {isBest ? " · Mejor opción" : ""}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-slate-800">
                    {formatCurrency(option.packageCost, currency)}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-slate-800">
                    {option.outsidePackageCost === null
                      ? "Pendiente"
                      : formatCurrency(option.outsidePackageCost, currency)}
                  </td>
                  <td className="px-4 py-4 text-right text-base font-bold text-slate-900">
                    {option.totalCost === null
                      ? "No disponible"
                      : formatCurrency(option.totalCost, currency)}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-slate-800">
                    {option.coverageScore === null
                      ? "—"
                      : `${option.coverageScore.toFixed(0)} %`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-5 rounded-xl border border-green-200 bg-white p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
          Conclusión DrinkPilot
        </p>
        <p className="mt-2 text-lg font-bold text-slate-900">{conclusion}</p>
        {comparison.savingsAgainstNoPackage !== null &&
          comparison.savingsAgainstNoPackage > 0 && (
            <p className="mt-2 leading-6 text-slate-700">
              Ahorrarías aproximadamente{" "}
              <strong>
                {formatCurrency(comparison.savingsAgainstNoPackage, currency)}
              </strong>{" "}
              frente a pagar todas las bebidas por separado.
            </p>
          )}
        {comparison.hasIncompleteOptions && (
          <p className="mt-3 text-sm leading-6 text-amber-800">
            La conclusión compara únicamente las opciones con todos los precios necesarios. Las alternativas pendientes permanecen visibles, pero no se usan para decidir.
          </p>
        )}
      </div>
    </section>
  );
}
