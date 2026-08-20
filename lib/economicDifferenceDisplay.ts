export type EconomicDifferenceDisplayInput = {
  effectiveSavings: number | null;
  savings: number;
};

export function resolveDisplayedEconomicDifference(
  input: EconomicDifferenceDisplayInput
): number | null {
  return input.effectiveSavings;
}
