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
  type DrinkPriceThresholdChargePolicy,
  type DrinkPriceThresholdCoveragePolicy,
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

export type OperationalRuleSource = {
  source:
    | "base"
    | "contextual"
    | "none";

  contextualRuleIds:
    string[];
};

export type PackageVenueCoverageStatus =
  | "unknown"
  | "included"
  | "limited"
  | "conditional"
  | "excluded";

export type PackageVenueCoverage = {
  specialityRestaurants:
    PackageVenueCoverageStatus;

  privateIslands:
    PackageVenueCoverageStatus;

  themedVenues:
    PackageVenueCoverageStatus;

  excludedVenues:
    string[];
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

  alcoholicDrinksDailyLimitSource:
    OperationalRuleSource;

  /*
   * Umbral máximo por bebida.
   *
   * null = ninguna regla válida
   * conocida para este contexto.
   */
  drinkPriceThreshold:
    number | null;

  /*
   * Moneda del umbral anterior.
   *
   * null cuando no existe un umbral
   * monetario válido.
   */
  drinkPriceThresholdCurrency:
    string | null;

  drinkPriceThresholdSource:
    OperationalRuleSource;

  /*
   * Política económica conocida para
   * bebidas que superan el threshold.
   *
   * Por defecto permanece en "unknown"
   * hasta que una regla contextual
   * explícita aporte evidencia.
   */
  drinkPriceThresholdChargePolicy:
    DrinkPriceThresholdChargePolicy;

  drinkPriceThresholdChargePolicySource:
    OperationalRuleSource;

  /*
   * Política de cobertura asociada al
   * threshold.
   *
   * Se mantiene separada de la política
   * económica: conocer que una bebida
   * queda fuera de cobertura no implica
   * conocer cuánto se cobra por ella.
   */
  drinkPriceThresholdCoveragePolicy:
    DrinkPriceThresholdCoveragePolicy;

  drinkPriceThresholdCoveragePolicySource:
    OperationalRuleSource;

  /*
   * AQUA u otra cobertura específica
   * expresamente modelada.
   */
  aquaUnlimited: boolean;

  aquaUnlimitedSource:
    OperationalRuleSource;

  /*
   * Paquete reservado a menores.
   */
  minorsOnly: boolean;

  minorsOnlySource:
    OperationalRuleSource;

  /*
   * Cobertura operativa conocida según
   * el tipo de venue.
   *
   * No se infiere desde restrictions:
   * procede únicamente de datos
   * estructurados.
   */
  venueCoverage:
    PackageVenueCoverage;

  /*
   * Procedencia de la cobertura de venues.
   *
   * La cobertura base procede únicamente
   * de observedCoverage estructurado.
   */
  venueCoverageSource:
    OperationalRuleSource;

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

function readVenueCoverageStatus(
  value: unknown
): PackageVenueCoverageStatus {
  if (
    value === "included" ||
    value === "limited" ||
    value === "conditional" ||
    value === "excluded"
  ) {
    return value;
  }

  return "unknown";
}

function readVenueCoverage(
  value: unknown
): PackageVenueCoverage {
  const fallback:
    PackageVenueCoverage = {
      specialityRestaurants:
        "unknown",

      privateIslands:
        "unknown",

      themedVenues:
        "unknown",

      excludedVenues: [],
    };

  if (
    !value ||
    typeof value !== "object"
  ) {
    return fallback;
  }

  const record =
    value as Record<
      string,
      unknown
    >;

  const excludedVenues =
    Array.isArray(
      record.excludedVenues
    )
      ? record.excludedVenues
          .filter(
            (
              venue
            ): venue is string =>
              typeof venue ===
                "string" &&
              venue.trim().length >
                0
          )
          .map(
            (venue) =>
              venue.trim()
          )
      : [];

  return {
    specialityRestaurants:
      readVenueCoverageStatus(
        record
          .specialityRestaurants
      ),

    privateIslands:
      readVenueCoverageStatus(
        record.privateIslands
      ),

    themedVenues:
      readVenueCoverageStatus(
        record.themedVenues
      ),

    excludedVenues,
  };
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

    const alcoholicDrinksDailyLimitSource =
      values.alcoholicDrinksDailyLimit !==
      undefined
        ? {
            source:
              "contextual" as const,
            contextualRuleIds: [
              ...result
                .alcoholicDrinksDailyLimitSource
                .contextualRuleIds,
              rule.id,
            ],
          }
        : result
            .alcoholicDrinksDailyLimitSource;

    const drinkPriceThresholdSource =
      values.drinkPriceThreshold !==
      undefined
        ? {
            source:
              "contextual" as const,
            contextualRuleIds: [
              ...result
                .drinkPriceThresholdSource
                .contextualRuleIds,
              rule.id,
            ],
          }
        : result
            .drinkPriceThresholdSource;

    const drinkPriceThresholdChargePolicySource =
      values
        .drinkPriceThresholdChargePolicy !==
      undefined
        ? {
            source:
              "contextual" as const,
            contextualRuleIds: [
              ...result
                .drinkPriceThresholdChargePolicySource
                .contextualRuleIds,
              rule.id,
            ],
          }
        : result
            .drinkPriceThresholdChargePolicySource;

    const drinkPriceThresholdCoveragePolicySource =
      values
        .drinkPriceThresholdCoveragePolicy !==
      undefined
        ? {
            source:
              "contextual" as const,
            contextualRuleIds: [
              ...result
                .drinkPriceThresholdCoveragePolicySource
                .contextualRuleIds,
              rule.id,
            ],
          }
        : result
            .drinkPriceThresholdCoveragePolicySource;

    const aquaUnlimitedSource =
      values.aquaUnlimited !==
      undefined
        ? {
            source:
              "contextual" as const,
            contextualRuleIds: [
              ...result
                .aquaUnlimitedSource
                .contextualRuleIds,
              rule.id,
            ],
          }
        : result
            .aquaUnlimitedSource;

    const minorsOnlySource =
      values.minorsOnly !==
      undefined
        ? {
            source:
              "contextual" as const,
            contextualRuleIds: [
              ...result
                .minorsOnlySource
                .contextualRuleIds,
              rule.id,
            ],
          }
        : result
            .minorsOnlySource;

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

      drinkPriceThresholdCurrency:
        values
          .drinkPriceThreshold !==
        undefined
          ? (
              typeof values
                .drinkPriceThresholdCurrency ===
                "string" &&
              values
                .drinkPriceThresholdCurrency
                .trim().length > 0
                ? values
                    .drinkPriceThresholdCurrency
                    .trim()
                    .toUpperCase()
                : null
            )
          : result
              .drinkPriceThresholdCurrency,

      drinkPriceThresholdChargePolicy:
        values
          .drinkPriceThresholdChargePolicy !==
        undefined
          ? values
              .drinkPriceThresholdChargePolicy
          : result
              .drinkPriceThresholdChargePolicy,

      drinkPriceThresholdCoveragePolicy:
        values
          .drinkPriceThresholdCoveragePolicy !==
        undefined
          ? values
              .drinkPriceThresholdCoveragePolicy
          : result
              .drinkPriceThresholdCoveragePolicy,

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

      alcoholicDrinksDailyLimitSource,

      drinkPriceThresholdSource,

      drinkPriceThresholdChargePolicySource,

      drinkPriceThresholdCoveragePolicySource,

      aquaUnlimitedSource,

      minorsOnlySource,

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

  let venueCoverage:
    PackageVenueCoverage = {
      specialityRestaurants:
        "unknown",

      privateIslands:
        "unknown",

      themedVenues:
        "unknown",

      excludedVenues: [],
    };

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

    if (
      "venueCoverage" in
        observed
    ) {
      venueCoverage =
        readVenueCoverage(
          observed.venueCoverage
        );
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

      alcoholicDrinksDailyLimitSource:
        alcoholicDrinksDailyLimit !== null
          ? {
              source: "base",
              contextualRuleIds: [],
            }
          : {
              source: "none",
              contextualRuleIds: [],
            },

      /*
       * Los umbrales no se consideran
       * universales.
       *
       * Deben proceder de una regla
       * contextual explícita.
       */
      drinkPriceThreshold:
        null,

      drinkPriceThresholdCurrency:
        null,

      drinkPriceThresholdSource: {
        source: "none",
        contextualRuleIds: [],
      },

      drinkPriceThresholdChargePolicy:
        "unknown",

      drinkPriceThresholdChargePolicySource: {
        source: "none",
        contextualRuleIds: [],
      },

      drinkPriceThresholdCoveragePolicy:
        "unknown",

      drinkPriceThresholdCoveragePolicySource: {
        source: "none",
        contextualRuleIds: [],
      },

      aquaUnlimited,

      aquaUnlimitedSource:
        aquaUnlimited
          ? {
              source: "base",
              contextualRuleIds: [],
            }
          : {
              source: "none",
              contextualRuleIds: [],
            },

      minorsOnly,

      minorsOnlySource:
        minorsOnly
          ? {
              source: "base",
              contextualRuleIds: [],
            }
          : {
              source: "none",
              contextualRuleIds: [],
            },

      venueCoverage,

      venueCoverageSource:
        observed &&
        "venueCoverage" in observed
          ? {
              source: "base",
              contextualRuleIds: [],
            }
          : {
              source: "none",
              contextualRuleIds: [],
            },

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
