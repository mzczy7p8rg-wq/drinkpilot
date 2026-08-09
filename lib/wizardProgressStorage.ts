import {
  isNonNegativeSafeInteger,
  isPositiveSafeInteger,
} from "@/lib/wizardNumberValidation";

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

  /*
   * 0 representa que el paso Personas
   * todavía no ha sido confirmado.
   */
  people: 0,
};

function sanitizeNonNegativeInteger(
  value: unknown,
  fallback: number
): number {
  return isNonNegativeSafeInteger(value)
    ? value
    : isNonNegativeSafeInteger(fallback)
      ? fallback
      : 0;
}

function sanitizePeopleCount(
  value: unknown,
  fallback: number
): number {
  /*
   * Un valor positivo representa una
   * confirmación válida.
   *
   * 0 se conserva únicamente como estado
   * interno "pendiente de confirmar".
   */
  if (
    isPositiveSafeInteger(
      value
    )
  ) {
    return value;
  }

  return isNonNegativeSafeInteger(
    fallback
  )
    ? fallback
    : 0;
}

/*
 * Normaliza los contadores recuperados de una
 * sesión guardada antes de que puedan alcanzar
 * los guards de ruta o el motor económico.
 *
 * El wizard solo produce números enteros:
 *
 * - días y bebidas admiten 0 como estado vacío;
 * - personas usa 0 como estado no confirmado y
 *   un entero positivo después de confirmarse.
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
      sanitizePeopleCount(
        input.people,
        fallback.people
      ),
  };
}
