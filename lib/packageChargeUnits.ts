import type {
  CruiseDuration,
} from "@/lib/cruiseDuration";

export type PackageChargeUnitPolicy =
  | "unknown"
  | "per-night"
  | "per-itinerary-day"
  | "per-itinerary-day-excluding-disembarkation";

export type PackageChargeUnitsInput =
  CruiseDuration & {
    packageChargeUnitPolicy:
      PackageChargeUnitPolicy;
  };

export type PackageChargeUnitsResult =
  | {
      status: "resolved";
      chargeUnits: number;
      policy:
        Exclude<
          PackageChargeUnitPolicy,
          "unknown"
        >;
    }
  | {
      status: "unknown";
      chargeUnits: null;
      policy: "unknown";
    };

/*
 * Resuelve unidades facturables desde una
 * duración cuya unidad canónica ya son noches.
 *
 * Esta función nunca interpreta cruiseNights
 * como una lista inclusiva de fechas ni resta
 * automáticamente el desembarque.
 *
 * Una política desconocida tampoco presupone
 * que las unidades facturables sean iguales a
 * las noches: conserva explícitamente la duda.
 */
export function resolvePackageChargeUnits(
  input: PackageChargeUnitsInput
): PackageChargeUnitsResult {
  const {
    cruiseNights,
    packageChargeUnitPolicy,
  } = input;

  if (
    packageChargeUnitPolicy ===
    "unknown"
  ) {
    return {
      status: "unknown",
      chargeUnits: null,
      policy: "unknown",
    };
  }

  if (
    packageChargeUnitPolicy ===
    "per-itinerary-day"
  ) {
    return {
      status: "resolved",
      chargeUnits:
        cruiseNights + 1,
      policy:
        packageChargeUnitPolicy,
    };
  }

  /*
   * Para un itinerario estándar de N noches:
   *
   * - cobro por noche = N;
   * - jornadas inclusivas menos desembarque
   *   = (N + 1) - 1 = N.
   *
   * Son reglas comerciales distintas aunque
   * produzcan el mismo número.
   */
  return {
    status: "resolved",
    chargeUnits:
      cruiseNights,
    policy:
      packageChargeUnitPolicy,
  };
}
