import { describe, expect, it } from "vitest";

import {
  isBreakEvenAvailable,
} from "@/lib/breakEvenAvailability";

describe("break-even availability", () => {
  it("no muestra el punto de equilibrio cuando no existe coste diario de bebidas", () => {
    expect(
      isBreakEvenAvailable({
        dailyDrinkCost: 0,
      })
    ).toBe(false);
  });

  it("permite mostrar un punto de equilibrio cero para un paquete incluido si existe consumo valorado", () => {
    expect(
      isBreakEvenAvailable({
        dailyDrinkCost: 12,
      })
    ).toBe(true);
  });
});
