import type {
  CruiseLineKey,
} from "@/data/cruiseLines";

import {
  mscContextualPackageRules,
} from "@/data/msc/contextualRules";

import type {
  ContextualPackageRule,
} from "@/lib/contextualPackageRules";

/*
 * REGISTRO CENTRAL DE REGLAS
 * CONTEXTUALES.
 *
 * Cada naviera puede aportar cero o
 * más reglas dependientes de mercado,
 * fecha o versión del paquete.
 */
const contextualRulesByCruiseLine:
  Record<
    CruiseLineKey,
    ContextualPackageRule[]
  > = {
    costa: [],

    msc:
      mscContextualPackageRules,
  };

/*
 * Devuelve exclusivamente las reglas
 * registradas para una naviera.
 */
export function getContextualRulesForCruiseLine(
  cruiseLine: CruiseLineKey
): ContextualPackageRule[] {
  return contextualRulesByCruiseLine[
    cruiseLine
  ];
}
