import { describe, expect, it } from "vitest";

import {
  MAX_CRUISE_NIGHTS,
  MAX_DAILY_DRINKS_PER_CATEGORY,
  MAX_TRAVELERS,
  isValidCruiseNights,
  isValidDailyDrinkCount,
  isValidTravelerCount,
} from "@/lib/wizardNumberValidation";

describe("wizard domain number validation", () => {
  it("acepta los límites máximos del dominio", () => {
    expect(isValidCruiseNights(MAX_CRUISE_NIGHTS)).toBe(true);
    expect(isValidTravelerCount(MAX_TRAVELERS)).toBe(true);
    expect(
      isValidDailyDrinkCount(MAX_DAILY_DRINKS_PER_CATEGORY)
    ).toBe(true);
  });

  it("rechaza valores absurdos aunque sean enteros seguros", () => {
    expect(isValidCruiseNights(MAX_CRUISE_NIGHTS + 1)).toBe(false);
    expect(isValidTravelerCount(MAX_TRAVELERS + 1)).toBe(false);
    expect(
      isValidDailyDrinkCount(MAX_DAILY_DRINKS_PER_CATEGORY + 1)
    ).toBe(false);
  });

  it("mantiene cero únicamente para contadores diarios", () => {
    expect(isValidCruiseNights(0)).toBe(false);
    expect(isValidTravelerCount(0)).toBe(false);
    expect(isValidDailyDrinkCount(0)).toBe(true);
  });
});
