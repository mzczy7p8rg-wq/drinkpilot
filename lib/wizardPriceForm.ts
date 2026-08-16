import type { OnboardPriceKey } from "@/lib/onboardPriceService";
import { isPositiveSafePrice } from "@/lib/priceValidation";

export const drinkCategoryLabels: Record<OnboardPriceKey, string> = {
  coffee: "Café",
  water: "Agua",
  soda: "Refresco",
  juice: "Zumo",
  beer: "Cerveza",
  wine: "Vino",
  cocktail: "Cóctel",
};

export type PriceValidation = {
  valid: boolean;
  value: number | null;
  error: string | null;
  warning: string | null;
};

export function validateOptionalPrice(
  rawValue: string,
  highPriceThreshold: number
): PriceValidation {
  const trimmed = rawValue.trim();

  if (trimmed === "") {
    return {
      valid: true,
      value: null,
      error: null,
      warning: null,
    };
  }

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed)) {
    return {
      valid: false,
      value: null,
      error: "Introduce un precio válido.",
      warning: null,
    };
  }

  if (parsed <= 0) {
    return {
      valid: false,
      value: null,
      error: "El precio debe ser mayor que 0.",
      warning: null,
    };
  }

  if (!isPositiveSafePrice(parsed)) {
    return {
      valid: false,
      value: null,
      error: "El precio es demasiado grande para calcularlo de forma segura.",
      warning: null,
    };
  }

  if (parsed > highPriceThreshold) {
    return {
      valid: true,
      value: parsed,
      error: null,
      warning:
        "Este precio parece bastante alto. Puedes continuar si es el importe real que aparece en tu reserva.",
    };
  }

  return {
    valid: true,
    value: parsed,
    error: null,
    warning: null,
  };
}

export function getHighPriceThreshold(
  referencePrice: number | null
): number {
  if (
    typeof referencePrice === "number" &&
    Number.isFinite(referencePrice) &&
    referencePrice > 0
  ) {
    return Math.max(100, referencePrice * 2.5);
  }

  return 100;
}

export function getCurrencySymbol(currency: string): string {
  try {
    const parts = new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);

    return parts.find((part) => part.type === "currency")?.value ?? currency;
  } catch {
    return currency;
  }
}
