import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getCruiseLine,
} from "@/data/cruiseLines";

import {
  costaMetadata,
} from "@/data/metadata";

describe("Costa reference region", () => {
  it("presenta Europa como referencia general de Costa", () => {
    expect(
      getCruiseLine("costa").market
    ).toBe("Europa");
  });

  it("conserva España en el alcance de las fuentes verificadas en España", () => {
    expect(
      costaMetadata.sources.officialSourceDetails.map(
        (source) => source.market
      )
    ).toEqual([
      "España",
      "España",
    ]);
  });
});
