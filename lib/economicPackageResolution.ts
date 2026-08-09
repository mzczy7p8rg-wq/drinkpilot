import type { CustomPackagePrice } from "@/lib/customPackagePrice";
import { resolveStoredCustomPackagePrice } from "@/lib/customPackagePrice";
import { getAllPackages, type PackageKey } from "@/lib/packageService";
import { isPositiveSafePrice } from "@/lib/priceValidation";

type AllPackage = ReturnType<typeof getAllPackages>[number];

export type EconomicPackagePriceInput = Record<
  string,
  CustomPackagePrice | number | null | undefined
>;

export type ResolvedEconomicPackage = {
  pkg: AllPackage;
  packageKey: PackageKey;
  referencePrice: number | null;
  resolvedPrice: {
    price: number;
    currency: string;
    source: "user" | "reference";
  };
};

export function resolveEconomicPackage(
  pkg: AllPackage,
  customPackagePrices?: EconomicPackagePriceInput
): ResolvedEconomicPackage | null {
  const packageKey = pkg.key as PackageKey;
  const customPrice = resolveStoredCustomPackagePrice(
    customPackagePrices?.[packageKey],
    pkg.currency
  );

  if (pkg.economicActivation === "user-price-only") {
    if (pkg.existenceStatus !== "verified" || customPrice === null) {
      return null;
    }

    return {
      pkg,
      packageKey,
      referencePrice: null,
      resolvedPrice: {
        price: customPrice.price,
        currency: customPrice.currency,
        source: "user",
      },
    };
  }

  if (
    pkg.economicEligibility !== "eligible" ||
    pkg.status !== "verified" ||
    !isPositiveSafePrice(pkg.pricePerDay)
  ) {
    return null;
  }

  if (customPrice !== null) {
    return {
      pkg,
      packageKey,
      referencePrice: pkg.pricePerDay,
      resolvedPrice: {
        price: customPrice.price,
        currency: customPrice.currency,
        source: "user",
      },
    };
  }

  return {
    pkg,
    packageKey,
    referencePrice: pkg.pricePerDay,
    resolvedPrice: {
      price: pkg.pricePerDay,
      currency: pkg.currency,
      source: "reference",
    },
  };
}
