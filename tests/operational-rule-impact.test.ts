import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveAlcoholConsumption,
} from "@/lib/alcoholConsumption";

import {
  evaluateOperationalRuleImpacts,
} from "@/lib/operationalRuleImpact";

import {
  getPackageOperationalRules,
} from "@/lib/packageRules";

describe(
  "operational rule impact",
  () => {
    it(
      "evalúa el límite de alcohol para cada paquete MSC",
      () => {
        const consumption =
          resolveAlcoholConsumption({
            beer: 6,
            wine: 4,
            cocktail: 8,

            alcoholicCocktail: 8,
            nonAlcoholicCocktail: 0,
          });

        expect(
          consumption
            .alcoholicDrinksPerDay
        ).toBe(18);

        const rules =
          getPackageOperationalRules(
            "msc"
          );

        const impacts =
          evaluateOperationalRuleImpacts(
            consumption,
            rules
          );

        const easy =
          impacts.find(
            (impact) =>
              impact.packageKey ===
              "mscEasy"
          );

        expect(easy).toBeDefined();

        expect(
          easy?.alcoholDailyLimit
            .status
        ).toBe("over-limit");

        expect(
          easy?.alcoholDailyLimit
            .excessDrinksPerDay
        ).toBe(3);
      }
    );

    it(
      "mantiene unknown cuando la composición de cócteles es desconocida",
      () => {
        const consumption =
          resolveAlcoholConsumption({
            beer: 2,
            wine: 1,
            cocktail: 4,
          });

        expect(
          consumption
            .alcoholicDrinksPerDay
        ).toBeNull();

        const impacts =
          evaluateOperationalRuleImpacts(
            consumption,
            getPackageOperationalRules(
              "msc"
            )
          );

        expect(
          impacts.every(
            (impact) =>
              impact
                .alcoholDailyLimit
                .status ===
              "unknown"
          )
        ).toBe(true);
      }
    );

    it(
      "mantiene unknown en paquetes sin límite diario conocido",
      () => {
        const consumption =
          resolveAlcoholConsumption({
            beer: 2,
            wine: 1,
            cocktail: 4,

            alcoholicCocktail: 3,
            nonAlcoholicCocktail: 1,
          });

        const impacts =
          evaluateOperationalRuleImpacts(
            consumption,
            getPackageOperationalRules(
              "costa"
            )
          );

        expect(
          impacts.every(
            (impact) =>
              impact
                .alcoholDailyLimit
                .status ===
              "unknown"
          )
        ).toBe(true);
      }
    );
  }
);

describe(
  "operational economic impact integration",
  () => {
    it(
      "marca como known-unquantified un exceso MSC",
      () => {
        const consumption =
          resolveAlcoholConsumption({
            beer: 6,
            wine: 4,
            cocktail: 8,

            alcoholicCocktail: 8,
            nonAlcoholicCocktail: 0,
          });

        const impacts =
          evaluateOperationalRuleImpacts(
            consumption,
            getPackageOperationalRules(
              "msc"
            )
          );

        const easy =
          impacts.find(
            (impact) =>
              impact.packageKey ===
              "mscEasy"
          );

        expect(
          easy?.economicImpact.status
        ).toBe(
          "known-unquantified"
        );

        expect(
          easy
            ?.economicImpact
            .additionalCostPerDay
        ).toBeNull();
      }
    );

    it(
      "mantiene unknown cuando no puede evaluar el límite",
      () => {
        const consumption =
          resolveAlcoholConsumption({
            beer: 2,
            wine: 1,
            cocktail: 4,
          });

        const impacts =
          evaluateOperationalRuleImpacts(
            consumption,
            getPackageOperationalRules(
              "msc"
            )
          );

        const easy =
          impacts.find(
            (impact) =>
              impact.packageKey ===
              "mscEasy"
          );

        expect(
          easy?.economicImpact.status
        ).toBe("unknown");
      }
    );
  }
);
