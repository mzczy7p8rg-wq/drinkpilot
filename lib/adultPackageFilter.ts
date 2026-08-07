import type {
  PackageOperationalRules,
} from "@/lib/packageRules";

import type {
  PackageKey,
} from "@/lib/packageService";

export type PackageKeyedItem = {
  packageKey: PackageKey;
};

/*
 * El flujo actual de DrinkPilot analiza
 * paquetes adultos.
 *
 * Este helper centraliza la exclusión de
 * cualquier elemento asociado a paquetes
 * marcados como minorsOnly.
 *
 * Puede utilizarse con:
 *
 * - avisos operativos;
 * - impactos personalizados;
 * - futuras explicaciones;
 * - cualquier estructura con packageKey.
 */
export function filterAdultPackageItems<
  T extends PackageKeyedItem,
>(
  items: T[],
  rules: PackageOperationalRules[]
): T[] {
  const minorsOnlyPackageKeys =
    new Set(
      rules
        .filter(
          (rule) =>
            rule.minorsOnly
        )
        .map(
          (rule) =>
            rule.packageKey
        )
    );

  return items.filter(
    (item) =>
      !minorsOnlyPackageKeys.has(
        item.packageKey
      )
  );
}
