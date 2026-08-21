import {
  resolveStoredCocktailConsumption,
} from "@/lib/cocktailConsumptionStorage";
import {
  resolveStoredConsumptionConfirmation,
} from "@/lib/consumptionConfirmationStorage";
import {
  isValidDailyDrinkCount,
  isValidTravelerCount,
} from "@/lib/wizardNumberValidation";

export type AdultConsumptionProfile = {
  id: string;
  label: string;
  coffee: number;
  water: number;
  soda: number;
  juice: number;
  beer: number;
  wine: number;
  cocktail: number;
  alcoholicCocktail: number | null;
  nonAlcoholicCocktail: number | null;
  consumptionConfirmed: boolean;
};

export type AdultConsumptionProfileInput = {
  id?: unknown;
  label?: unknown;
  coffee?: unknown;
  water?: unknown;
  soda?: unknown;
  juice?: unknown;
  beer?: unknown;
  wine?: unknown;
  cocktail?: unknown;
  alcoholicCocktail?: unknown;
  nonAlcoholicCocktail?: unknown;
  consumptionConfirmed?: unknown;
};

export type LegacyAdultConsumptionInput =
  AdultConsumptionProfileInput & {
    adults?: unknown;
    people?: unknown;
    adultConsumptionProfiles?: unknown;
  };

function defaultProfileId(index: number): string {
  return `adult-${index + 1}`;
}

function defaultProfileLabel(index: number): string {
  return `Adulto ${index + 1}`;
}

function sanitizeCount(value: unknown): number {
  return isValidDailyDrinkCount(value)
    ? value
    : 0;
}

function sanitizeLabel(value: unknown, index: number): string {
  if (typeof value !== "string") {
    return defaultProfileLabel(index);
  }

  const normalized = value.trim().slice(0, 40);

  return normalized || defaultProfileLabel(index);
}

function resolveProfileId(
  value: unknown,
  index: number,
  usedIds: Set<string>
): string {
  const normalized =
    typeof value === "string"
      ? value.trim().slice(0, 80)
      : "";

  const baseId = normalized || defaultProfileId(index);
  let candidate = baseId;
  let suffix = 2;

  while (usedIds.has(candidate)) {
    candidate = `${baseId}-${suffix}`;
    suffix += 1;
  }

  usedIds.add(candidate);
  return candidate;
}

function asProfileInput(value: unknown): AdultConsumptionProfileInput {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as AdultConsumptionProfileInput
    : {};
}

export function resolveAdultConsumptionProfile(
  value: unknown,
  index: number,
  usedIds: Set<string> = new Set()
): AdultConsumptionProfile {
  const input = asProfileInput(value);
  const coffee = sanitizeCount(input.coffee);
  const water = sanitizeCount(input.water);
  const soda = sanitizeCount(input.soda);
  const juice = sanitizeCount(input.juice);
  const beer = sanitizeCount(input.beer);
  const wine = sanitizeCount(input.wine);
  const cocktailConsumption = resolveStoredCocktailConsumption({
    cocktail: input.cocktail,
    alcoholicCocktail: input.alcoholicCocktail,
    nonAlcoholicCocktail: input.nonAlcoholicCocktail,
  });

  const counts = {
    coffee,
    water,
    soda,
    juice,
    beer,
    wine,
    cocktail: cocktailConsumption.cocktail,
  };

  return {
    id: resolveProfileId(input.id, index, usedIds),
    label: sanitizeLabel(input.label, index),
    ...counts,
    alcoholicCocktail: cocktailConsumption.alcoholicCocktail,
    nonAlcoholicCocktail: cocktailConsumption.nonAlcoholicCocktail,
    consumptionConfirmed: resolveStoredConsumptionConfirmation(
      input,
      counts
    ),
  };
}

export function createEmptyAdultConsumptionProfile(
  index: number,
  usedIds: Set<string> = new Set()
): AdultConsumptionProfile {
  return resolveAdultConsumptionProfile({}, index, usedIds);
}

function resolveAdultCount(input: LegacyAdultConsumptionInput): number {
  if (isValidTravelerCount(input.adults)) {
    return input.adults;
  }

  if (isValidTravelerCount(input.people)) {
    return input.people;
  }

  return 0;
}

function legacyProfileInput(
  input: LegacyAdultConsumptionInput
): AdultConsumptionProfileInput {
  return {
    coffee: input.coffee,
    water: input.water,
    soda: input.soda,
    juice: input.juice,
    beer: input.beer,
    wine: input.wine,
    cocktail: input.cocktail,
    alcoholicCocktail: input.alcoholicCocktail,
    nonAlcoholicCocktail: input.nonAlcoholicCocktail,
    consumptionConfirmed: input.consumptionConfirmed,
  };
}

export function resolveStoredAdultConsumptionProfiles(
  input: LegacyAdultConsumptionInput
): AdultConsumptionProfile[] {
  const adultCount = resolveAdultCount(input);

  if (adultCount === 0) {
    return [];
  }

  const storedProfiles = Array.isArray(input.adultConsumptionProfiles)
    ? input.adultConsumptionProfiles
    : null;
  const usedIds = new Set<string>();

  if (storedProfiles !== null) {
    return Array.from({ length: adultCount }, (_, index) =>
      index < storedProfiles.length
        ? resolveAdultConsumptionProfile(storedProfiles[index], index, usedIds)
        : createEmptyAdultConsumptionProfile(index, usedIds)
    );
  }

  const legacyProfile = legacyProfileInput(input);

  return Array.from({ length: adultCount }, (_, index) =>
    resolveAdultConsumptionProfile(legacyProfile, index, usedIds)
  );
}

export function resizeAdultConsumptionProfiles(
  profiles: readonly AdultConsumptionProfile[],
  adultCount: number
): AdultConsumptionProfile[] {
  if (!isValidTravelerCount(adultCount)) {
    return [];
  }

  const usedIds = new Set<string>();

  return Array.from({ length: adultCount }, (_, index) =>
    index < profiles.length
      ? resolveAdultConsumptionProfile(profiles[index], index, usedIds)
      : createEmptyAdultConsumptionProfile(index, usedIds)
  );
}
