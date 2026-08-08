function normalizeCurrency(
  currency: string
): string {
  const normalized =
    currency.trim().toUpperCase();

  return normalized.length > 0
    ? normalized
    : currency;
}

export function formatCurrency(
  amount: number,
  currency: string
): string {
  const normalizedCurrency =
    normalizeCurrency(currency);

  try {
    return new Intl.NumberFormat(
      "es-ES",
      {
        style: "currency",
        currency:
          normalizedCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(amount);
  } catch {
    return `${amount.toFixed(
      2
    )} ${normalizedCurrency}`;
  }
}

export function formatSignedCurrency(
  amount: number,
  currency: string
): string {
  const formatted =
    formatCurrency(
      amount,
      currency
    );

  return amount > 0
    ? `+${formatted}`
    : formatted;
}
