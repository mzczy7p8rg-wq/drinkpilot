import {
  describe,
  expect,
  it,
} from "vitest";

import {
  mscSpecificDrinkPrices,
  type MscSpecificDrinkPrice,
} from "@/data/msc/specificDrinkPrices";

describe(
  "MSC specific drink prices",
  () => {
    it(
      "empieza sin inventar precios concretos",
      () => {
        expect(
          mscSpecificDrinkPrices
        ).toEqual([]);
      }
    );

    it(
      "permite representar una referencia oficial concreta",
      () => {
        const reference:
          MscSpecificDrinkPrice = {
          id:
            "msc-aqua-example",

          category:
            "water",

          productName:
            "AQUA by MSC",

          format:
            "example-format",

          price:
            1,

          currency:
            "EUR",

          source:
            "official",

          sourceUrl:
            "https://example.com",

          verifiedAt:
            "2026-08-07",
        };

        expect(
          reference.source
        ).toBe("official");

        expect(
          reference.category
        ).toBe("water");

        expect(
          reference.productName
        ).toBe("AQUA by MSC");
      }
    );
  }
);
