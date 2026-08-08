import {
  onboardPriceKeys,
  type OnboardPriceKey,
  type PartialOnboardPriceValues,
} from "@/lib/onboardPriceService";

import type {
  SelectedDrinkPriceContextRelevance,
  SelectedDrinkPriceSource,
} from "@/lib/selectedDrinkPrice";

export type EconomicDrinkPriceInput =
  | {
      price:
        number | null | undefined;

      source?:
        SelectedDrinkPriceSource;

      contextRelevance?:
        SelectedDrinkPriceContextRelevance;
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
    typeof selectedPrice.price !==
      "number" ||
    !Number.isFinite(
      selectedPrice.price
    ) ||
    selectedPrice.price <= 0
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
    EconomicDrinkPriceSelections
): PartialOnboardPriceValues {
  return Object.fromEntries(
    onboardPriceKeys.map(
      (category) => {
        const selectedPrice =
          resolveEconomicDrinkPrice(
            selections[
              category
            ]
          );

        return [
          category,
          selectedPrice ??
            referencePrices[
              category
            ],
        ];
      }
    )
  ) as PartialOnboardPriceValues;
}
