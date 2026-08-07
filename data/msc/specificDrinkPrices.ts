import type {
  OnboardPriceKey,
} from "@/lib/onboardPriceService";

/*
 * PRECIOS CONCRETOS DE BEBIDAS MSC
 *
 * Esta capa representa referencias de precio
 * para productos concretos publicados o
 * documentados por MSC.
 *
 * No representa precios medios de una categoría
 * ni debe utilizarse para fabricar una cesta
 * económica general.
 */

export type MscSpecificDrinkPriceSource =
  "official";

export type MscSpecificDrinkPrice = {
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

  source:
    MscSpecificDrinkPriceSource;

  sourceUrl:
    string;

  verifiedAt:
    string;

  notes?:
    string;
};

/*
 * Inicialmente permanece vacío.
 *
 * Solo añadiremos referencias cuando tengamos
 * evidencia suficiente para asociar:
 *
 * - producto
 * - formato
 * - precio
 * - moneda
 * - fuente oficial
 * - fecha de verificación
 */
export const mscSpecificDrinkPrices:
  readonly MscSpecificDrinkPrice[] = [
  {
    id: "msc-aqua-1l-main-restaurant",
    category: "water",
    productName: "AQUA by MSC",
    format: "1L glass bottle",
    price: 2,
    currency: "EUR",
    source: "official",
    sourceUrl:
      "https://www.msccruises.com/int/on-board/dining-and-drinks/aqua-by-msc",
    verifiedAt: "2026-08-07",
    notes:
      "Para huéspedes sin paquete de bebidas; disponible en restaurantes principales.",
  },
  {
    id: "msc-aqua-50cl-refill",
    category: "water",
    productName: "AQUA by MSC",
    format: "50cl self-service refill",
    price: 1,
    currency: "EUR",
    source: "official",
    sourceUrl:
      "https://www.msccruises.com/int/on-board/dining-and-drinks/aqua-by-msc",
    verifiedAt: "2026-08-07",
    notes:
      "Para huéspedes sin paquete de bebidas; refill en estaciones self-service.",
  },
  {
    id: "msc-aqua-20cl-glass",
    category: "water",
    productName: "AQUA by MSC",
    format: "20cl glass",
    price: 0.5,
    currency: "EUR",
    source: "official",
    sourceUrl:
      "https://www.msccruises.com/int/on-board/dining-and-drinks/aqua-by-msc",
    verifiedAt: "2026-08-07",
    notes:
      "Para huéspedes sin paquete de bebidas; vaso servido en bares y buffets.",
  },
];
