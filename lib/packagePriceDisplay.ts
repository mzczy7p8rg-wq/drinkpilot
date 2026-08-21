import { formatCurrency } from "@/lib/currencyFormatting";

export function formatPackagePricePerChargeUnit(
  price: number,
  currency: string,
  isIncludedInReservation: boolean
): string {
  const amount = `${formatCurrency(price, currency)} por persona / noche`;

  return isIncludedInReservation
    ? `Coste incremental: ${amount}`
    : amount;
}
