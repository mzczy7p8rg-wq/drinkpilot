import {
  isValidDailyDrinkCount,
  isValidTravelerCount,
} from "@/lib/wizardNumberValidation";

export type StoredWizardProgressInput = {
  coffee?: unknown;
  water?: unknown;
  soda?: unknown;
  juice?: unknown;
  beer?: unknown;
  wine?: unknown;

  people?: unknown;
};

export type StoredWizardProgress = {
  coffee: number;
  water: number;
  soda: number;
  juice: number;
  beer: number;
  wine: number;

  people: number;
};

const defaultWizardProgress:
  StoredWizardProgress = {
  coffee: 0,
  water: 0,
  soda: 0,
  juice: 0,
  beer: 0,
  wine: 0,

  /*
   * 0 representa que el paso Personas
   * todavía no ha sido confirmado.
   */
  people: 0,
};

function sanitizeDailyDrinkCount(
  value: unknown,
  fallback: number
): number {
  return isValidDailyDrinkCount(value)
    ? value
    : isValidDailyDrinkCount(fallback)
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
    isValidTravelerCount(
      value
    )
  ) {
    return value;
  }

  return fallback === 0 || isValidTravelerCount(fallback)
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
 * - las bebidas admiten 0 como estado vacío;
 * - personas usa 0 como estado no confirmado y
 *   un entero positivo después de confirmarse.
 */
export function resolveStoredWizardProgress(
  input:
    StoredWizardProgressInput,
  fallback:
    Omit<StoredWizardProgress, "juice"> &
      Partial<Pick<StoredWizardProgress, "juice">> =
      defaultWizardProgress
): StoredWizardProgress {
  return {
    coffee:
      sanitizeDailyDrinkCount(
        input.coffee,
        fallback.coffee
      ),

    water:
      sanitizeDailyDrinkCount(
        input.water,
        fallback.water
      ),

    soda:
      sanitizeDailyDrinkCount(
        input.soda,
        fallback.soda
      ),

    juice:
      sanitizeDailyDrinkCount(
        input.juice,
        fallback.juice ?? 0
      ),

    beer:
      sanitizeDailyDrinkCount(
        input.beer,
        fallback.beer
      ),

    wine:
      sanitizeDailyDrinkCount(
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
