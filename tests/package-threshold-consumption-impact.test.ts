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
          "quantified"
        );

        expect(
          result.additionalCostPerDay
        ).toBe(2);
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
      "suma el copago de varias bebidas afectadas",
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
          "quantified"
        );

        expect(
          result.additionalCostPerDay
        ).toBe(4);
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

describe(
  "quantified package threshold consumption impact",
  () => {
    it(
      "suma el coste adicional diario cuando la política es difference",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine: "msc",
              market: "ES",
              sailingRegion: null,
              onboardCurrency: "EUR",
              sailingDate: "2026-08-15",
            },
            "mscPremiumExtra",
            {
              contextualRules: [
                {
                  id:
                    "test-difference-policy",

                  cruiseLine:
                    "msc",

                  packageKey:
                    "mscPremiumExtra",

                  onboardCurrencies: [
                    "EUR",
                  ],

                  rules: {
                    drinkPriceThreshold:
                      14,

                    drinkPriceThresholdCurrency:
                      "EUR",

                    drinkPriceThresholdChargePolicy:
                      "difference",
                  },
                },
              ],
            }
          );

        if (!rule) {
          throw new Error(
            "MSC Premium Extra rule missing"
          );
        }

        const result =
          evaluatePackageThresholdConsumptionImpact(
            rule,
            [
              createConsumption(
                "cocktail",
                18,
                2
              ),

              createConsumption(
                "wine",
                16,
                1
              ),

              createConsumption(
                "beer",
                8,
                3
              ),
            ]
          );

        /*
         * Cocktail:
         * (18 - 14) * 2 = 8
         *
         * Wine:
         * (16 - 14) * 1 = 2
         *
         * Beer:
         * debajo del threshold = 0
         *
         * Total diario = 10
         */
        expect(
          result.status
        ).toBe("quantified");

        expect(
          result.totalDrinksPerDay
        ).toBe(6);

        expect(
          result.drinksAboveThresholdPerDay
        ).toBe(3);

        expect(
          result.additionalCostPerDay
        ).toBe(10);
      }
    );

    it(
      "cuantifica todas las bebidas afectadas cuando sus precios son conocidos",
      () => {
        const rule =
          getPackageOperationalRule(
            {
              cruiseLine: "msc",
              market: "ES",
              sailingRegion: null,
              onboardCurrency: "EUR",
              sailingDate: "2026-08-15",
            },
            "mscPremiumExtra"
          );

        if (!rule) {
          throw new Error(
            "MSC Premium Extra rule missing"
          );
        }

        const result =
          evaluatePackageThresholdConsumptionImpact(
            rule,
            [
              createConsumption(
                "cocktail",
                18,
                2
              ),
            ]
          );

        expect(
          result.status
        ).toBe(
          "quantified"
        );

        expect(
          result.drinksAboveThresholdPerDay
        ).toBe(2);

        expect(
          result.additionalCostPerDay
        ).toBe(8);
      }
    );
  }
);

describe(
  "package threshold consumption coverage",
  () => {
    it(
      "cuenta por separado las bebidas excluidas de cobertura",
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
                18,
                1
              ),
            ]
          );

        expect(
          result.drinksAboveThresholdPerDay
        ).toBe(3);

        expect(
          result.drinksExcludedFromCoveragePerDay
        ).toBe(3);

        expect(
          result.additionalCostPerDay
        ).toBe(6);
      }
    );

    it(
      "devuelve cero exclusiones cuando todas las bebidas están cubiertas",
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
          result.drinksExcludedFromCoveragePerDay
        ).toBe(0);
      }
    );

    it(
      "mantiene exclusiones desconocidas cuando no puede evaluar el threshold",
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
          result.drinksExcludedFromCoveragePerDay
        ).toBeNull();
      }
    );
  }
);
