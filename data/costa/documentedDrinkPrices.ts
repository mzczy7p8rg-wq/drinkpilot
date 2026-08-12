import type {
  DrinkPriceEvidence,
} from "@/lib/drinkPriceEvidence";

import type {
  OnboardPriceKey,
} from "@/lib/onboardPriceService";

export type CostaDocumentedDrinkPrice = {
  id: string;
  category: OnboardPriceKey;
  productName: string;
  format: string | null;
  price: number;
  currency: "EUR" | "USD";
  evidence: Extract<
    DrinkPriceEvidence,
    "documented-menu"
  >;
  sourceUrl: string;
  observedAt?: string | null;
  ship?: string | null;
  sailingRegion?: string | null;
  itinerary?: string | null;
  menuName?: string | null;
  notes?: string;
};

/*
 * Permanece vacío hasta que una referencia
 * Costa tenga producto, formato, precio,
 * moneda y contexto documental suficientes.
 */
export const costaDocumentedDrinkPrices:
  readonly CostaDocumentedDrinkPrice[] = [];
