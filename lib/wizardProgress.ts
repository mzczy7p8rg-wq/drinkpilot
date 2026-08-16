import type {
  WizardData,
} from "@/lib/store";

import {
  isValidCruiseNights,
  isValidDailyDrinkCount,
  isValidTravelerCount,
} from "@/lib/wizardNumberValidation";

export type WizardRequirement =
  | "cruise"
  | "consumption"
  | "people";

type WizardProgressData =
  Pick<
    WizardData,
    | "cruiseNights"
    | "coffee"
    | "water"
    | "soda"
    | "beer"
    | "wine"
    | "cocktail"
    | "consumptionConfirmed"
    | "people"
  > & { juice?: number };

export function getTotalDrinksPerDay(
  data: WizardProgressData
): number {
  return (
    data.coffee +
    data.water +
    data.soda +
    (data.juice ?? 0) +
    data.beer +
    data.wine +
    data.cocktail
  );
}

export function hasValidCruiseStep(
  data: WizardProgressData
): boolean {
  return isValidCruiseNights(
    data.cruiseNights
  );
}

export function hasValidConsumptionStep(
  data: WizardProgressData
): boolean {
  return (
    hasValidConsumptionValues(
      data
    ) &&
    data.consumptionConfirmed ===
      true
  );
}

export function hasValidConsumptionValues(
  data: WizardProgressData
): boolean {
  const counts = [
    data.coffee,
    data.water,
    data.soda,
    data.juice ?? 0,
    data.beer,
    data.wine,
    data.cocktail,
  ];

  if (
    !counts.every(
      isValidDailyDrinkCount
    )
  ) {
    return false;
  }

  return true;
}

export function hasValidPeopleStep(
  data: WizardProgressData
): boolean {
  return isValidTravelerCount(
    data.people
  );
}

export function resolveWizardRedirect(
  data: WizardProgressData,
  requirement: WizardRequirement
): string | null {
  /*
   * El orden debe reflejar el wizard visible:
   * Viajeros -> Crucero -> Consumo.
   *
   * Si validamos primero el crucero, un reset
   * completo desvía "Nuevo análisis" al antiguo
   * primer paso en lugar de mantener al usuario
   * en Viajeros.
   */
  if (!hasValidPeopleStep(data)) {
    return "/wizard/people";
  }

  if (!hasValidCruiseStep(data)) {
    return "/wizard";
  }

  if (requirement === "cruise") {
    return null;
  }

  if (!hasValidConsumptionStep(data)) {
    return "/wizard/consumption";
  }

  if (requirement === "consumption") {
    return null;
  }

  return null;
}
