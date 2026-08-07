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

  operationalMessage: string;

  economicMessage:
    string | null;
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
 * La consecuencia operativa y el grado
 * de conocimiento económico se mantienen
 * separados explícitamente.
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

    let economicMessage:
      string | null = null;

    if (
      impact.economicImpact.status ===
      "known-unquantified"
    ) {
      economicMessage =
        "Existe un impacto económico potencial asociado a este exceso, pero los datos disponibles no permiten cuantificarlo de forma fiable. DrinkPilot no lo incorpora todavía al cálculo económico.";
    }

    explanations.push({
      id:
        `${impact.packageKey}-alcohol-daily-limit-impact`,

      packageKey:
        impact.packageKey,

      packageName:
        impact.packageName,

      severity: "warning",

      operationalMessage:
        `${impact.packageName}: tu consumo conocido es de ${evaluation.alcoholicDrinksPerDay} bebidas alcohólicas al día y supera en ${evaluation.excessDrinksPerDay} el límite operativo conocido de ${evaluation.alcoholicDrinksDailyLimit} al día.`,

      economicMessage,
    });
  }

  return explanations;
}
