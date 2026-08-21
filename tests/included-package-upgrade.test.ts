import { describe, expect, it } from "vitest";
import { resolveIncludedPackageUpgradeDecision } from "@/lib/includedPackageUpgrade";

const included = {
  packageKey: "easy",
  packageName: "Easy Package",
  currency: "EUR",
  packageCost: 0,
  effectiveSavings: 30,
  economicComparisonStatus: "complete" as const,
  coverageScore: 60,
  fullyCovered: true,
};

describe("included package upgrade decision", () => {
  it("recomienda el upgrade solo si mejora el ahorro efectivo", () => {
    const result = resolveIncludedPackageUpgradeDecision(
      [
        included,
        {
          ...included,
          packageKey: "premium",
          packageName: "Premium Extra",
          packageCost: 70,
          effectiveSavings: 95,
          coverageScore: 100,
        },
      ],
      "easy"
    );

    expect(result).toMatchObject({
      status: "upgrade",
      savingsDifference: 65,
      addedCost: 70,
      coverageDifference: 40,
    });
  });

  it("declara datos insuficientes si no hay alternativa completa cuantificable", () => {
    expect(
      resolveIncludedPackageUpgradeDecision([included], "easy")
    ).toMatchObject({ status: "insufficient-data" });
  });

  it("mantiene el paquete incluido cuando el upgrade no mejora el ahorro efectivo", () => {
    const result = resolveIncludedPackageUpgradeDecision(
      [
        included,
        {
          ...included,
          packageKey: "premium",
          packageName: "Premium Extra",
          packageCost: 70,
          effectiveSavings: 20,
          coverageScore: 100,
        },
      ],
      "easy"
    );

    expect(result).toMatchObject({
      status: "keep",
      savingsDifference: -10,
      addedCost: 70,
      coverageDifference: 40,
    });
  });

  it("compara un upgrade con cobertura incompleta cuando todo el gasto exterior está cuantificado", () => {
    const result = resolveIncludedPackageUpgradeDecision(
      [
        included,
        {
          ...included,
          packageKey: "premium",
          packageName: "Premium Extra",
          packageCost: 70,
          effectiveSavings: 200,
          coverageScore: 90,
          fullyCovered: false,
        },
      ],
      "easy"
    );

    expect(result).toMatchObject({
      status: "upgrade",
      savingsDifference: 170,
      addedCost: 70,
      coverageDifference: 30,
    });
  });

  it("no recomienda un upgrade parcial cuando su gasto exterior sigue sin cuantificar", () => {
    const result = resolveIncludedPackageUpgradeDecision(
      [
        included,
        {
          ...included,
          packageKey: "premium",
          packageName: "Premium Extra",
          packageCost: 70,
          effectiveSavings: null,
          economicComparisonStatus: "partial-unknown" as const,
          coverageScore: 90,
          fullyCovered: false,
        },
      ],
      "easy"
    );

    expect(result).toMatchObject({
      status: "insufficient-data",
    });
  });

  it("declara datos insuficientes si el ahorro del paquete incluido no es cuantificable", () => {
    const result = resolveIncludedPackageUpgradeDecision(
      [
        {
          ...included,
          effectiveSavings: null,
        },
      ],
      "easy"
    );

    expect(result).toMatchObject({
      status: "insufficient-data",
    });
  });

});
