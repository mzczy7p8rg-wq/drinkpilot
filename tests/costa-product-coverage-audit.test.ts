import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculatePackageCoverage,
} from "@/lib/coverage";

import {
  compareDrinkPackages,
} from "@/lib/comparison";

import {
  createSelectedDrinkPriceFromCostaDocumentedReference,
  getCostaDocumentedDrinkPrices,
  resolveCostaDocumentedPackageCoverage,
} from "@/lib/costaDocumentedDrinkPriceService";

import {
  getPackageOperationalRules,
} from "@/lib/packageRules";

const costaBarListSourceUrl =
  "https://00c6f9b6-80c4-42a1-a483-0f4d44d2549a.usrfiles.com/ugd/00c6f9_568325f9b411432682f077fc5d8339aa.pdf";

describe(
  "Costa product coverage audit — current production behavior",
  () => {
    it(
      "distinguishes tonic water and Red Bull before the generic soda fallback",
      () => {
        const tonicWaterCoverage =
          calculatePackageCoverage(
            {
              coffee: 0,
              water: 0,
              soda: 1,
              beer: 0,
              wine: 0,
              cocktail: 0,
              premiumCocktails: false,
              bottledBeer: false,
              premiumSpirits: false,
              bottledWaterUnlimited: false,
            },
            {
              cruiseLine: "costa",
              includePendingPackages: true,
              selectedDrinkReferenceIds: {
                soda: ["costa-bar-list-tonic-water"],
              },
            }
          );

        const redBullCoverage =
          calculatePackageCoverage(
            {
              coffee: 0,
              water: 0,
              soda: 1,
              beer: 0,
              wine: 0,
              cocktail: 0,
              premiumCocktails: false,
              bottledBeer: false,
              premiumSpirits: false,
              bottledWaterUnlimited: false,
            },
            {
              cruiseLine: "costa",
              includePendingPackages: true,
              selectedDrinkReferenceIds: {
                soda: ["costa-bar-list-red-bull"],
              },
            }
          );

        expect(redBullCoverage).not.toEqual(
          tonicWaterCoverage
        );
      }
    );

    it(
      "preserves the Costa Bar List identity in documented records",
      () => {
        expect(
          getCostaDocumentedDrinkPrices()
        ).toHaveLength(55);

        expect(
          getCostaDocumentedDrinkPrices().some(
            (item) =>
              item.sourceUrl ===
              costaBarListSourceUrl
          )
        ).toBe(true);
      }
    );

    it(
      "has no Costa price-threshold rule that could explain product coverage",
      () => {
        const rules =
          getPackageOperationalRules({
            cruiseLine: "costa",
            market: null,
            sailingRegion: null,
            onboardCurrency: null,
            sailingDate: null,
          });

        expect(
          rules.every(
            (rule) =>
              rule.drinkPriceThreshold ===
              null
          )
        ).toBe(true);
      }
    );

    it(
      "charges Red Bull outside My Drinks when its documented reference is selected",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine: "costa",
            cruiseNights: 7,
            people: 1,
            coffee: 0,
            water: 0,
            soda: 1,
            beer: 0,
            wine: 0,
            cocktail: 0,
            documentedDrinkQuantities: {
              "costa-bar-list-red-bull": 1,
            },
          });

        const myDrinks =
          result.packages.find(
            (item) =>
              item.packageKey ===
              "myDrinks"
          );

        expect(
          result.economicDrinkPrices.soda
        ).toBe(3.5);

        expect(
          myDrinks?.uncoveredCategories
        ).toContain("soda");

        expect(myDrinks?.drinksCost).toBe(35);
        expect(myDrinks?.packageCost).toBe(238);
        expect(myDrinks?.savings).toBe(-203);
        expect(myDrinks?.effectiveSavings).toBe(-238);
        expect(
          myDrinks?.documentedProductAdditionalCost
        ).toBe(35);
      }
    );

    it(
      "combines tonic water and Red Bull quantities without collapsing their coverage",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine: "costa",
            cruiseNights: 7,
            people: 1,
            coffee: 0,
            water: 0,
            soda: 2,
            beer: 0,
            wine: 0,
            cocktail: 0,
            documentedDrinkQuantities: {
              "costa-bar-list-tonic-water": 1,
              "costa-bar-list-red-bull": 1,
            },
          });

        const myDrinks =
          result.packages.find(
            (item) =>
              item.packageKey === "myDrinks"
          );

        expect(result.economicDrinkPrices.soda).toBe(3.5);
        expect(myDrinks?.drinksCost).toBe(63);
        expect(myDrinks?.documentedProductAdditionalCost).toBe(35);
        expect(myDrinks?.effectiveSavings).toBe(-210);
        expect(myDrinks?.uncoveredCategories).toContain("soda");
      }
    );

    it(
      "does not add the documented 15 percent service charge to Costa menu prices",
      () => {
        const result =
          compareDrinkPackages({
            cruiseLine: "costa",
            cruiseNights: 1,
            people: 1,
            coffee: 0,
            water: 0,
            soda: 1,
            beer: 0,
            wine: 0,
            cocktail: 0,
            selectedDrinkPrices: {
              soda: {
                category: "soda",
                price: 5,
                currency: "EUR",
                source: "user",
              },
            },
          });

        expect(result.economicDrinkPrices.soda).toBe(5);
        expect(
          result.packages.find(
            (item) =>
              item.packageKey ===
              "myDrinks"
          )?.drinksCost
        ).toBe(5);
      }
    );
  }
);

describe(
  "Costa product coverage audit — approved future regression contract",
  () => {
    it(
      "A: tonic water is included in My Drinks",
      () => {
        expect(
          resolveCostaDocumentedPackageCoverage(
            "costa-bar-list-tonic-water",
            "myDrinks"
          )?.status
        ).toBe("included");
      }
    );

    it(
      "B: Red Bull must not inherit My Drinks coverage from soda",
      () => {
        expect(
          resolveCostaDocumentedPackageCoverage(
            "costa-bar-list-red-bull",
            "myDrinks"
          )?.status
        ).toBe("notIncluded");
      }
    );

    it(
      "C: tonic water is included in My Soft Drinks",
      () => {
        expect(
          resolveCostaDocumentedPackageCoverage(
            "costa-bar-list-tonic-water",
            "myDrinksSoft"
          )?.status
        ).toBe("included");
      }
    );

    it(
      "D: Red Bull must not inherit My Soft Drinks coverage from soda",
      () => {
        expect(
          resolveCostaDocumentedPackageCoverage(
            "costa-bar-list-red-bull",
            "myDrinksSoft"
          )?.status
        ).toBe("notIncluded");
      }
    );

    it(
      "E: My Drinks Plus includes both tonic water and Red Bull",
      () => {
        expect(
          resolveCostaDocumentedPackageCoverage(
            "costa-bar-list-tonic-water",
            "myDrinksPlus"
          )?.status
        ).toBe("included");

        expect(
          resolveCostaDocumentedPackageCoverage(
            "costa-bar-list-red-bull",
            "myDrinksPlus"
          )?.status
        ).toBe("included");
      }
    );

    it(
      "F: products in the same generic family must be able to resolve different coverage",
      () => {
        expect(
          resolveCostaDocumentedPackageCoverage(
            "costa-bar-list-tonic-water",
            "myDrinks"
          )?.status
        ).not.toBe(
          resolveCostaDocumentedPackageCoverage(
            "costa-bar-list-red-bull",
            "myDrinks"
          )?.status
        );
      }
    );

    it(
      "G: equal menu prices must be able to resolve different documented coverage",
      () => {
        const corona =
          getCostaDocumentedDrinkPrices().find(
            (item) =>
              item.id ===
              "costa-bar-list-corona-33cl"
          );

        const estrellaDamm =
          getCostaDocumentedDrinkPrices().find(
            (item) =>
              item.id ===
              "costa-bar-list-estrella-damm-33cl"
          );

        expect(corona?.price).toBe(4.5);
        expect(estrellaDamm?.price).toBe(4.5);
        expect(
          corona?.packageCoverage.myDrinks
        ).toBe("notIncluded");
        expect(
          estrellaDamm?.packageCoverage.myDrinks
        ).toBe("included");
      }
    );

    it(
      "H: price and coverage resolution must preserve the Costa Bar List evidence identity",
      () => {
        expect(
          createSelectedDrinkPriceFromCostaDocumentedReference(
            "costa-bar-list-red-bull"
          )
        ).toMatchObject({
          referenceId:
            "costa-bar-list-red-bull",
          source: "documented-menu",
        });

        expect(
          resolveCostaDocumentedPackageCoverage(
            "costa-bar-list-red-bull",
            "myDrinks"
          )
        ).toMatchObject({
          referenceId:
            "costa-bar-list-red-bull",
          sourceUrl:
            costaBarListSourceUrl,
          evidence: "documented-menu",
        });
      }
    );

    it(
      "I: los zumos conservan cobertura por producto y no heredan la de refrescos",
      () => {
        const glassJuice =
          "costa-bar-list-zumos-de-fruta-por-vaso";
        const looza =
          "costa-bar-list-looza-ace-pera-melocoton-y-albaricoque";
        const freshOrange =
          "costa-bar-list-zumo-de-naranja-recien-exprimido";

        expect(
          resolveCostaDocumentedPackageCoverage(
            glassJuice,
            "myDrinksSoft"
          )?.status
        ).toBe("included");

        expect(
          resolveCostaDocumentedPackageCoverage(
            looza,
            "myDrinksSoft"
          )?.status
        ).toBe("notIncluded");

        expect(
          resolveCostaDocumentedPackageCoverage(
            looza,
            "myDrinks"
          )?.status
        ).toBe("included");

        expect(
          resolveCostaDocumentedPackageCoverage(
            freshOrange,
            "myDrinks"
          )?.status
        ).toBe("notIncluded");

        expect(
          resolveCostaDocumentedPackageCoverage(
            freshOrange,
            "myDrinksPlus"
          )?.status
        ).toBe("included");
      }
    );
  }
);
