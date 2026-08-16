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
    source: "user" | "reference" | "included";
  };
};

export function resolveEconomicPackage(
  pkg: AllPackage,
  customPackagePrices?: EconomicPackagePriceInput,
  includedPackageKey?: string | null
): ResolvedEconomicPackage | null {
  const packageKey = pkg.key as PackageKey;

  if (
    includedPackageKey === packageKey &&
    pkg.economicActivation !== "disabled" &&
    pkg.existenceStatus === "verified"
  ) {
    return {
      pkg,
      packageKey,
      referencePrice: isPositiveSafePrice(pkg.pricePerChargeUnit)
        ? pkg.pricePerChargeUnit
        : null,
      resolvedPrice: {
        price: 0,
        currency: pkg.currency,
        source: "included",
      },
    };
  }

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
    !isPositiveSafePrice(pkg.pricePerChargeUnit)
  ) {
    return null;
  }

  if (customPrice !== null) {
    return {
      pkg,
      packageKey,
      referencePrice: pkg.pricePerChargeUnit,
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
    referencePrice: pkg.pricePerChargeUnit,
    resolvedPrice: {
      price: pkg.pricePerChargeUnit,
      currency: pkg.currency,
      source: "reference",
    },
  };
}
