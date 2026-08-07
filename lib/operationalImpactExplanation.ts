import type {
  PackageOperationalRuleImpact,
} from "@/lib/operationalRuleImpact";

export type OperationalImpactSeverity =
  | "info"
  | "warning";

export type OperationalImpactExplanation = {
  id: string;

  packageKey:
    PackageOperationalRuleImpact["packageKey"];

  packageName: string;

  severity:
    OperationalImpactSeverity;

  message: string;
};

/*
 * Traduce impactos operativos ya
 * calculados a explicaciones dirigidas
 * al usuario.
 *
 * Esta capa NO decide:
 *
 * - cobertura;
 * - ahorro;
 * - rentabilidad;
 * - recomendación.
 *
 * Solo explica consecuencias que pueden
 * afirmarse a partir de los datos
 * operativos ya resueltos.
 */
export function buildOperationalImpactExplanations(
  impacts:
    PackageOperationalRuleImpact[]
): OperationalImpactExplanation[] {
  const explanations:
    OperationalImpactExplanation[] = [];

  for (const impact of impacts) {
    const evaluation =
      impact.alcoholDailyLimit;

    if (
      evaluation.status !==
      "over-limit"
    ) {
      continue;
    }

    if (
      evaluation.alcoholicDrinksPerDay ===
        null ||
      evaluation.alcoholicDrinksDailyLimit ===
        null ||
      evaluation.excessDrinksPerDay ===
        null
    ) {
      continue;
    }

    explanations.push({
      id:
        `${impact.packageKey}-alcohol-daily-limit-impact`,

      packageKey:
        impact.packageKey,

      packageName:
        impact.packageName,

      severity: "warning",

      message:
        `${impact.packageName}: tu consumo conocido es de ${evaluation.alcoholicDrinksPerDay} bebidas alcohólicas al día y supera en ${evaluation.excessDrinksPerDay} el límite operativo conocido de ${evaluation.alcoholicDrinksDailyLimit} al día. DrinkPilot todavía no aplica este exceso al cálculo económico.`,
    });
  }

  return explanations;
}
