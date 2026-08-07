import type {
  ContextualPackageRule,
} from "@/lib/contextualPackageRules";

/*
 * REGLAS CONTEXTUALES MSC
 *
 * Este registro contiene exclusivamente
 * reglas cuya aplicación depende de un
 * contexto concreto.
 *
 * IMPORTANTE
 *
 * No convertimos observaciones parciales
 * en reglas universales.
 *
 * Los límites Premium Extra se resuelven
 * únicamente cuando conocemos la moneda
 * operativa a bordo.
 *
 * La transición legacy documentada para
 * paquetes adquiridos antes del cambio
 * contractual permanece fuera del motor
 * automático mientras DrinkPilot no
 * modele de forma segura la fecha de
 * adquisición del paquete.
 */
export const mscContextualPackageRules:
  ContextualPackageRule[] = [
    {
      id:
        "msc-premium-extra-threshold-eur",

      cruiseLine:
        "msc",

      packageKey:
        "mscPremiumExtra",

      onboardCurrencies: [
        "EUR",
      ],

      rules: {
        drinkPriceThreshold:
          14,

        drinkPriceThresholdCurrency:
          "EUR",
      },
    },

    {
      id:
        "msc-premium-extra-threshold-usd",

      cruiseLine:
        "msc",

      packageKey:
        "mscPremiumExtra",

      onboardCurrencies: [
        "USD",
      ],

      rules: {
        drinkPriceThreshold:
          16,

        drinkPriceThresholdCurrency:
          "USD",
      },
    },
  ];
