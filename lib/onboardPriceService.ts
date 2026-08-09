import {
  isPositiveSafePrice,
} from "@/lib/priceValidation";

/*
 * Categorías de precios individuales
 * utilizadas actualmente por el motor
 * económico de DrinkPilot.
 */
export const onboardPriceKeys = [
  "coffee",
  "water",
  "soda",
  "beer",
  "wine",
  "cocktail",
] as const;

export type OnboardPriceKey =
  (typeof onboardPriceKeys)[number];

/*
 * Una naviera puede tener:
 *
 * number -> precio conocido y utilizable.
 * null   -> precio todavía desconocido.
 *
 * Nunca utilizamos 0 como sustituto
 * de un precio desconocido.
 */
export type PartialOnboardPriceValues =
  Record<
    OnboardPriceKey,
    number | null
  >;

/*
 * Contrato que necesita calculator.ts.
 *
 * Una vez validado, todos los precios
 * son números positivos y el calculador
 * puede continuar siendo estricto.
 */
export type CompleteOnboardPriceValues =
  Record<
    OnboardPriceKey,
    number
  >;

function isValidOnboardPrice(
  value: unknown
): value is number {
  return isPositiveSafePrice(value);
}

/*
 * Type guard central.
 *
 * Permite saber si una naviera tiene
 * suficientes precios individuales
 * para ejecutar una comparación
 * económica completa.
 */
export function hasCompleteOnboardPriceValues(
  values: PartialOnboardPriceValues
): values is CompleteOnboardPriceValues {
  return onboardPriceKeys.every(
    (key) =>
      isValidOnboardPrice(
        values[key]
      )
  );
}

/*
 * Devuelve qué categorías siguen
 * pendientes.
 *
 * Servirá también para explicar en UI
 * por qué una comparación económica
 * todavía no está disponible.
 */
export function getMissingOnboardPriceKeys(
  values: PartialOnboardPriceValues
): OnboardPriceKey[] {
  return onboardPriceKeys.filter(
    (key) =>
      !isValidOnboardPrice(
        values[key]
      )
  );
}
