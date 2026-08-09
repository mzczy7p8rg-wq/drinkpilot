import { describe, expect, it } from "vitest";

import {
  MAX_CRUISE_DAYS,
  MAX_DAILY_DRINKS_PER_CATEGORY,
  MAX_TRAVELERS,
  isValidCruiseDays,
  isValidDailyDrinkCount,
  isValidTravelerCount,
} from "@/lib/wizardNumberValidation";

describe("wizard domain number validation", () => {
  it("acepta los límites máximos del dominio", () => {
    expect(isValidCruiseDays(MAX_CRUISE_DAYS)).toBe(true);
    expect(isValidTravelerCount(MAX_TRAVELERS)).toBe(true);
    expect(
      isValidDailyDrinkCount(MAX_DAILY_DRINKS_PER_CATEGORY)
    ).toBe(true);
  });

  it("rechaza valores absurdos aunque sean enteros seguros", () => {
    expect(isValidCruiseDays(MAX_CRUISE_DAYS + 1)).toBe(false);
    expect(isValidTravelerCount(MAX_TRAVELERS + 1)).toBe(false);
    expect(
      isValidDailyDrinkCount(MAX_DAILY_DRINKS_PER_CATEGORY + 1)
    ).toBe(false);
  });

  it("mantiene cero únicamente para contadores diarios", () => {
    expect(isValidCruiseDays(0)).toBe(false);
    expect(isValidTravelerCount(0)).toBe(false);
    expect(isValidDailyDrinkCount(0)).toBe(true);
  });
});
