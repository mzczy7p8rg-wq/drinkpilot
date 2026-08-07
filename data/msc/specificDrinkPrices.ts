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
  readonly MscSpecificDrinkPrice[] = [];
