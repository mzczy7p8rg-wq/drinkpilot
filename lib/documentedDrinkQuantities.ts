export type DocumentedDrinkQuantities =
  Record<string, number>;

export function resolveStoredDocumentedDrinkQuantities(
  input: unknown
): DocumentedDrinkQuantities {
  if (
    typeof input !== "object" ||
    input === null ||
    Array.isArray(input)
  ) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(input).filter(
      ([referenceId, quantity]) =>
        referenceId.trim().length > 0 &&
        typeof quantity === "number" &&
        Number.isSafeInteger(quantity) &&
        quantity > 0 &&
        quantity <= 20
    )
  );
}
