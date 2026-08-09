import { isPositiveSafePrice } from "@/lib/priceValidation";

export type CustomPackagePrice = {
  price: number;
  currency: string;
};

export type CustomPackagePrices = Record<
  string,
  CustomPackagePrice | null
>;

function normalizeCurrency(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const currency = value.trim().toUpperCase();

  return /^[A-Z]{3}$/.test(currency) ? currency : null;
}

export function createCustomPackagePrice({
  price,
  currency,
}: {
  price: unknown;
  currency: unknown;
}): CustomPackagePrice | null {
  const normalizedCurrency = normalizeCurrency(currency);

  if (!isPositiveSafePrice(price) || normalizedCurrency === null) {
    return null;
  }

  return { price, currency: normalizedCurrency };
}

export function resolveStoredCustomPackagePrice(
  value: unknown,
  fallbackCurrency: string
): CustomPackagePrice | null {
  if (isPositiveSafePrice(value)) {
    return createCustomPackagePrice({
      price: value,
      currency: fallbackCurrency,
    });
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const stored = value as Record<string, unknown>;

  return createCustomPackagePrice({
    price: stored.price,
    currency: stored.currency,
  });
}
