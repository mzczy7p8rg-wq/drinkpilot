import { describe, expect, it } from "vitest";

import {
  resolveStoredDocumentedDrinkQuantities,
} from "@/lib/documentedDrinkQuantities";

describe("documented drink quantities", () => {
  it("preserves several valid products independently", () => {
    expect(
      resolveStoredDocumentedDrinkQuantities({
        "costa-bar-list-tonic-water": 1,
        "costa-bar-list-red-bull": 2,
      })
    ).toEqual({
      "costa-bar-list-tonic-water": 1,
      "costa-bar-list-red-bull": 2,
    });
  });

  it("rejects invalid, fractional and excessive quantities", () => {
    expect(
      resolveStoredDocumentedDrinkQuantities({
        valid: 1,
        zero: 0,
        negative: -1,
        fractional: 1.5,
        excessive: 21,
        text: "2",
      })
    ).toEqual({ valid: 1 });
  });
});
