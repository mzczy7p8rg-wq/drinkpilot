import type {
  PackageThresholdConsumptionImpact,
} from "@/lib/packageThresholdConsumptionImpact";

export type PackageThresholdCruiseImpactStatus =
  | "unknown"
  | "none"
  | "known-unquantified";

export type PackageThresholdCruiseImpact = {
  status:
    PackageThresholdCruiseImpactStatus;

  days:
    number | null;

  people:
    number | null;

  totalDrinks:
    number | null;

  drinksAboveThreshold:
    number | null;

  additionalCostTotal:
    number | null;
};

type PackageThresholdCruiseImpactInput = {
  dailyImpact:
    PackageThresholdConsumptionImpact;

  days:
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
    days,
    people,
  } = input;

  if (
    !isPositiveFiniteNumber(days) ||
    !isPositiveFiniteNumber(people)
  ) {
    return {
      status: "unknown",

      days: null,
      people: null,

      totalDrinks: null,

      drinksAboveThreshold:
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

      days,
      people,

      totalDrinks:
        dailyImpact.totalDrinksPerDay *
        days *
        people,

      drinksAboveThreshold:
        null,

      additionalCostTotal:
        null,
    };
  }

  const totalDrinks =
    dailyImpact.totalDrinksPerDay *
    days *
    people;

  const drinksAboveThreshold =
    dailyImpact
      .drinksAboveThresholdPerDay *
    days *
    people;

  if (
    dailyImpact.status === "none" ||
    drinksAboveThreshold === 0
  ) {
    return {
      status: "none",

      days,
      people,

      totalDrinks,

      drinksAboveThreshold:
        0,

      additionalCostTotal:
        0,
    };
  }

  return {
    status:
      "known-unquantified",

    days,
    people,

    totalDrinks,

    drinksAboveThreshold,

    /*
     * Sabemos cuántas consumiciones
     * están afectadas, pero todavía
     * no tenemos una regla económica
     * suficientemente respaldada para
     * convertirlas en coste adicional.
     */
    additionalCostTotal:
      null,
  };
}
