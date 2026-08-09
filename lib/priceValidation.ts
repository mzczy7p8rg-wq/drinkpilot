/*
 * JavaScript deja de representar importes con
 * precisión fiable por encima de este límite.
 * Rechazar esos valores evita además que las
 * multiplicaciones económicas produzcan Infinity.
 */
export function isPositiveSafePrice(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0 &&
    value <= Number.MAX_SAFE_INTEGER
  );
}
