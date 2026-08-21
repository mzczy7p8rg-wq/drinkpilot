export type EconomicOptionCandidate = {
  packageKey: string;
  packageName: string;
  packageCost: number;
  drinksCost: number;
  effectiveSavings: number | null;
  economicComparisonStatus: string;
  coverageScore: number;
  fullyCovered: boolean;
  priceSource: string;
};

export type EconomicOption = {
  key: string;
  name: string;
  status: "no-package" | "included" | "package" | "upgrade";
  packageCost: number;
  outsidePackageCost: number | null;
  totalCost: number | null;
  coverageScore: number | null;
  fullyCovered: boolean;
};

export type EconomicOptionsComparison = {
  currency: string;
  options: EconomicOption[];
  bestOption: EconomicOption | null;
  savingsAgainstNoPackage: number | null;
  hasIncompleteOptions: boolean;
};

const normalizeMoney = (value: number) =>
  Math.max(0, Number(value.toFixed(2)));

/*
 * Convierte las métricas internas de ahorro en alternativas comparables.
 *
 * effectiveSavings = coste sin paquete - coste total de la alternativa.
 * Por tanto, cuando la comparación es completa, podemos separar el coste
 * del paquete del gasto conocido que queda fuera sin recalcular coberturas.
 */
export function buildEconomicOptionsComparison({
  currency,
  baselineCost,
  packages,
}: {
  currency: string;
  baselineCost: number;
  packages: EconomicOptionCandidate[];
}): EconomicOptionsComparison {
  const normalizedBaseline = normalizeMoney(baselineCost);
  const hasIncludedPackage = packages.some(
    (pkg) => pkg.priceSource === "included"
  );

  const noPackage: EconomicOption = {
    key: "no-package",
    name: "Sin paquete",
    status: "no-package",
    packageCost: 0,
    outsidePackageCost: normalizedBaseline,
    totalCost: normalizedBaseline,
    coverageScore: null,
    fullyCovered: true,
  };

  const packageOptions = packages.map((pkg): EconomicOption => {
    const comparisonComplete =
      pkg.economicComparisonStatus === "complete" &&
      pkg.effectiveSavings !== null;

    const totalCost = comparisonComplete
      ? normalizeMoney(pkg.drinksCost - pkg.effectiveSavings!)
      : null;

    const outsidePackageCost =
      totalCost === null
        ? null
        : normalizeMoney(totalCost - pkg.packageCost);

    return {
      key: pkg.packageKey,
      name: pkg.packageName,
      status:
        pkg.priceSource === "included"
          ? "included"
          : hasIncludedPackage
            ? "upgrade"
            : "package",
      packageCost: normalizeMoney(pkg.packageCost),
      outsidePackageCost,
      totalCost,
      coverageScore: pkg.coverageScore,
      fullyCovered: pkg.fullyCovered,
    };
  });

  const options = [noPackage, ...packageOptions];
  const completeOptions = options.filter(
    (option): option is EconomicOption & { totalCost: number } =>
      option.totalCost !== null
  );

  const bestOption = completeOptions.reduce<
    (EconomicOption & { totalCost: number }) | null
  >(
    (best, option) =>
      !best || option.totalCost < best.totalCost ? option : best,
    null
  );

  return {
    currency,
    options,
    bestOption,
    savingsAgainstNoPackage:
      bestOption === null
        ? null
        : normalizeMoney(normalizedBaseline - bestOption.totalCost),
    hasIncompleteOptions: packageOptions.some(
      (option) => option.totalCost === null
    ),
  };
}
