import {
  getAllPackages,
  PackageKey,
} from "@/lib/packageService";

export type CoverageInput = {
  coffee: number;
  water: number;
  soda: number;
  beer: number;
  wine: number;

  /*
   * Categoría legacy.
   *
   * Sigue representando el consumo de
   * cócteles introducido actualmente
   * en el wizard.
   */
  cocktail: number;

  /*
   * Coverage v2 — cócteles.
   *
   * Opcionales para mantener compatibilidad
   * con el flujo actual.
   */
  alcoholicCocktails?: boolean;
  nonAlcoholicCocktails?: boolean;

  premiumCocktails: boolean;

  bottledBeer: boolean;

  premiumSpirits: boolean;

  /*
   * Agua embotellada v2.
   *
   * bottledWaterDailyAllowance:
   * el usuario valora disponer al menos de
   * una botella de agua diaria incluida.
   *
   * bottledWaterUnlimited:
   * el usuario valora disponer de agua
   * embotellada sin límite.
   */
  bottledWaterDailyAllowance?: boolean;

  bottledWaterUnlimited: boolean;
};

export type CoverageCategory =
  | "coffee"
  | "water"
  | "soda"
  | "beer"
  | "wine"

  /*
   * Categoría legacy.
   */
  | "cocktail"

  /*
   * Coverage v2 — cócteles.
   */
  | "alcoholicCocktails"
  | "nonAlcoholicCocktails"

  | "premiumCocktails"
  | "bottledBeer"
  | "premiumSpirits"

  /*
   * Agua embotellada v2.
   */
  | "bottledWaterDailyAllowance"

  | "bottledWaterUnlimited";

export type PackageCoverageResult = {
  packageKey: PackageKey;

  packageName: string;

  requestedCategories:
    CoverageCategory[];

  coveredCategories:
    CoverageCategory[];

  uncoveredCategories:
    CoverageCategory[];

  coverageScore: number;

  fullyCovered: boolean;
};

export type CoverageOptions = {
  /*
   * Por defecto solo analizamos paquetes
   * completamente habilitados.
   *
   * Este modo permite inspeccionar paquetes
   * pendientes, como My Drinks Soft,
   * sin activarlos en comparison.ts.
   */
  includePendingPackages?: boolean;
};

/*
 * Comprueba una categoría de cobertura.
 *
 * La mayoría de categorías viven directamente
 * dentro de pkg.coverage.
 *
 * La excepción actual es:
 *
 * bottledWaterDailyAllowance
 *
 * porque la cobertura de agua embotellada
 * tiene más detalle que un simple booleano.
 */
function isCategoryCovered(
  pkg: ReturnType<
    typeof getAllPackages
  >[number],
  category: CoverageCategory
): boolean {
  /*
   * AGUA EMBOTELLADA DIARIA
   *
   * My Drinks:
   * observedCoverage.bottledWaterDailyAllowance = 1
   *
   * My Drinks Plus:
   * bottledWaterUnlimited = true
   *
   * Cualquiera de esas dos condiciones
   * cubre la petición de disponer al menos
   * de una botella diaria.
   */
  if (
    category ===
    "bottledWaterDailyAllowance"
  ) {
    const observedCoverage =
      pkg.observedCoverage;

    if (
      observedCoverage &&
      "bottledWaterDailyAllowance" in
        observedCoverage
    ) {
      const allowance =
        observedCoverage
          .bottledWaterDailyAllowance;

      if (
        typeof allowance === "number" &&
        allowance >= 1
      ) {
        return true;
      }
    }

    /*
     * Un paquete con agua ilimitada también
     * satisface naturalmente una necesidad
     * de una botella diaria.
     */
    if (
      pkg.coverage
        .bottledWaterUnlimited === true
    ) {
      return true;
    }

    return false;
  }

  /*
   * RESTO DE CATEGORÍAS
   */
  return (
    pkg.coverage[category] === true
  );
}

export function calculatePackageCoverage(
  input: CoverageInput,
  options: CoverageOptions = {}
): PackageCoverageResult[] {
  const packages =
    getAllPackages().filter(
      (pkg) =>
        pkg.status === "verified" ||
        options.includePendingPackages ===
          true
    );

  /*
   * Categorías realmente solicitadas
   * por el usuario.
   */
  const requestedCategories:
    CoverageCategory[] = [];

  /*
   * CONSUMO BÁSICO
   */

  if (input.coffee > 0) {
    requestedCategories.push(
      "coffee"
    );
  }

  if (input.water > 0) {
    requestedCategories.push(
      "water"
    );
  }

  if (input.soda > 0) {
    requestedCategories.push(
      "soda"
    );
  }

  if (input.beer > 0) {
    requestedCategories.push(
      "beer"
    );
  }

  if (input.wine > 0) {
    requestedCategories.push(
      "wine"
    );
  }

  /*
   * CÓCTEL LEGACY
   *
   * Conservamos exactamente el comportamiento
   * actual del wizard.
   */
  if (input.cocktail > 0) {
    requestedCategories.push(
      "cocktail"
    );
  }

  /*
   * COVERAGE V2 — CÓCTELES
   */

  if (input.alcoholicCocktails) {
    requestedCategories.push(
      "alcoholicCocktails"
    );
  }

  if (input.nonAlcoholicCocktails) {
    requestedCategories.push(
      "nonAlcoholicCocktails"
    );
  }

  if (input.premiumCocktails) {
    requestedCategories.push(
      "premiumCocktails"
    );
  }

  /*
   * CERVEZA / DESTILADOS PREMIUM
   */

  if (input.bottledBeer) {
    requestedCategories.push(
      "bottledBeer"
    );
  }

  if (input.premiumSpirits) {
    requestedCategories.push(
      "premiumSpirits"
    );
  }

  /*
   * AGUA EMBOTELLADA V2
   */

  if (
    input.bottledWaterDailyAllowance
  ) {
    requestedCategories.push(
      "bottledWaterDailyAllowance"
    );
  }

  if (
    input.bottledWaterUnlimited
  ) {
    requestedCategories.push(
      "bottledWaterUnlimited"
    );
  }

  /*
   * COBERTURA POR PAQUETE
   */

  return packages.map((pkg) => {
    const coveredCategories =
      requestedCategories.filter(
        (category) =>
          isCategoryCovered(
            pkg,
            category
          )
      );

    const uncoveredCategories =
      requestedCategories.filter(
        (category) =>
          !isCategoryCovered(
            pkg,
            category
          )
      );

    const coverageScore =
      requestedCategories.length > 0
        ? (
            coveredCategories.length /
            requestedCategories.length
          ) * 100
        : 0;

    return {
      packageKey:
        pkg.key as PackageKey,

      packageName:
        pkg.name,

      requestedCategories,

      coveredCategories,

      uncoveredCategories,

      coverageScore,

      fullyCovered:
        uncoveredCategories.length ===
        0,
    };
  });
}