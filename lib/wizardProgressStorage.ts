export type StoredWizardProgressInput = {
  days?: unknown;

  coffee?: unknown;
  water?: unknown;
  soda?: unknown;
  beer?: unknown;
  wine?: unknown;

  people?: unknown;
};

export type StoredWizardProgress = {
  days: number;

  coffee: number;
  water: number;
  soda: number;
  beer: number;
  wine: number;

  people: number;
};

const defaultWizardProgress:
  StoredWizardProgress = {
  days: 0,

  coffee: 0,
  water: 0,
  soda: 0,
  beer: 0,
  wine: 0,

  people: 1,
};

function sanitizeNonNegativeInteger(
  value: unknown,
  fallback: number
): number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= 0
  )
    ? value
    : fallback;
}

function sanitizePositiveInteger(
  value: unknown,
  fallback: number
): number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value > 0
  )
    ? value
    : fallback;
}

/*
 * Normaliza los contadores recuperados de una
 * sesión guardada antes de que puedan alcanzar
 * los guards de ruta o el motor económico.
 *
 * El wizard solo produce números enteros:
 *
 * - días y bebidas admiten 0 como estado vacío;
 * - personas debe ser siempre mayor que 0.
 */
export function resolveStoredWizardProgress(
  input:
    StoredWizardProgressInput,
  fallback:
    StoredWizardProgress =
      defaultWizardProgress
): StoredWizardProgress {
  return {
    days:
      sanitizeNonNegativeInteger(
        input.days,
        fallback.days
      ),

    coffee:
      sanitizeNonNegativeInteger(
        input.coffee,
        fallback.coffee
      ),

    water:
      sanitizeNonNegativeInteger(
        input.water,
        fallback.water
      ),

    soda:
      sanitizeNonNegativeInteger(
        input.soda,
        fallback.soda
      ),

    beer:
      sanitizeNonNegativeInteger(
        input.beer,
        fallback.beer
      ),

    wine:
      sanitizeNonNegativeInteger(
        input.wine,
        fallback.wine
      ),

    people:
      sanitizePositiveInteger(
        input.people,
        fallback.people
      ),
  };
}
