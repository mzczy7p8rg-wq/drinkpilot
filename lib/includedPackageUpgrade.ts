export type IncludedPackageUpgradeCandidate = {
  packageKey: string;
  packageName: string;
  currency: string;
  packageCost: number;
  effectiveSavings: number | null;
  economicComparisonStatus:
    | "complete"
    | "partial-calculable"
    | "partial-unknown";
  coverageScore: number;
  fullyCovered: boolean;
};

export type IncludedPackageUpgradeDecision =
  | {
      status: "upgrade" | "keep";
      current: IncludedPackageUpgradeCandidate;
      alternative: IncludedPackageUpgradeCandidate;
      savingsDifference: number;
      addedCost: number;
      coverageDifference: number;
    }
  | {
      status: "insufficient-data";
      current: IncludedPackageUpgradeCandidate;
    };

/*
 * Compara el paquete ya incluido con las alternativas que tienen un
 * ahorro efectivo completamente cuantificado. La cobertura puede ser parcial
 * si todos los consumos exteriores están valorados; nunca transforma un
 * precio ausente en una recomendación de upgrade.
 */
export function resolveIncludedPackageUpgradeDecision(
  packages: IncludedPackageUpgradeCandidate[],
  includedPackageKey: string | null | undefined
): IncludedPackageUpgradeDecision | null {
  if (!includedPackageKey) {
    return null;
  }

  const current = packages.find(
    (item) => item.packageKey === includedPackageKey
  );

  if (
    !current ||
    current.economicComparisonStatus !== "complete" ||
    current.effectiveSavings === null
  ) {
    return current ? { status: "insufficient-data", current } : null;
  }

  const alternatives = packages
    .filter(
      (item) =>
        item.packageKey !== current.packageKey &&
        item.economicComparisonStatus === "complete" &&
        item.effectiveSavings !== null
    )
    .sort(
      (left, right) =>
        (right.effectiveSavings ?? -Infinity) -
        (left.effectiveSavings ?? -Infinity)
    );

  const alternative = alternatives[0];

  if (!alternative || alternative.effectiveSavings === null) {
    return { status: "insufficient-data", current };
  }

  const savingsDifference =
    alternative.effectiveSavings - current.effectiveSavings;

  return {
    status: savingsDifference > 0 ? "upgrade" : "keep",
    current,
    alternative,
    savingsDifference,
    addedCost: alternative.packageCost - current.packageCost,
    coverageDifference: alternative.coverageScore - current.coverageScore,
  };
}
