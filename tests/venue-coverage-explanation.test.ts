import {
  describe,
  expect,
  it,
} from "vitest";

import {
  explainVenueCoverage,
} from "@/lib/venueCoverageExplanation";

describe(
  "venue coverage explanation",
  () => {
    it(
      "explica una cobertura limitada con venues excluidos concretos",
      () => {
        const result =
          explainVenueCoverage({
            specialityRestaurants:
              "unknown",

            privateIslands:
              "unknown",

            themedVenues:
              "limited",

            excludedVenues: [
              "Archipelago",
              "Casanova",
            ],
          });

        expect(
          result.themedVenues.status
        ).toBe("limited");

        expect(
          result.excludedVenues
        ).toEqual([
          "Archipelago",
          "Casanova",
        ]);

        expect(
          result.hasKnownLimitations
        ).toBe(true);
      }
    );

    it(
      "distingue cobertura condicional de exclusión",
      () => {
        const result =
          explainVenueCoverage({
            specialityRestaurants:
              "conditional",

            privateIslands:
              "conditional",

            themedVenues:
              "unknown",
          });

        expect(
          result.specialityRestaurants.status
        ).toBe("conditional");

        expect(
          result.privateIslands.status
        ).toBe("conditional");

        expect(
          result.hasKnownLimitations
        ).toBe(true);
      }
    );

    it(
      "no convierte unknown en una exclusión",
      () => {
        const result =
          explainVenueCoverage({
            specialityRestaurants:
              "unknown",

            privateIslands:
              "unknown",

            themedVenues:
              "unknown",
          });

        expect(
          result.specialityRestaurants.status
        ).toBe("unknown");

        expect(
          result.privateIslands.status
        ).toBe("unknown");

        expect(
          result.themedVenues.status
        ).toBe("unknown");

        expect(
          result.hasKnownLimitations
        ).toBe(false);
      }
    );

    it(
      "mantiene excluded como exclusión explícita",
      () => {
        const result =
          explainVenueCoverage({
            specialityRestaurants:
              "excluded",

            privateIslands:
              "excluded",

            themedVenues:
              "limited",
          });

        expect(
          result.specialityRestaurants.status
        ).toBe("excluded");

        expect(
          result.privateIslands.status
        ).toBe("excluded");

        expect(
          result.hasKnownLimitations
        ).toBe(true);
      }
    );
  }
);
