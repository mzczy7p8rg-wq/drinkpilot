import { describe, expect, it } from "vitest";

import {
  createCustomPackagePrice,
  resolveStoredCustomPackagePrice,
} from "@/lib/customPackagePrice";

describe("custom package price", () => {
  it("normaliza y conserva precio y moneda", () => {
    expect(
      createCustomPackagePrice({ price: 42.5, currency: " usd " })
    ).toEqual({ price: 42.5, currency: "USD" });
  });

  it("rechaza precios o monedas no válidos", () => {
    expect(
      createCustomPackagePrice({ price: 0, currency: "USD" })
    ).toBeNull();
    expect(
      createCustomPackagePrice({ price: 42, currency: "dólares" })
    ).toBeNull();
  });

  it("migra el número histórico usando la moneda de catálogo", () => {
    expect(resolveStoredCustomPackagePrice(34, "EUR")).toEqual({
      price: 34,
      currency: "EUR",
    });
  });

  it("preserva la moneda del formato moderno", () => {
    expect(
      resolveStoredCustomPackagePrice(
        { price: 49, currency: "USD" },
        "EUR"
      )
    ).toEqual({ price: 49, currency: "USD" });
  });
});
