import type {
  PackagePricingDayPolicy,
} from "@/lib/packageRules";

export type PackageChargeDaysInput = {
  cruiseDays: number;

  packagePricingDayPolicy:
    PackagePricingDayPolicy;
};

export type PackageChargeDaysResult = {
  chargeDays: number;

  applied: boolean;
};

/*
 * Resuelve cuántos días deben utilizarse
 * para calcular el coste del paquete.
 *
 * Esta función NO modifica los días de
 * consumo del crucero.
 *
 * Política conservadora:
 *
 * - unknown:
 *   conserva todos los días del crucero.
 *
 * - exclude-disembarkation-day:
 *   resta un día únicamente cuando el
 *   crucero tiene más de un día.
 *
 * Nunca devuelve cero días facturables.
 */
export function resolvePackageChargeDays(
  input: PackageChargeDaysInput
): PackageChargeDaysResult {
  const {
    cruiseDays,
    packagePricingDayPolicy,
  } = input;

  if (
    packagePricingDayPolicy ===
      "exclude-disembarkation-day" &&
    cruiseDays > 1
  ) {
    return {
      chargeDays:
        cruiseDays - 1,

      applied: true,
    };
  }

  return {
    chargeDays:
      cruiseDays,

    applied: false,
  };
}
