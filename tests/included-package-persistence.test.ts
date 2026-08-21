import { describe, expect, it } from "vitest";

import { resolveStoredIncludedPackageKey } from "@/lib/includedPackagePersistence";

describe("persistencia del paquete incluido", () => {
  it("restaura Easy cuando pertenece a MSC", () => {
    expect(resolveStoredIncludedPackageKey("msc", "mscEasy")).toBe(
      "mscEasy"
    );
  });

  it("descarta paquetes de otra naviera o valores inválidos", () => {
    expect(resolveStoredIncludedPackageKey("msc", "myDrinks")).toBeNull();
    expect(resolveStoredIncludedPackageKey("msc", 0)).toBeNull();
  });
});
