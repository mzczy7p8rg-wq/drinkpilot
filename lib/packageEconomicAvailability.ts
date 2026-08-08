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
