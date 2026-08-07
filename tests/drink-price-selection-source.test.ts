import { describe, expect, it } from "vitest";

import {
  resolveDrinkPriceSelectionSource,
} from "@/lib/drinkPriceSelectionSource";

describe("drink price selection source", () => {
  it("mantiene official cuando existe una referencia", () => {
    expect(
      resolveDrinkPriceSelectionSource(
        "msc-aqua-1l-main-restaurant"
      )
    ).toBe("official");
  });

  it("vuelve a user cuando desaparece la referencia", () => {
    expect(
      resolveDrinkPriceSelectionSource(undefined)
    ).toBe("user");

    expect(
      resolveDrinkPriceSelectionSource(null)
    ).toBe("user");
  });
});
