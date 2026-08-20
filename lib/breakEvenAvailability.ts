type BreakEvenAvailabilityInput = {
  dailyDrinkCost: number;
};

export function isBreakEvenAvailable(
  input: BreakEvenAvailabilityInput
): boolean {
  return input.dailyDrinkCost > 0;
}
