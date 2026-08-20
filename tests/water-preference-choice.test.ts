import { describe, expect, it } from "vitest";

import {
  resolveWaterPreferenceChoice,
  resolveWaterPreferenceState,
} from "@/lib/waterPreferenceChoice";

describe("water preference choice", () => {
  it("muestra solo agua sin límite cuando internamente también implica cobertura diaria", () => {
    expect(
      resolveWaterPreferenceChoice({
        bottledWaterDailyAllowance: true,
        bottledWaterUnlimited: true,
      })
    ).toBe("unlimited");
  });

  it("muestra una botella diaria cuando no hay agua ilimitada", () => {
    expect(
      resolveWaterPreferenceChoice({
        bottledWaterDailyAllowance: true,
        bottledWaterUnlimited: false,
      })
    ).toBe("daily");
  });

  it("no muestra ninguna preferencia de agua cuando ambas están desactivadas", () => {
    expect(
      resolveWaterPreferenceChoice({
        bottledWaterDailyAllowance: false,
        bottledWaterUnlimited: false,
      })
    ).toBe("none");
  });

  it("convierte la elección diaria en el estado interno correcto", () => {
    expect(
      resolveWaterPreferenceState("daily")
    ).toEqual({
      bottledWaterDailyAllowance: true,
      bottledWaterUnlimited: false,
    });
  });

  it("mantiene la cobertura diaria interna cuando se elige agua sin límite", () => {
    expect(
      resolveWaterPreferenceState("unlimited")
    ).toEqual({
      bottledWaterDailyAllowance: true,
      bottledWaterUnlimited: true,
    });
  });

  it("desactiva ambas coberturas cuando no se elige agua embotellada", () => {
    expect(
      resolveWaterPreferenceState("none")
    ).toEqual({
      bottledWaterDailyAllowance: false,
      bottledWaterUnlimited: false,
    });
  });
});
