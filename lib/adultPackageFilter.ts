import type {
  PackageOperationalRules,
} from "@/lib/packageRules";

import type {
  PackageKey,
} from "@/lib/packageService";

export type PackageKeyedItem = {
  packageKey: PackageKey;
};

export type PackageCatalogItem = {
  key: PackageKey;
};

function getMinorsOnlyPackageKeys(
  rules: PackageOperationalRules[]
): Set<PackageKey> {
  return new Set(
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
}

/*
 * Filtra estructuras de análisis que
 * utilizan packageKey.
 *
 * Ejemplos:
 *
 * - avisos operativos;
 * - impactos personalizados;
 * - resultados de cobertura.
 */
export function filterAdultPackageItems<
  T extends PackageKeyedItem,
>(
  items: T[],
  rules: PackageOperationalRules[]
): T[] {
  const minorsOnlyPackageKeys =
    getMinorsOnlyPackageKeys(
      rules
    );

  return items.filter(
    (item) =>
      !minorsOnlyPackageKeys.has(
        item.packageKey
      )
  );
}

/*
 * Filtra objetos procedentes del catálogo
 * de paquetes, donde el identificador se
 * expone como key.
 *
 * Se utiliza en vistas adultas como Review,
 * sin eliminar el paquete del catálogo ni
 * de las capas de evidencia.
 */
export function filterAdultCatalogPackages<
  T extends PackageCatalogItem,
>(
  packages: T[],
  rules: PackageOperationalRules[]
): T[] {
  const minorsOnlyPackageKeys =
    getMinorsOnlyPackageKeys(
      rules
    );

  return packages.filter(
    (pkg) =>
      !minorsOnlyPackageKeys.has(
        pkg.key
      )
  );
}
