import type {
  PackageThresholdConsumptionImpact,
} from "@/lib/packageThresholdConsumptionImpact";

export type PackageThresholdCruiseImpactStatus =
  | "unknown"
  | "none"
  | "known-unquantified"
  | "quantified";

export type PackageThresholdCruiseImpact = {
  status:
    PackageThresholdCruiseImpactStatus;

  cruiseNights:
    number | null;

  people:
    number | null;

  totalDrinks:
    number | null;

  drinksAboveThreshold:
    number | null;

  drinksExcludedFromCoverage:
    number | null;

  additionalCostTotal:
    number | null;
};

type PackageThresholdCruiseImpactInput = {
  dailyImpact:
    PackageThresholdConsumptionImpact;

  cruiseNights:
    number | null | undefined;

  people:
    number | null | undefined;
};

function isPositiveFiniteNumber(
  value:
    number | null | undefined
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

export function evaluatePackageThresholdCruiseImpact(
  input:
    PackageThresholdCruiseImpactInput
): PackageThresholdCruiseImpact {
  const {
    dailyImpact,
    cruiseNights,
    people,
  } = input;

  if (
    !isPositiveFiniteNumber(cruiseNights) ||
    !isPositiveFiniteNumber(people)
  ) {
    return {
      status: "unknown",

      cruiseNights: null,
      people: null,

      totalDrinks: null,

      drinksAboveThreshold:
        null,

      drinksExcludedFromCoverage:
        null,

      additionalCostTotal:
        null,
    };
  }

  if (
    dailyImpact.status ===
      "unknown" ||
    dailyImpact
      .drinksAboveThresholdPerDay ===
      null
  ) {
    return {
      status: "unknown",

      cruiseNights,
      people,

      totalDrinks:
        dailyImpact.totalDrinksPerDay *
        cruiseNights *
        people,

      drinksAboveThreshold:
        null,

      drinksExcludedFromCoverage:
        null,

      additionalCostTotal:
        null,
    };
  }

  const totalDrinks =
    dailyImpact.totalDrinksPerDay *
    cruiseNights *
    people;

  const drinksAboveThreshold =
    dailyImpact
      .drinksAboveThresholdPerDay *
    cruiseNights *
    people;

  const drinksExcludedFromCoverage =
    dailyImpact
      .drinksExcludedFromCoveragePerDay ===
    null
      ? null
      : dailyImpact
          .drinksExcludedFromCoveragePerDay *
        cruiseNights *
        people;

  if (
    dailyImpact.status === "none" ||
    drinksAboveThreshold === 0
  ) {
    return {
      status: "none",

      cruiseNights,
      people,

      totalDrinks,

      drinksAboveThreshold:
        0,

      drinksExcludedFromCoverage:
        0,

      additionalCostTotal:
        0,
    };
  }

  if (
    dailyImpact.status ===
      "known-unquantified" ||
    dailyImpact.additionalCostPerDay ===
      null
  ) {
    return {
      status:
        "known-unquantified",

      cruiseNights,
      people,

      totalDrinks,

      drinksAboveThreshold,

      drinksExcludedFromCoverage,

      additionalCostTotal:
        null,
    };
  }

  return {
    status: "quantified",

    cruiseNights,
    people,

    totalDrinks,

    drinksAboveThreshold,

    drinksExcludedFromCoverage,

    additionalCostTotal:
      dailyImpact.additionalCostPerDay *
      cruiseNights *
      people,
  };
}
