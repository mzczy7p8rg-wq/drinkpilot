import type {
  CruiseLineKey,
} from "@/data/cruiseLines";

import type {
  CruiseContext,
} from "@/lib/cruiseContext";

import {
  evaluateDrinkPriceContextRelevance,
} from "@/lib/drinkPriceContextRelevance";

import {
  resolveMscDocumentedDrinkPriceSelectionForContext,
} from "@/lib/mscDocumentedDrinkPriceService";

import {
  resolveCostaDocumentedDrinkPriceSelectionForContext,
} from "@/lib/costaDocumentedDrinkPriceService";

import {
  resolveMscSpecificDrinkPriceSelection,
} from "@/lib/mscSpecificDrinkPriceService";

import {
  createSelectedDrinkPrice,
  type SelectedDrinkPrice,
} from "@/lib/selectedDrinkPrice";

import type {
  SelectedDrinkPrices,
} from "@/lib/selectedDrinkPriceStorage";

export type SelectedDrinkPriceCruiseLineChange = {
  previousCruiseLine:
    CruiseLineKey;

  nextCruiseLine:
    CruiseLineKey;

  selectedDrinkPrices:
    SelectedDrinkPrices;
};

/*
 * Los precios seleccionados pertenecen
 * a la naviera activa, incluso cuando
 * fueron introducidos manualmente.
 *
 * Al cambiar de compañía no conservamos
 * importes ni referencias que podrían
 * describir otra carta o moneda.
 */
export function resolveSelectedDrinkPricesAfterCruiseLineChange(
  input:
    SelectedDrinkPriceCruiseLineChange
): SelectedDrinkPrices {
  if (
    input.previousCruiseLine ===
    input.nextCruiseLine
  ) {
    return input.selectedDrinkPrices;
  }

  return {};
}

export type SelectedDrinkPriceContextResolution = {
  cruiseContext:
    CruiseContext;

  selectedDrinkPrices:
    SelectedDrinkPrices;
};

function normalizeCurrency(
  value: string | null
): string | null {
  if (value === null) {
    return null;
  }

  const normalized =
    value.trim().toUpperCase();

  return normalized.length > 0
    ? normalized
    : null;
}

function isManualPriceCompatible(
  selectedDrinkPrice:
    SelectedDrinkPrice,
  cruiseContext:
    CruiseContext
): boolean {
  const onboardCurrency =
    normalizeCurrency(
      cruiseContext.onboardCurrency
    );

  return (
    onboardCurrency === null ||
    selectedDrinkPrice.currency ===
      onboardCurrency
  );
}

/*
 * Revalida cada precio con el contexto
 * actual del crucero.
 *
 * - Los precios manuales se conservan
 *   mientras su moneda siga siendo
 *   compatible.
 * - Las referencias se resuelven otra
 *   vez desde su fuente canónica.
 * - Una referencia incompatible, rota o
 *   perteneciente a otra naviera se
 *   descarta.
 *
 * sailingDate provoca esta revalidación,
 * pero no se inventa una caducidad: las
 * fuentes actuales solo documentan una
 * fecha de observación, no un intervalo
 * de vigencia.
 */
export function resolveSelectedDrinkPricesForCruiseContext(
  input:
    SelectedDrinkPriceContextResolution
): SelectedDrinkPrices {
  const result:
    SelectedDrinkPrices = {};

  for (
    const selectedDrinkPrice of
    Object.values(
      input.selectedDrinkPrices
    )
  ) {
    if (!selectedDrinkPrice) {
      continue;
    }

    if (
      selectedDrinkPrice.source ===
      "user"
    ) {
      if (
        isManualPriceCompatible(
          selectedDrinkPrice,
          input.cruiseContext
        )
      ) {
        result[
          selectedDrinkPrice.category
        ] = selectedDrinkPrice;
      }

      continue;
    }

    if (!selectedDrinkPrice.referenceId) {
      continue;
    }

    if (
      input.cruiseContext.cruiseLine ===
        "costa"
    ) {
      if (
        selectedDrinkPrice.source !==
        "documented-menu"
      ) {
        continue;
      }

      const selection =
        resolveCostaDocumentedDrinkPriceSelectionForContext(
          selectedDrinkPrice.referenceId,
          input.cruiseContext
        );

      if (
        !selection ||
        selection.selectedDrinkPrice
          .category !==
          selectedDrinkPrice.category ||
        selection.contextRelevance
          .relevance === "mismatch"
      ) {
        continue;
      }

      const normalizedSelection =
        createSelectedDrinkPrice({
          ...selection.selectedDrinkPrice,
          contextRelevance:
            selection.contextRelevance
              .relevance,
        });

      if (normalizedSelection) {
        result[
          selectedDrinkPrice.category
        ] = normalizedSelection;
      }

      continue;
    }

    if (
      input.cruiseContext.cruiseLine !==
        "msc"
    ) {
      continue;
    }

    if (
      selectedDrinkPrice.source ===
      "official"
    ) {
      const selection =
        resolveMscSpecificDrinkPriceSelection(
          selectedDrinkPrice.referenceId
        );

      if (
        !selection ||
        selection.selectedDrinkPrice
          .category !==
          selectedDrinkPrice.category
      ) {
        continue;
      }

      const relevance =
        evaluateDrinkPriceContextRelevance(
          input.cruiseContext,
          selection.evidence.context
        );

      if (
        relevance.relevance ===
        "mismatch"
      ) {
        continue;
      }

      result[
        selectedDrinkPrice.category
      ] = selection.selectedDrinkPrice;

      continue;
    }

    const selection =
      resolveMscDocumentedDrinkPriceSelectionForContext(
        selectedDrinkPrice.referenceId,
        input.cruiseContext
      );

    if (
      !selection ||
      selection.selectedDrinkPrice
        .category !==
        selectedDrinkPrice.category ||
      selection.contextRelevance
        .relevance === "mismatch"
    ) {
      continue;
    }

    const normalizedSelection =
      createSelectedDrinkPrice({
        ...selection.selectedDrinkPrice,
        contextRelevance:
          selection.contextRelevance
            .relevance,
      });

    if (normalizedSelection) {
      result[
        selectedDrinkPrice.category
      ] = normalizedSelection;
    }
  }

  return result;
}
