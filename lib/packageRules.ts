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

import {
  getContextualRulesForCruiseLine,
} from "@/data/contextualRules";

import {
  getContextualPackageRulesForPackage,
  type ContextualPackageRule,
} from "@/lib/contextualPackageRules";

export type PackageRulesContext =
  | CruiseLineKey
  | CruiseContext;

export type PackageRulesOptions = {
  /*
   * Permite inyectar reglas contextuales
   * explícitas.
   *
   * Principalmente útil para tests y
   * futuras capas de resolución.
   *
   * undefined = utilizar el registro
   * normal de la naviera.
   */
  contextualRules?:
    ContextualPackageRule[];
};

export type PackageOperationalRules = {
  packageKey: PackageKey;

  packageName: string;

  /*
   * Contexto exacto utilizado
   * para resolver las reglas.
   */
  context: CruiseContext;

  /*
   * Máximo diario de bebidas
   * alcohólicas.
   */
  alcoholicDrinksDailyLimit:
    number | null;

  /*
   * Umbral máximo por bebida.
   *
   * null = ninguna regla válida
   * conocida para este contexto.
   */
  drinkPriceThreshold:
    number | null;

  /*
   * AQUA u otra cobertura específica
   * expresamente modelada.
   */
  aquaUnlimited: boolean;

  /*
   * Paquete reservado a menores.
   */
  minorsOnly: boolean;

  /*
   * IDs de reglas contextuales que
   * realmente participaron en la
   * resolución.
   *
   * Esto permite auditar posteriormente
   * de dónde procede cada comportamiento.
   */
  appliedContextualRuleIds:
    string[];
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

/*
 * Aplica reglas contextuales sobre
 * las reglas base.
 *
 * Solo una propiedad expresamente
 * definida en la regla contextual
 * puede reemplazar el valor anterior.
 */
function applyContextualRules(
  base: PackageOperationalRules,
  rules: ContextualPackageRule[]
): PackageOperationalRules {
  let result =
    base;

  for (
    const rule of
    rules
  ) {
    const values =
      rule.rules;

    result = {
      ...result,

      alcoholicDrinksDailyLimit:
        values
          .alcoholicDrinksDailyLimit !==
        undefined
          ? readPositiveNumber(
              values
                .alcoholicDrinksDailyLimit
            )
          : result
              .alcoholicDrinksDailyLimit,

      drinkPriceThreshold:
        values
          .drinkPriceThreshold !==
        undefined
          ? readPositiveNumber(
              values
                .drinkPriceThreshold
            )
          : result
              .drinkPriceThreshold,

      aquaUnlimited:
        values.aquaUnlimited !==
        undefined
          ? values.aquaUnlimited
          : result.aquaUnlimited,

      minorsOnly:
        values.minorsOnly !==
        undefined
          ? values.minorsOnly
          : result.minorsOnly,

      appliedContextualRuleIds: [
        ...result
          .appliedContextualRuleIds,

        rule.id,
      ],
    };
  }

  return result;
}

function resolvePackageRules(
  pkg: RulesPackage,
  context: CruiseContext,
  contextualRuleRegistry:
    ContextualPackageRule[]
): PackageOperationalRules {
  const observed =
    pkg.observedCoverage;

  let alcoholicDrinksDailyLimit:
    number | null = null;

  let aquaUnlimited =
    false;

  let minorsOnly =
    false;

  /*
   * REGLAS BASE
   *
   * Solo utilizamos aquí condiciones
   * que ya forman parte de los datos
   * generales del paquete.
   */
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

  const baseRules:
    PackageOperationalRules = {
      packageKey:
        pkg.key as PackageKey,

      packageName:
        pkg.name,

      context,

      alcoholicDrinksDailyLimit,

      /*
       * Los umbrales no se consideran
       * universales.
       *
       * Deben proceder de una regla
       * contextual explícita.
       */
      drinkPriceThreshold:
        null,

      aquaUnlimited,

      minorsOnly,

      appliedContextualRuleIds:
        [],
    };

  /*
   * REGLAS CONTEXTUALES
   *
   * Primero obtenemos exclusivamente
   * las registradas para la naviera.
   *
   * Después filtramos por:
   *
   * - contexto
   * - packageKey
   */
  const contextualRules =
    getContextualPackageRulesForPackage(
      contextualRuleRegistry,
      context,
      pkg.key as PackageKey
    );

  return applyContextualRules(
    baseRules,
    contextualRules
  );
}

export function getPackageOperationalRules(
  input: PackageRulesContext,
  options: PackageRulesOptions = {}
): PackageOperationalRules[] {
  const context =
    normalizeCruiseContext(
      input
    );

  const contextualRuleRegistry =
    options.contextualRules ??
    getContextualRulesForCruiseLine(
      context.cruiseLine
    );

  return getAllPackages(
    context.cruiseLine
  ).map(
    (pkg) =>
      resolvePackageRules(
        pkg,
        context,
        contextualRuleRegistry
      )
  );
}

export function getPackageOperationalRule(
  input: PackageRulesContext,
  packageKey: PackageKey,
  options: PackageRulesOptions = {}
): PackageOperationalRules | null {
  return (
    getPackageOperationalRules(
      input,
      options
    ).find(
      (rule) =>
        rule.packageKey ===
        packageKey
    ) ?? null
  );
}
