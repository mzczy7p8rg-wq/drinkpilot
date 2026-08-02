import { costaMetadata } from "./metadata";

import {
  myDrinksSoftRestrictions,
  myDrinksRestrictions,
  myDrinksPlusRestrictions,
} from "./restrictions";

const COSTA_DRINKS_SOURCE =
  costaMetadata.sources.officialDrinksPage;

export const costaPackages = {
  myDrinksSoft: {
    id: "myDrinksSoft",

    name: "My Drinks Soft",

    icon: "🥤",

    description:
      "Opción sin alcohol. La información detallada y el precio están pendientes de verificación oficial para el mercado y crucero seleccionados.",

    pricePerDay: 0,

    priceStatus: "pending",

    priceNote:
      "Precio pendiente de verificación para el crucero seleccionado.",

    currency: "EUR",

    includesAlcohol: false,

    restrictions: myDrinksSoftRestrictions,

    status: "pending",

    sourceUrl: COSTA_DRINKS_SOURCE,

    lastVerified: null,
  },

  myDrinks: {
    id: "myDrinks",

    name: "My Drinks",

    icon: "🍹",

    description:
      "Paquete con bebidas alcohólicas y sin alcohol, cafetería, vinos por copa, cerveza de barril, refrescos, aperitivos, cócteles clásicos, licores y destilados incluidos según las condiciones de Costa.",

    pricePerDay: 34,

    priceStatus: "reference",

    priceNote:
      "Precio orientativo usado para el cálculo. El precio real puede variar y debe comprobarse en MyCosta o en la reserva.",

    currency: "EUR",

    includesAlcohol: true,

    restrictions: myDrinksRestrictions,

    status: "verified",

    sourceUrl: COSTA_DRINKS_SOURCE,

    lastVerified:
      costaMetadata.verification.inclusionsLastVerified,
  },

  myDrinksPlus: {
    id: "myDrinksPlus",

    name: "My Drinks Plus",

    icon: "🍸",

    description:
      "Paquete ampliado con cafetería, vinos seleccionados, cócteles especiales, licores y destilados de marcas superiores, además de agua embotellada y una selección más amplia de bebidas.",

    pricePerDay: 46,

    priceStatus: "reference",

    priceNote:
      "Precio orientativo usado para el cálculo. El precio real puede variar y debe comprobarse en MyCosta o en la reserva.",

    currency: "EUR",

    includesAlcohol: true,

    restrictions: myDrinksPlusRestrictions,

    status: "verified",

    sourceUrl: COSTA_DRINKS_SOURCE,

    lastVerified:
      costaMetadata.verification.inclusionsLastVerified,
  },
} as const;