import {
  mscMetadata,
} from "@/data/msc/metadata";

import {
  mscEasyRestrictions,
  mscPremiumExtraRestrictions,
  mscAlcoholFreeRestrictions,
  mscMinorsRestrictions,
} from "@/data/msc/restrictions";

const MSC_DRINKS_SOURCE =
  mscMetadata.sources
    .officialDrinksPage;

export const mscPackages = {
  mscEasy: {
    id: "mscEasy",

    name: "Easy Package",

    icon: "🍹",

    description:
      "Paquete MSC con bebidas calientes, refrescos, zumos, AQUA by MSC, cerveza seleccionada, vino de la casa, cócteles clásicos y alternativas sin alcohol.",

    pricePerDay: null,

    priceStatus: "pending",

    priceNote:
      "MSC no publica un precio diario universal válido para todos los barcos, mercados e itinerarios. Pendiente de precio real de reserva o referencia suficientemente fiable.",

    economicEligibility:
      "blocked",

    economicActivation:
      "user-price-only",

    currency: "EUR",

    includesAlcohol: true,

    existenceStatus:
      "verified",

    inclusionsStatus:
      "verified",

    coverage: {
      coffee: true,
      water: true,
      soda: true,

      beer: true,
      wine: true,

      cocktail: true,

      alcoholicCocktails:
        true,

      nonAlcoholicCocktails:
        true,

      premiumCocktails:
        false,

      /*
       * MSC menciona cerveza
       * embotellada seleccionada.
       */
      bottledBeer: true,

      premiumSpirits:
        false,

      /*
       * AQUA es ilimitada para titulares
       * de paquete, pero no equivale a
       * agua mineral embotellada
       * tradicional ilimitada.
       */
      bottledWaterUnlimited:
        false,

      status: "verified",
    },

    observedCoverage: {
      aquaByMscUnlimited:
        true,

      alcoholicDrinksDailyLimit:
        15,

      venueCoverage: {
        specialityRestaurants:
          "limited",

        privateIslands:
          "limited",

        themedVenues:
          "limited",

        excludedVenues: [],
      },

      packagePurchaseGroupRequirement:
        "same-cabin",

      packagePricingDayPolicy:
        "exclude-disembarkation-day",
    },

    restrictions:
      mscEasyRestrictions,

    status: "pending",

    sourceUrl:
      MSC_DRINKS_SOURCE,

    lastVerified:
      mscMetadata.verification
        .inclusionsLastVerified,
  },

  mscPremiumExtra: {
    id: "mscPremiumExtra",

    name:
      "Premium Extra Package",

    icon: "🍸",

    description:
      "Paquete premium MSC con cafés especiales, refrescos y energy drinks, zumos y smoothies, AQUA by MSC, cerveza amplia, vinos premium, destilados premium y cócteles preparados con marcas premium.",

    pricePerDay: null,

    priceStatus: "pending",

    priceNote:
      "Precio dependiente de reserva, mercado, barco e itinerario. Pendiente de precio real o referencia suficientemente fiable.",

    economicEligibility:
      "blocked",

    economicActivation:
      "user-price-only",

    currency: "EUR",

    includesAlcohol: true,

    existenceStatus:
      "verified",

    inclusionsStatus:
      "verified",

    coverage: {
      coffee: true,
      water: true,
      soda: true,

      beer: true,
      wine: true,

      cocktail: true,

      alcoholicCocktails:
        true,

      nonAlcoholicCocktails:
        true,

      premiumCocktails:
        true,

      bottledBeer:
        true,

      premiumSpirits:
        true,

      bottledWaterUnlimited:
        false,

      status: "verified",
    },

    observedCoverage: {
      aquaByMscUnlimited:
        true,

      alcoholicDrinksDailyLimit:
        15,

      venueCoverage: {
        specialityRestaurants:
          "conditional",

        privateIslands:
          "conditional",

        themedVenues:
          "unknown",

        excludedVenues: [],
      },

      packagePurchaseGroupRequirement:
        "same-cabin",

      packagePricingDayPolicy:
        "exclude-disembarkation-day",
    },

    restrictions:
      mscPremiumExtraRestrictions,

    status: "pending",

    sourceUrl:
      MSC_DRINKS_SOURCE,

    lastVerified:
      mscMetadata.verification
        .inclusionsLastVerified,
  },

  mscAlcoholFree: {
    id: "mscAlcoholFree",

    name:
      "Alcohol-Free Package",

    icon: "🥤",

    description:
      "Paquete MSC sin alcohol con cafés especiales, bebidas calientes, refrescos y energy drinks, zumos, smoothies, AQUA by MSC y cerveza, vino y cócteles sin alcohol.",

    pricePerDay: null,

    priceStatus: "pending",

    priceNote:
      "Precio dependiente de reserva, mercado, barco e itinerario. Pendiente de precio real o referencia suficientemente fiable.",

    economicEligibility:
      "blocked",

    economicActivation:
      "user-price-only",

    currency: "EUR",

    includesAlcohol:
      false,

    existenceStatus:
      "verified",

    inclusionsStatus:
      "verified",

    coverage: {
      coffee: true,
      water: true,
      soda: true,

      beer: false,
      wine: false,

      cocktail: false,

      alcoholicCocktails:
        false,

      nonAlcoholicCocktails:
        true,

      premiumCocktails:
        false,

      bottledBeer:
        false,

      premiumSpirits:
        false,

      bottledWaterUnlimited:
        false,

      status: "verified",
    },

    observedCoverage: {
      aquaByMscUnlimited:
        true,

      nonAlcoholicBeer:
        true,

      nonAlcoholicWine:
        true,

      venueCoverage: {
        specialityRestaurants:
          "limited",

        privateIslands:
          "limited",

        themedVenues:
          "limited",

        excludedVenues: [],
      },

      packagePurchaseGroupRequirement:
        "same-cabin",

      packagePricingDayPolicy:
        "exclude-disembarkation-day",
    },

    restrictions:
      mscAlcoholFreeRestrictions,

    status: "pending",

    sourceUrl:
      MSC_DRINKS_SOURCE,

    lastVerified:
      mscMetadata.verification
        .inclusionsLastVerified,
  },

  mscMinors: {
    id: "mscMinors",

    name: "Minors Package",

    icon: "🧃",

    description:
      "Paquete MSC destinado a menores vinculados a familias que adquieren determinados paquetes adultos. Incluye bebidas calientes, refrescos, energy drinks, zumos, smoothies, AQUA by MSC y cócteles sin alcohol.",

    pricePerDay: null,

    priceStatus: "pending",

    priceNote:
      "No se utiliza todavía en el cálculo adulto de DrinkPilot.",

    economicEligibility:
      "blocked",

    /*
     * A diferencia de los paquetes adultos,
     * no queremos que pueda activarse
     * simplemente introduciendo un precio.
     */
    economicActivation:
      "disabled",

    currency: "EUR",

    includesAlcohol:
      false,

    existenceStatus:
      "verified",

    inclusionsStatus:
      "verified",

    coverage: {
      coffee: true,
      water: true,
      soda: true,

      beer: false,
      wine: false,

      cocktail: false,

      alcoholicCocktails:
        false,

      nonAlcoholicCocktails:
        true,

      premiumCocktails:
        false,

      bottledBeer:
        false,

      premiumSpirits:
        false,

      bottledWaterUnlimited:
        false,

      status: "verified",
    },

    observedCoverage: {
      aquaByMscUnlimited:
        true,

      minorsOnly:
        true,

      packagePurchaseGroupRequirement:
        "same-cabin",

      packagePricingDayPolicy:
        "exclude-disembarkation-day",
    },

    restrictions:
      mscMinorsRestrictions,

    /*
     * Pendiente para el motor adulto.
     */
    status: "pending",

    sourceUrl:
      MSC_DRINKS_SOURCE,

    lastVerified:
      mscMetadata.verification
        .inclusionsLastVerified,
  },
} as const;