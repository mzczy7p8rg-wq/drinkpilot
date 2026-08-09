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

/*
 * Valores estrictamente matemáticos
 * enviados al calculador.
 *
 * A diferencia de CompleteOnboardPriceValues,
 * una categoría no consumida puede valer 0
 * porque no contribuye al coste.
 */
export type CalculationOnboardPriceValues =
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

/*
 * Consumo diario utilizado para decidir
 * qué precios son realmente necesarios.
 */
export type OnboardPriceConsumptionValues =
  Record<
    OnboardPriceKey,
    number
  >;

/*
 * Devuelve únicamente categorías consumidas
 * cuyo precio todavía falta.
 */
export function getMissingRequiredOnboardPriceKeys(
  values: PartialOnboardPriceValues,
  consumption: OnboardPriceConsumptionValues
): OnboardPriceKey[] {
  return onboardPriceKeys.filter(
    (key) =>
      consumption[key] > 0 &&
      !isValidOnboardPrice(
        values[key]
      )
  );
}

/*
 * Construye la cesta numérica que necesita
 * calculator.ts.
 *
 * Importante:
 *
 * - consumo > 0 exige un precio válido;
 * - consumo = 0 utiliza 0 únicamente como
 *   neutro matemático;
 * - no modifica la evidencia original,
 *   donde un precio desconocido sigue
 *   siendo null.
 */
export function resolveOnboardPriceValuesForConsumption(
  values: PartialOnboardPriceValues,
  consumption: OnboardPriceConsumptionValues
): CalculationOnboardPriceValues | null {
  const result =
    {} as CalculationOnboardPriceValues;

  let hasConsumption =
    false;

  for (
    const key of onboardPriceKeys
  ) {
    const quantity =
      consumption[key];

    if (
      !Number.isSafeInteger(
        quantity
      ) ||
      quantity < 0
    ) {
      return null;
    }

    if (quantity === 0) {
      result[key] = 0;
      continue;
    }

    hasConsumption =
      true;

    const price =
      values[key];

    if (
      !isValidOnboardPrice(
        price
      )
    ) {
      return null;
    }

    result[key] =
      price;
  }

  return hasConsumption
    ? result
    : null;
}
