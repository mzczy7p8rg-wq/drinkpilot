import type {
  WizardData,
} from "@/lib/store";

import {
  isNonNegativeSafeInteger,
  isPositiveSafeInteger,
} from "@/lib/wizardNumberValidation";

export type WizardRequirement =
  | "cruise"
  | "consumption"
  | "people";

type WizardProgressData =
  Pick<
    WizardData,
    | "days"
    | "coffee"
    | "water"
    | "soda"
    | "beer"
    | "wine"
    | "cocktail"
    | "people"
  >;

export function getTotalDrinksPerDay(
  data: WizardProgressData
): number {
  return (
    data.coffee +
    data.water +
    data.soda +
    data.beer +
    data.wine +
    data.cocktail
  );
}

export function hasValidCruiseStep(
  data: WizardProgressData
): boolean {
  return isPositiveSafeInteger(
    data.days
  );
}

export function hasValidConsumptionStep(
  data: WizardProgressData
): boolean {
  const counts = [
    data.coffee,
    data.water,
    data.soda,
    data.beer,
    data.wine,
    data.cocktail,
  ];

  if (
    !counts.every(
      isNonNegativeSafeInteger
    )
  ) {
    return false;
  }

  return isPositiveSafeInteger(
    getTotalDrinksPerDay(data)
  );
}

export function hasValidPeopleStep(
  data: WizardProgressData
): boolean {
  return isPositiveSafeInteger(
    data.people
  );
}

export function resolveWizardRedirect(
  data: WizardProgressData,
  requirement: WizardRequirement
): string | null {
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

  if (!hasValidPeopleStep(data)) {
    return "/wizard/people";
  }

  return null;
}
