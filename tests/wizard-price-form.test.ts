import { describe, expect, it } from "vitest";

import {
  getHighPriceThreshold,
  validateOptionalPrice,
} from "@/lib/wizardPriceForm";

describe("wizard price form", () => {
  it("mantiene vacío como precio opcional válido", () => {
    expect(validateOptionalPrice("", 100)).toEqual({
      valid: true,
      value: null,
      error: null,
      warning: null,
    });
  });

  it("rechaza importes no positivos", () => {
    expect(validateOptionalPrice("0", 100).error).toBe(
      "El precio debe ser mayor que 0."
    );
  });

  it("avisa sin bloquear cuando el importe es inusualmente alto", () => {
    const validation = validateOptionalPrice("101", 100);

    expect(validation.valid).toBe(true);
    expect(validation.value).toBe(101);
    expect(validation.warning).not.toBeNull();
  });

  it("deriva un umbral amplio desde la referencia", () => {
    expect(getHighPriceThreshold(50)).toBe(125);
    expect(getHighPriceThreshold(null)).toBe(100);
  });
});
