import type {
  ContextualPackageRule,
} from "@/lib/contextualPackageRules";

/*
 * REGLAS CONTEXTUALES MSC
 *
 * Este registro contiene exclusivamente
 * reglas cuya aplicación depende de un
 * contexto concreto, por ejemplo:
 *
 * - mercado;
 * - región;
 * - fecha de navegación;
 * - versión temporal de un paquete.
 *
 * IMPORTANTE
 *
 * Una regla solo debe añadirse aquí cuando
 * exista evidencia suficiente para definir
 * explícitamente el contexto en el que
 * resulta válida.
 *
 * No utilizamos este archivo para convertir
 * observaciones parciales en reglas
 * universales.
 */
export const mscContextualPackageRules:
  ContextualPackageRule[] = [];
