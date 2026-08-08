import {
  describe,
  expect,
  it,
} from "vitest";

import {
  evaluatePackageThresholdCruiseImpact,
} from "@/lib/packageThresholdCruiseImpact";

import type {
  PackageThresholdConsumptionImpact,
} from "@/lib/packageThresholdConsumptionImpact";

function createDailyImpact(
  overrides:
    Partial<PackageThresholdConsumptionImpact> = {}
): PackageThresholdConsumptionImpact {
  return {
    status:
      "known-unquantified",

    items: [],

    totalDrinksPerDay:
      7,

    drinksAboveThresholdPerDay:
      2,

    drinksExcludedFromCoveragePerDay:
      1,

    additionalCostPerDay:
      null,

    ...overrides,
  };
}

describe(
  "package threshold cruise impact",
  () => {
    it(
      "proyecta el impacto diario a todo el crucero",
      () => {
        const result =
          evaluatePackageThresholdCruiseImpact({
            dailyImpact:
              createDailyImpact(),

            days:
              7,

            people:
              2,
          });

        expect(
          result.status
        ).toBe(
          "known-unquantified"
        );

        expect(
          result.totalDrinks
        ).toBe(98);

        expect(
          result.drinksAboveThreshold
        ).toBe(28);

        expect(
          result.additionalCostTotal
        ).toBeNull();
      }
    );

    it(
      "mantiene impacto cero cuando ninguna bebida supera el threshold",
      () => {
        const result =
          evaluatePackageThresholdCruiseImpact({
            dailyImpact:
              createDailyImpact({
                status:
                  "none",

                totalDrinksPerDay:
                  5,

                drinksAboveThresholdPerDay:
                  0,

                additionalCostPerDay:
                  0,
              }),

            days:
              7,

            people:
              2,
          });

        expect(
          result.status
        ).toBe("none");

        expect(
          result.totalDrinks
        ).toBe(70);

        expect(
          result.drinksAboveThreshold
        ).toBe(0);

        expect(
          result.additionalCostTotal
        ).toBe(0);
      }
    );

    it(
      "propaga unknown cuando el impacto diario no puede determinarse",
      () => {
        const result =
          evaluatePackageThresholdCruiseImpact({
            dailyImpact:
              createDailyImpact({
                status:
                  "unknown",

                drinksAboveThresholdPerDay:
                  null,

                additionalCostPerDay:
                  null,
              }),

            days:
              7,

            people:
              2,
          });

        expect(
          result.status
        ).toBe("unknown");

        expect(
          result.totalDrinks
        ).toBe(98);

        expect(
          result.drinksAboveThreshold
        ).toBeNull();

        expect(
          result.additionalCostTotal
        ).toBeNull();
      }
    );

    it(
      "no calcula el crucero cuando faltan los días",
      () => {
        const result =
          evaluatePackageThresholdCruiseImpact({
            dailyImpact:
              createDailyImpact(),

            days:
              null,

            people:
              2,
          });

        expect(
          result.status
        ).toBe("unknown");

        expect(
          result.totalDrinks
        ).toBeNull();

        expect(
          result.drinksAboveThreshold
        ).toBeNull();

        expect(
          result.additionalCostTotal
        ).toBeNull();
      }
    );

    it(
      "no calcula el crucero cuando falta el número de personas",
      () => {
        const result =
          evaluatePackageThresholdCruiseImpact({
            dailyImpact:
              createDailyImpact(),

            days:
              7,

            people:
              null,
          });

        expect(
          result.status
        ).toBe("unknown");

        expect(
          result.totalDrinks
        ).toBeNull();

        expect(
          result.drinksAboveThreshold
        ).toBeNull();
      }
    );

    it(
      "rechaza días o personas no positivos",
      () => {
        const zeroDays =
          evaluatePackageThresholdCruiseImpact({
            dailyImpact:
              createDailyImpact(),

            days:
              0,

            people:
              2,
          });

        const negativePeople =
          evaluatePackageThresholdCruiseImpact({
            dailyImpact:
              createDailyImpact(),

            days:
              7,

            people:
              -1,
          });

        expect(
          zeroDays.status
        ).toBe("unknown");

        expect(
          negativePeople.status
        ).toBe("unknown");
      }
    );

    it(
      "no inventa coste adicional aunque conozca el número total de bebidas afectadas",
      () => {
        const result =
          evaluatePackageThresholdCruiseImpact({
            dailyImpact:
              createDailyImpact({
                totalDrinksPerDay:
                  10,

                drinksAboveThresholdPerDay:
                  4,
              }),

            days:
              10,

            people:
              3,
          });

        expect(
          result.totalDrinks
        ).toBe(300);

        expect(
          result.drinksAboveThreshold
        ).toBe(120);

        expect(
          result.status
        ).toBe(
          "known-unquantified"
        );

        expect(
          result.additionalCostTotal
        ).toBeNull();
      }
    );
  }
);

describe(
  "package threshold cruise coverage",
  () => {
    it(
      "proyecta las bebidas excluidas a todo el crucero",
      () => {
        const result =
          evaluatePackageThresholdCruiseImpact({
            dailyImpact:
              createDailyImpact({
                drinksExcludedFromCoveragePerDay:
                  2,
              }),

            days:
              7,

            people:
              2,
          });

        expect(
          result.drinksExcludedFromCoverage
        ).toBe(28);
      }
    );

    it(
      "mantiene desconocidas las exclusiones si el dato diario es desconocido",
      () => {
        const result =
          evaluatePackageThresholdCruiseImpact({
            dailyImpact:
              createDailyImpact({
                drinksExcludedFromCoveragePerDay:
                  null,
              }),

            days:
              7,

            people:
              2,
          });

        expect(
          result.drinksExcludedFromCoverage
        ).toBeNull();
      }
    );

    it(
      "mantiene cero exclusiones cuando ninguna bebida supera el threshold",
      () => {
        const result =
          evaluatePackageThresholdCruiseImpact({
            dailyImpact:
              createDailyImpact({
                status:
                  "none",

                drinksAboveThresholdPerDay:
                  0,

                drinksExcludedFromCoveragePerDay:
                  0,

                additionalCostPerDay:
                  0,
              }),

            days:
              7,

            people:
              2,
          });

        expect(
          result.drinksExcludedFromCoverage
        ).toBe(0);
      }
    );
  }
);


describe(
  "quantified package threshold cruise impact",
  () => {
    it(
      "proyecta el coste adicional diario a todo el crucero",
      () => {
        const result =
          evaluatePackageThresholdCruiseImpact({
            dailyImpact:
              createDailyImpact({
                status:
                  "quantified",

                totalDrinksPerDay:
                  6,

                drinksAboveThresholdPerDay:
                  3,

                additionalCostPerDay:
                  10,
              }),

            days:
              7,

            people:
              2,
          });

        expect(
          result.status
        ).toBe("quantified");

        expect(
          result.totalDrinks
        ).toBe(84);

        expect(
          result.drinksAboveThreshold
        ).toBe(42);

        expect(
          result.additionalCostTotal
        ).toBe(140);
      }
    );

    it(
      "no degrada un impacto quantified con coste cero válido",
      () => {
        const result =
          evaluatePackageThresholdCruiseImpact({
            dailyImpact:
              createDailyImpact({
                status:
                  "quantified",

                totalDrinksPerDay:
                  4,

                drinksAboveThresholdPerDay:
                  1,

                additionalCostPerDay:
                  0,
              }),

            days:
              7,

            people:
              2,
          });

        expect(
          result.status
        ).toBe("quantified");

        expect(
          result.additionalCostTotal
        ).toBe(0);
      }
    );
  }
);
