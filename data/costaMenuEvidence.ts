export const costaMenuEvidence = {
  source: {
    name:
      "Costa Toscana — carta de bebidas",

    type:
      "secondary-historical",

    ship:
      "Costa Toscana",

    documentType:
      "onboard-drinks-menu",

    confidence:
      "supporting-evidence",

    note:
      "Carta de bebidas utilizada como evidencia histórica y de cobertura. No se interpreta como lista oficial de precios vigente para 2026.",
  },

  packageMarkers: {
    myDrinksPlus: {
      label: "My Drinks Plus",
      observed: true,
    },

    myDrinks: {
      label: "My Drinks",
      observed: true,
    },

    myDrinksSoft: {
      label: "My Soft Drinks",
      observed: true,
    },
  },

  myDrinksSoft: {
    existenceVerifiedFromMenu: true,

    observedCoverage: {
      coffee: true,
      water: true,
      soda: true,

      alcoholicBeer: false,
      alcoholicWine: false,
      alcoholicCocktails: false,

      nonAlcoholicCocktails: true,
    },

    limitations: [
      "El documento confirma la existencia de My Soft Drinks y marcadores de inclusión en bebidas sin alcohol.",
      "El precio vigente del paquete no está verificado.",
      "La cobertura completa del paquete debe contrastarse con documentación oficial actual.",
      "DrinkPilot todavía no distingue en el motor entre cócteles alcohólicos y cócteles sin alcohol.",
    ],
  },

  pricing: {
    serviceChargeRate: 0.15,

    serviceChargeStatus:
      "documented",

    currentReferencePricesStatus:
      "reference",

    note:
      "Los precios observados en la carta sirven para calibrar referencias históricas. No se sustituyen automáticamente los precios actuales utilizados por DrinkPilot.",
  },
} as const;