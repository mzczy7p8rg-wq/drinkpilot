export type StoredCruiseContextInput = {
  market?: unknown;
  sailingRegion?: unknown;
  onboardCurrency?: unknown;
  sailingDate?: unknown;
};

export type StoredCruiseContext = {
  market: string | null;
  sailingRegion: string | null;
  onboardCurrency: string | null;
  sailingDate: string | null;
};

function sanitizeOptionalString(
  value: unknown
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized.length > 0
    ? normalized
    : null;
}

/*
 * Normaliza el contexto recuperado de
 * una sesión guardada.
 *
 * SESIONES ANTIGUAS
 *
 * No contienen market ni sailingDate:
 *
 * → market: null
 * → sailingDate: null
 *
 * SESIONES MODERNAS
 *
 * Conservan los valores almacenados,
 * eliminando espacios accidentales.
 *
 * La validación semántica de la fecha
 * continúa perteneciendo a
 * cruiseContext.ts.
 */
export function resolveStoredCruiseContext(
  input: StoredCruiseContextInput
): StoredCruiseContext {
  return {
    market:
      sanitizeOptionalString(
        input.market
      ),

    sailingRegion:
      sanitizeOptionalString(
        input.sailingRegion
      ),

    onboardCurrency:
      sanitizeOptionalString(
        input.onboardCurrency
      ),

    sailingDate:
      sanitizeOptionalString(
        input.sailingDate
      ),
  };
}
