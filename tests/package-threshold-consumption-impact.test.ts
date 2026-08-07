import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getPackageOperationalRule,
} from "@/lib/packageRules";

import {
  createSelectedDrinkPrice,
} from "@/lib/selectedDrinkPrice";

import {
  createSelectedDrinkConsumption,
} from "@/lib/selectedDrinkConsumption";

import {
  evaluatePackageThresholdConsumptionImpact,
} from "@/lib/packageThresholdConsumptionImpact";

function getPremiumExtraEurRule() {
  const rule =
    getPackageOperationalRule(
      {
        cruiseLine:
          "msc",

        market:
          "ES",

        sailingRegion:
          null,

        onboardCurrency:
          "EUR",

        sailingDate:
          "2026-08-15",
      },
      "mscPremiumExtra"
    );

  if (!rule) {
    throw new Error(
      "MSC Premium Extra rule missing"
    );
  }

  return rule;
}

function createConsumption(
  category:
    "cocktail" |
    "wine" |
    "beer",
  price:
    number,
  quantityPerDay:
    number
) {
  const drink =
    createSelectedDrinkPrice({
      category,
      price,
      currency:
        "EUR",
    });

  if (!drink) {
    throw new Error(
      "Selected drink setup failed"
    );
  }

  const consumption =
    createSelectedDrinkConsumption({
      drink,
      quantityPerDay,
    });

  if (!consumption) {
    throw new Error(
      "Consumption setup failed"
    );
  }

  return consumption;
}

describe(
  "package threshold consumption impact",
  () => {
    it(
      "detecta cuántas consumiciones diarias superan el threshold",
      () => {
        const result =
          evaluatePackageThresholdConsumptionImpact(
            getPremiumExtraEurRule(),
            [
              createConsumption(
                "cocktail",
                15,
                2
              ),

              createConsumption(
                "wine",
                12,
                3
              ),

              createConsumption(
                "beer",
                8,
                2
              ),
            ]
          );

        expect(
          result.totalDrinksPerDay
        ).toBe(7);

        expect(
          result.drinksAboveThresholdPerDay
        ).toBe(2);

        expect(
          result.status
        ).toBe(
          "known-unquantified"
        );

        expect(
          result.additionalCostPerDay
        ).toBeNull();
      }
    );

    it(
      "devuelve none cuando ninguna bebida supera el threshold",
      () => {
        const result =
          evaluatePackageThresholdConsumptionImpact(
            getPremiumExtraEurRule(),
            [
              createConsumption(
                "cocktail",
                14,
                2
              ),

              createConsumption(
                "wine",
                12,
                3
              ),
            ]
          );

        expect(
          result.status
        ).toBe("none");

        expect(
          result.totalDrinksPerDay
        ).toBe(5);

        expect(
          result.drinksAboveThresholdPerDay
        ).toBe(0);

        expect(
          result.additionalCostPerDay
        ).toBe(0);
      }
    );

    it(
      "mantiene unknown si alguna bebida no puede evaluarse",
      () => {
        const rule =
          getPremiumExtraEurRule();

        const usdDrink =
          createSelectedDrinkPrice({
            category:
              "cocktail",

            price:
              15,

            currency:
              "USD",
          });

        if (!usdDrink) {
          throw new Error(
            "Selected drink setup failed"
          );
        }

        const consumption =
          createSelectedDrinkConsumption({
            drink:
              usdDrink,

            quantityPerDay:
              2,
          });

        if (!consumption) {
          throw new Error(
            "Consumption setup failed"
          );
        }

        const result =
          evaluatePackageThresholdConsumptionImpact(
            rule,
            [
              consumption,
            ]
          );

        expect(
          result.status
        ).toBe("unknown");

        expect(
          result.drinksAboveThresholdPerDay
        ).toBeNull();

        expect(
          result.additionalCostPerDay
        ).toBeNull();
      }
    );

    it(
      "no inventa coste aunque conozca varias bebidas afectadas",
      () => {
        const result =
          evaluatePackageThresholdConsumptionImpact(
            getPremiumExtraEurRule(),
            [
              createConsumption(
                "cocktail",
                15,
                2
              ),

              createConsumption(
                "wine",
                16,
                1
              ),
            ]
          );

        expect(
          result.drinksAboveThresholdPerDay
        ).toBe(3);

        expect(
          result.status
        ).toBe(
          "known-unquantified"
        );

        expect(
          result.additionalCostPerDay
        ).toBeNull();
      }
    );

    it(
      "maneja una lista vacía sin fabricar impacto",
      () => {
        const result =
          evaluatePackageThresholdConsumptionImpact(
            getPremiumExtraEurRule(),
            []
          );

        expect(
          result.status
        ).toBe("none");

        expect(
          result.totalDrinksPerDay
        ).toBe(0);

        expect(
          result.drinksAboveThresholdPerDay
        ).toBe(0);

        expect(
          result.additionalCostPerDay
        ).toBe(0);
      }
    );
  }
);
