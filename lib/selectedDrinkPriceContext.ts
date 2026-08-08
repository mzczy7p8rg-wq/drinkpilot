import type {
  CruiseLineKey,
} from "@/data/cruiseLines";

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
