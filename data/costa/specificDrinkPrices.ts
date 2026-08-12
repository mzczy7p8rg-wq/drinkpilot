import type {
  DrinkPriceEvidence,
} from "@/lib/drinkPriceEvidence";

import type {
  OnboardPriceKey,
} from "@/lib/onboardPriceService";

export type CostaSpecificDrinkPrice = {
  id: string;
  category: OnboardPriceKey;
  productName: string;
  format: string | null;
  price: number;
  currency: "EUR" | "USD";
  source: "official";
  evidence: DrinkPriceEvidence;
  sourceUrl: string;
  verifiedAt: string;
  notes?: string;
};

/*
 * No se incorporan precios oficiales Costa
 * hasta disponer de una referencia concreta
 * verificable para producto, formato y moneda.
 */
export const costaSpecificDrinkPrices:
  readonly CostaSpecificDrinkPrice[] = [];
