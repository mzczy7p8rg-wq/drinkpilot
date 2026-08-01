export const costaPackages = {
  myDrinksSoft: {
    id: "myDrinksSoft",

    name: "My Drinks Soft",

    icon: "🥤",

    description:
      "Paquete de bebidas sin alcohol. Pendiente de completar con información oficial.",

    pricePerDay: 0,

    currency: "EUR",

    includesAlcohol: false,

    maxDrinkPrice: 0,

    drinks: {
      coffee: 0,
      water: 0,
      soda: 0,
      beer: 0,
      wine: 0,
      cocktail: 0,
    },

    status: "pending",
  },

  myDrinks: {
    id: "myDrinks",

    name: "My Drinks",

    icon: "🍹",

    description:
      "Paquete de bebidas con alcohol para disfrutar de una amplia selección durante todo el crucero.",

    pricePerDay: 34,

    currency: "EUR",

    includesAlcohol: true,

    maxDrinkPrice: 9,

    drinks: {
      coffee: 3.5,
      water: 2.5,
      soda: 3.5,
      beer: 7,
      wine: 8,
      cocktail: 9,
    },

    status: "verified",
  },

  myDrinksPlus: {
    id: "myDrinksPlus",

    name: "My Drinks Plus",

    icon: "🍸",

    description:
      "Incluye una selección más amplia de bebidas y marcas premium.",

    pricePerDay: 46,

    currency: "EUR",

    includesAlcohol: true,

    maxDrinkPrice: 15,

    drinks: {
      coffee: 4,
      water: 3,
      soda: 4,
      beer: 8,
      wine: 10,
      cocktail: 12,
    },

    status: "verified",
  },
} as const;