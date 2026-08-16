import {
  isValidDailyDrinkCount,
} from "@/lib/wizardNumberValidation";

export type StoredConsumptionConfirmationInput = {
  consumptionConfirmed?: unknown;
};

export type ConsumptionCounts = {
  coffee: number;
  water: number;
  soda: number;
  juice: number;
  beer: number;
  wine: number;
  cocktail: number;
};

/*
 * Las sesiones anteriores no distinguían entre
 * "todavía no respondido" y "confirmado con cero".
 *
 * Conservamos como completadas las sesiones legacy
 * que ya contienen consumo positivo. Un perfil legacy
 * completamente a cero debe volver al paso Consumo para
 * que el usuario lo confirme explícitamente.
 */
export function resolveStoredConsumptionConfirmation(
  input: StoredConsumptionConfirmationInput,
  counts: ConsumptionCounts
): boolean {
  if (
    typeof input.consumptionConfirmed ===
    "boolean"
  ) {
    return input.consumptionConfirmed;
  }

  const values =
    Object.values(counts);

  return (
    values.every(
      isValidDailyDrinkCount
    ) &&
    values.some(
      (value) => value > 0
    )
  );
}
