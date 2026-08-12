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
      "no publica referencias de menú sin evidencia modelada",
      () => {
        expect(
          getCostaDocumentedDrinkPrices()
        ).toEqual([]);

        expect(
          getCostaDocumentedDrinkPrices({
            category: "coffee",
            currency: "EUR",
            sailingRegion: "MED",
          })
        ).toEqual([]);
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
