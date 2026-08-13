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

  it("separa la referencia general de los mercados documentales", () => {
    const sourceMarkets =
      costaMetadata.sources.officialSourceDetails.map(
        (source) => source.market
      );

    expect(sourceMarkets).toContain(
      "España"
    );

    expect(sourceMarkets).toContain(
      "Estados Unidos / Canadá"
    );

    expect(sourceMarkets).not.toContain(
      "Europa"
    );
  });
});
