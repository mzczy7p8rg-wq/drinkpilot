import type { IncludedPackageUpgradeDecision } from "@/lib/includedPackageUpgrade";

type BestPackage = {
  packageName: string;
} | null;

export function resolveComparisonHeader(
  bestPackage: BestPackage,
  includedPackageUpgradeDecision: IncludedPackageUpgradeDecision | null
): string {
  if (bestPackage) {
    return `Mejor opción: ${bestPackage.packageName}`;
  }

  if (includedPackageUpgradeDecision?.status === "keep") {
    return `Mantén ${includedPackageUpgradeDecision.current.packageName}`;
  }

  if (includedPackageUpgradeDecision?.status === "upgrade") {
    return `Mejora a ${includedPackageUpgradeDecision.alternative.packageName}`;
  }

  return "Sin opción completa con resultado favorable";
}
