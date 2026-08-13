import type {
  CruiseLineKey,
} from "@/data/cruiseLines";

type MinorsCalculationNoticeProps = {
  cruiseLine: CruiseLineKey;
  minors: number;
};

export default function MinorsCalculationNotice({
  cruiseLine,
  minors,
}: MinorsCalculationNoticeProps) {
  if (minors <= 0) {
    return null;
  }

  return (
    <details className="group mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-sky-950 marker:content-none sm:text-lg">
        <span>
          👨‍👩‍👧 Menores incluidos en el viaje
        </span>

        <span className="shrink-0 text-xs font-semibold text-sky-700 group-open:hidden">
          Ver detalle ↓
        </span>

        <span className="hidden shrink-0 text-xs font-semibold text-sky-700 group-open:inline">
          Ocultar ↑
        </span>
      </summary>

      <p className="mt-3 text-sm leading-6 text-sky-950">
        El cálculo económico incluye solo a los adultos.
      </p>

      {cruiseLine === "costa" ? (
        <p className="mt-2 text-sm leading-6 text-sky-900">
          Costa ofrece a los viajeros de 3 a 17 años un paquete sin alcohol, pero el precio depende de la reserva y no está publicado como importe único. Por eso DrinkPilot no añade un coste infantil estimado.
        </p>
      ) : (
        <p className="mt-2 text-sm leading-6 text-sky-900">
          Las condiciones y el precio para menores dependen de la reserva. DrinkPilot no añade un coste infantil sin información suficiente.
        </p>
      )}
    </details>
  );
}
