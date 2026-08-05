import {
  getAllPackages,
  type PackageKey,
} from "@/lib/packageService";

import type {
  CruiseLineKey,
} from "@/data/cruiseLines";

export type PackageOperationalRules = {
  packageKey: PackageKey;

  packageName: string;

  /*
   * Máximo diario de bebidas alcohólicas.
   *
   * null = no existe una regla conocida
   * o no está modelada todavía.
   */
  alcoholicDrinksDailyLimit:
    number | null;

  /*
   * Umbral máximo por bebida cubierto
   * por el paquete para el mercado
   * europeo.
   *
   * null = no existe o no está modelado.
   */
  drinkPriceThresholdEurope:
    number | null;

  /*
   * Cobertura específica AQUA by MSC.
   *
   * Se mantiene separada de
   * bottledWaterUnlimited porque no
   * representa exactamente el mismo
   * producto.
   */
  aquaUnlimited: boolean;

  /*
   * Indica que el paquete está reservado
   * a menores y no debe tratarse como
   * paquete adulto.
   */
  minorsOnly: boolean;
};

type RulesPackage =
  ReturnType<
    typeof getAllPackages
  >[number];

function readPositiveNumber(
  value: unknown
): number | null {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  )
    ? value
    : null;
}

function resolvePackageRules(
  pkg: RulesPackage
): PackageOperationalRules {
  const observed =
    pkg.observedCoverage;

  let alcoholicDrinksDailyLimit:
    number | null = null;

  let drinkPriceThresholdEurope:
    number | null = null;

  let aquaUnlimited =
    false;

  let minorsOnly =
    false;

  if (observed) {
    if (
      "alcoholicDrinksDailyLimit" in
      observed
    ) {
      alcoholicDrinksDailyLimit =
        readPositiveNumber(
          observed
            .alcoholicDrinksDailyLimit
        );
    }

    if (
      "drinkPriceThresholdEurope" in
      observed
    ) {
      drinkPriceThresholdEurope =
        readPositiveNumber(
          observed
            .drinkPriceThresholdEurope
        );
    }

    if (
      "aquaByMscUnlimited" in
        observed &&
      observed
        .aquaByMscUnlimited ===
        true
    ) {
      aquaUnlimited =
        true;
    }

    if (
      "minorsOnly" in
        observed &&
      observed.minorsOnly ===
        true
    ) {
      minorsOnly =
        true;
    }
  }

  return {
    packageKey:
      pkg.key as PackageKey,

    packageName:
      pkg.name,

    alcoholicDrinksDailyLimit,

    drinkPriceThresholdEurope,

    aquaUnlimited,

    minorsOnly,
  };
}

export function getPackageOperationalRules(
  cruiseLine: CruiseLineKey
): PackageOperationalRules[] {
  return getAllPackages(
    cruiseLine
  ).map(
    resolvePackageRules
  );
}

export function getPackageOperationalRule(
  cruiseLine: CruiseLineKey,
  packageKey: PackageKey
): PackageOperationalRules | null {
  return (
    getPackageOperationalRules(
      cruiseLine
    ).find(
      (rule) =>
        rule.packageKey ===
        packageKey
    ) ?? null
  );
}
