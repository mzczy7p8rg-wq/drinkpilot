import { costaPackages } from "@/data/packages";

import {
  costaOnboardPrices,
  costaOnboardPriceValues,
} from "@/data/onboardPrices";

import { costaMetadata } from "@/data/metadata";

/*
 * Registro central de navieras
 * disponibles en DrinkPilot.
 *
 * Las nuevas compañías se añaden aquí
 * sin necesidad de modificar directamente
 * el motor económico, Store o las páginas
 * dinámicas del wizard.
 */
export const cruiseLines = {
  costa: {
    id: "costa",

    name: "Costa Cruceros",

    market: costaMetadata.market,

    currency: costaMetadata.currency,

    packages: costaPackages,

    onboardPrices:
      costaOnboardPrices,

    onboardPriceValues:
      costaOnboardPriceValues,

    metadata: costaMetadata,
  },
} as const;

/*
 * Clave universal de naviera.
 *
 * TypeScript ampliará automáticamente
 * esta unión cuando añadamos nuevas
 * compañías al registro.
 */
export type CruiseLineKey =
  keyof typeof cruiseLines;

/*
 * NAVIERA POR DEFECTO
 *
 * Este es el único lugar del proyecto
 * donde decidimos qué compañía se utiliza
 * cuando el usuario todavía no ha elegido
 * explícitamente una.
 */
export const DEFAULT_CRUISE_LINE:
  CruiseLineKey = "costa";

/*
 * Devuelve la configuración completa
 * de una naviera.
 */
export function getCruiseLine(
  cruiseLine: CruiseLineKey
) {
  return cruiseLines[
    cruiseLine
  ];
}

/*
 * Devuelve todas las navieras
 * disponibles.
 */
export function getAllCruiseLines() {
  return Object.values(
    cruiseLines
  );
}