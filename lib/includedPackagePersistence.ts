import type { CruiseLineKey } from "@/data/cruiseLines";
import { getAllPackages } from "@/lib/packageService";

export function resolveStoredIncludedPackageKey(
  cruiseLine: CruiseLineKey,
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  return getAllPackages(cruiseLine).some((pkg) => pkg.key === value)
    ? value
    : null;
}
