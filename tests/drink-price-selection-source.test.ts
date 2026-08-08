import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveDrinkPriceSelectionSource,
} from "@/lib/drinkPriceSelectionSource";

describe(
  "drink price selection source",
  () => {
    it(
      "mantiene compatibilidad con referencias oficiales existentes",
      () => {
        expect(
          resolveDrinkPriceSelectionSource(
            "msc-aqua-1l-main-restaurant"
          )
        ).toBe("official");
      }
    );

    it(
      "conserva documented-menu cuando la referencia es documentada",
      () => {
        expect(
          resolveDrinkPriceSelectionSource(
            "msc-world-america-espresso-coffee-emporium-2025-07",
            "documented-menu"
          )
        ).toBe(
          "documented-menu"
        );
      }
    );

    it(
      "vuelve a user cuando desaparece la referencia",
      () => {
        expect(
          resolveDrinkPriceSelectionSource(
            undefined,
            "documented-menu"
          )
        ).toBe("user");

        expect(
          resolveDrinkPriceSelectionSource(
            null,
            "official"
          )
        ).toBe("user");
      }
    );

    it(
      "no convierte una selección manual en referencia documentada",
      () => {
        expect(
          resolveDrinkPriceSelectionSource(
            null,
            "documented-menu"
          )
        ).toBe("user");
      }
    );
  }
);
