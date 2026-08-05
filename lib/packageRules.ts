import {
  getAllPackages,
  type PackageKey,
} from "@/lib/packageService";

import type {
  CruiseLineKey,
} from "@/data/cruiseLines";

import {
  createCruiseContext,
  type CruiseContext,
} from "@/lib/cruiseContext";

/*
 * Entrada compatible con ambos modelos:
 *
 * Antiguo:
 *   "msc"
 *
 * Nuevo:
 *   {
 *     cruiseLine: "msc",
 *     market: "ES",
 *     sailingDate: "2026-08-15"
 *   }
 */
export type PackageRulesContext =
  | CruiseLineKey
  | CruiseContext;

export type PackageOperationalRules = {
  packageKey: PackageKey;

  packageName: string;

  /*
   * Contexto utilizado para evaluar
   * las reglas.
   *
   * Aunque todavía no tengamos reglas
   * dependientes de mercado o fecha,
   * lo conservamos para que el resultado
   * sea trazable.
   */
  context: CruiseContext;

  /*
   * Máximo diario de bebidas alcohólicas.
   *
   * null = no existe una regla conocida
   * o no está modelada todavía.
   */
  alcoholicDrinksDailyLimit:
    number | null;

  /*
   * Umbral máximo por bebida.
   *
   * Actualmente no existe ningún
   * umbral universal activo para MSC.
   *
   * Se mantiene preparado para futuras
   * reglas contextualizadas.
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

function normalizeCruiseContext(
  input: PackageRulesContext
): CruiseContext {
  if (
    typeof input === "string"
  ) {
    return createCruiseContext(
      input
    );
  }

  return input;
}

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
  pkg: RulesPackage,
  context: CruiseContext
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

    /*
     * Este lector continúa existiendo
     * para futuras reglas contextualizadas.
     *
     * Actualmente los datos MSC activos
     * no contienen un umbral europeo
     * universal.
     */
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

    context,

    alcoholicDrinksDailyLimit,

    drinkPriceThresholdEurope,

    aquaUnlimited,

    minorsOnly,
  };
}

export function getPackageOperationalRules(
  input: PackageRulesContext
): PackageOperationalRules[] {
  const context =
    normalizeCruiseContext(
      input
    );

  return getAllPackages(
    context.cruiseLine
  ).map(
    (pkg) =>
      resolvePackageRules(
        pkg,
        context
      )
  );
}

export function getPackageOperationalRule(
  input: PackageRulesContext,
  packageKey: PackageKey
): PackageOperationalRules | null {
  return (
    getPackageOperationalRules(
      input
    ).find(
      (rule) =>
        rule.packageKey ===
        packageKey
    ) ?? null
  );
}
