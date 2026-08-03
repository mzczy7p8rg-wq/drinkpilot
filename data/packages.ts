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
     * El precio continúa pendiente.
     *
     * Muy importante:
     * mientras el precio sea 0 no debe entrar
     * en el motor económico.
     */
    pricePerDay: 0,

    priceStatus: "pending",

    priceNote:
      "Precio pendiente de verificación para el crucero y mercado seleccionados.",

    currency: "EUR",

    includesAlcohol: false,

    /*
     * Estado separado por dimensión.
     *
     * Sabemos que el paquete existe,
     * pero todavía no tenemos suficiente
     * evidencia para considerarlo totalmente
     * listo para cálculo.
     */
    existenceStatus: "verified",

    inclusionsStatus: "partial-verified",

    coverage: {
      /*
       * Cobertura básica observada
       * en la carta histórica de Costa.
       */
      coffee: true,
      water: true,
      soda: true,

      /*
       * El motor actual todavía no distingue
       * mocktails de cócteles alcohólicos.
       *
       * Por seguridad mantenemos cocktail=false
       * hasta ampliar el modelo de cobertura.
       */
      beer: false,
      wine: false,
      cocktail: false,

      premiumCocktails: false,
      bottledBeer: false,
      premiumSpirits: false,
      bottledWaterUnlimited: false,

      status: "partial-verified",
    },

    /*
     * Información adicional que todavía
     * no utiliza coverage.ts.
     */
    observedCoverage: {
      nonAlcoholicCocktails: true,
    },

    restrictions: myDrinksSoftRestrictions,

    /*
     * IMPORTANTE:
     *
     * comparison.ts filtra únicamente
     * paquetes con status === "verified".
     *
     * Mantener "pending" impide que
     * My Drinks Soft entre en el cálculo
     * con precio 0 €.
     */
    status: "pending",

    sourceUrl: COSTA_DRINKS_SOURCE,

    lastVerified:
      costaMetadata.verification.inclusionsLastVerified,
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

    existenceStatus: "verified",

    inclusionsStatus: "verified",

    coverage: {
      coffee: true,
      water: true,
      soda: true,

      beer: true,
      wine: true,
      cocktail: true,

      premiumCocktails: false,
      bottledBeer: false,
      premiumSpirits: false,
      bottledWaterUnlimited: false,

      status: "verified",
    },

    /*
     * La carta y documentación revisada
     * respaldan una inclusión limitada
     * de agua embotellada.
     *
     * Todavía no participa en coverage.ts.
     */
    observedCoverage: {
      bottledWaterDailyAllowance: 1,
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

    existenceStatus: "verified",

    inclusionsStatus: "verified",

    coverage: {
      coffee: true,
      water: true,
      soda: true,

      beer: true,
      wine: true,
      cocktail: true,

      premiumCocktails: true,
      bottledBeer: true,
      premiumSpirits: true,
      bottledWaterUnlimited: true,

      status: "verified",
    },

    observedCoverage: {
      bottledWaterDailyAllowance: null,
      bottledWaterUnlimited: true,
    },

    restrictions: myDrinksPlusRestrictions,

    status: "verified",

    sourceUrl: COSTA_DRINKS_SOURCE,

    lastVerified:
      costaMetadata.verification.inclusionsLastVerified,
  },
} as const;