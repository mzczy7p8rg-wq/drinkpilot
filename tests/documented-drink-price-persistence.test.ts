import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveMscDocumentedDrinkPriceSelectionForContext,
} from "@/lib/mscDocumentedDrinkPriceService";

import {
  createSelectedDrinkPrice,
} from "@/lib/selectedDrinkPrice";

import {
  resolveStoredSelectedDrinkPrices,
} from "@/lib/selectedDrinkPriceStorage";

describe(
  "documented drink price persistence",
  () => {
    it(
      "conserva documented-menu y compatible tras serializar y rehidratar",
      () => {
        const contextual =
          resolveMscDocumentedDrinkPriceSelectionForContext(
            "msc-world-america-espresso-fleetwide-2025-07",
            {
              cruiseLine: "msc",
              market: null,
              sailingRegion: null,
              onboardCurrency: "USD",
              sailingDate: null,
            }
          );

        expect(contextual).not.toBeNull();

        const relevance =
          contextual?.contextRelevance
            .relevance;

        const selected =
          createSelectedDrinkPrice({
            category: "coffee",
            price: 2.5,
            currency: "USD",
            source: "documented-menu",

            contextRelevance:
              relevance === "exact" ||
              relevance === "compatible"
                ? relevance
                : undefined,
          });

        const serialized =
          JSON.stringify({
            selectedDrinkPrices: {
              coffee: selected,
            },
          });

        const parsed =
          JSON.parse(serialized);

        expect(
          resolveStoredSelectedDrinkPrices(
            parsed.selectedDrinkPrices
          )
        ).toEqual({
          coffee: {
            category: "coffee",
            price: 2.5,
            currency: "USD",
            source: "documented-menu",
            contextRelevance: "compatible",
          },
        });
      }
    );

    it(
      "no convierte mismatch en relevancia persistible",
      () => {
        const contextual =
          resolveMscDocumentedDrinkPriceSelectionForContext(
            "msc-world-america-espresso-fleetwide-2025-07",
            {
              cruiseLine: "msc",
              market: "Europe",
              sailingRegion: null,
              onboardCurrency: "USD",
              sailingDate: null,
            }
          );

        expect(
          contextual?.contextRelevance
            .relevance
        ).toBe("mismatch");

        const relevance =
          contextual?.contextRelevance
            .relevance;

        expect(
          createSelectedDrinkPrice({
            category: "coffee",
            price: 2.5,
            currency: "USD",
            source: "documented-menu",

            contextRelevance:
              relevance === "exact" ||
              relevance === "compatible"
                ? relevance
                : undefined,
          })
        ).toEqual({
          category: "coffee",
          price: 2.5,
          currency: "USD",
          source: "documented-menu",
        });
      }
    );
  }
);
