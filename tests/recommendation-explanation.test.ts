import {
  describe,
  expect,
  it,
} from "vitest";

import { compareDrinkPackages } from "@/lib/comparison";
import { buildRecommendationExplanation } from "@/lib/recommendationExplanation";

describe("DrinkPilot recommendation explanations", () => {
  it("explica correctamente una recomendación rentable de My Drinks", () => {
    const comparison = compareDrinkPackages({
      days: 7,
      people: 2,

      coffee: 2,
      water: 2,
      soda: 2,
      beer: 1,
      wine: 1,
      cocktail: 1,
    });

    const explanation =
      buildRecommendationExplanation(
        comparison
      );

    expect(
      comparison.bestPackage?.packageKey
    ).toBe("myDrinks");

    expect(explanation.tone).toBe(
      "positive"
    );

    expect(explanation.title).toContain(
      "My Drinks"
    );

    expect(explanation.summary).toContain(
      "126.00 €"
    );
  });

  it("explica por qué My Drinks Plus gana cuando existen preferencias premium", () => {
    const comparison = compareDrinkPackages({
      days: 7,
      people: 1,

      coffee: 2,
      water: 2,
      soda: 2,
      beer: 2,
      wine: 2,
      cocktail: 2,

      premiumCocktails: true,
      premiumSpirits: true,
    });

    const explanation =
      buildRecommendationExplanation(
        comparison
      );

    expect(
      comparison.bestPackage?.packageKey
    ).toBe("myDrinksPlus");

    expect(explanation.tone).toBe(
      "positive"
    );

    expect(explanation.title).toContain(
      "My Drinks Plus"
    );

    expect(
      explanation.secondaryReason
    ).toContain("cócteles premium");

    expect(
      explanation.secondaryReason
    ).toContain("destilados premium");
  });

  it("avisa correctamente cuando un paquete cubre todo pero cuesta más", () => {
    const comparison = compareDrinkPackages({
      days: 7,
      people: 1,

      coffee: 1,
      water: 1,
      soda: 1,
      beer: 0,
      wine: 0,
      cocktail: 0,
    });

    const explanation =
      buildRecommendationExplanation(
        comparison
      );

    expect(
      comparison.bestPackage
    ).toBeNull();

    expect(explanation.tone).toBe(
      "warning"
    );

    expect(explanation.summary).toContain(
      "más económico"
    );

    expect(explanation.reason).toContain(
      "más que comprar las bebidas por separado"
    );
  });

  it("no debería describir un empate exacto como si las bebidas por separado fueran más económicas", () => {
    /*
     * Consumo diario:
     *
     * café     3.50 €
     * agua     2.50 €
     * refresco 3.50 €
     *
     * total = 9.50 € / día
     *
     * Forzamos My Drinks a 9.50 € / día.
     *
     * Resultado:
     * coste paquete = coste bebidas
     * ahorro = 0
     */
    const comparison = compareDrinkPackages({
      days: 7,
      people: 1,

      coffee: 1,
      water: 1,
      soda: 1,
      beer: 0,
      wine: 0,
      cocktail: 0,

      customPackagePrices: {
        myDrinks: 9.5,
      },
    });

    const myDrinks =
      comparison.packages.find(
        (pkg) =>
          pkg.packageKey === "myDrinks"
      );

    expect(myDrinks?.savings).toBe(0);

    expect(
      comparison.bestPackage
    ).toBeNull();

    const explanation =
      buildRecommendationExplanation(
        comparison
      );

    /*
     * Este es el comportamiento que queremos.
     *
     * Con ahorro exactamente 0 no existe
     * una opción más económica.
     */
    expect(explanation.summary).toContain(
      "cuestan aproximadamente lo mismo"
    );

    expect(explanation.reason).not.toContain(
      "0.00 € más"
    );
  });

  it("utiliza el ahorro calculado cuando el usuario introduce un precio real", () => {
    const comparison = compareDrinkPackages({
      days: 7,
      people: 1,

      coffee: 1,
      water: 1,
      soda: 1,
      beer: 0,
      wine: 0,
      cocktail: 0,

      customPackagePrices: {
        myDrinks: 8,
      },
    });

    const explanation =
      buildRecommendationExplanation(
        comparison
      );

    expect(
      comparison.bestPackage?.packageKey
    ).toBe("myDrinks");

    expect(
      comparison.bestPackage?.priceSource
    ).toBe("user");

    expect(explanation.tone).toBe(
      "positive"
    );

    expect(explanation.title).toContain(
      "My Drinks"
    );
  });
});
describe("threshold uncertainty in recommendation explanation", () => {
  it("keeps a positive recommendation when the best package has no unquantified threshold impact", () => {
    const comparison = {
      packages: [
        {
          packageKey: "test-package",
          packageName: "Test Package",
          packagePricePerDay: 40,
          packageCost: 280,
          drinksCost: 350,
          savings: 70,
          savingsPercentage: 20,
          dailyMargin: 10,
          breakEvenDrinksPerDay: 5,
          coverageScore: 100,
          fullyCovered: true,
          coveredCategories: [],
          uncoveredCategories: [],
          priceSource: "reference",
          referencePricePerDay: 40,
          economicComparisonStatus: "complete",
        },
      ],

      bestPackage: {
        packageKey: "test-package",
        packageName: "Test Package",
        packagePricePerDay: 40,
        packageCost: 280,
        drinksCost: 350,
        savings: 70,
        savingsPercentage: 20,
        dailyMargin: 10,
        breakEvenDrinksPerDay: 5,
        coverageScore: 100,
        fullyCovered: true,
        coveredCategories: [],
        uncoveredCategories: [],
        priceSource: "reference",
        referencePricePerDay: 40,
        economicComparisonStatus: "complete",
      },

      thresholdCruiseImpacts: [],
    } as any;

    const explanation =
      buildRecommendationExplanation(
        comparison
      );

    expect(explanation.tone).toBe(
      "positive"
    );

    expect(explanation.title).toContain(
      "mejor opción"
    );
  });

  it("marks the recommendation as provisional when the best package has an unquantified threshold impact", () => {
    const bestPackage = {
      packageKey: "test-package",
      packageName: "Test Package",
      packagePricePerDay: 40,
      packageCost: 280,
      drinksCost: 350,
      savings: 70,
      savingsPercentage: 20,
      dailyMargin: 10,
      breakEvenDrinksPerDay: 5,
      coverageScore: 100,
      fullyCovered: true,
      coveredCategories: [],
      uncoveredCategories: [],
      priceSource: "reference",
      referencePricePerDay: 40,
      economicComparisonStatus: "complete",
    };

    const comparison = {
      packages: [bestPackage],

      bestPackage,

      thresholdCruiseImpacts: [
        {
          packageKey:
            "test-package",

          packageName:
            "Test Package",

          cruiseImpact: {
            status:
              "known-unquantified",

            drinksAboveThreshold: 8,
          },
        },
      ],
    } as any;

    const explanation =
      buildRecommendationExplanation(
        comparison
      );

    expect(explanation.tone).toBe(
      "warning"
    );

    expect(explanation.title).toContain(
      "provisional"
    );

    expect(explanation.reason).toContain(
      "8 consumiciones"
    );

    expect(
      explanation.secondaryReason
    ).toContain(
      "no debe interpretarse como definitivo"
    );
  });
});
