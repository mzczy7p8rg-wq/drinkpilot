export const mscOnboardPrices = {
  coffee: {
    name: "Café",
    icon: "☕",
    price: null,
    currency: "EUR",

    status: "pending",

    note:
      "Pendiente de una referencia oficial general suficientemente fiable para el mercado y crucero seleccionados.",
  },

  water: {
    name: "AQUA by MSC",
    icon: "💧",

    /*
     * MSC publica distintos formatos
     * y precios para AQUA by MSC.
     *
     * DrinkPilot todavía no reduce
     * esos formatos a un único precio
     * medio válido para el motor.
     */
    price: null,

    currency: "EUR",

    status: "pending",

    note:
      "MSC publica precios específicos para distintos formatos de AQUA by MSC, pero DrinkPilot todavía no los reduce a un único precio medio para el motor.",
  },

  soda: {
    name: "Refresco",
    icon: "🥤",
    price: null,
    currency: "EUR",

    status: "pending",

    note:
      "Pendiente de una referencia oficial general suficientemente fiable.",
  },

  juice: {
    name: "Zumo",
    icon: "🧃",
    price: null,
    currency: "EUR",
    status: "pending",
    note:
      "Pendiente de una referencia oficial general suficientemente fiable.",
  },

  beer: {
    name: "Cerveza",
    icon: "🍺",
    price: null,
    currency: "EUR",

    status: "pending",

    note:
      "Pendiente de una referencia oficial general suficientemente fiable.",
  },

  wine: {
    name: "Vino por copa",
    icon: "🍷",
    price: null,
    currency: "EUR",

    status: "pending",

    note:
      "Pendiente de una referencia oficial general suficientemente fiable.",
  },

  cocktail: {
    name: "Cóctel",
    icon: "🍸",
    price: null,
    currency: "EUR",

    status: "pending",

    note:
      "Pendiente de una referencia oficial general suficientemente fiable.",
  },
} as const;

/*
 * Valores económicos utilizados por
 * comparison.ts.
 *
 * null significa que todavía no existe
 * una referencia suficientemente fiable.
 *
 * Nunca utilizamos 0 como sustituto de
 * un precio desconocido.
 */
export const mscOnboardPriceValues = {
  coffee:
    mscOnboardPrices.coffee.price,

  water:
    mscOnboardPrices.water.price,

  soda:
    mscOnboardPrices.soda.price,

  juice:
    mscOnboardPrices.juice.price,

  beer:
    mscOnboardPrices.beer.price,

  wine:
    mscOnboardPrices.wine.price,

  cocktail:
    mscOnboardPrices.cocktail.price,
} as const;
