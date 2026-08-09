export type StoredWizardPreferencesInput = {
  alcoholicCocktails?: unknown;
  nonAlcoholicCocktails?: unknown;
  premiumCocktails?: unknown;
  bottledBeer?: unknown;
  premiumSpirits?: unknown;
  bottledWaterDailyAllowance?: unknown;
  bottledWaterUnlimited?: unknown;
};

export type StoredWizardPreferences = {
  alcoholicCocktails: boolean;
  nonAlcoholicCocktails: boolean;
  premiumCocktails: boolean;
  bottledBeer: boolean;
  premiumSpirits: boolean;
  bottledWaterDailyAllowance: boolean;
  bottledWaterUnlimited: boolean;
};

const defaultWizardPreferences:
  StoredWizardPreferences = {
  alcoholicCocktails: false,
  nonAlcoholicCocktails: false,
  premiumCocktails: false,
  bottledBeer: false,
  premiumSpirits: false,
  bottledWaterDailyAllowance: false,
  bottledWaterUnlimited: false,
};

function sanitizeBoolean(
  value: unknown,
  fallback: unknown
): boolean {
  return typeof value === "boolean"
    ? value
    : typeof fallback === "boolean"
      ? fallback
      : false;
}

/*
 * Migra las preferencias recuperadas de una
 * sesión guardada y restablece sus invariantes.
 *
 * El wizard representa el agua ilimitada como
 * una cobertura que incluye necesariamente la
 * asignación diaria. Una sesión antigua o
 * manipulada no puede conservar la combinación
 * imposible unlimited=true y daily=false.
 */
export function resolveStoredWizardPreferences(
  input:
    StoredWizardPreferencesInput,
  fallback:
    StoredWizardPreferences =
      defaultWizardPreferences
): StoredWizardPreferences {
  const bottledWaterUnlimited =
    sanitizeBoolean(
      input.bottledWaterUnlimited,
      fallback.bottledWaterUnlimited
    );

  return {
    alcoholicCocktails:
      sanitizeBoolean(
        input.alcoholicCocktails,
        fallback.alcoholicCocktails
      ),

    nonAlcoholicCocktails:
      sanitizeBoolean(
        input.nonAlcoholicCocktails,
        fallback.nonAlcoholicCocktails
      ),

    premiumCocktails:
      sanitizeBoolean(
        input.premiumCocktails,
        fallback.premiumCocktails
      ),

    bottledBeer:
      sanitizeBoolean(
        input.bottledBeer,
        fallback.bottledBeer
      ),

    premiumSpirits:
      sanitizeBoolean(
        input.premiumSpirits,
        fallback.premiumSpirits
      ),

    bottledWaterDailyAllowance:
      bottledWaterUnlimited ||
      sanitizeBoolean(
        input
          .bottledWaterDailyAllowance,
        fallback
          .bottledWaterDailyAllowance
      ),

    bottledWaterUnlimited,
  };
}
