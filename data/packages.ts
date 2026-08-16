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
      "Paquete sin alcohol observado en la carta de bebidas de Costa. Su existencia y parte de su cobertura están respaldadas, pero el precio vigente y algunas condiciones siguen pendientes de verificación suficiente.",

    /*
     * null = precio desconocido.
     *
     * No utilizamos 0 porque 0 € sería
     * conceptualmente un precio real.
     */
    pricePerChargeUnit: null,

    priceStatus: "pending",

    priceNote:
      "Precio pendiente de verificación para el crucero y mercado seleccionados.",

    /*
     * El paquete existe en nuestra capa
     * de datos, pero todavía no puede
     * participar en el cálculo económico.
     */
    economicEligibility: "blocked",

    /*
     * Solo puede participar económicamente
     * cuando el usuario aporta un precio
     * real de su reserva.
     */
    economicActivation:
      "user-price-only",

    currency: "EUR",

    includesAlcohol: false,

    existenceStatus: "verified",

    inclusionsStatus:
      "partial-verified",

    coverage: {
      coffee: true,
      water: true,
      soda: true,
      juice: false,

      beer: false,
      wine: false,

      /*
       * Categoría legacy de cócteles
       * cuantificados por el wizard.
       */
      cocktail: false,

      alcoholicCocktails: false,

      nonAlcoholicCocktails: true,

      premiumCocktails: false,

      bottledBeer: false,

      premiumSpirits: false,

      bottledWaterUnlimited: false,

      status: "partial-verified",
    },

    /*
     * Evidencia adicional observada
     * en la carta estudiada.
     */
    observedCoverage: {
      nonAlcoholicCocktails: true,

      venueCoverage: {
        specialityRestaurants:
          "unknown",

        privateIslands:
          "unknown",

        themedVenues:
          "limited",

        excludedVenues: [
          "Archipelago",
          "Casanova",
        ],
      },

      packagePurchaseGroupRequirement:
        "same-booking-or-cabin",

      packageChargeUnitPolicy:
        "per-night",
    },

    restrictions:
      myDrinksSoftRestrictions,

    /*
     * Sigue pendiente como paquete
     * calculable.
     */
    status: "pending",

    sourceUrl:
      COSTA_DRINKS_SOURCE,

    lastVerified:
      costaMetadata.verification
        .inclusionsLastVerified,
  },

  myDrinks: {
    id: "myDrinks",

    name: "My Drinks",

    icon: "🍹",

    description:
      "Paquete con bebidas alcohólicas y sin alcohol, cafetería, vinos por copa, cerveza de barril, refrescos, aperitivos, cócteles clásicos, licores y destilados incluidos según las condiciones de Costa.",

    pricePerChargeUnit: 34,

    priceStatus: "reference",

    priceNote:
      "Precio orientativo usado para el cálculo. El precio real puede variar y debe comprobarse en MyCosta o en la reserva.",

    economicEligibility:
      "eligible",

    economicActivation:
      "reference-or-user",

    currency: "EUR",

    includesAlcohol: true,

    existenceStatus: "verified",

    inclusionsStatus: "verified",

    coverage: {
      coffee: true,
      water: true,
      soda: true,
      juice: false,

      beer: true,
      wine: true,

      cocktail: true,

      alcoholicCocktails: true,

      nonAlcoholicCocktails: true,

      premiumCocktails: false,

      bottledBeer: false,

      premiumSpirits: false,

      bottledWaterUnlimited: false,

      status: "verified",
    },

    observedCoverage: {
      venueCoverage: {
        specialityRestaurants:
          "unknown",

        privateIslands:
          "unknown",

        themedVenues:
          "limited",

        excludedVenues: [
          "Archipelago",
          "Casanova",
        ],
      },

      packagePurchaseGroupRequirement:
        "same-booking-or-cabin",

      packageChargeUnitPolicy:
        "per-night",
    },

    restrictions:
      myDrinksRestrictions,

    status: "verified",

    sourceUrl:
      COSTA_DRINKS_SOURCE,

    lastVerified:
      costaMetadata.verification
        .inclusionsLastVerified,
  },

  myDrinksPlus: {
    id: "myDrinksPlus",

    name: "My Drinks Plus",

    icon: "🍸",

    description:
      "Paquete ampliado con cafetería, vinos seleccionados, cócteles especiales, licores y destilados de marcas superiores, además de agua embotellada y una selección más amplia de bebidas.",

    pricePerChargeUnit: 46,

    priceStatus: "reference",

    priceNote:
      "Precio orientativo usado para el cálculo. El precio real puede variar y debe comprobarse en MyCosta o en la reserva.",

    economicEligibility:
      "eligible",

    economicActivation:
      "reference-or-user",

    currency: "EUR",

    includesAlcohol: true,

    existenceStatus: "verified",

    inclusionsStatus: "verified",

    coverage: {
      coffee: true,
      water: true,
      soda: true,
      juice: false,

      beer: true,
      wine: true,

      cocktail: true,

      alcoholicCocktails: true,

      nonAlcoholicCocktails: true,

      premiumCocktails: true,

      bottledBeer: true,

      premiumSpirits: true,

      bottledWaterUnlimited: true,

      status: "verified",
    },

    observedCoverage: {
      bottledWaterDailyAllowance:
        null,

      bottledWaterUnlimited: true,

      venueCoverage: {
        specialityRestaurants:
          "unknown",

        privateIslands:
          "unknown",

        themedVenues:
          "limited",

        excludedVenues: [
          "Archipelago",
          "Casanova",
        ],
      },

      packagePurchaseGroupRequirement:
        "same-booking-or-cabin",

      packageChargeUnitPolicy:
        "per-night",
    },

    restrictions:
      myDrinksPlusRestrictions,

    status: "verified",

    sourceUrl:
      COSTA_DRINKS_SOURCE,

    lastVerified:
      costaMetadata.verification
        .inclusionsLastVerified,
  },
} as const;
