export type DrinkPriceSelectionSource =
  | "user"
  | "official";

export function resolveDrinkPriceSelectionSource(
  referenceId: string | null | undefined
): DrinkPriceSelectionSource {
  return referenceId
    ? "official"
    : "user";
}
