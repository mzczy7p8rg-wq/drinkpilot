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

  it("keeps zero incremental cost in the active reservation currency", () => {
    const pkg = getAllPackages("msc").find(
      (item) => item.key === "mscEasy"
    );

    expect(pkg).toBeDefined();

    const resolved = resolveEconomicPackage(
      pkg!,
      undefined,
      "mscEasy",
      "USD"
    );

    expect(resolved?.resolvedPrice).toEqual({
      price: 0,
      currency: "USD",
      source: "included",
    });
  });
});
