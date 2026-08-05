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
   * Mercado o región de la reserva.
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
    sailingDate: null,
  };
}

/*
 * Comprueba únicamente el formato básico
 * ISO de fecha.
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

  return /^\d{4}-\d{2}-\d{2}$/.test(
    value
  );
}
