import { describe, expect, it } from "vitest";

import {
  getMarketLabel,
  getSailingRegionLabel,
} from "@/lib/cruiseContextOptions";

describe("cruise context options", () => {
  it("muestra el mercado US con una etiqueta comprensible", () => {
    expect(getMarketLabel("us")).toBe("Estados Unidos");
  });

  it("muestra la región documental de MSC World America", () => {
    expect(getSailingRegionLabel("North America")).toBe(
      "Norteamérica"
    );
  });

  it("reconoce los códigos regionales ya admitidos por el modelo", () => {
    expect(getSailingRegionLabel("med")).toBe("Mediterráneo");
  });

  it("no inventa contexto cuando el usuario no lo conoce", () => {
    expect(getMarketLabel(null)).toBe("No indicado");
    expect(getSailingRegionLabel(null)).toBe("No indicado");
  });
});
