import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveStoredAdultConsumptionProfiles,
} from "@/lib/adultConsumptionProfiles";
import {
  calculateAdultProfileGroupRecommendation,
  evaluateAdultProfileOperationalImpacts,
} from "@/lib/adultProfileGroupCalculation";
import { calculateRecommendation } from "@/lib/calculator";
import { getPackageOperationalRules } from "@/lib/packageRules";

const prices = {
  coffeePrice: 4,
  waterPrice: 3,
  sodaPrice: 5,
  juicePrice: 5,
  beerPrice: 6,
  winePrice: 8,
  cocktailPrice: 10,
};

describe("adult profile group calculation", () => {
  it("preserves every economic metric for migrated identical profiles", () => {
    const consumption = {
      coffee: 2,
      water: 1,
      soda: 1,
      juice: 0,
      beer: 2,
      wine: 1,
      cocktail: 1,
      alcoholicCocktail: 1,
      nonAlcoholicCocktail: 0,
      consumptionConfirmed: true,
    };
    const profiles = resolveStoredAdultConsumptionProfiles({
      adults: 2,
      people: 2,
      ...consumption,
    });
    const legacy = calculateRecommendation({
      cruiseNights: 7,
      packageChargeUnits: 6,
      people: 2,
      packagePricePerChargeUnit: 40,
      ...consumption,
      ...prices,
    });
    const group = calculateAdultProfileGroupRecommendation({
      cruiseNights: 7,
      packageChargeUnits: 6,
      packagePricePerChargeUnit: 40,
      profiles,
      ...prices,
    });

    expect(group).toMatchObject({
      adultCount: 2,
      packageCost: legacy.packageCost,
      drinksCost: legacy.drinksCost,
      savings: legacy.savings,
      recommended: legacy.recommended,
      recommendationLevel: legacy.recommendationLevel,
      dailyDrinkCostPerAdult: legacy.dailyDrinkCost,
      dailyMarginPerAdult: legacy.dailyMargin,
      savingsPercentage: legacy.savingsPercentage,
      coffeeCost: legacy.coffeeCost,
      waterCost: legacy.waterCost,
      sodaCost: legacy.sodaCost,
      juiceCost: legacy.juiceCost,
      beerCost: legacy.beerCost,
      wineCost: legacy.wineCost,
      cocktailCost: legacy.cocktailCost,
      breakEvenDrinksPerDayPerAdult: legacy.breakEvenDrinksPerDay,
    });
  });

  it("calculates the heterogeneous regression case without averaging", () => {
    const profiles = resolveStoredAdultConsumptionProfiles({
      adults: 2,
      adultConsumptionProfiles: [
        {
          id: "adult-one",
          label: "Adulto 1",
          coffee: 3,
          beer: 2,
          consumptionConfirmed: true,
        },
        {
          id: "adult-two",
          label: "Adulto 2",
          coffee: 1,
          water: 1,
          cocktail: 2,
          alcoholicCocktail: 2,
          nonAlcoholicCocktail: 0,
          consumptionConfirmed: true,
        },
      ],
    });
    const result = calculateAdultProfileGroupRecommendation({
      cruiseNights: 7,
      packagePricePerChargeUnit: 40,
      profiles,
      ...prices,
    });

    expect(result.drinksCost).toBe(357);
    expect(result.packageCost).toBe(560);
    expect(result.savings).toBe(-203);
    expect(result.dailyDrinkCostForGroup).toBe(51);
    expect(result.dailyDrinkCostPerAdult).toBe(25.5);
    expect(result.coffeeCost).toBe(112);
    expect(result.waterCost).toBe(21);
    expect(result.beerCost).toBe(84);
    expect(result.cocktailCost).toBe(140);
    expect(result.profileResults.map((item) => item.calculation.drinksCost))
      .toEqual([168, 189]);
  });

  it("uses package charge units for every adult without changing consumption nights", () => {
    const profiles = resolveStoredAdultConsumptionProfiles({
      adults: 2,
      adultConsumptionProfiles: [
        { coffee: 1, consumptionConfirmed: true },
        { coffee: 2, consumptionConfirmed: true },
      ],
    });
    const result = calculateAdultProfileGroupRecommendation({
      cruiseNights: 7,
      packageChargeUnits: 6,
      packagePricePerChargeUnit: 40,
      profiles,
      ...prices,
    });

    expect(result.packageCost).toBe(40 * 6 * 2);
    expect(result.coffeeCost).toBe((1 + 2) * 4 * 7);
  });

  it("rejects a group without adult profiles", () => {
    expect(() => calculateAdultProfileGroupRecommendation({
      cruiseNights: 7,
      packagePricePerChargeUnit: 40,
      profiles: [],
      ...prices,
    })).toThrow(RangeError);
  });

  it("does not calculate while a newly added adult remains unconfirmed", () => {
    const profiles = resolveStoredAdultConsumptionProfiles({
      adults: 2,
      adultConsumptionProfiles: [
        { coffee: 1, consumptionConfirmed: true },
      ],
    });

    expect(() => calculateAdultProfileGroupRecommendation({
      cruiseNights: 7,
      packagePricePerChargeUnit: 40,
      profiles,
      ...prices,
    })).toThrow("Every adult profile must be confirmed");
  });
});

describe("adult profile operational impacts", () => {
  it("detects an MSC alcohol excess only for the adult who exceeds it", () => {
    const profiles = resolveStoredAdultConsumptionProfiles({
      adults: 2,
      adultConsumptionProfiles: [
        { id: "high", beer: 16, consumptionConfirmed: true },
        { id: "zero", beer: 0, consumptionConfirmed: true },
      ],
    });
    const impacts = evaluateAdultProfileOperationalImpacts(
      profiles,
      getPackageOperationalRules("msc")
    );
    const easyForHigh = impacts[0].packageImpacts.find(
      (impact) => impact.packageKey === "mscEasy"
    );
    const easyForZero = impacts[1].packageImpacts.find(
      (impact) => impact.packageKey === "mscEasy"
    );

    expect(easyForHigh?.alcoholDailyLimit).toMatchObject({
      status: "over-limit",
      alcoholicDrinksPerDay: 16,
      excessDrinksPerDay: 1,
    });
    expect(easyForZero?.alcoholDailyLimit).toMatchObject({
      status: "within-limit",
      alcoholicDrinksPerDay: 0,
      excessDrinksPerDay: 0,
    });
  });

  it("keeps only the adult with unknown cocktail composition unresolved", () => {
    const profiles = resolveStoredAdultConsumptionProfiles({
      adults: 2,
      adultConsumptionProfiles: [
        {
          id: "unknown",
          cocktail: 2,
          consumptionConfirmed: true,
        },
        {
          id: "known",
          cocktail: 2,
          alcoholicCocktail: 1,
          nonAlcoholicCocktail: 1,
          consumptionConfirmed: true,
        },
      ],
    });
    const impacts = evaluateAdultProfileOperationalImpacts(
      profiles,
      getPackageOperationalRules("msc")
    );

    expect(impacts[0].alcoholConsumption.alcoholicDrinksPerDay).toBeNull();
    expect(impacts[1].alcoholConsumption.alcoholicDrinksPerDay).toBe(1);
  });
});
