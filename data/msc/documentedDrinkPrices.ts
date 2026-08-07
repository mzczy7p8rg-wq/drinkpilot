import type {
  OnboardPriceKey,
} from "@/lib/onboardPriceService";

import type {
  DrinkPriceEvidence,
} from "@/lib/drinkPriceEvidence";

/*
 * PRECIOS MSC PROCEDENTES DE MENÚS DOCUMENTADOS
 *
 * Esta colección representa precios observados
 * en cartas o menús MSC documentados.
 *
 * No equivale a una publicación oficial vigente
 * de MSC para toda la flota.
 *
 * Cada referencia debe conservar el contexto
 * disponible y nunca generalizarse más allá
 * de lo que permita su evidencia.
 */

export type MscDocumentedDrinkPrice = {
  id: string;

  category:
    OnboardPriceKey;

  productName:
    string;

  format:
    string | null;

  price:
    number;

  currency:
    "EUR" | "USD";

  evidence:
    Extract<
      DrinkPriceEvidence,
      "documented-menu"
    >;

  sourceUrl:
    string;

  observedAt?:
    string | null;

  ship?:
    string | null;

  market?:
    string | null;

  itinerary?:
    string | null;

  notes?:
    string;
};

/*
 * Se mantiene vacío hasta incorporar
 * una referencia documental concreta
 * con contexto suficiente.
 */
export const mscDocumentedDrinkPrices:
  readonly MscDocumentedDrinkPrice[] = [];
