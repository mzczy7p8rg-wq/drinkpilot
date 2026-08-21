import type { IncludedPackageUpgradeDecision } from "@/lib/includedPackageUpgrade";

type BestPackage = {
  packageName: string;
} | null;

export function resolveComparisonHeader(
  bestPackage: BestPackage,
  includedPackageUpgradeDecision: IncludedPackageUpgradeDecision | null
): string {
  if (includedPackageUpgradeDecision?.status === "keep") {
    return `Mantén ${includedPackageUpgradeDecision.current.packageName}`;
  }

  if (includedPackageUpgradeDecision?.status === "upgrade") {
    return `Mejora a ${includedPackageUpgradeDecision.alternative.packageName}`;
  }

  if (includedPackageUpgradeDecision?.status === "insufficient-data") {
    return "Comparación pendiente de datos";
  }

  if (bestPackage) {
    return `Mejor opción: ${bestPackage.packageName}`;
  }

  return "Sin opción completa con resultado favorable";
}
