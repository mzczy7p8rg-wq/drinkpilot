import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resizeAdultConsumptionProfiles,
  resolveStoredAdultConsumptionProfiles,
} from "@/lib/adultConsumptionProfiles";
import { calculateRecommendation } from "@/lib/calculator";

const legacyConsumption = {
  coffee: 3,
  water: 1,
  soda: 0,
  juice: 0,
  beer: 2,
  wine: 0,
  cocktail: 2,
  alcoholicCocktail: 1,
  nonAlcoholicCocktail: 1,
  consumptionConfirmed: true,
};

describe("adult consumption profile storage", () => {
  it.each([1, 2, 10])(
    "migrates one legacy profile into %i identical adult profiles",
    (adults) => {
      const profiles = resolveStoredAdultConsumptionProfiles({
        adults,
        people: adults,
        ...legacyConsumption,
      });

      expect(profiles).toHaveLength(adults);
      expect(profiles.map((profile) => profile.id)).toEqual(
        Array.from({ length: adults }, (_, index) => `adult-${index + 1}`)
      );

      for (const [index, profile] of profiles.entries()) {
        expect(profile).toMatchObject({
          label: `Adulto ${index + 1}`,
          ...legacyConsumption,
        });
      }

      if (profiles.length > 1) {
        expect(profiles[0]).not.toBe(profiles[1]);
      }
    }
  );

  it("preserves the legacy economic result after migration", () => {
    const profiles = resolveStoredAdultConsumptionProfiles({
      adults: 2,
      people: 2,
      ...legacyConsumption,
    });

    const commonInput = {
      cruiseNights: 7,
      packagePricePerChargeUnit: 40,
      coffeePrice: 4,
      waterPrice: 3,
      sodaPrice: 5,
      juicePrice: 5,
      beerPrice: 6,
      winePrice: 8,
      cocktailPrice: 10,
    };

    const legacyResult = calculateRecommendation({
      ...commonInput,
      people: 2,
      ...legacyConsumption,
    });

    const migratedDrinksCost = profiles.reduce(
      (total, profile) => total + calculateRecommendation({
        ...commonInput,
        people: 1,
        ...profile,
      }).drinksCost,
      0
    );

    expect(migratedDrinksCost).toBe(legacyResult.drinksCost);
    expect(legacyResult.packageCost).toBe(40 * 7 * 2);
  });

  it("preserves an explicitly confirmed zero-consumption legacy profile", () => {
    const profiles = resolveStoredAdultConsumptionProfiles({
      people: 2,
      coffee: 0,
      water: 0,
      soda: 0,
      juice: 0,
      beer: 0,
      wine: 0,
      cocktail: 0,
      consumptionConfirmed: true,
    });

    expect(profiles).toHaveLength(2);
    expect(profiles.every((profile) => profile.consumptionConfirmed)).toBe(true);
  });

  it("keeps valid heterogeneous profiles and normalizes unsafe fields", () => {
    const profiles = resolveStoredAdultConsumptionProfiles({
      adults: 2,
      people: 2,
      adultConsumptionProfiles: [
        {
          id: "alex",
          label: " Alex ",
          coffee: 3,
          water: 0,
          soda: 0,
          juice: 0,
          beer: 2,
          wine: 0,
          cocktail: 0,
          consumptionConfirmed: true,
        },
        {
          id: "alex",
          label: "",
          coffee: 1,
          water: 1,
          soda: 0.5,
          juice: -1,
          beer: 0,
          wine: 0,
          cocktail: 2,
          alcoholicCocktail: 2,
          nonAlcoholicCocktail: 2,
        },
      ],
    });

    expect(profiles).toEqual([
      expect.objectContaining({
        id: "alex",
        label: "Alex",
        coffee: 3,
        beer: 2,
        consumptionConfirmed: true,
      }),
      expect.objectContaining({
        id: "alex-2",
        label: "Adulto 2",
        coffee: 1,
        water: 1,
        soda: 0,
        juice: 0,
        cocktail: 2,
        alcoholicCocktail: null,
        nonAlcoholicCocktail: null,
        consumptionConfirmed: true,
      }),
    ]);
  });

  it("prefers the canonical adult count and rejects invalid group sizes", () => {
    expect(resolveStoredAdultConsumptionProfiles({
      adults: 2,
      people: 4,
      ...legacyConsumption,
    })).toHaveLength(2);

    expect(resolveStoredAdultConsumptionProfiles({
      adults: 0,
      people: 0,
      ...legacyConsumption,
    })).toEqual([]);
  });

  it("adds empty unconfirmed profiles and trims without redistributing consumption", () => {
    const initial = resolveStoredAdultConsumptionProfiles({
      adults: 2,
      adultConsumptionProfiles: [
        { id: "one", coffee: 3, consumptionConfirmed: true },
        { id: "two", beer: 2, consumptionConfirmed: true },
      ],
    });

    const increased = resizeAdultConsumptionProfiles(initial, 3);

    expect(increased).toHaveLength(3);
    expect(increased[0]).toMatchObject({ id: "one", coffee: 3 });
    expect(increased[1]).toMatchObject({ id: "two", beer: 2 });
    expect(increased[2]).toMatchObject({
      id: "adult-3",
      coffee: 0,
      beer: 0,
      consumptionConfirmed: false,
    });

    expect(resizeAdultConsumptionProfiles(increased, 1)).toEqual([
      expect.objectContaining({ id: "one", coffee: 3 }),
    ]);
  });
});
