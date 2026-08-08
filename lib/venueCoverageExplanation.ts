import type {
  PackageVenueCoverage,
  PackageVenueCoverageStatus,
} from "@/lib/packageRules";

export type VenueCoverageExplanationItem = {
  status:
    PackageVenueCoverageStatus;
};

export type VenueCoverageExplanation = {
  specialityRestaurants:
    VenueCoverageExplanationItem;

  privateIslands:
    VenueCoverageExplanationItem;

  themedVenues:
    VenueCoverageExplanationItem;

  excludedVenues:
    string[];

  hasKnownLimitations:
    boolean;
};

function isKnownLimitation(
  status:
    PackageVenueCoverageStatus
): boolean {
  return (
    status === "limited" ||
    status === "conditional" ||
    status === "excluded"
  );
}

export function explainVenueCoverage(
  coverage:
    PackageVenueCoverage
): VenueCoverageExplanation {
  const excludedVenues = [
    ...(coverage.excludedVenues ?? []),
  ];

  return {
    specialityRestaurants: {
      status:
        coverage
          .specialityRestaurants,
    },

    privateIslands: {
      status:
        coverage.privateIslands,
    },

    themedVenues: {
      status:
        coverage.themedVenues,
    },

    excludedVenues,

    hasKnownLimitations:
      isKnownLimitation(
        coverage
          .specialityRestaurants
      ) ||
      isKnownLimitation(
        coverage.privateIslands
      ) ||
      isKnownLimitation(
        coverage.themedVenues
      ) ||
      excludedVenues.length > 0,
  };
}
