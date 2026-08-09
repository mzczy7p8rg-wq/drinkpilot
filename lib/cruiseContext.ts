import type {
  CruiseLineKey,
} from "@/data/cruiseLines";

/*
 * Contexto concreto de una navegación.
 *
 * Permite diferenciar reglas que pueden
 * variar por:
 *
 * - naviera
 * - mercado
 * - fecha de salida
 *
 * Todos los campos salvo cruiseLine son
 * opcionales para mantener compatibilidad
 * con el flujo actual.
 */
export type CruiseContext = {
  cruiseLine: CruiseLineKey;

  /*
   * Mercado de compra o reserva.
   *
   * Ejemplos futuros:
   *
   * "ES"
   * "EU"
   * "US"
   *
   * null = desconocido.
   */
  market: string | null;

  /*
   * Región geográfica u operativa de la
   * navegación.
   *
   * Es deliberadamente distinta del
   * mercado de compra o reserva.
   *
   * Ejemplos futuros para MSC:
   *
   * "MED"
   * "NOR"
   * "WEE"
   *
   * null = desconocida.
   */
  sailingRegion: string | null;

  /*
   * Moneda operativa utilizada a bordo.
   *
   * Es independiente del mercado de compra
   * y de la moneda en la que el usuario haya
   * pagado su reserva.
   *
   * Ejemplos:
   *
   * "EUR"
   * "USD"
   * "GBP"
   *
   * null = desconocida.
   */
  onboardCurrency: string | null;

  /*
   * Fecha de salida ISO:
   *
   * YYYY-MM-DD
   *
   * null = desconocida.
   */
  sailingDate: string | null;
};

/*
 * Contexto mínimo para una naviera.
 *
 * Nos permite utilizar el sistema antes
 * de añadir fecha y mercado al wizard.
 */
export function createCruiseContext(
  cruiseLine: CruiseLineKey
): CruiseContext {
  return {
    cruiseLine,
    market: null,
    sailingRegion: null,
    onboardCurrency: null,
    sailingDate: null,
  };
}

/*
 * Comprueba que el valor sea una fecha de
 * calendario real con formato ISO.
 *
 * La expresión regular por sí sola aceptaría
 * fechas imposibles como 2026-02-31. Ese tipo
 * de valor no debe alcanzar las comparaciones
 * temporales de las reglas contextuales.
 *
 * No intenta decidir todavía si una fecha
 * concreta activa una versión de paquete.
 */
export function isIsoSailingDate(
  value: unknown
): value is string {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      value
    );

  if (!match) {
    return false;
  }

  const year = Number(
    match[1]
  );

  const month = Number(
    match[2]
  );

  const day = Number(
    match[3]
  );

  if (
    month < 1 ||
    month > 12 ||
    day < 1
  ) {
    return false;
  }

  const isLeapYear =
    year % 4 === 0 &&
    (year % 100 !== 0 ||
      year % 400 === 0);

  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return day <=
    daysInMonth[
      month - 1
    ];
}
