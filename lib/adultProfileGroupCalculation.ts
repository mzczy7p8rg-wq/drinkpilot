import type {
  AdultConsumptionProfile,
} from "@/lib/adultConsumptionProfiles";
import {
  calculateRecommendation,
  type CalculationResult,
  type RecommendationLevel,
} from "@/lib/calculator";
import {
  resolveAlcoholConsumption,
  type AlcoholConsumptionResolution,
} from "@/lib/alcoholConsumption";
import {
  evaluateOperationalRuleImpacts,
  type PackageOperationalRuleImpact,
} from "@/lib/operationalRuleImpact";
import type {
  PackageOperationalRules,
} from "@/lib/packageRules";

export type AdultProfileDrinkPrices = {
  coffeePrice: number;
  waterPrice: number;
  sodaPrice: number;
  juicePrice: number;
  beerPrice: number;
  winePrice: number;
  cocktailPrice: number;
};

export type AdultProfileGroupCalculationInput =
  AdultProfileDrinkPrices & {
    cruiseNights: number;
    packageChargeUnits?: number;
    packagePricePerChargeUnit: number;
    profiles: readonly AdultConsumptionProfile[];
  };

export type AdultProfileCalculation = {
  profileId: string;
  profileLabel: string;
  calculation: CalculationResult;
};

export type AdultProfileGroupCalculationResult = {
  adultCount: number;
  profileResults: AdultProfileCalculation[];
  packageCost: number;
  drinksCost: number;
  savings: number;
  recommended: boolean;
  recommendationLevel: RecommendationLevel;
  dailyDrinkCostPerAdult: number;
  dailyDrinkCostForGroup: number;
  dailyMarginPerAdult: number;
  savingsPercentage: number;
  coffeeCost: number;
  waterCost: number;
  sodaCost: number;
  juiceCost: number;
  beerCost: number;
  wineCost: number;
  cocktailCost: number;
  breakEvenDrinksPerDayPerAdult: number;
};

export type AdultProfileOperationalImpact = {
  profileId: string;
  profileLabel: string;
  alcoholConsumption: AlcoholConsumptionResolution;
  packageImpacts: PackageOperationalRuleImpact[];
};

function resolveRecommendationLevel(
  dailyMargin: number
): RecommendationLevel {
  if (dailyMargin <= 0) {
    return "not-worth-it";
  }

  if (dailyMargin < 3) {
    return "very-close";
  }

  if (dailyMargin < 8) {
    return "worth-considering";
  }

  if (dailyMargin < 15) {
    return "worth-it";
  }

  return "strongly-worth-it";
}

function assertSafeGroupValues(values: readonly number[]): void {
  if (
    values.some(
      (value) =>
        !Number.isFinite(value) ||
        Math.abs(value) > Number.MAX_SAFE_INTEGER
    )
  ) {
    throw new RangeError("Group calculation exceeds the safe numeric range");
  }
}

export function calculateAdultProfileGroupRecommendation(
  input: AdultProfileGroupCalculationInput
): AdultProfileGroupCalculationResult {
  if (input.profiles.length === 0) {
    throw new RangeError("At least one adult profile is required");
  }

  if (input.profiles.some((profile) => !profile.consumptionConfirmed)) {
    throw new RangeError("Every adult profile must be confirmed");
  }

  const profileResults = input.profiles.map((profile) => ({
    profileId: profile.id,
    profileLabel: profile.label,
    calculation: calculateRecommendation({
      cruiseNights: input.cruiseNights,
      packageChargeUnits: input.packageChargeUnits,
      people: 1,
      packagePricePerChargeUnit: input.packagePricePerChargeUnit,
      coffee: profile.coffee,
      water: profile.water,
      soda: profile.soda,
      juice: profile.juice,
      beer: profile.beer,
      wine: profile.wine,
      cocktail: profile.cocktail,
      coffeePrice: input.coffeePrice,
      waterPrice: input.waterPrice,
      sodaPrice: input.sodaPrice,
      juicePrice: input.juicePrice,
      beerPrice: input.beerPrice,
      winePrice: input.winePrice,
      cocktailPrice: input.cocktailPrice,
    }),
  }));

  const sum = (select: (result: CalculationResult) => number): number =>
    profileResults.reduce(
      (total, profile) => total + select(profile.calculation),
      0
    );

  const adultCount = profileResults.length;
  const packageCost = sum((result) => result.packageCost);
  const drinksCost = sum((result) => result.drinksCost);
  const savings = drinksCost - packageCost;
  const dailyDrinkCostForGroup = sum((result) => result.dailyDrinkCost);
  const dailyDrinkCostPerAdult = dailyDrinkCostForGroup / adultCount;
  const dailyMarginPerAdult =
    sum((result) => result.dailyMargin) / adultCount;
  const savingsPercentage =
    drinksCost > 0
      ? (savings / drinksCost) * 100
      : 0;

  const totalDrinksPerDayForGroup = input.profiles.reduce(
    (total, profile) =>
      total +
      profile.coffee +
      profile.water +
      profile.soda +
      profile.juice +
      profile.beer +
      profile.wine +
      profile.cocktail,
    0
  );
  const averageDrinkPrice =
    totalDrinksPerDayForGroup > 0
      ? dailyDrinkCostForGroup / totalDrinksPerDayForGroup
      : 0;
  const packageChargeUnits =
    input.packageChargeUnits ?? input.cruiseNights;
  const effectivePackagePricePerCruiseDay =
    input.cruiseNights > 0
      ? (input.packagePricePerChargeUnit * packageChargeUnits) /
        input.cruiseNights
      : input.packagePricePerChargeUnit;
  const breakEvenDrinksPerDayPerAdult =
    averageDrinkPrice > 0
      ? effectivePackagePricePerCruiseDay / averageDrinkPrice
      : 0;

  const result = {
    adultCount,
    profileResults,
    packageCost,
    drinksCost,
    savings,
    recommended: savings > 0,
    recommendationLevel: resolveRecommendationLevel(dailyMarginPerAdult),
    dailyDrinkCostPerAdult,
    dailyDrinkCostForGroup,
    dailyMarginPerAdult,
    savingsPercentage,
    coffeeCost: sum((item) => item.coffeeCost),
    waterCost: sum((item) => item.waterCost),
    sodaCost: sum((item) => item.sodaCost),
    juiceCost: sum((item) => item.juiceCost),
    beerCost: sum((item) => item.beerCost),
    wineCost: sum((item) => item.wineCost),
    cocktailCost: sum((item) => item.cocktailCost),
    breakEvenDrinksPerDayPerAdult,
  } satisfies AdultProfileGroupCalculationResult;

  assertSafeGroupValues([
    result.packageCost,
    result.drinksCost,
    result.savings,
    result.dailyDrinkCostPerAdult,
    result.dailyDrinkCostForGroup,
    result.dailyMarginPerAdult,
    result.savingsPercentage,
    result.coffeeCost,
    result.waterCost,
    result.sodaCost,
    result.juiceCost,
    result.beerCost,
    result.wineCost,
    result.cocktailCost,
    result.breakEvenDrinksPerDayPerAdult,
  ]);

  return result;
}

export function evaluateAdultProfileOperationalImpacts(
  profiles: readonly AdultConsumptionProfile[],
  operationalRules: PackageOperationalRules[]
): AdultProfileOperationalImpact[] {
  return profiles.map((profile) => {
    const alcoholConsumption = resolveAlcoholConsumption({
      beer: profile.beer,
      wine: profile.wine,
      cocktail: profile.cocktail,
      alcoholicCocktail: profile.alcoholicCocktail,
      nonAlcoholicCocktail: profile.nonAlcoholicCocktail,
    });

    return {
      profileId: profile.id,
      profileLabel: profile.label,
      alcoholConsumption,
      packageImpacts: evaluateOperationalRuleImpacts(
        alcoholConsumption,
        operationalRules
      ),
    };
  });
}
