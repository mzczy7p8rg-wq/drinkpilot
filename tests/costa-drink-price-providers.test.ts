import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createSelectedDrinkPriceFromCostaDocumentedReference,
  getCostaDocumentedDrinkPriceById,
  getCostaDocumentedDrinkPrices,
  resolveCostaDocumentedDrinkPriceSelection,
} from "@/lib/costaDocumentedDrinkPriceService";

import {
  createSelectedDrinkPriceFromCostaReference,
  getCostaSpecificDrinkPriceById,
  getCostaSpecificDrinkPrices,
  resolveCostaSpecificDrinkPriceSelection,
} from "@/lib/costaSpecificDrinkPriceService";

describe(
  "Costa documented drink price provider",
  () => {
    it(
      "publica únicamente las referencias modeladas de la Costa Bar List",
      () => {
        expect(
          getCostaDocumentedDrinkPrices()
        ).toHaveLength(55);

        expect(
          getCostaDocumentedDrinkPrices({
            category: "soda",
            currency: "EUR",
          })
        ).toHaveLength(12);
      }
    );

    it(
      "conserva cafés del mismo precio con cobertura distinta",
      () => {
        const references =
          getCostaDocumentedDrinkPrices({
            category: "coffee",
            currency: "EUR",
          });

        expect(references).toHaveLength(21);

        expect(
          getCostaDocumentedDrinkPrices({
            category: "juice",
            currency: "EUR",
          })
        ).toHaveLength(4);

        const shakerato = references.find(
          (item) =>
            item.productName === "Café shakerato"
        );

        const pistacchio = references.find(
          (item) =>
            item.productName === "Pistacchio"
        );

        expect(shakerato?.price).toBe(4.2);
        expect(pistacchio?.price).toBe(4.2);
        expect(
          shakerato?.packageCoverage.myDrinks
        ).toBe("included");
        expect(
          pistacchio?.packageCoverage.myDrinks
        ).toBe("notIncluded");
      }
    );

    it(
      "no fabrica referencias selecciones ni evidencia documentada",
      () => {
        expect(
          getCostaDocumentedDrinkPriceById(
            "missing-reference"
          )
        ).toBeNull();

        expect(
          createSelectedDrinkPriceFromCostaDocumentedReference(
            "missing-reference"
          )
        ).toBeNull();

        expect(
          resolveCostaDocumentedDrinkPriceSelection(
            "missing-reference"
          )
        ).toBeNull();
      }
    );
  }
);

describe(
  "Costa specific drink price provider",
  () => {
    it(
      "no publica precios oficiales específicos no documentados",
      () => {
        expect(
          getCostaSpecificDrinkPrices()
        ).toEqual([]);

        expect(
          getCostaSpecificDrinkPrices(
            "water"
          )
        ).toEqual([]);
      }
    );

    it(
      "no fabrica referencias selecciones ni evidencia oficial",
      () => {
        expect(
          getCostaSpecificDrinkPriceById(
            "missing-reference"
          )
        ).toBeNull();

        expect(
          createSelectedDrinkPriceFromCostaReference(
            "missing-reference"
          )
        ).toBeNull();

        expect(
          resolveCostaSpecificDrinkPriceSelection(
            "missing-reference"
          )
        ).toBeNull();
      }
    );
  }
);
