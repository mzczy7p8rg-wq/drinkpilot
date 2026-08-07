import type {
  SelectedDrinkPrice,
} from "@/lib/selectedDrinkPrice";

export type SelectedDrinkConsumption = {
  drink:
    SelectedDrinkPrice;

  quantityPerDay:
    number;
};

export type SelectedDrinkConsumptionInput = {
  drink:
    SelectedDrinkPrice;

  quantityPerDay:
    number | null | undefined;
};

export function createSelectedDrinkConsumption(
  input:
    SelectedDrinkConsumptionInput
): SelectedDrinkConsumption | null {
  if (
    typeof input.quantityPerDay !== "number" ||
    !Number.isFinite(
      input.quantityPerDay
    ) ||
    input.quantityPerDay <= 0
  ) {
    return null;
  }

  return {
    drink:
      input.drink,

    quantityPerDay:
      input.quantityPerDay,
  };
}
