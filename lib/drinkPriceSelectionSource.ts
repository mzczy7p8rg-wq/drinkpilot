import type {
  SelectedDrinkPriceSource,
} from "@/lib/selectedDrinkPrice";

export type DrinkPriceReferenceSource =
  Exclude<
    SelectedDrinkPriceSource,
    "user"
  >;

export function resolveDrinkPriceSelectionSource(
  referenceId:
    string | null | undefined,

  referenceSource:
    DrinkPriceReferenceSource =
      "official"
): SelectedDrinkPriceSource {
  if (!referenceId) {
    return "user";
  }

  return referenceSource;
}
