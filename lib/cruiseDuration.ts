export type CruiseDuration = {
  /*
   * Unidad canónica de duración.
   *
   * No incluye una jornada adicional por
   * desembarque y no debe derivarse contando
   * las filas/fechas mostradas en el itinerario.
   */
  cruiseNights: number;
};

export type LegacyCruiseDurationResolution = {
  status: "requires-confirmation";
  cruiseNights: null;
  legacyDays: number | null;
};

/*
 * Un valor persistido como `days` es ambiguo:
 * podría representar noches o el número inclusivo
 * de fechas/jornadas mostrado por la naviera.
 *
 * Este contrato conserva el dato únicamente para
 * poder mostrárselo al usuario durante una futura
 * confirmación. Nunca lo convierte en noches.
 */
export function resolveLegacyCruiseDuration(
  value: unknown
): LegacyCruiseDurationResolution {
  const legacyDays =
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0
      ? value
      : null;

  return {
    status: "requires-confirmation",
    cruiseNights: null,
    legacyDays,
  };
}
