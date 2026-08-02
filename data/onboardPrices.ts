export const costaOnboardPrices = {
  coffee: {
    name: "Café",
    icon: "☕",
    price: 3.5,
    currency: "EUR",

    status: "reference",

    note:
      "Precio medio de referencia utilizado por DrinkPilot. Pendiente de contrastar con una carta oficial vigente de Costa Cruceros.",
  },

  water: {
    name: "Agua",
    icon: "💧",
    price: 2.5,
    currency: "EUR",

    status: "reference",

    note:
      "Precio medio de referencia utilizado por DrinkPilot. Pendiente de contrastar con una carta oficial vigente de Costa Cruceros.",
  },

  soda: {
    name: "Refresco",
    icon: "🥤",
    price: 3.5,
    currency: "EUR",

    status: "reference",

    note:
      "Precio medio de referencia utilizado por DrinkPilot. Pendiente de contrastar con una carta oficial vigente de Costa Cruceros.",
  },

  beer: {
    name: "Cerveza",
    icon: "🍺",
    price: 7,
    currency: "EUR",

    status: "reference",

    note:
      "Precio medio de referencia utilizado por DrinkPilot. Pendiente de contrastar con una carta oficial vigente de Costa Cruceros.",
  },

  wine: {
    name: "Vino por copa",
    icon: "🍷",
    price: 8,
    currency: "EUR",

    status: "reference",

    note:
      "Precio medio de referencia utilizado por DrinkPilot. Pendiente de contrastar con una carta oficial vigente de Costa Cruceros.",
  },

  cocktail: {
    name: "Cóctel",
    icon: "🍸",
    price: 9,
    currency: "EUR",

    status: "reference",

    note:
      "Precio medio de referencia utilizado por DrinkPilot. Pendiente de contrastar con una carta oficial vigente de Costa Cruceros.",
  },
} as const;

export type DrinkPriceKey =
  keyof typeof costaOnboardPrices;

export const costaOnboardPriceValues = {
  coffee: costaOnboardPrices.coffee.price,
  water: costaOnboardPrices.water.price,
  soda: costaOnboardPrices.soda.price,
  beer: costaOnboardPrices.beer.price,
  wine: costaOnboardPrices.wine.price,
  cocktail: costaOnboardPrices.cocktail.price,
} as const;