export const mscMetadata = {
  cruiseLine: "MSC Cruises",

  /*
   * Primera incorporación de MSC
   * orientada al mercado europeo.
   *
   * Los precios reales pueden variar
   * por mercado, barco e itinerario.
   */
  market: "Europa",

  currency: "EUR",

  sources: {
    officialDrinksPage:
      "https://www.msccruises.com/int/on-board/dining-and-drinks/drinks-packages",

    officialTerms:
      "https://www.msccruises.com/int/terms-conditions",

    officialAquaPage:
      "https://www.msccruises.com/int/on-board/dining-and-drinks/aqua-by-msc",

    officialSourceDetails: [
      {
        id: "msc-drinks-packages",

        name:
          "MSC Cruises — Drinks Packages",

        type: "official",

        url:
          "https://www.msccruises.com/int/on-board/dining-and-drinks/drinks-packages",

        market: "International / Europa",

        supports: [
          "existence-easy-package",
          "existence-premium-extra-package",
          "existence-alcohol-free-package",
          "existence-minors-package",

          "package-inclusions",
          "premium-inclusions",
          "non-alcoholic-inclusions",

          "15-alcoholic-drinks-daily-limit",
          "same-cabin-requirement",
          "speciality-restaurant-rules",
          "private-island-rules",
          "minors-package-requirement",

          "aqua-by-msc-inclusion",
        ],

        verifiedAt:
          "2026-08-04",
      },

      {
        id: "msc-terms",

        name:
          "MSC Cruises — Onboard Services Terms & Conditions",

        type: "official",

        url:
          "https://www.msccruises.com/int/terms-conditions",

        market: "International",

        supports: [
          "package-per-cruise-basis",
          "pricing-days-excluding-disembarkation",
          "same-cabin-requirement",
          "package-exclusions",
          "15-alcoholic-drinks-daily-limit",
        ],

        verifiedAt:
          "2026-08-04",
      },

      {
        id: "msc-aqua",

        name:
          "MSC Cruises — AQUA by MSC",

        type: "official",

        url:
          "https://www.msccruises.com/int/on-board/dining-and-drinks/aqua-by-msc",

        market: "International",

        supports: [
          "aqua-by-msc-description",
          "unlimited-aqua-with-drink-package",
          "aqua-refill-system",
          "aqua-individual-prices",
          "traditional-bottled-water-distinction",
        ],

        verifiedAt:
          "2026-08-04",
      },
    ],

    secondarySources: [],
  },

  verification: {
    inclusionsLastVerified:
      "2026-08-04",

    restrictionsLastVerified:
      "2026-08-04",

    /*
     * No existe un precio diario
     * universal suficientemente fiable.
     */
    packagePricesStatus:
      "pending",

    /*
     * Tampoco disponemos todavía de una
     * carta oficial general con precios
     * individuales para todas las
     * categorías del motor.
     */
    individualDrinkPricesStatus:
      "pending",
  },

  dataPolicy: {
    verified:
      "Información respaldada directamente por documentación oficial vigente de MSC Cruises.",

    reference:
      "Valor orientativo utilizado para estimaciones y que puede variar por barco, mercado, itinerario o momento de compra.",

    pending:
      "Información que todavía no dispone de evidencia oficial suficiente para participar de forma segura en el cálculo económico.",

    secondary:
      "Información contextual que nunca sustituye una fuente oficial.",
  },

  contextualEvidence: [
    {
      id:
        "premium-extra-threshold-eur",

      sourceId:
        "msc-drinks-packages",

      type:
        "official",

      packageKey:
        "mscPremiumExtra",

      onboardCurrency:
        "EUR",

      value:
        14,

      valueType:
        "drink-price-threshold",

      status:
        "verified",

      verifiedAt:
        "2026-08-07",
    },

    {
      id:
        "premium-extra-threshold-usd",

      sourceId:
        "msc-drinks-packages",

      type:
        "official",

      packageKey:
        "mscPremiumExtra",

      onboardCurrency:
        "USD",

      value:
        16,

      valueType:
        "drink-price-threshold",

      status:
        "verified",

      verifiedAt:
        "2026-08-07",
    },

    {
      id:
        "legacy-package-transition",

      sourceId:
        "msc-drinks-packages",

      type:
        "official",

      packageKey:
        null,

      effectivePurchaseDate:
        "2025-10-01",

      valueType:
        "legacy-package-transition",

      status:
        "verified",

      verifiedAt:
        "2026-08-07",
    },
  ],

  notes: [
    "MSC indica que los paquetes se venden por crucero y que el precio se aplica a los días del crucero excepto el día de desembarque.",

    "Los paquetes deben contratarse para los huéspedes que ocupan el mismo camarote según las condiciones publicadas por MSC.",

    "Easy y Premium Extra permiten hasta 15 bebidas alcohólicas por huésped y día.",

    "Los límites de precio por bebida pueden depender de la región, fecha de navegación y versión concreta del paquete; DrinkPilot no aplica todavía un umbral universal a Premium Extra.",

    "AQUA by MSC es agua mineralizada producida a bordo y no debe tratarse automáticamente como agua mineral embotellada tradicional.",

    "Los precios de paquetes e inclusiones pueden variar por barco e itinerario.",

    "DrinkPilot no utilizará precios económicos MSC hasta disponer de referencias suficientes o del precio real introducido por el usuario.",
  ],
} as const;