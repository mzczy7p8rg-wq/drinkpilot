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
      "solo contiene referencias oficiales verificadas",
      () => {
        expect(
          mscSpecificDrinkPrices.every(
            (item) =>
              item.source === "official" &&
              item.price > 0
          )
        ).toBe(true);
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

      evidence:
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

describe("MSC AQUA official prices", () => {
  it("conserva los tres formatos oficiales sin calcular una media", () => {
    expect(
      mscSpecificDrinkPrices.map(
        ({ format, price, currency }) => ({
          format,
          price,
          currency,
        })
      )
    ).toEqual([
      {
        format: "1L glass bottle",
        price: 2,
        currency: "EUR",
      },
      {
        format: "50cl self-service refill",
        price: 1,
        currency: "EUR",
      },
      {
        format: "20cl glass",
        price: 0.5,
        currency: "EUR",
      },
    ]);
  });

  it("identifica todas las referencias como AQUA by MSC", () => {
    expect(
      mscSpecificDrinkPrices.every(
        (item) =>
          item.category === "water" &&
          item.productName === "AQUA by MSC" &&
          item.verifiedAt === "2026-08-07"
      )
    ).toBe(true);
  });
});

describe(
  "MSC specific drink price evidence",
  () => {
    it(
      "marca AQUA como evidencia oficial",
      () => {
        expect(
          mscSpecificDrinkPrices.every(
            (item) =>
              item.evidence === "official"
          )
        ).toBe(true);
      }
    );

    it(
      "mantiene sourceUrl como URL limpia",
      () => {
        expect(
          mscSpecificDrinkPrices.every(
            (item) =>
              item.sourceUrl.startsWith(
                "https://"
              ) &&
              !item.sourceUrl.includes("[") &&
              !item.sourceUrl.includes("]")
          )
        ).toBe(true);
      }
    );
  }
);
