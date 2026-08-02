import { costaMetadata } from "./metadata";

import {
  myDrinksSoftRestrictions,
  myDrinksRestrictions,
  myDrinksPlusRestrictions,
} from "./restrictions";

const COSTA_DRINKS_SOURCE =
  costaMetadata.sources.officialDrinksPage;

const REFERENCE_PRICE_NOTE =
  "Precio de referencia usado por DrinkPilot para estimar el coste de pagar la bebida por separado. No representa una carta oficial universal de Costa Cruceros.";

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

    maxDrinkPrice: 0,

    maxDrinkPriceVerified: false,

    drinks: {
      coffee: 0,
      water: 0,
      soda: 0,
      beer: 0,
      wine: 0,
      cocktail: 0,
    },

    drinkPriceMeta: {
      coffee: {
        status: "pending",
        note: "Precio pendiente de verificación.",
      },
      water: {
        status: "pending",
        note: "Precio pendiente de verificación.",
      },
      soda: {
        status: "pending",
        note: "Precio pendiente de verificación.",
      },
      beer: {
        status: "not-applicable",
        note: "El paquete no incluye bebidas alcohólicas.",
      },
      wine: {
        status: "not-applicable",
        note: "El paquete no incluye bebidas alcohólicas.",
      },
      cocktail: {
        status: "pending",
        note: "Precio de cócteles sin alcohol pendiente de verificación.",
      },
    },

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

    maxDrinkPrice: 0,

    maxDrinkPriceVerified: false,

    drinks: {
      coffee: 3.5,
      water: 2.5,
      soda: 3.5,
      beer: 7,
      wine: 8,
      cocktail: 9,
    },

    drinkPriceMeta: {
      coffee: {
        status: "reference",
        note: REFERENCE_PRICE_NOTE,
      },
      water: {
        status: "reference",
        note: REFERENCE_PRICE_NOTE,
      },
      soda: {
        status: "reference",
        note: REFERENCE_PRICE_NOTE,
      },
      beer: {
        status: "reference",
        note: REFERENCE_PRICE_NOTE,
      },
      wine: {
        status: "reference",
        note: REFERENCE_PRICE_NOTE,
      },
      cocktail: {
        status: "reference",
        note: REFERENCE_PRICE_NOTE,
      },
    },

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

    maxDrinkPrice: 0,

    maxDrinkPriceVerified: false,

    drinks: {
      coffee: 4,
      water: 3,
      soda: 4,
      beer: 8,
      wine: 10,
      cocktail: 12,
    },

    drinkPriceMeta: {
      coffee: {
        status: "reference",
        note: REFERENCE_PRICE_NOTE,
      },
      water: {
        status: "reference",
        note: REFERENCE_PRICE_NOTE,
      },
      soda: {
        status: "reference",
        note: REFERENCE_PRICE_NOTE,
      },
      beer: {
        status: "reference",
        note: REFERENCE_PRICE_NOTE,
      },
      wine: {
        status: "reference",
        note: REFERENCE_PRICE_NOTE,
      },
      cocktail: {
        status: "reference",
        note: REFERENCE_PRICE_NOTE,
      },
    },

    restrictions: myDrinksPlusRestrictions,

    status: "verified",

    sourceUrl: COSTA_DRINKS_SOURCE,

    lastVerified:
      costaMetadata.verification.inclusionsLastVerified,
  },
} as const;