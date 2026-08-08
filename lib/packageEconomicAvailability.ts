export type PackageEconomicAvailabilityStatus =
  | "available"
  | "user-price-required"
  | "disabled";

export type PackageEconomicAvailability = {
  status:
    PackageEconomicAvailabilityStatus;

  explanation:
    string;
};

export type EconomicComparisonAvailabilityStatus =
  | "available"
  | "drink-prices-required"
  | "package-price-required";

export type EconomicComparisonAvailabilityInput = {
  economicDrinkPricesAvailable:
    boolean;

  comparedPackageCount:
    number;
};

const disabledAvailability:
  PackageEconomicAvailability = {
  status: "disabled",
  explanation:
    "No participa actualmente en la comparación económica de adultos.",
};

export function resolvePackageEconomicAvailability(
  economicActivation:
    string
): PackageEconomicAvailability {
  if (
    economicActivation ===
    "reference-or-user"
  ) {
    return {
      status: "available",
      explanation:
        "Habilitado para la comparación. Si introduces el precio real de tu reserva, DrinkPilot lo utiliza con prioridad.",
    };
  }

  if (
    economicActivation ===
    "user-price-only"
  ) {
    return {
      status:
        "user-price-required",
      explanation:
        "El paquete está identificado, pero necesita un precio real introducido por el usuario para participar en la comparación económica.",
    };
  }

  return disabledAvailability;
}

/*
 * Distingue las dos fuentes económicas que
 * necesita una comparación completa:
 *
 * - una cesta utilizable de precios de bebidas;
 * - al menos un paquete con precio comparable.
 *
 * Tener solo la primera permite calcular el coste
 * de las bebidas por separado, pero no afirmar que
 * los paquetes ya han sido comparados.
 */
export function resolveEconomicComparisonAvailability(
  input:
    EconomicComparisonAvailabilityInput
): EconomicComparisonAvailabilityStatus {
  if (
    !input.economicDrinkPricesAvailable
  ) {
    return "drink-prices-required";
  }

  if (
    input.comparedPackageCount <= 0
  ) {
    return "package-price-required";
  }

  return "available";
}
