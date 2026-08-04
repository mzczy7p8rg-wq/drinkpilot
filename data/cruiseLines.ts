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
 * Por ahora únicamente existe Costa.
 *
 * Las siguientes navieras se añadirán
 * aquí sin necesidad de modificar
 * directamente el motor económico.
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
 * Actualmente:
 *
 * "costa"
 *
 * En el futuro TypeScript ampliará
 * automáticamente esta unión cuando
 * añadamos nuevas navieras al registro.
 */
export type CruiseLineKey =
  keyof typeof cruiseLines;

/*
 * Devuelve la configuración completa
 * de una naviera.
 */
export function getCruiseLine(
  cruiseLine: CruiseLineKey
) {
  return cruiseLines[cruiseLine];
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