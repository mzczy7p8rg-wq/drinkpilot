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

        myDrinksCustomPrice: 8,
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
});