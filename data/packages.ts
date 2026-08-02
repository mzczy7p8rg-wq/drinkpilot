import {
  myDrinksSoftRestrictions,
  myDrinksRestrictions,
  myDrinksPlusRestrictions,
} from "./restrictions";

const COSTA_DRINKS_SOURCE =
  "https://www.costacruceros.com/experiencia/paquetes-de-bebidas.html";

export const costaPackages = {
  myDrinksSoft: {
    id: "myDrinksSoft",

    name: "My Drinks Soft",

    icon: "🥤",

    description:
      "Opción sin alcohol. La información detallada y el precio están pendientes de verificación oficial para el mercado y crucero seleccionados.",

    /*
     * No utilizamos un precio inventado.
     * Este paquete permanece bloqueado hasta disponer
     * de información suficiente para calcularlo.
     */
    pricePerDay: 0,

    priceStatus: "pending",

    priceNote:
      "Precio pendiente de verificación para el crucero seleccionado.",

    currency: "EUR",

    includesAlcohol: false,

    /*
     * Costa no publica en la página oficial consultada
     * un límite monetario universal por bebida.
     */
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

    /*
     * PRECIO DE REFERENCIA DE DRINKPILOT.
     *
     * Costa no publica un precio diario universal:
     * puede variar según crucero, destino, tarifa
     * y momento de compra.
     */
    pricePerDay: 34,

    priceStatus: "reference",

    priceNote:
      "Precio orientativo usado para el cálculo. El precio real puede variar y debe comprobarse en MyCosta o en la reserva.",

    currency: "EUR",

    includesAlcohol: true,

    maxDrinkPrice: 0,

    maxDrinkPriceVerified: false,

    /*
     * Estos importes son precios de referencia
     * para estimar cuánto costaría comprar
     * las bebidas por separado.
     *
     * NO son una carta oficial universal de Costa.
     */
    drinks: {
      coffee: 3.5,
      water: 2.5,
      soda: 3.5,
      beer: 7,
      wine: 8,
      cocktail: 9,
    },

    restrictions: myDrinksRestrictions,

    status: "verified",

    sourceUrl: COSTA_DRINKS_SOURCE,

    lastVerified: "2026-08-02",
  },

  myDrinksPlus: {
    id: "myDrinksPlus",

    name: "My Drinks Plus",

    icon: "🍸",

    description:
      "Paquete ampliado con cafetería, vinos seleccionados, cócteles especiales, licores y destilados de marcas superiores, además de agua embotellada y una selección más amplia de bebidas.",

    /*
     * PRECIO DE REFERENCIA DE DRINKPILOT.
     *
     * No representa una tarifa oficial universal.
     */
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

    restrictions: myDrinksPlusRestrictions,

    status: "verified",

    sourceUrl: COSTA_DRINKS_SOURCE,

    lastVerified: "2026-08-02",
  },
} as const;