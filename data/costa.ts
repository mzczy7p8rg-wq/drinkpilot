export const costaPackages = {
  myDrinks: {
    name: "My Drinks",
    pricePerDay: 34,
    maxPriceIncluded: 9,

    drinks: {
      coffee: 3.5,
      water: 2.5,
      soda: 3.5,
      beer: 7,
      wine: 8,
      cocktail: 9,
    },
  },

  myDrinksPlus: {
    name: "My Drinks Plus",
    pricePerDay: 46,
    maxPriceIncluded: 15,

    drinks: {
      coffee: 4,
      water: 3,
      soda: 4,
      beer: 8,
      wine: 10,
      cocktail: 12,
    },
  },

  premiumExtra: {
    name: "Premium Extra",
    pricePerDay: 65,
    maxPriceIncluded: 20,

    drinks: {
      coffee: 5,
      water: 3,
      soda: 4,
      beer: 9,
      wine: 14,
      cocktail: 16,
    },
  },
} as const;