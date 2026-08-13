import {
  costaMetadata,
} from "@/data/metadata";

function formatVerifiedDate(value: string) {
  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;
}

export default function CostaIncludedPackageGuidance() {
  const source = costaMetadata.sources.officialSourceDetails.find(
    ({ id }) => id === "costa-spain-drinks-page"
  );

  return (
    <details className="group mt-5 rounded-xl border border-sky-200 bg-white p-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-sky-950 marker:content-none">
        <span>¿Tu tarifa ya incluye bebidas?</span>

        <span className="shrink-0 text-xs font-semibold text-sky-700 group-open:hidden">
          Comprobar ↓
        </span>

        <span className="hidden shrink-0 text-xs font-semibold text-sky-700 group-open:inline">
          Ocultar ↑
        </span>
      </summary>

      <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
        <p>
          En las tarifas españolas de Costa, <strong>Todo Incluido</strong> y <strong>Super Todo Incluido</strong> incluyen <strong>My Drinks</strong>. <strong>Todo Incluido Suite</strong> incluye <strong>My Drinks Plus</strong>.
        </p>

        <p>
          Comprueba el nombre y el precio que aparecen en tu reserva o en MyCosta. No deducimos automáticamente qué paquete tienes ni añadimos un coste si no lo indicas.
        </p>

        {source && (
          <p className="border-t border-sky-100 pt-3 text-xs text-slate-500">
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-sky-700 underline decoration-sky-300 underline-offset-4 hover:text-sky-900"
            >
              Consultar fuente oficial de Costa
            </a>{" "}
            · Revisado el {formatVerifiedDate(source.verifiedAt)}
          </p>
        )}
      </div>
    </details>
  );
}
