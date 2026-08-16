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

  juice: {
    name: "Zumo",
    icon: "🧃",
    price: null,
    currency: "EUR",
    status: "pending",
    note:
      "La carta documenta varios zumos con precios distintos. DrinkPilot no fabrica un precio genérico: elige un producto documentado o introduce el precio real.",
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
  juice: costaOnboardPrices.juice.price,
  beer: costaOnboardPrices.beer.price,
  wine: costaOnboardPrices.wine.price,
  cocktail: costaOnboardPrices.cocktail.price,
} as const;
