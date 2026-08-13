import type {
  CruiseLineKey,
} from "@/data/cruiseLines";

const sources = {
  costa: "https://www.costacruises.com/useful-links/useful-info.html",
  msc: "https://www.msccruisesusa.com/-/media/US/Documents/Passage-Contract-240520",
} as const;

type UsAlcoholAgeNoticeProps = {
  cruiseLine: CruiseLineKey;
};

export default function UsAlcoholAgeNotice({
  cruiseLine,
}: UsAlcoholAgeNoticeProps) {
  const isCosta = cruiseLine === "costa";

  return (
    <details className="group mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-amber-950 marker:content-none">
        <span>⚠️ Edad mínima para bebidas con alcohol</span>

        <span className="shrink-0 text-xs text-amber-800 group-open:hidden">
          Ver aviso ↓
        </span>

        <span className="hidden shrink-0 text-xs text-amber-800 group-open:inline">
          Ocultar ↑
        </span>
      </summary>

      <div className="mt-3 space-y-3 text-xs leading-5 text-amber-950 sm:text-sm sm:leading-6">
        <p>
          {isCosta
            ? "Costa establece 21 años para cruceros que salen de puertos de Estados Unidos."
            : "MSC aplica 21 años cuando el itinerario incluye un puerto de Estados Unidos."}
        </p>

        <p>
          Haber seleccionado Estados Unidos o Norteamérica no confirma por sí sola que la regla se aplique. Comprueba el puerto de salida y el itinerario de tu reserva.
        </p>

        <a
          href={sources[cruiseLine]}
          target="_blank"
          rel="noreferrer"
          className="inline-block font-semibold text-amber-900 underline decoration-amber-400 underline-offset-4 hover:text-amber-950"
        >
          Fuente oficial {isCosta ? "Costa" : "MSC"}
        </a>
      </div>
    </details>
  );
}
