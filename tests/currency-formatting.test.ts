import {
  describe,
  expect,
  it,
} from "vitest";

import {
  formatCurrency,
  formatSignedCurrency,
} from "@/lib/currencyFormatting";

describe("currency formatting", () => {
  it("formatea EUR con la configuración regional de Results", () => {
    expect(
      formatCurrency(12.5, "EUR")
    ).toBe(
      new Intl.NumberFormat(
        "es-ES",
        {
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      ).format(12.5)
    );
  });

  it("formatea USD sin mostrar el símbolo del euro", () => {
    const result =
      formatCurrency(12.5, "USD");

    expect(result).not.toContain("€");
    expect(result).toContain("12,50");
  });

  it("añade un signo positivo al ahorro", () => {
    expect(
      formatSignedCurrency(
        12.5,
        "EUR"
      ).startsWith("+")
    ).toBe(true);
  });
});
