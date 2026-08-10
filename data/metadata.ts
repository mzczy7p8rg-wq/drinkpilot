export const costaMetadata = {
  cruiseLine: "Costa Cruceros",

  market: "Europa",

  currency: "EUR",

  /*
   * FUENTES
   *
   * Conservamos las URLs principales como strings
   * para mantener compatibilidad con los archivos
   * que ya las utilizan directamente.
   */
  sources: {
    officialDrinksPage:
      "https://www.costacruceros.com/experiencia/paquetes-de-bebidas.html",

    officialTerms:
      "https://www.costacruceros.com/condiciones-generales/contrato.html",

    /*
     * Información adicional sobre qué respalda
     * cada fuente oficial.
     */
    officialSourceDetails: [
      {
        id: "costa-drinks-page",

        name:
          "Costa Cruceros — Paquetes de bebidas",

        type: "official",

        url:
          "https://www.costacruceros.com/experiencia/paquetes-de-bebidas.html",

        market: "España",

        supports: [
          "existence-my-drinks",
          "existence-my-drinks-plus",
          "package-inclusions",
          "premium-inclusions",
          "bottled-water-conditions",
          "bottled-beer",
          "premium-cocktails",
          "premium-spirits",
          "same-booking-or-cabin-requirement",
          "archipelago-exclusion",
          "casanova-exclusion",
          "themed-venue-limitations",
          "minor-alcohol-conditions",
        ],

        verifiedAt: "2026-08-03",
      },

      {
        id: "costa-general-terms",

        name:
          "Costa Cruceros — Condiciones generales",

        type: "official",

        url:
          "https://www.costacruceros.com/condiciones-generales/contrato.html",

        market: "España",

        supports: [
          "general-booking-conditions",
          "general-alcohol-conditions",
        ],

        verifiedAt: "2026-08-03",
      },
    ],

    /*
     * Las fuentes secundarias sirven únicamente
     * como contexto o apoyo histórico.
     *
     * Nunca deben elevar por sí solas un dato
     * al estado "verified".
     */
    secondarySources: [
      {
        name: "Miramar Cruceros",

        type: "secondary",

        url:
          "https://www.miramarcruceros.com/blog/todo-lo-que-debes-saber-sobre-los-paquetes-de-bebidas-en-costa-cruceros-tipos-consejos-para-familias-y-que-pasa-si-no-contratas-uno",

        purpose:
          "Contexto adicional sobre paquetes de bebidas. No sustituye la documentación oficial de Costa.",
      },

      {
        name:
          "Scribd - BB_MY-DRINKS_ARG",

        type: "secondary-historical",

        url:
          "https://es.scribd.com/document/697559448/BB-MY-DRINKS-ARG",

        purpose:
          "Referencia histórica. No se utiliza como fuente oficial para precios o condiciones vigentes.",
      },
    ],
  },

  /*
   * ESTADO DE VERIFICACIÓN
   */
  verification: {
    inclusionsLastVerified:
      "2026-08-03",

    restrictionsLastVerified:
      "2026-08-03",

    /*
     * Los precios diarios de los paquetes
     * continúan siendo orientativos porque
     * pueden variar según reserva, tarifa,
     * mercado, crucero y momento de compra.
     */
    packagePricesStatus:
      "reference",

    /*
     * Los precios individuales de bebidas
     * continúan como referencia hasta disponer
     * de una carta oficial vigente y verificable.
     */
    individualDrinkPricesStatus:
      "reference",

    /*
     * My Drinks Soft continúa fuera del motor
     * hasta disponer de información oficial
     * suficiente para el mercado objetivo.
     */
    myDrinksSoftStatus:
      "pending",
  },

  /*
   * PRINCIPIOS DE CALIDAD DE DATOS
   */
  dataPolicy: {
    verified:
      "Información respaldada directamente por documentación oficial vigente de Costa Cruceros.",

    reference:
      "Valor utilizado para realizar estimaciones, pero que puede variar y no debe interpretarse como precio oficial garantizado.",

    pending:
      "Información insuficiente o todavía no verificada para utilizarse como dato fiable en el motor de recomendación.",

    secondary:
      "Información utilizada únicamente como apoyo contextual y nunca como sustituto de una fuente oficial.",
  },

  notes: [
    "Los precios de los paquetes pueden variar según crucero, tarifa, mercado, promoción y momento de compra.",

    "Cuando el usuario introduce el precio mostrado en su reserva, DrinkPilot utiliza ese importe con prioridad sobre el precio de referencia.",

    "Los precios individuales de bebidas usados por DrinkPilot son valores de referencia hasta disponer de una carta oficial vigente y verificable.",

    "Las inclusiones y restricciones pueden depender de las condiciones concretas de la reserva y deben comprobarse antes de contratar.",

    "Las fuentes secundarias se utilizan únicamente como apoyo y no sustituyen la información oficial de Costa Cruceros.",

    "DrinkPilot verifica por separado la existencia e inclusiones de los paquetes y la fiabilidad de los precios utilizados en el cálculo.",
  ],
} as const;