import {
  onboardPriceKeys,
  type OnboardPriceKey,
  type PartialOnboardPriceValues,
} from "@/lib/onboardPriceService";

import type {
  SelectedDrinkPriceContextRelevance,
  SelectedDrinkPriceSource,
} from "@/lib/selectedDrinkPrice";

import {
  isPositiveSafePrice,
} from "@/lib/priceValidation";

export type EconomicDrinkPriceInput =
  | {
      price:
        number | null | undefined;

      source?:
        SelectedDrinkPriceSource;

      contextRelevance?:
        SelectedDrinkPriceContextRelevance;

      currency?:
        string | null | undefined;
    }
  | null
  | undefined;

export type EconomicDrinkPriceSelections =
  Partial<
    Record<
      OnboardPriceKey,
      EconomicDrinkPriceInput
    >
  >;

/*
 * Decide si una selección concreta puede
 * participar en el cálculo económico.
 *
 * Política conservadora:
 *
 * - user -> sí
 * - official -> sí
 * - documented-menu + exact -> sí
 * - documented-menu + compatible -> no
 *
 * Una referencia compatible todavía tiene
 * contexto pendiente y no debe elevarse
 * automáticamente a precio económico.
 */
export function resolveEconomicDrinkPrice(
  selectedPrice:
    EconomicDrinkPriceInput
): number | null {
  if (!selectedPrice) {
    return null;
  }

  if (
    !isPositiveSafePrice(
      selectedPrice.price
    )
  ) {
    return null;
  }

  if (
    selectedPrice.source ===
      "user" ||
    selectedPrice.source ===
      "official"
  ) {
    return selectedPrice.price;
  }

  if (
    selectedPrice.source ===
      "documented-menu" &&
    selectedPrice.contextRelevance ===
      "exact"
  ) {
    return selectedPrice.price;
  }

  return null;
}

/*
 * Aplica también el contrato monetario de la
 * comparación.
 *
 * Esta función es la fuente común para decidir
 * si una selección concreta participa realmente
 * en el cálculo económico y para explicarlo en la
 * interfaz sin prometer un uso que el motor rechaza.
 */
export function resolveEconomicDrinkPriceForCurrency(
  selectedPrice:
    EconomicDrinkPriceInput,
  expectedCurrency?:
    string | null
): number | null {
  const economicPrice =
    resolveEconomicDrinkPrice(
      selectedPrice
    );

  if (economicPrice === null) {
    return null;
  }

  const normalizedExpectedCurrency =
    expectedCurrency
      ?.trim()
      .toUpperCase() ?? null;

  if (
    normalizedExpectedCurrency ===
    null
  ) {
    return economicPrice;
  }

  const selectedCurrency =
    selectedPrice &&
    "currency" in
      selectedPrice &&
    typeof selectedPrice.currency ===
      "string"
      ? selectedPrice.currency
          .trim()
          .toUpperCase()
      : null;

  return selectedCurrency ===
    normalizedExpectedCurrency
    ? economicPrice
    : null;
}

/*
 * Convierte las selecciones individuales
 * en la cesta estricta number | null que
 * entiende onboardPriceService.
 *
 * Nunca rellena una categoría ausente
 * con 0 ni con una media inventada.
 */
export function resolveEconomicDrinkPrices(
  selections:
    EconomicDrinkPriceSelections
): PartialOnboardPriceValues {
  return Object.fromEntries(
    onboardPriceKeys.map(
      (category) => [
        category,
        resolveEconomicDrinkPrice(
          selections[
            category
          ]
        ),
      ]
    )
  ) as PartialOnboardPriceValues;
}

/*
 * Construye la única cesta de precios que
 * debe utilizar el motor económico.
 *
 * Una selección económicamente admisible
 * prevalece sobre la referencia de la
 * naviera. Las categorías sin selección
 * válida conservan su precio de referencia.
 */
export function resolveEffectiveDrinkPrices(
  referencePrices:
    PartialOnboardPriceValues,
  selections:
    EconomicDrinkPriceSelections,
  expectedCurrency?:
    string | null
): PartialOnboardPriceValues {
  return Object.fromEntries(
    onboardPriceKeys.map(
      (category) => {
        const selectedPrice =
          selections[category];

        const selectedEconomicPrice =
          resolveEconomicDrinkPriceForCurrency(
            selectedPrice,
            expectedCurrency
          );

        return [
          category,
          selectedEconomicPrice ??
            referencePrices[
              category
            ],
        ];
      }
    )
  ) as PartialOnboardPriceValues;
}
