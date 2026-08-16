import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveStoredConsumptionConfirmation,
  type ConsumptionCounts,
} from "@/lib/consumptionConfirmationStorage";

const zeroConsumption: ConsumptionCounts = {
  coffee: 0,
  water: 0,
  soda: 0,
  juice: 0,
  beer: 0,
  wine: 0,
  cocktail: 0,
};

describe("consumption confirmation storage", () => {
  it("conserva una confirmación explícita incluso con consumo cero", () => {
    expect(
      resolveStoredConsumptionConfirmation(
        { consumptionConfirmed: true },
        zeroConsumption
      )
    ).toBe(true);
  });

  it("respeta un estado explícitamente no confirmado", () => {
    expect(
      resolveStoredConsumptionConfirmation(
        { consumptionConfirmed: false },
        { ...zeroConsumption, coffee: 2 }
      )
    ).toBe(false);
  });

  it("mantiene como confirmada una sesión legacy con consumo positivo", () => {
    expect(
      resolveStoredConsumptionConfirmation(
        {},
        { ...zeroConsumption, water: 1 }
      )
    ).toBe(true);
  });

  it("no infiere que una sesión legacy completamente a cero fue respondida", () => {
    expect(
      resolveStoredConsumptionConfirmation(
        {},
        zeroConsumption
      )
    ).toBe(false);
  });
});
