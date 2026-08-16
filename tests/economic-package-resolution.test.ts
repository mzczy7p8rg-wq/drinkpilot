import { describe, expect, it } from "vitest";

import { getAllPackages } from "@/lib/packageService";
import { resolveEconomicPackage } from "@/lib/economicPackageResolution";

describe("included package resolution", () => {
  it("uses zero incremental cost only for the package included in the reservation", () => {
    const pkg = getAllPackages("costa")[0];

    const resolved = resolveEconomicPackage(pkg, undefined, pkg.key);

    expect(resolved?.resolvedPrice).toEqual({
      price: 0,
      currency: pkg.currency,
      source: "included",
    });
  });
});
