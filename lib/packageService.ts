import {
  CruiseLineKey,
  getCruiseLine,
} from "@/data/cruiseLines";

const DEFAULT_CRUISE_LINE:
  CruiseLineKey = "costa";

export type PackageKey =
  keyof ReturnType<
    typeof getCruiseLine
  >["packages"];

/*
 * Devuelve todos los paquetes
 * de la naviera indicada.
 *
 * Mientras el wizard todavía
 * no permita elegir naviera,
 * Costa sigue siendo el valor
 * por defecto.
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
 * Este helper nos permitirá
 * migrar otros módulos sin
 * duplicar el literal "costa".
 */
export function getDefaultCruiseLine():
  CruiseLineKey {
  return DEFAULT_CRUISE_LINE;
}