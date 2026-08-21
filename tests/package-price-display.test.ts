import { describe, expect, it } from "vitest";

import { formatPackagePricePerChargeUnit } from "@/lib/packagePriceDisplay";

describe("package price display", () => {
  it("aclara que cero es el coste incremental de un paquete incluido", () => {
    expect(
      formatPackagePricePerChargeUnit(0, "EUR", true)
    ).toBe("Coste incremental: 0,00 € por persona / noche");
  });

  it("mantiene el precio normal cuando el paquete no está incluido", () => {
    expect(
      formatPackagePricePerChargeUnit(15, "USD", false)
    ).toBe("15,00 US$ por persona / noche");
  });
});
