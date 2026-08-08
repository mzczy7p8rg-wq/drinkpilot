import {
  describe,
  expect,
  it,
} from "vitest";

import { calculateRecommendation } from "@/lib/calculator";
import { compareDrinkPackages } from "@/lib/comparison";
import { calculatePackageCoverage } from "@/lib/coverage";

describe("DrinkPilot recommendation engine", () => {
  describe("calculator", () => {
    it("calcula correctamente el coste diario y total", () => {
      const result = calculateRecommendation({
        days: 7,
        people: 2,

        packagePricePerDay: 34,

        coffee: 2,
        water: 2,
        soda: 2,
        beer: 1,
        wine: 1,
        cocktail: 1,

        coffeePrice: 3.5,
        waterPrice: 2.5,
        sodaPrice: 3.5,
        beerPrice: 7,
        winePrice: 8,
        cocktailPrice: 9,
      });

      expect(result.dailyDrinkCost).toBe(43);

      expect(result.drinksCost).toBe(
        43 * 7 * 2
      );

      expect(result.packageCost).toBe(
        34 * 7 * 2
      );

      expect(result.savings).toBe(126);

      expect(result.dailyMargin).toBe(9);

      expect(result.recommended).toBe(true);
    });

    it("no recomienda cuando el paquete cuesta exactamente lo mismo", () => {
      const result = calculateRecommendation({
        days: 7,
        people: 1,

        packagePricePerDay: 34,

        coffee: 0,
        water: 0,
        soda: 0,
        beer: 0,
        wine: 2,
        cocktail: 2,

        coffeePrice: 3.5,
        waterPrice: 2.5,
        sodaPrice: 3.5,
        beerPrice: 7,
        winePrice: 8,
        cocktailPrice: 9,
      });

      expect(result.dailyDrinkCost).toBe(34);
      expect(result.dailyMargin).toBe(0);
      expect(result.savings).toBe(0);
      expect(result.recommended).toBe(false);

      expect(result.recommendationLevel).toBe(
        "not-worth-it"
      );
    });
  });

  describe("package comparison", () => {
    it("utiliza los precios seleccionados en toda la comparación económica", () => {
      const result = compareDrinkPackages({
        days: 7,
        people: 1,

        coffee: 1,
        water: 0,
        soda: 0,
        beer: 0,
        wine: 0,
        cocktail: 0,

        selectedDrinkPrices: {
          coffee: {
            category: "coffee",
            price: 10,
            currency: "EUR",
            source: "user",
          },
        },
      });

      expect(
        result.economicDrinkPrices
          .coffee
      ).toBe(10);

      expect(
        result.packages.every(
          (pkg) =>
            pkg.dailyDrinkCost ===
              10 &&
            pkg.drinksCost === 70
        )
      ).toBe(true);
    });

    it("no recomienda ningún paquete con consumo bajo", () => {
      const result = compareDrinkPackages({
        days: 7,
        people: 1,

        coffee: 1,
        water: 1,
        soda: 1,
        beer: 0,
        wine: 0,
        cocktail: 0,
      });

      expect(result.bestPackage).toBeNull();

      expect(
        result.anyPackageWorthIt
      ).toBe(false);

      expect(
        result.packages.every(
          (pkg) => pkg.savings < 0
        )
      ).toBe(true);
    });

    it("recomienda My Drinks para consumo básico rentable", () => {
      const result = compareDrinkPackages({
        days: 7,
        people: 2,

        coffee: 2,
        water: 2,
        soda: 2,
        beer: 1,
        wine: 1,
        cocktail: 1,
      });

      expect(
        result.bestPackage?.packageKey
      ).toBe("myDrinks");

      expect(
        result.bestPackage?.fullyCovered
      ).toBe(true);

      expect(
        result.bestPackage?.savings
      ).toBe(126);
    });

    it("recomienda My Drinks Plus cuando las preferencias premium requieren cobertura adicional", () => {
      const result = compareDrinkPackages({
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

      expect(
        result.bestPackage?.packageKey
      ).toBe("myDrinksPlus");

      const myDrinks =
        result.packages.find(
          (pkg) =>
            pkg.packageKey === "myDrinks"
        );

      const myDrinksPlus =
        result.packages.find(
          (pkg) =>
            pkg.packageKey === "myDrinksPlus"
        );

      expect(
        myDrinks?.fullyCovered
      ).toBe(false);

      expect(
        myDrinksPlus?.fullyCovered
      ).toBe(true);

      expect(
        myDrinksPlus?.coverageScore
      ).toBe(100);
    });

    it("utiliza el precio real de la reserva cuando está disponible", () => {
      const result = compareDrinkPackages({
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

      const myDrinks =
        result.packages.find(
          (pkg) =>
            pkg.packageKey === "myDrinks"
        );

      expect(
        myDrinks?.packagePricePerDay
      ).toBe(8);

      expect(
        myDrinks?.referencePricePerDay
      ).toBe(34);

      expect(
        myDrinks?.priceSource
      ).toBe("user");

      expect(
        result.bestPackage?.packageKey
      ).toBe("myDrinks");
    });

    it("días y personas escalan el ahorro pero no cambian el mejor paquete", () => {
      const shortCruise =
        compareDrinkPackages({
          days: 7,
          people: 1,

          coffee: 2,
          water: 2,
          soda: 2,
          beer: 1,
          wine: 1,
          cocktail: 1,
        });

      const largeCruise =
        compareDrinkPackages({
          days: 14,
          people: 4,

          coffee: 2,
          water: 2,
          soda: 2,
          beer: 1,
          wine: 1,
          cocktail: 1,
        });

      expect(
        shortCruise.bestPackage?.packageKey
      ).toBe("myDrinks");

      expect(
        largeCruise.bestPackage?.packageKey
      ).toBe("myDrinks");

      expect(
        largeCruise.bestPackage?.dailyMargin
      ).toBe(
        shortCruise.bestPackage?.dailyMargin
      );

      expect(
        largeCruise.bestPackage?.savings
      ).toBe(
        (shortCruise.bestPackage?.savings ?? 0) *
          8
      );
    });
  });

  describe("coverage", () => {
    it("distingue correctamente cobertura estándar y premium", () => {
      const result =
        calculatePackageCoverage({
          coffee: 1,
          water: 1,
          soda: 1,
          beer: 1,
          wine: 1,
          cocktail: 1,

          premiumCocktails: true,
          bottledBeer: false,
          premiumSpirits: true,
          bottledWaterUnlimited: false,
        });

      const myDrinks =
        result.find(
          (pkg) =>
            pkg.packageKey === "myDrinks"
        );

      const myDrinksPlus =
        result.find(
          (pkg) =>
            pkg.packageKey === "myDrinksPlus"
        );

      expect(
        myDrinks?.fullyCovered
      ).toBe(false);

      expect(
        myDrinks?.uncoveredCategories
      ).toContain("premiumCocktails");

      expect(
        myDrinks?.uncoveredCategories
      ).toContain("premiumSpirits");

      expect(
        myDrinksPlus?.fullyCovered
      ).toBe(true);

      expect(
        myDrinksPlus?.coverageScore
      ).toBe(100);
    });
  });
});describe("edge cases", () => {
  it("mantiene coherencia entre savings, dailyMargin y recommended", () => {
    const result = compareDrinkPackages({
      days: 1,
      people: 1,

      coffee: 2,
      water: 2,
      soda: 2,
      beer: 1,
      wine: 1,
      cocktail: 1,
    });

    for (const pkg of result.packages) {
      expect(
        Math.sign(pkg.savings)
      ).toBe(
        Math.sign(pkg.dailyMargin)
      );

      expect(pkg.recommended).toBe(
        pkg.savings > 0
      );
    }
  });

  it("un céntimo por debajo del coste diario produce ahorro positivo", () => {
    const result = compareDrinkPackages({
      days: 1,
      people: 1,

      coffee: 1,
      water: 1,
      soda: 1,
      beer: 0,
      wine: 0,
      cocktail: 0,

      customPackagePrices: {
        myDrinks: 9.49,
      },
    });

    const myDrinks =
      result.packages.find(
        (pkg) =>
          pkg.packageKey === "myDrinks"
      );

    expect(myDrinks?.dailyDrinkCost).toBe(9.5);
    expect(myDrinks?.dailyMargin).toBeCloseTo(0.01);
    expect(myDrinks?.savings).toBeCloseTo(0.01);
    expect(myDrinks?.recommended).toBe(true);
  });

  it("un céntimo por encima del coste diario no recomienda el paquete", () => {
    const result = compareDrinkPackages({
      days: 1,
      people: 1,

      coffee: 1,
      water: 1,
      soda: 1,
      beer: 0,
      wine: 0,
      cocktail: 0,

      customPackagePrices: {
        myDrinks: 9.51,
      },
    });

    const myDrinks =
      result.packages.find(
        (pkg) =>
          pkg.packageKey === "myDrinks"
      );

    expect(myDrinks?.dailyDrinkCost).toBe(9.5);
    expect(myDrinks?.dailyMargin).toBeCloseTo(-0.01);
    expect(myDrinks?.savings).toBeCloseTo(-0.01);
    expect(myDrinks?.recommended).toBe(false);
  });

  it("todas las preferencias premium fuerzan cobertura completa solo en My Drinks Plus", () => {
    const result = compareDrinkPackages({
      days: 7,
      people: 1,

      coffee: 1,
      water: 1,
      soda: 1,
      beer: 1,
      wine: 1,
      cocktail: 1,

      premiumCocktails: true,
      bottledBeer: true,
      premiumSpirits: true,
      bottledWaterUnlimited: true,
    });

    const myDrinks =
      result.packages.find(
        (pkg) =>
          pkg.packageKey === "myDrinks"
      );

    const myDrinksPlus =
      result.packages.find(
        (pkg) =>
          pkg.packageKey === "myDrinksPlus"
      );

    expect(myDrinks?.fullyCovered).toBe(false);

    expect(
      myDrinks?.coverageScore
    ).toBeLessThan(100);

    expect(
      myDrinksPlus?.fullyCovered
    ).toBe(true);

    expect(
      myDrinksPlus?.coverageScore
    ).toBe(100);
  });

  it("muchos viajeros no alteran el margen diario ni el punto de equilibrio", () => {
    const onePerson = compareDrinkPackages({
      days: 7,
      people: 1,

      coffee: 2,
      water: 2,
      soda: 2,
      beer: 1,
      wine: 1,
      cocktail: 1,
    });

    const manyPeople = compareDrinkPackages({
      days: 7,
      people: 100,

      coffee: 2,
      water: 2,
      soda: 2,
      beer: 1,
      wine: 1,
      cocktail: 1,
    });

    const onePersonBest =
      onePerson.bestPackage;

    const manyPeopleBest =
      manyPeople.bestPackage;

    expect(
      manyPeopleBest?.packageKey
    ).toBe(
      onePersonBest?.packageKey
    );

    expect(
      manyPeopleBest?.dailyMargin
    ).toBe(
      onePersonBest?.dailyMargin
    );

    expect(
      manyPeopleBest?.breakEvenDrinksPerDay
    ).toBe(
      onePersonBest?.breakEvenDrinksPerDay
    );

    expect(
      manyPeopleBest?.savings
    ).toBe(
      (onePersonBest?.savings ?? 0) *
        100
    );
  });

  it("ignora precios personalizados inválidos y usa la referencia", () => {
    const result = compareDrinkPackages({
      days: 7,
      people: 1,

      coffee: 2,
      water: 2,
      soda: 2,
      beer: 1,
      wine: 1,
      cocktail: 1,

      customPackagePrices: {
        myDrinks: -10,
        myDrinksPlus: 0,
      },
    });

    const myDrinks =
      result.packages.find(
        (pkg) =>
          pkg.packageKey === "myDrinks"
      );

    const myDrinksPlus =
      result.packages.find(
        (pkg) =>
          pkg.packageKey === "myDrinksPlus"
      );

    expect(
      myDrinks?.packagePricePerDay
    ).toBe(34);

    expect(
      myDrinks?.priceSource
    ).toBe("reference");

    expect(
      myDrinksPlus?.packagePricePerDay
    ).toBe(46);

    expect(
      myDrinksPlus?.priceSource
    ).toBe("reference");
  });
});describe("effective economic comparison", () => {
  it("marca como comparación completa un paquete con cobertura total", () => {
    const result = compareDrinkPackages({
      days: 7,
      people: 1,

      coffee: 2,
      water: 2,
      soda: 2,
      beer: 1,
      wine: 1,
      cocktail: 1,
    });

    const myDrinks =
      result.packages.find(
        (pkg) =>
          pkg.packageKey === "myDrinks"
      );

    expect(
      myDrinks?.fullyCovered
    ).toBe(true);

    expect(
      myDrinks?.economicComparisonStatus
    ).toBe("complete");

    expect(
      myDrinks?.effectiveSavings
    ).toBe(
      myDrinks?.savings
    );
  });

  it("marca como incompleta la comparación económica cuando faltan preferencias premium no cuantificadas", () => {
    const result = compareDrinkPackages({
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

    const myDrinks =
      result.packages.find(
        (pkg) =>
          pkg.packageKey === "myDrinks"
      );

    expect(
      myDrinks?.fullyCovered
    ).toBe(false);

    expect(
      myDrinks?.economicComparisonStatus
    ).toBe("partial-unknown");

    expect(
      myDrinks?.effectiveSavings
    ).toBeNull();
  });

  it("mantiene ahorro efectivo para My Drinks Plus cuando cubre todo el perfil premium", () => {
    const result = compareDrinkPackages({
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

    const myDrinksPlus =
      result.packages.find(
        (pkg) =>
          pkg.packageKey === "myDrinksPlus"
      );

    expect(
      myDrinksPlus?.fullyCovered
    ).toBe(true);

    expect(
      myDrinksPlus?.economicComparisonStatus
    ).toBe("complete");

    expect(
      myDrinksPlus?.effectiveSavings
    ).toBe(
      myDrinksPlus?.savings
    );
  });
});describe("My Drinks Soft safety", () => {
  it("existe en la capa de datos", async () => {
    const { costaPackages } =
      await import("@/data/packages");

    expect(
      costaPackages.myDrinksSoft.existenceStatus
    ).toBe("verified");

    expect(
      costaPackages.myDrinksSoft.inclusionsStatus
    ).toBe("partial-verified");

    expect(
      costaPackages.myDrinksSoft.status
    ).toBe("pending");
  });

  it("mantiene el precio pendiente", async () => {
    const { costaPackages } =
      await import("@/data/packages");

    expect(
      costaPackages.myDrinksSoft.priceStatus
    ).toBe("pending");

    expect(
      costaPackages.myDrinksSoft.pricePerDay
    ).toBeNull();

    expect(
      costaPackages.myDrinksSoft
        .economicEligibility
    ).toBe("blocked");

    expect(
      costaPackages.myDrinks
        .economicEligibility
    ).toBe("eligible");

    expect(
      costaPackages.myDrinksPlus
        .economicEligibility
    ).toBe("eligible");
  });

  it("no entra todavía en la comparación económica", () => {
    const result = compareDrinkPackages({
      days: 7,
      people: 1,

      coffee: 2,
      water: 2,
      soda: 2,
      beer: 0,
      wine: 0,
      cocktail: 0,
    });

    expect(
      result.packages.some(
        (pkg) =>
          pkg.packageKey === "myDrinksSoft"
      )
    ).toBe(false);
  });

  it("nunca puede convertirse en mejor opción con precio 0 mientras siga pendiente", () => {
    const result = compareDrinkPackages({
      days: 7,
      people: 1,

      coffee: 4,
      water: 4,
      soda: 4,
      beer: 0,
      wine: 0,
      cocktail: 0,
    });

    expect(
      result.bestPackage?.packageKey
    ).not.toBe("myDrinksSoft");
  });
});describe("Coverage v2 cocktail categories", () => {
  it("My Drinks cubre cócteles con y sin alcohol", () => {
    const result =
      calculatePackageCoverage({
        coffee: 0,
        water: 0,
        soda: 0,
        beer: 0,
        wine: 0,
        cocktail: 0,

        alcoholicCocktails: true,
        nonAlcoholicCocktails: true,

        premiumCocktails: false,
        bottledBeer: false,
        premiumSpirits: false,
        bottledWaterUnlimited: false,
      });

    const myDrinks =
      result.find(
        (pkg) =>
          pkg.packageKey === "myDrinks"
      );

    expect(
      myDrinks?.coveredCategories
    ).toContain("alcoholicCocktails");

    expect(
      myDrinks?.coveredCategories
    ).toContain("nonAlcoholicCocktails");

    expect(
      myDrinks?.fullyCovered
    ).toBe(true);
  });

  it("My Drinks Plus cubre cócteles con alcohol, sin alcohol y premium", () => {
    const result =
      calculatePackageCoverage({
        coffee: 0,
        water: 0,
        soda: 0,
        beer: 0,
        wine: 0,
        cocktail: 0,

        alcoholicCocktails: true,
        nonAlcoholicCocktails: true,

        premiumCocktails: true,
        bottledBeer: false,
        premiumSpirits: false,
        bottledWaterUnlimited: false,
      });

    const myDrinksPlus =
      result.find(
        (pkg) =>
          pkg.packageKey === "myDrinksPlus"
      );

    expect(
      myDrinksPlus?.fullyCovered
    ).toBe(true);

    expect(
      myDrinksPlus?.coveredCategories
    ).toContain("premiumCocktails");
  });

  it("My Drinks no cubre cócteles premium", () => {
    const result =
      calculatePackageCoverage({
        coffee: 0,
        water: 0,
        soda: 0,
        beer: 0,
        wine: 0,
        cocktail: 0,

        alcoholicCocktails: true,
        nonAlcoholicCocktails: true,

        premiumCocktails: true,
        bottledBeer: false,
        premiumSpirits: false,
        bottledWaterUnlimited: false,
      });

    const myDrinks =
      result.find(
        (pkg) =>
          pkg.packageKey === "myDrinks"
      );

    expect(
      myDrinks?.uncoveredCategories
    ).toContain("premiumCocktails");

    expect(
      myDrinks?.fullyCovered
    ).toBe(false);
  });
});describe("My Drinks Soft coverage preview", () => {
  it("puede analizar My Drinks Soft sin activarlo económicamente", () => {
    const result =
      calculatePackageCoverage(
        {
          coffee: 1,
          water: 1,
          soda: 1,
          beer: 0,
          wine: 0,
          cocktail: 0,

          alcoholicCocktails: false,
          nonAlcoholicCocktails: true,

          premiumCocktails: false,
          bottledBeer: false,
          premiumSpirits: false,
          bottledWaterUnlimited: false,
        },
        {
          includePendingPackages: true,
        }
      );

    const soft =
      result.find(
        (pkg) =>
          pkg.packageKey ===
          "myDrinksSoft"
      );

    expect(soft).toBeDefined();

    expect(
      soft?.coveredCategories
    ).toContain(
      "nonAlcoholicCocktails"
    );

    expect(
      soft?.fullyCovered
    ).toBe(true);
  });

  it("My Drinks Soft no cubre cócteles alcohólicos", () => {
    const result =
      calculatePackageCoverage(
        {
          coffee: 0,
          water: 0,
          soda: 0,
          beer: 0,
          wine: 0,
          cocktail: 0,

          alcoholicCocktails: true,
          nonAlcoholicCocktails: false,

          premiumCocktails: false,
          bottledBeer: false,
          premiumSpirits: false,
          bottledWaterUnlimited: false,
        },
        {
          includePendingPackages: true,
        }
      );

    const soft =
      result.find(
        (pkg) =>
          pkg.packageKey ===
          "myDrinksSoft"
      );

    expect(
      soft?.uncoveredCategories
    ).toContain(
      "alcoholicCocktails"
    );

    expect(
      soft?.fullyCovered
    ).toBe(false);
  });

  it("el modo normal continúa excluyendo My Drinks Soft", () => {
    const result =
      calculatePackageCoverage({
        coffee: 1,
        water: 1,
        soda: 1,
        beer: 0,
        wine: 0,
        cocktail: 0,

        alcoholicCocktails: false,
        nonAlcoholicCocktails: true,

        premiumCocktails: false,
        bottledBeer: false,
        premiumSpirits: false,
        bottledWaterUnlimited: false,
      });

    expect(
      result.some(
        (pkg) =>
          pkg.packageKey ===
          "myDrinksSoft"
      )
    ).toBe(false);
  });
});describe("Bottled water coverage v2", () => {
  it("My Drinks cubre una botella de agua diaria", () => {
    const result =
      calculatePackageCoverage({
        coffee: 0,
        water: 0,
        soda: 0,
        beer: 0,
        wine: 0,
        cocktail: 0,

        alcoholicCocktails: false,
        nonAlcoholicCocktails: false,

        premiumCocktails: false,
        bottledBeer: false,
        premiumSpirits: false,

        bottledWaterDailyAllowance: true,
        bottledWaterUnlimited: false,
      });

    const myDrinks =
      result.find(
        (pkg) =>
          pkg.packageKey === "myDrinks"
      );

    expect(
      myDrinks?.coveredCategories
    ).toContain(
      "bottledWaterDailyAllowance"
    );

    expect(
      myDrinks?.fullyCovered
    ).toBe(true);
  });

  it("My Drinks no cubre agua embotellada ilimitada", () => {
    const result =
      calculatePackageCoverage({
        coffee: 0,
        water: 0,
        soda: 0,
        beer: 0,
        wine: 0,
        cocktail: 0,

        alcoholicCocktails: false,
        nonAlcoholicCocktails: false,

        premiumCocktails: false,
        bottledBeer: false,
        premiumSpirits: false,

        bottledWaterDailyAllowance: false,
        bottledWaterUnlimited: true,
      });

    const myDrinks =
      result.find(
        (pkg) =>
          pkg.packageKey === "myDrinks"
      );

    expect(
      myDrinks?.uncoveredCategories
    ).toContain(
      "bottledWaterUnlimited"
    );

    expect(
      myDrinks?.fullyCovered
    ).toBe(false);
  });

  it("My Drinks Plus cubre tanto una botella diaria como agua ilimitada", () => {
    const result =
      calculatePackageCoverage({
        coffee: 0,
        water: 0,
        soda: 0,
        beer: 0,
        wine: 0,
        cocktail: 0,

        alcoholicCocktails: false,
        nonAlcoholicCocktails: false,

        premiumCocktails: false,
        bottledBeer: false,
        premiumSpirits: false,

        bottledWaterDailyAllowance: true,
        bottledWaterUnlimited: true,
      });

    const myDrinksPlus =
      result.find(
        (pkg) =>
          pkg.packageKey === "myDrinksPlus"
      );

    expect(
      myDrinksPlus?.coveredCategories
    ).toContain(
      "bottledWaterDailyAllowance"
    );

    expect(
      myDrinksPlus?.coveredCategories
    ).toContain(
      "bottledWaterUnlimited"
    );

    expect(
      myDrinksPlus?.fullyCovered
    ).toBe(true);
  });
});describe("Bottled water integration", () => {
  it("My Drinks cubre una botella diaria a través de compareDrinkPackages", () => {
    const result = compareDrinkPackages({
      days: 7,
      people: 1,

      coffee: 1,
      water: 1,
      soda: 1,
      beer: 0,
      wine: 0,
      cocktail: 0,

      bottledWaterDailyAllowance: true,
      bottledWaterUnlimited: false,
    });

    const myDrinks =
      result.packages.find(
        (pkg) =>
          pkg.packageKey === "myDrinks"
      );

    expect(
      myDrinks?.coveredCategories
    ).toContain(
      "bottledWaterDailyAllowance"
    );

    expect(
      myDrinks?.uncoveredCategories
    ).not.toContain(
      "bottledWaterDailyAllowance"
    );
  });

  it("My Drinks no cubre agua ilimitada a través de compareDrinkPackages", () => {
    const result = compareDrinkPackages({
      days: 7,
      people: 1,

      coffee: 1,
      water: 1,
      soda: 1,
      beer: 0,
      wine: 0,
      cocktail: 0,

      bottledWaterDailyAllowance: true,
      bottledWaterUnlimited: true,
    });

    const myDrinks =
      result.packages.find(
        (pkg) =>
          pkg.packageKey === "myDrinks"
      );

    expect(
      myDrinks?.coveredCategories
    ).toContain(
      "bottledWaterDailyAllowance"
    );

    expect(
      myDrinks?.uncoveredCategories
    ).toContain(
      "bottledWaterUnlimited"
    );

    expect(
      myDrinks?.fullyCovered
    ).toBe(false);

    expect(
      myDrinks?.economicComparisonStatus
    ).toBe("partial-unknown");
  });

  it("My Drinks Plus cubre agua diaria e ilimitada a través de compareDrinkPackages", () => {
    const result = compareDrinkPackages({
      days: 7,
      people: 1,

      coffee: 1,
      water: 1,
      soda: 1,
      beer: 0,
      wine: 0,
      cocktail: 0,

      bottledWaterDailyAllowance: true,
      bottledWaterUnlimited: true,
    });

    const myDrinksPlus =
      result.packages.find(
        (pkg) =>
          pkg.packageKey === "myDrinksPlus"
      );

    expect(
      myDrinksPlus?.coveredCategories
    ).toContain(
      "bottledWaterDailyAllowance"
    );

    expect(
      myDrinksPlus?.coveredCategories
    ).toContain(
      "bottledWaterUnlimited"
    );

    expect(
      myDrinksPlus?.fullyCovered
    ).toBe(true);

    expect(
      myDrinksPlus?.economicComparisonStatus
    ).toBe("complete");
  });
});describe("Non alcoholic cocktails integration", () => {
  it("My Drinks cubre cócteles sin alcohol a través de compareDrinkPackages", () => {
    const result = compareDrinkPackages({
      days: 7,
      people: 1,

      coffee: 1,
      water: 1,
      soda: 1,
      beer: 0,
      wine: 0,
      cocktail: 0,

      nonAlcoholicCocktails: true,
    });

    const myDrinks =
      result.packages.find(
        (pkg) =>
          pkg.packageKey === "myDrinks"
      );

    expect(
      myDrinks?.coveredCategories
    ).toContain(
      "nonAlcoholicCocktails"
    );

    expect(
      myDrinks?.uncoveredCategories
    ).not.toContain(
      "nonAlcoholicCocktails"
    );
  });

  it("My Drinks Plus cubre cócteles sin alcohol a través de compareDrinkPackages", () => {
    const result = compareDrinkPackages({
      days: 7,
      people: 1,

      coffee: 1,
      water: 1,
      soda: 1,
      beer: 0,
      wine: 0,
      cocktail: 0,

      nonAlcoholicCocktails: true,
    });

    const myDrinksPlus =
      result.packages.find(
        (pkg) =>
          pkg.packageKey === "myDrinksPlus"
      );

    expect(
      myDrinksPlus?.coveredCategories
    ).toContain(
      "nonAlcoholicCocktails"
    );

    expect(
      myDrinksPlus?.fullyCovered
    ).toBe(true);
  });

  it("My Drinks Soft cubre cócteles sin alcohol únicamente en modo preview", () => {
    const result =
      calculatePackageCoverage(
        {
          coffee: 0,
          water: 0,
          soda: 0,
          beer: 0,
          wine: 0,
          cocktail: 0,

          nonAlcoholicCocktails: true,

          premiumCocktails: false,
          bottledBeer: false,
          premiumSpirits: false,
          bottledWaterDailyAllowance: false,
          bottledWaterUnlimited: false,
        },
        {
          includePendingPackages: true,
        }
      );

    const soft =
      result.find(
        (pkg) =>
          pkg.packageKey ===
          "myDrinksSoft"
      );

    expect(soft).toBeDefined();

    expect(
      soft?.coveredCategories
    ).toContain(
      "nonAlcoholicCocktails"
    );

    expect(
      soft?.fullyCovered
    ).toBe(true);
  });

  it("My Drinks Soft sigue excluido de la comparación económica", () => {
    const result = compareDrinkPackages({
      days: 7,
      people: 1,

      coffee: 1,
      water: 1,
      soda: 1,
      beer: 0,
      wine: 0,
      cocktail: 0,

      nonAlcoholicCocktails: true,
    });

    expect(
      result.packages.some(
        (pkg) =>
          pkg.packageKey ===
          "myDrinksSoft"
      )
    ).toBe(false);

    expect(
      result.bestPackage?.packageKey
    ).not.toBe(
      "myDrinksSoft"
    );
  });
});describe("Package economic safety", () => {
  it("solo devuelve paquetes con precio económico válido", () => {
    const result =
      compareDrinkPackages({
        days: 7,
        people: 1,

        coffee: 2,
        water: 2,
        soda: 2,
        beer: 1,
        wine: 1,
        cocktail: 1,
      });

    for (
      const pkg of
      result.packages
    ) {
      expect(
        Number.isFinite(
          pkg.packagePricePerDay
        )
      ).toBe(true);

      expect(
        pkg.packagePricePerDay
      ).toBeGreaterThan(0);
    }
  });

  it("My Drinks Soft permanece fuera mientras su precio siga pendiente", () => {
    const result =
      compareDrinkPackages({
        days: 7,
        people: 1,

        coffee: 4,
        water: 4,
        soda: 4,
        beer: 0,
        wine: 0,
        cocktail: 0,

        nonAlcoholicCocktails:
          true,
      });

    const soft =
      result.packages.find(
        (pkg) =>
          pkg.packageKey ===
          "myDrinksSoft"
      );

    expect(
      soft
    ).toBeUndefined();

    expect(
      result.bestPackage
        ?.packageKey
    ).not.toBe(
      "myDrinksSoft"
    );
  });
});describe("My Drinks Soft manual price", () => {
  it("sigue fuera de la comparación cuando no existe precio del usuario", () => {
    const result =
      compareDrinkPackages({
        days: 7,
        people: 1,

        coffee: 2,
        water: 2,
        soda: 2,
        beer: 0,
        wine: 0,
        cocktail: 0,

        nonAlcoholicCocktails:
          true,

        customPackagePrices: {
          myDrinksSoft: null,
        },
      });

    expect(
      result.packages.some(
        (pkg) =>
          pkg.packageKey ===
          "myDrinksSoft"
      )
    ).toBe(false);
  });

  it("entra en la comparación cuando el usuario introduce un precio válido", () => {
    const result =
      compareDrinkPackages({
        days: 7,
        people: 1,

        coffee: 2,
        water: 2,
        soda: 2,
        beer: 0,
        wine: 0,
        cocktail: 0,

        nonAlcoholicCocktails:
          true,

        customPackagePrices: {
          myDrinksSoft: 20,
        },
      });

    const soft =
      result.packages.find(
        (pkg) =>
          pkg.packageKey ===
          "myDrinksSoft"
      );

    expect(
      soft
    ).toBeDefined();

    expect(
      soft?.packagePricePerDay
    ).toBe(20);

    expect(
      soft?.priceSource
    ).toBe("user");

    expect(
      soft?.referencePricePerDay
    ).toBeNull();
  });

  it("ignora precios inválidos de My Drinks Soft", () => {
    const invalidPrices = [
      0,
      -1,
      Number.NaN,
      Number.POSITIVE_INFINITY,
    ];

    for (
      const price of
      invalidPrices
    ) {
      const result =
        compareDrinkPackages({
          days: 7,
          people: 1,

          coffee: 2,
          water: 2,
          soda: 2,
          beer: 0,
          wine: 0,
          cocktail: 0,

          nonAlcoholicCocktails:
            true,

          customPackagePrices: {
            myDrinksSoft: price,
          },
        });

      expect(
        result.packages.some(
          (pkg) =>
            pkg.packageKey ===
            "myDrinksSoft"
        )
      ).toBe(false);
    }
  });

  it("puede recomendar My Drinks Soft cuando cubre el perfil y genera ahorro", () => {
    const result =
      compareDrinkPackages({
        days: 7,
        people: 1,

        coffee: 3,
        water: 3,
        soda: 3,
        beer: 0,
        wine: 0,
        cocktail: 0,

        nonAlcoholicCocktails:
          true,

        customPackagePrices: {
          myDrinksSoft: 15,
        },
      });

    const soft =
      result.packages.find(
        (pkg) =>
          pkg.packageKey ===
          "myDrinksSoft"
      );

    expect(
      soft?.fullyCovered
    ).toBe(true);

    expect(
      soft?.savings
    ).toBeGreaterThan(0);

    expect(
      soft?.economicComparisonStatus
    ).toBe("complete");

    expect(
      soft?.effectiveSavings
    ).toBe(
      soft?.savings
    );

    expect(
      result.bestPackage?.packageKey
    ).toBe(
      "myDrinksSoft"
    );
  });

  it("no recomienda My Drinks Soft cuando el perfil contiene alcohol", () => {
    const result =
      compareDrinkPackages({
        days: 7,
        people: 1,

        coffee: 2,
        water: 2,
        soda: 2,
        beer: 2,
        wine: 1,
        cocktail: 1,

        nonAlcoholicCocktails:
          true,

        customPackagePrices: {
          myDrinksSoft: 10,
        },
      });

    const soft =
      result.packages.find(
        (pkg) =>
          pkg.packageKey ===
          "myDrinksSoft"
      );

    expect(
      soft
    ).toBeDefined();

    expect(
      soft?.fullyCovered
    ).toBe(false);

    expect(
      result.bestPackage?.packageKey
    ).not.toBe(
      "myDrinksSoft"
    );
  });
});describe("Generic custom package prices", () => {
  it("utiliza customPackagePrices para My Drinks", () => {
    const result =
      compareDrinkPackages({
        days: 7,
        people: 1,

        coffee: 2,
        water: 2,
        soda: 2,
        beer: 1,
        wine: 1,
        cocktail: 1,

        customPackagePrices: {
          myDrinks: 20,
        },
      });

    const myDrinks =
      result.packages.find(
        (pkg) =>
          pkg.packageKey ===
          "myDrinks"
      );

    expect(
      myDrinks?.packagePricePerDay
    ).toBe(20);

    expect(
      myDrinks?.priceSource
    ).toBe("user");
  });

  it("utiliza exactamente el precio indicado en customPackagePrices", () => {
    const result =
      compareDrinkPackages({
        days: 7,
        people: 1,

        coffee: 2,
        water: 2,
        soda: 2,
        beer: 1,
        wine: 1,
        cocktail: 1,

        customPackagePrices: {
          myDrinks: 18,
        },
      });

    const myDrinks =
      result.packages.find(
        (pkg) =>
          pkg.packageKey ===
          "myDrinks"
      );

    expect(
      myDrinks?.packagePricePerDay
    ).toBe(18);

    expect(
      myDrinks?.priceSource
    ).toBe("user");
  });

  it("puede activar My Drinks Soft mediante customPackagePrices", () => {
    const result =
      compareDrinkPackages({
        days: 7,
        people: 1,

        coffee: 2,
        water: 2,
        soda: 2,
        beer: 0,
        wine: 0,
        cocktail: 0,

        nonAlcoholicCocktails:
          true,

        customPackagePrices: {
          myDrinksSoft: 15,
        },
      });

    const soft =
      result.packages.find(
        (pkg) =>
          pkg.packageKey ===
          "myDrinksSoft"
      );

    expect(soft).toBeDefined();

    expect(
      soft?.packagePricePerDay
    ).toBe(15);

    expect(
      soft?.priceSource
    ).toBe("user");

    expect(
      soft?.referencePricePerDay
    ).toBeNull();
  });
});
describe(
  "alcoholic cocktails integration",
  () => {
    it(
      "transporta alcoholicCocktails hasta Coverage v2",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine: "costa",

            days: 7,
            people: 1,

            coffee: 1,
            water: 1,
            soda: 1,
            beer: 0,
            wine: 0,
            cocktail: 0,

            alcoholicCocktails:
              true,

            nonAlcoholicCocktails:
              false,

            premiumCocktails:
              false,

            bottledBeer:
              false,

            premiumSpirits:
              false,

            bottledWaterUnlimited:
              false,
          });

        const myDrinks =
          result.coveragePackages.find(
            (pkg) =>
              pkg.packageKey ===
              "myDrinks"
          );

        expect(
          myDrinks
            ?.requestedCategories
        ).toContain(
          "alcoholicCocktails"
        );

        expect(
          myDrinks
            ?.coveredCategories
        ).toContain(
          "alcoholicCocktails"
        );
      }
    );

    it(
      "no cambia el cálculo económico por activar una preferencia de cobertura",
      () => {
        const baseInput = {
          cruiseLine:
            "costa" as const,

          days: 7,
          people: 1,

          coffee: 2,
          water: 2,
          soda: 1,
          beer: 1,
          wine: 1,
          cocktail: 1,

          nonAlcoholicCocktails:
            false,

          premiumCocktails:
            false,

          bottledBeer:
            false,

          premiumSpirits:
            false,

          bottledWaterUnlimited:
            false,
        };

        const withoutPreference =
          compareDrinkPackages({
            ...baseInput,

            alcoholicCocktails:
              false,
          });

        const withPreference =
          compareDrinkPackages({
            ...baseInput,

            alcoholicCocktails:
              true,
          });

        const withoutMyDrinks =
          withoutPreference
            .packages.find(
              (pkg) =>
                pkg.packageKey ===
                "myDrinks"
            );

        const withMyDrinks =
          withPreference
            .packages.find(
              (pkg) =>
                pkg.packageKey ===
                "myDrinks"
            );

        expect(
          withMyDrinks?.drinksCost
        ).toBe(
          withoutMyDrinks
            ?.drinksCost
        );

        expect(
          withMyDrinks?.packageCost
        ).toBe(
          withoutMyDrinks
            ?.packageCost
        );

        expect(
          withMyDrinks?.savings
        ).toBe(
          withoutMyDrinks?.savings
        );
      }
    );
  }
);

describe(
  "alcohol consumption integration",
  () => {
    it(
      "resuelve el consumo alcohólico cuando conoce toda la composición de cócteles",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine: "costa",

            days: 7,
            people: 1,

            coffee: 0,
            water: 0,
            soda: 0,

            beer: 2,
            wine: 1,
            cocktail: 4,

            alcoholicCocktail: 3,
            nonAlcoholicCocktail: 1,

            alcoholicCocktails: true,
            nonAlcoholicCocktails: true,

            premiumCocktails: false,
            bottledBeer: false,
            premiumSpirits: false,
            bottledWaterUnlimited: false,
          });

        expect(
          result
            .alcoholConsumption
            .cocktailCompositionKnown
        ).toBe(true);

        expect(
          result
            .alcoholConsumption
            .knownAlcoholicDrinksPerDay
        ).toBe(6);

        expect(
          result
            .alcoholConsumption
            .alcoholicDrinksPerDay
        ).toBe(6);
      }
    );

    it(
      "mantiene desconocido el total alcohólico con composición legacy incompleta",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine: "costa",

            days: 7,
            people: 1,

            coffee: 0,
            water: 0,
            soda: 0,

            beer: 2,
            wine: 1,
            cocktail: 4,

            alcoholicCocktails: true,
            nonAlcoholicCocktails: true,

            premiumCocktails: false,
            bottledBeer: false,
            premiumSpirits: false,
            bottledWaterUnlimited: false,
          });

        expect(
          result
            .alcoholConsumption
            .cocktailCompositionKnown
        ).toBe(false);

        expect(
          result
            .alcoholConsumption
            .knownAlcoholicDrinksPerDay
        ).toBe(3);

        expect(
          result
            .alcoholConsumption
            .alcoholicDrinksPerDay
        ).toBeNull();
      }
    );

    it(
      "no modifica el cálculo económico por conocer la composición alcohólica",
      () => {
        const baseInput = {
          cruiseLine:
            "costa" as const,

          days: 7,
          people: 1,

          coffee: 2,
          water: 2,
          soda: 1,
          beer: 2,
          wine: 1,
          cocktail: 4,

          alcoholicCocktails:
            true,

          nonAlcoholicCocktails:
            true,

          premiumCocktails:
            false,

          bottledBeer:
            false,

          premiumSpirits:
            false,

          bottledWaterUnlimited:
            false,
        };

        const legacy =
          compareDrinkPackages({
            ...baseInput,
          });

        const v2 =
          compareDrinkPackages({
            ...baseInput,

            alcoholicCocktail: 3,
            nonAlcoholicCocktail: 1,
          });

        const legacyPackage =
          legacy.packages.find(
            (pkg) =>
              pkg.packageKey ===
              "myDrinks"
          );

        const v2Package =
          v2.packages.find(
            (pkg) =>
              pkg.packageKey ===
              "myDrinks"
          );

        expect(
          v2Package?.drinksCost
        ).toBe(
          legacyPackage?.drinksCost
        );

        expect(
          v2Package?.packageCost
        ).toBe(
          legacyPackage?.packageCost
        );

        expect(
          v2Package?.savings
        ).toBe(
          legacyPackage?.savings
        );
      }
    );
  }
);

describe(
  "operational rule impacts integration",
  () => {
    const createMscInput = (
      alcoholicCocktail: number
    ) => ({
      cruiseLine:
        "msc" as const,

      days: 7,
      people: 1,

      coffee: 0,
      water: 0,
      soda: 0,

      beer: 5,
      wine: 5,
      cocktail: 10,

      alcoholicCocktail,
      nonAlcoholicCocktail:
        10 - alcoholicCocktail,

      alcoholicCocktails:
        true,

      nonAlcoholicCocktails:
        true,

      premiumCocktails:
        false,

      bottledBeer:
        false,

      premiumSpirits:
        false,

      bottledWaterUnlimited:
        false,
    });

    it(
      "expone impacto within-limit para MSC",
      () => {
        /*
         * 5 cerveza + 5 vino +
         * 4 cócteles alcohólicos = 14.
         */
        const result =
          compareDrinkPackages(
            createMscInput(4)
          );

        const easy =
          result
            .operationalRuleImpacts
            .find(
              (impact) =>
                impact.packageKey ===
                "mscEasy"
            );

        expect(
          easy?.alcoholDailyLimit
            .status
        ).toBe("within-limit");

        expect(
          easy?.alcoholDailyLimit
            .alcoholicDrinksPerDay
        ).toBe(14);

        expect(
          easy?.alcoholDailyLimit
            .alcoholicDrinksDailyLimit
        ).toBe(15);
      }
    );

    it(
      "expone impacto at-limit para MSC",
      () => {
        /*
         * 5 + 5 + 5 = 15.
         */
        const result =
          compareDrinkPackages(
            createMscInput(5)
          );

        const easy =
          result
            .operationalRuleImpacts
            .find(
              (impact) =>
                impact.packageKey ===
                "mscEasy"
            );

        expect(
          easy?.alcoholDailyLimit
            .status
        ).toBe("at-limit");

        expect(
          easy?.alcoholDailyLimit
            .excessDrinksPerDay
        ).toBe(0);
      }
    );

    it(
      "expone impacto over-limit para MSC",
      () => {
        /*
         * 5 + 5 + 8 = 18.
         */
        const result =
          compareDrinkPackages(
            createMscInput(8)
          );

        const easy =
          result
            .operationalRuleImpacts
            .find(
              (impact) =>
                impact.packageKey ===
                "mscEasy"
            );

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
      "mantiene unknown cuando Costa no tiene límite diario conocido",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine:
              "costa",

            days: 7,
            people: 1,

            coffee: 0,
            water: 0,
            soda: 0,

            beer: 5,
            wine: 5,
            cocktail: 10,

            alcoholicCocktail: 8,
            nonAlcoholicCocktail: 2,

            alcoholicCocktails:
              true,

            nonAlcoholicCocktails:
              true,

            premiumCocktails:
              false,

            bottledBeer:
              false,

            premiumSpirits:
              false,

            bottledWaterUnlimited:
              false,
          });

        expect(
          result
            .operationalRuleImpacts
            .every(
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
  "effective savings recommendation safety",
  () => {
    it(
      "mantiene el ahorro efectivo igual al bruto cuando no existe impacto de threshold",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine:
              "costa",

            days:
              7,

            people:
              1,

            coffee:
              2,

            water:
              2,

            soda:
              2,

            beer:
              1,

            wine:
              1,

            cocktail:
              1,
          });

        const bestPackage =
          result.bestPackage;

        expect(
          bestPackage
        ).not.toBeNull();

        expect(
          bestPackage
            ?.effectiveSavings
        ).toBe(
          bestPackage
            ?.savings
        );
      }
    );
  }
);

describe(
  "package charge days calculator integration",
  () => {
    it(
      "separa los días de consumo de los días facturables del paquete",
      () => {
        const result =
          calculateRecommendation({
            days: 7,

            packageChargeDays: 6,

            people: 1,

            packagePricePerDay: 40,

            coffee: 1,
            water: 1,
            soda: 1,
            beer: 1,
            wine: 1,
            cocktail: 1,

            coffeePrice: 4,
            waterPrice: 3,
            sodaPrice: 4,
            beerPrice: 8,
            winePrice: 9,
            cocktailPrice: 12,
          });

        /*
         * Coste diario:
         *
         * 4 + 3 + 4 + 8 + 9 + 12
         * = 40
         *
         * El consumo mantiene los
         * 7 días completos:
         *
         * 40 × 7 = 280
         */
        expect(
          result.drinksCost
        ).toBe(280);

        /*
         * El paquete utiliza únicamente
         * los días facturables:
         *
         * 40 × 6 = 240
         */
        expect(
          result.packageCost
        ).toBe(240);

        expect(
          result.savings
        ).toBe(40);
      }
    );

    it(
      "mantiene compatibilidad cuando no se proporcionan días facturables separados",
      () => {
        const result =
          calculateRecommendation({
            days: 7,

            people: 1,

            packagePricePerDay: 40,

            coffee: 1,
            water: 1,
            soda: 1,
            beer: 1,
            wine: 1,
            cocktail: 1,

            coffeePrice: 4,
            waterPrice: 3,
            sodaPrice: 4,
            beerPrice: 8,
            winePrice: 9,
            cocktailPrice: 12,
          });

        expect(
          result.drinksCost
        ).toBe(280);

        expect(
          result.packageCost
        ).toBe(280);
      }
    );
  }
);
