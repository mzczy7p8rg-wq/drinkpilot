export const costaMetadata = {
  cruiseLine: "Costa Cruceros",

  market: "España",

  currency: "EUR",

  sources: {
    officialDrinksPage:
      "https://www.costacruceros.com/experiencia/paquetes-de-bebidas.html",

    officialTerms:
      "https://www.costacruceros.com/condiciones-generales/contrato.html",

    secondarySources: [
      {
        name: "Miramar Cruceros",
        type: "secondary",
        url:
          "https://www.miramarcruceros.com/blog/todo-lo-que-debes-saber-sobre-los-paquetes-de-bebidas-en-costa-cruceros-tipos-consejos-para-familias-y-que-pasa-si-no-contratas-uno",
      },

      {
        name: "Scribd - BB_MY-DRINKS_ARG",
        type: "secondary-historical",
        url:
          "https://es.scribd.com/document/697559448/BB-MY-DRINKS-ARG",
      },
    ],
  },

  verification: {
    inclusionsLastVerified: "2026-08-02",

    restrictionsLastVerified: "2026-08-02",

    packagePricesStatus: "reference",

    individualDrinkPricesStatus: "reference",
  },

  notes: [
    "Los precios de los paquetes pueden variar según crucero, tarifa, mercado y momento de compra.",
    "Los precios individuales de bebidas usados por DrinkPilot son valores de referencia hasta disponer de una carta oficial vigente y verificable.",
    "Las fuentes secundarias se utilizan únicamente como apoyo y no sustituyen la información oficial de Costa Cruceros.",
  ],
} as const;