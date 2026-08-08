import type {
  WizardData,
} from "@/lib/store";

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
  return (
    Number.isInteger(data.days) &&
    data.days > 0
  );
}

export function hasValidConsumptionStep(
  data: WizardProgressData
): boolean {
  return getTotalDrinksPerDay(data) > 0;
}

export function hasValidPeopleStep(
  data: WizardProgressData
): boolean {
  return (
    Number.isInteger(data.people) &&
    data.people > 0
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
