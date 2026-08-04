import {
  cruiseLines,
  DEFAULT_CRUISE_LINE,
  type CruiseLineKey,
  getCruiseLine,
} from "@/data/cruiseLines";

/*
 * CLAVE DE PAQUETE PARA CUALQUIER REGISTRO
 *
 * Este tipo recibe un registro de navieras
 * y construye la unión de TODAS las claves
 * de paquete existentes.
 *
 * Es deliberadamente genérico para que
 * podamos probar la arquitectura sin
 * añadir navieras ficticias al registro
 * real de producción.
 */
export type PackageKeyForRegistry<
  TRegistry extends Record<
    PropertyKey,
    {
      packages: object;
    }
  >
> =
  TRegistry[
    keyof TRegistry
  ] extends infer TCruiseLine
    ? TCruiseLine extends {
        packages:
          infer TPackages;
      }
      ? Extract<
          keyof TPackages,
          string
        >
      : never
    : never;

/*
 * CLAVE UNIVERSAL DE PAQUETE
 *
 * Se calcula automáticamente a partir
 * del registro real de DrinkPilot.
 *
 * Cuando añadamos nuevas navieras,
 * sus packageKeys pasarán a formar
 * parte de PackageKey sin tener que
 * editar este tipo manualmente.
 */
export type PackageKey =
  PackageKeyForRegistry<
    typeof cruiseLines
  >;

/*
 * Devuelve todos los paquetes
 * pertenecientes a la naviera indicada.
 *
 * Si no se especifica una compañía,
 * utiliza la configurada globalmente
 * como naviera por defecto.
 */
export function getAllPackages(
  cruiseLine:
    CruiseLineKey =
      DEFAULT_CRUISE_LINE
) {
  const configuration =
    getCruiseLine(
      cruiseLine
    );

  return Object.entries(
    configuration.packages
  ).map(
    ([key, value]) => ({
      key,
      ...value,
    })
  );
}

/*
 * Devuelve la naviera utilizada
 * actualmente por defecto.
 *
 * Conservamos este helper para que
 * otros módulos no necesiten conocer
 * dónde vive la configuración.
 */
export function getDefaultCruiseLine():
  CruiseLineKey {
  return DEFAULT_CRUISE_LINE;
}