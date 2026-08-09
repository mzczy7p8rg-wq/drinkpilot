import {
  isIsoSailingDate,
} from "@/lib/cruiseContext";

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

function sanitizeOptionalCode(
  value: unknown
): string | null {
  return sanitizeOptionalString(
    value
  )?.toUpperCase() ?? null;
}

function sanitizeSailingDate(
  value: unknown
): string | null {
  const normalized =
    sanitizeOptionalString(
      value
    );

  return (
    normalized !== null &&
    isIsoSailingDate(
      normalized
    )
  )
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
 * Las fechas se validan mediante la regla
 * canónica de cruiseContext.ts para impedir
 * que una sesión dañada active condiciones
 * temporales con una fecha imposible.
 */
export function resolveStoredCruiseContext(
  input: StoredCruiseContextInput
): StoredCruiseContext {
  return {
    market:
      sanitizeOptionalCode(
        input.market
      ),

    sailingRegion:
      sanitizeOptionalCode(
        input.sailingRegion
      ),

    onboardCurrency:
      sanitizeOptionalCode(
        input.onboardCurrency
      ),

    sailingDate:
      sanitizeSailingDate(
        input.sailingDate
      ),
  };
}
