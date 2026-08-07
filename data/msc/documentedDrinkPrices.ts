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

  menuName?:
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
  readonly MscDocumentedDrinkPrice[] = [
  {
    id:
      "msc-world-america-passion-fruit-martini-2025-07",

    category:
      "cocktail",

    productName:
      "Passion Fruit Martini",

    format:
      null,

    price:
      14,

    currency:
      "USD",

    evidence:
      "documented-menu",

    sourceUrl:
      "https://cruise.blog/2025/msc-cruises-drink-menu-and-prices",

    observedAt:
      "2025-07",

    ship:
      "MSC World America",

    market:
      "North America",

    itinerary:
      null,


  menuName:
    "Fleetwide menu",

    notes:
      "Precio observado en una carta atribuida a MSC World America; no debe generalizarse a toda la flota ni a otros mercados.",
  },

  {
    id:
      "msc-world-america-heineken-draft-14oz-2025-07",

    category:
      "beer",

    productName:
      "Heineken Draft",

    format:
      "14 oz",

    price:
      9,

    currency:
      "USD",

    evidence:
      "documented-menu",

    sourceUrl:
      "https://cruise.blog/2025/msc-cruises-drink-menu-and-prices",

    observedAt:
      "2025-07",

    ship:
      "MSC World America",

    market:
      "North America",

    itinerary:
      null,


  menuName:
    "Fleetwide menu",

    notes:
      "Precio observado para formato draft de 14 oz; la misma carta documenta un formato de 7 oz con precio diferente.",
  },

  {
    id:
      "msc-world-america-canned-soda-2025-07",

    category:
      "soda",

    productName:
      "Canned Soda",

    format:
      "can",

    price:
      3.5,

    currency:
      "USD",

    evidence:
      "documented-menu",

    sourceUrl:
      "https://cruise.blog/2025/msc-cruises-drink-menu-and-prices",

    observedAt:
      "2025-07",

    ship:
      "MSC World America",

    market:
      "North America",

    itinerary:
      null,


  menuName:
    "Fleetwide menu",

    notes:
      "Precio observado en carta documentada de MSC World America; no representa un precio medio MSC.",
  },

  {
    id:
      "msc-world-america-espresso-fleetwide-2025-07",

    category:
      "coffee",

    productName:
      "Espresso",

    format:
      null,

    price:
      2.5,

    currency:
      "USD",

    evidence:
      "documented-menu",

    sourceUrl:
      "https://cruise.blog/2025/msc-cruises-drink-menu-and-prices",

    observedAt:
      "2025-07",

    ship:
      "MSC World America",

    market:
      "North America",

    itinerary:
      null,

    menuName:
      "Fleetwide menu",

    notes:
      "Espresso del menú general documentado. No debe confundirse con el Espresso de Coffee Emporium, que tiene un precio distinto.",
  },

  {
    id:
      "msc-world-america-water-16oz-fleetwide-2025-07",

    category:
      "water",

    productName:
      "Still/Sparkling Water",

    format:
      "16 oz",

    price:
      3.25,

    currency:
      "USD",

    evidence:
      "documented-menu",

    sourceUrl:
      "https://cruise.blog/2025/msc-cruises-drink-menu-and-prices",

    observedAt:
      "2025-07",

    ship:
      "MSC World America",

    market:
      "North America",

    itinerary:
      null,

    menuName:
      "Fleetwide menu",

    notes:
      "Precio documentado para formato de 16 oz; la carta también muestra un formato de 32 oz con precio diferente.",
  },

  {
    id:
      "msc-world-america-valdo-prosecco-glass-2025-07",

    category:
      "wine",

    productName:
      "Valdo, Prosecco",

    format:
      "glass",

    price:
      14,

    currency:
      "USD",

    evidence:
      "documented-menu",

    sourceUrl:
      "https://cruise.blog/2025/msc-cruises-drink-menu-and-prices",

    observedAt:
      "2025-07",

    ship:
      "MSC World America",

    market:
      "North America",

    itinerary:
      null,

    menuName:
      "Fleetwide menu",

    notes:
      "Precio por copa documentado; la misma carta muestra también precio por botella.",
  },

  {
    id:
      "msc-world-america-heineken-draft-7oz-2025-07",

    category:
      "beer",

    productName:
      "Heineken Draft",

    format:
      "7 oz",

    price:
      6,

    currency:
      "USD",

    evidence:
      "documented-menu",

    sourceUrl:
      "https://cruise.blog/2025/msc-cruises-drink-menu-and-prices",

    observedAt:
      "2025-07",

    ship:
      "MSC World America",

    market:
      "North America",

    itinerary:
      null,

    menuName:
      "Fleetwide menu",

    notes:
      "Segundo formato documentado de Heineken draft; el formato de 14 oz tiene un precio diferente.",
  },

];
