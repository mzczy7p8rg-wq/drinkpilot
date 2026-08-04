import {
  costaPackages,
} from "@/data/packages";

import {
  costaOnboardPrices,
  costaOnboardPriceValues,
} from "@/data/onboardPrices";

import {
  costaMetadata,
} from "@/data/metadata";

import {
  mscPackages,
} from "@/data/msc/packages";

import {
  mscOnboardPrices,
  mscOnboardPriceValues,
} from "@/data/msc/onboardPrices";

import {
  mscMetadata,
} from "@/data/msc/metadata";

/*
 * REGISTRO CENTRAL DE NAVIERAS
 *
 * Cada compañía aporta su propia:
 *
 * - metadata
 * - definición de paquetes
 * - información de precios a bordo
 * - valores económicos
 *
 * Los motores de DrinkPilot consumen
 * este registro sin depender directamente
 * de una compañía concreta.
 */
export const cruiseLines = {
  costa: {
    id: "costa",

    name: "Costa Cruceros",

    market:
      costaMetadata.market,

    currency:
      costaMetadata.currency,

    packages:
      costaPackages,

    onboardPrices:
      costaOnboardPrices,

    onboardPriceValues:
      costaOnboardPriceValues,

    metadata:
      costaMetadata,
  },

  msc: {
    id: "msc",

    name: "MSC Cruises",

    market:
      mscMetadata.market,

    currency:
      mscMetadata.currency,

    packages:
      mscPackages,

    onboardPrices:
      mscOnboardPrices,

    /*
     * MSC todavía puede contener
     * precios individuales pendientes.
     *
     * comparison.ts detecta los null
     * mediante onboardPriceService y
     * evita fabricar resultados
     * económicos.
     */
    onboardPriceValues:
      mscOnboardPriceValues,

    metadata:
      mscMetadata,
  },
} as const;

/*
 * Clave universal de naviera.
 *
 * TypeScript genera automáticamente:
 *
 * "costa" | "msc"
 */
export type CruiseLineKey =
  keyof typeof cruiseLines;

/*
 * NAVIERA POR DEFECTO
 *
 * Costa continúa siendo el valor
 * utilizado mientras el usuario no
 * seleccione explícitamente otra
 * compañía.
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
 * disponibles en DrinkPilot.
 *
 * Este helper permitirá construir
 * dinámicamente la futura selección
 * de compañía en el wizard.
 */
export function getAllCruiseLines() {
  return Object.values(
    cruiseLines
  );
}