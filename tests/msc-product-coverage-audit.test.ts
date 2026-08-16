import {
  describe,
  expect,
  it,
} from "vitest";

import {
  compareDrinkPackages,
} from "@/lib/comparison";

import {
  resolveMscDocumentedPackageCoverage,
} from "@/lib/mscDocumentedDrinkPriceService";

const cannedSoda =
  "msc-cocktails-more-2023-refresco-en-lata-33-cl";
const redBull =
  "msc-cocktails-more-2023-red-bull-25-cl";
const icedTea =
  "msc-cocktails-more-2023-te-frio-33-cl";
const tonic =
  "msc-cocktails-more-2023-fever-tree-tonic-20-cl";
const fountainSoda =
  "msc-cocktails-more-2023-refresco-por-vaso-30-cl";

describe(
  "MSC product coverage audit — historical documented menu",
  () => {
    it(
      "resuelve cobertura distinta dentro de la categoría refresco",
      () => {
        expect(
          resolveMscDocumentedPackageCoverage(
            cannedSoda,
            "mscEasy"
          )?.status
        ).toBe("included");

        expect(
          resolveMscDocumentedPackageCoverage(
            redBull,
            "mscEasy"
          )?.status
        ).toBe("notIncluded");
      }
    );

    it(
      "combina cantidades sin colapsar precio ni cobertura",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine: "msc",
            onboardCurrency: "EUR",
            cruiseNights: 7,
            people: 1,
            coffee: 0,
            water: 0,
            soda: 2,
            juice: 0,
            beer: 0,
            wine: 0,
            cocktail: 0,
            customPackagePrices: {
              mscEasy: 10,
            },
            documentedDrinkQuantities: {
              [cannedSoda]: 1,
              [redBull]: 1,
            },
          });

        const easy =
          result.packages.find(
            (item) =>
              item.packageKey === "mscEasy"
          );

        expect(
          result.missingOnboardPriceKeys
        ).toEqual([]);
        expect(
          result.calculationDrinkPrices?.soda
        ).toBe(4);
        expect(easy?.drinksCost).toBe(56);
        expect(
          easy?.uncoveredCategories
        ).toContain("soda");
        expect(
          easy?.documentedProductAdditionalCost
        ).toBe(31.5);
      }
    );

    it(
      "permite elegir más variedades que consumiciones sin aumentar el total diario",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine: "msc",
            onboardCurrency: "EUR",
            cruiseNights: 7,
            people: 1,
            coffee: 0,
            water: 0,
            soda: 4,
            juice: 0,
            beer: 0,
            wine: 0,
            cocktail: 0,
            customPackagePrices: {
              mscEasy: 10,
            },
            documentedDrinkQuantities: {
              [cannedSoda]: 1,
              [icedTea]: 1,
              [tonic]: 1,
              [fountainSoda]: 1,
              [redBull]: 1,
            },
          });

        const easy =
          result.packages.find(
            (item) =>
              item.packageKey === "mscEasy"
          );

        expect(
          result.calculationDrinkPrices?.soda
        ).toBe(3.5);
        expect(easy?.drinksCost).toBe(98);
        expect(
          easy?.documentedProductAdditionalCost
        ).toBeCloseTo(42);
      }
    );

    it(
      "usa AQUA by MSC seleccionada y no deja el agua como precio pendiente",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine: "msc",
            onboardCurrency: "EUR",
            cruiseNights: 7,
            people: 1,
            coffee: 0,
            water: 2,
            soda: 0,
            juice: 0,
            beer: 0,
            wine: 0,
            cocktail: 0,
            customPackagePrices: {
              mscEasy: 10,
            },
            selectedDrinkPrices: {
              water: {
                category: "water",
                price: 2,
                currency: "EUR",
                source: "official",
                referenceId:
                  "msc-aqua-1l-main-restaurant",
              },
            },
          });

        expect(
          result.missingOnboardPriceKeys
        ).toEqual([]);
        expect(
          result.calculationDrinkPrices?.water
        ).toBe(2);
      }
    );
  }
);
