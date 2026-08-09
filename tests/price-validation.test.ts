import {
  describe,
  expect,
  it,
} from "vitest";

import {
  isPositiveSafePrice,
} from "@/lib/priceValidation";

describe("price validation", () => {
  it("acepta importes positivos y decimales dentro del rango seguro", () => {
    expect(
      isPositiveSafePrice(12.5)
    ).toBe(true);

    expect(
      isPositiveSafePrice(
        Number.MAX_SAFE_INTEGER
      )
    ).toBe(true);
  });

  it("rechaza valores vacíos, no positivos y no finitos", () => {
    expect(
      isPositiveSafePrice(null)
    ).toBe(false);
    expect(
      isPositiveSafePrice(0)
    ).toBe(false);
    expect(
      isPositiveSafePrice(-1)
    ).toBe(false);
    expect(
      isPositiveSafePrice(
        Number.POSITIVE_INFINITY
      )
    ).toBe(false);
  });

  it("rechaza importes que superan el rango seguro", () => {
    expect(
      isPositiveSafePrice(
        Number.MAX_SAFE_INTEGER + 1
      )
    ).toBe(false);

    expect(
      isPositiveSafePrice(1e308)
    ).toBe(false);
  });
});
