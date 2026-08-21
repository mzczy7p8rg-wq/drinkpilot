import {
  type PackageComparisonResult,
  type PackageThresholdCruiseImpactResult,
} from "@/lib/comparison";

import { CoverageCategory } from "@/lib/coverage";
import { formatCurrency } from "@/lib/currencyFormatting";

export type RecommendationExplanation = {
  title: string;

  summary: string;

  reason: string;

  secondaryReason?: string;

  tone:
    | "positive"
    | "neutral"
    | "warning";
};

type RecommendationPackage =
  Omit<
    Partial<PackageComparisonResult>,
    | "packageKey"
    | "effectiveSavings"
  > & {
    packageKey: string;

    packageName: string;

    savings: number;

    effectiveSavings:
      number | null;

    coverageScore: number;

    fullyCovered: boolean;

    uncoveredCategories:
      CoverageCategory[];
  };

type RecommendationThresholdImpact =
  Omit<
    Partial<PackageThresholdCruiseImpactResult>,
    "packageKey" | "cruiseImpact"
  > & {
    packageKey: string;

    cruiseImpact:
      Partial<
        PackageThresholdCruiseImpactResult[
          "cruiseImpact"
        ]
      > &
        Pick<
          PackageThresholdCruiseImpactResult[
            "cruiseImpact"
          ],
          | "status"
          | "drinksAboveThreshold"
        >;
  };

export type RecommendationComparison = {
  packages:
    RecommendationPackage[];

  bestPackage:
    RecommendationPackage | null;

  thresholdCruiseImpacts:
    RecommendationThresholdImpact[];
};

const coverageLabels: Record<CoverageCategory, string> = {
  coffee: "café",
  water: "agua",
  soda: "refrescos",
  juice: "zumos",
  beer: "cerveza",
  wine: "vino",
  cocktail: "cócteles",

  alcoholicCocktails:
    "cócteles con alcohol",

  nonAlcoholicCocktails:
    "cócteles sin alcohol",

  premiumCocktails:
    "cócteles premium",

  bottledBeer:
    "cerveza embotellada",

  premiumSpirits:
    "destilados premium",

  bottledWaterDailyAllowance:
    "una botella de agua diaria",

  bottledWaterUnlimited:
    "agua embotellada sin límite",
};

function formatCategories(
  categories: CoverageCategory[]
) {
  return categories
    .map((category) => coverageLabels[category])
    .join(", ");
}

function getEffectiveSavings(
  pkg: RecommendationPackage
): number | null {
  return pkg.effectiveSavings;
}

function findHighestSavingsPackage(
  packages: RecommendationPackage[]
) {
  const comparablePackages =
    packages.filter(
      (pkg) =>
        getEffectiveSavings(pkg) !== null
    );

  if (comparablePackages.length === 0) {
    return null;
  }

  return [...comparablePackages].sort(
    (a, b) =>
      (getEffectiveSavings(b) ?? -Infinity) -
      (getEffectiveSavings(a) ?? -Infinity)
  )[0];
}

function findHighestGrossSavingsPackage(
  packages: RecommendationPackage[]
) {
  if (packages.length === 0) {
    return null;
  }

  return [...packages].sort(
    (a, b) =>
      b.savings -
      a.savings
  )[0];
}

function findBestCoveragePackage(
  packages: RecommendationPackage[]
) {
  if (packages.length === 0) {
    return null;
  }

  return [...packages].sort((a, b) => {
    if (b.coverageScore !== a.coverageScore) {
      return b.coverageScore - a.coverageScore;
    }

    return (
      (getEffectiveSavings(b) ?? -Infinity) -
      (getEffectiveSavings(a) ?? -Infinity)
    );
  })[0];
}

function getUnquantifiedThresholdImpact(
  comparison: RecommendationComparison,
  packageKey: string
) {
  const thresholdImpact =
    comparison.thresholdCruiseImpacts.find(
      (item) =>
        item.packageKey === packageKey &&
        item.cruiseImpact.status ===
          "known-unquantified" &&
        item.cruiseImpact.drinksAboveThreshold !==
          null &&
        item.cruiseImpact.drinksAboveThreshold > 0
    );

  return thresholdImpact?.cruiseImpact ?? null;
}

function buildThresholdUncertaintyExplanation(
  packageName: string,
  savings: number,
  currency: string,
  affectedDrinks: number,
  excludedDrinks: number | null
): RecommendationExplanation {
  return {
    title:
      `${packageName} es la mejor opción provisional`,

    summary:
      `Con los costes que DrinkPilot puede cuantificar actualmente, este paquete presenta un ahorro teórico de ${formatCurrency(
        savings,
        currency
      )} durante el crucero.`,

    reason:
      excludedDrinks !== null &&
      excludedDrinks > 0
        ? `${excludedDrinks} ${
            excludedDrinks === 1
              ? "consumición prevista queda"
              : "consumiciones previstas quedan"
          } fuera de cobertura por superar el límite de precio conocido del paquete.`
        : `${affectedDrinks} ${
            affectedDrinks === 1
              ? "consumición prevista supera"
              : "consumiciones previstas superan"
          } el límite de precio conocido del paquete.`,

    secondaryReason:
      "El coste adicional de esas consumiciones todavía no puede cuantificarse de forma fiable, por lo que el ahorro mostrado no debe interpretarse como definitivo.",

    tone: "warning",
  };
}

export function buildRecommendationExplanation(
  comparison: RecommendationComparison
): RecommendationExplanation {
  const {
    packages,
    bestPackage,
  } = comparison;

  /*
   * CASO 1
   *
   * Existe una opción que:
   * - cubre completamente el perfil
   * - genera ahorro positivo
   */
  if (bestPackage) {
    const thresholdImpact =
      getUnquantifiedThresholdImpact(
        comparison,
        bestPackage.packageKey
      );

    const affectedThresholdDrinks =
      thresholdImpact?.drinksAboveThreshold ?? 0;

    const excludedThresholdDrinks =
      thresholdImpact?.drinksExcludedFromCoverage ??
      null;

    if (affectedThresholdDrinks > 0) {
      return buildThresholdUncertaintyExplanation(
        bestPackage.packageName,
        bestPackage.savings,
        bestPackage.currency ?? "EUR",
        affectedThresholdDrinks,
        excludedThresholdDrinks
      );
    }

    const highestSavingsPackage =
      findHighestSavingsPackage(packages);

    /*
     * Se usa únicamente para explicar
     * alternativas con mayor ahorro bruto
     * pero cobertura incompleta.
     *
     * NO gobierna la recomendación final.
     */
    const highestGrossSavingsPackage =
      findHighestGrossSavingsPackage(
        packages
      );

    /*
     * El mejor paquete también es
     * el que más ahorro genera.
     */
    if (
      highestSavingsPackage &&
      highestSavingsPackage.packageKey ===
        bestPackage.packageKey &&
      !(
        highestGrossSavingsPackage &&
        highestGrossSavingsPackage.savings >
          bestPackage.savings &&
        !highestGrossSavingsPackage
          .fullyCovered
      )
    ) {
      return {
        title:
          `${bestPackage.packageName} es la mejor opción para tu perfil`,

        summary:
          `Cubre todo lo que has indicado y podría ahorrarte aproximadamente ${formatCurrency(
            bestPackage.effectiveSavings ?? bestPackage.savings,
            bestPackage.currency ?? "EUR"
          )} durante el crucero.`,

        reason:
          `Además de ofrecer una cobertura del ${bestPackage.coverageScore.toFixed(
            0
          )} %, es también el paquete con mejor resultado económico entre las opciones analizadas.`,

        tone: "positive",
      };
    }

    /*
     * Hay otro paquete que ahorra más,
     * pero no cubre completamente
     * lo solicitado.
     */
    if (
      highestGrossSavingsPackage &&
      highestGrossSavingsPackage.savings >
        bestPackage.savings &&
      !highestGrossSavingsPackage.fullyCovered
    ) {
      const missing =
        formatCategories(
          highestGrossSavingsPackage
            .uncoveredCategories
        );

      return {
        title:
          `${bestPackage.packageName} encaja mejor con lo que buscas`,

        summary:
          `${highestGrossSavingsPackage.packageName} puede parecer más favorable antes de descontar las bebidas que deja fuera, pero no cubre completamente tus preferencias.`,

        reason:
          `${bestPackage.packageName} cubre el 100 % de lo solicitado y mantiene un ahorro efectivo estimado de ${formatCurrency(
            bestPackage.effectiveSavings ?? bestPackage.savings,
            bestPackage.currency ?? "EUR"
          )}.`,

        secondaryReason:
          `${highestGrossSavingsPackage.packageName} deja fuera: ${missing}.`,

        tone: "positive",
      };
    }

    /*
     * Fallback por si en el futuro aparecen
     * más paquetes o configuraciones.
     */
    return {
      title:
        `${bestPackage.packageName} es nuestra recomendación`,

      summary:
        "Es la opción que combina cobertura completa y ahorro positivo para tu perfil.",

      reason:
        `Su ahorro efectivo estimado es de ${formatCurrency(
          bestPackage.effectiveSavings ?? bestPackage.savings,
          bestPackage.currency ?? "EUR"
        )} y su cobertura es del ${bestPackage.coverageScore.toFixed(
          0
        )} %.`,

      tone: "positive",
    };
  }

  /*
   * CASO 2
   *
   * Ningún paquete cumple simultáneamente:
   * - cobertura completa
   * - ahorro positivo
   */
  const fullyCoveredPackages =
    packages.filter(
      (pkg) => pkg.fullyCovered
    );

  if (fullyCoveredPackages.length > 0) {
    const comparableCoveredPackages =
      fullyCoveredPackages.filter(
        (pkg) =>
          pkg.effectiveSavings !== null
      );

    /*
     * Si ningún paquete completamente cubierto
     * tiene un ahorro efectivo cuantificable,
     * no debemos afirmar empate ni sobrecoste.
     */
    if (
      comparableCoveredPackages.length === 0
    ) {
      const bestCoveredPackage =
        [...fullyCoveredPackages].sort(
          (a, b) =>
            b.savings -
            a.savings
        )[0];

      return {
        title:
          "Tus preferencias están cubiertas, pero el resultado económico no es definitivo",

        summary:
          `${bestCoveredPackage.packageName} cubre completamente lo que has indicado, pero todavía existen costes que DrinkPilot no puede cuantificar con suficiente fiabilidad.`,

        reason:
          `El ahorro bruto calculado es de ${formatCurrency(
            bestCoveredPackage.savings,
            bestCoveredPackage.currency ?? "EUR"
          )}, pero no debe interpretarse como ahorro final.`,

        secondaryReason:
          "Por eso DrinkPilot no recomienda contratar el paquete únicamente por motivos económicos hasta poder cerrar esos costes pendientes.",

        tone: "warning",
      };
    }

    const bestCoveredPackage =
      [...comparableCoveredPackages].sort(
        (a, b) =>
          (b.effectiveSavings ?? -Infinity) -
          (a.effectiveSavings ?? -Infinity)
      )[0];

    const effectiveSavings =
      bestCoveredPackage.effectiveSavings;

    if (effectiveSavings === null) {
      throw new Error(
        "Unexpected null effectiveSavings"
      );
    }

    /*
     * EMPATE ECONÓMICO
     *
     * Si la diferencia efectiva es inferior
     * a medio céntimo, la tratamos como empate.
     */
    const isEconomicTie =
      Math.abs(effectiveSavings) <
      0.005;

    if (isEconomicTie) {
      return {
        title:
          "El paquete y las bebidas por separado quedan prácticamente empatados",

        summary:
          `${bestCoveredPackage.packageName} cubre completamente lo que has indicado y ambas opciones cuestan aproximadamente lo mismo.`,

        reason:
          "Con esta estimación no existe un ahorro económico efectivo claro al contratar el paquete.",

        secondaryReason:
          "En este caso puedes decidir en función de la comodidad del paquete y de las condiciones concretas de tu crucero.",

        tone: "neutral",
      };
    }

    /*
     * Existe al menos un paquete que
     * cubre completamente al usuario,
     * pero su ahorro efectivo no es positivo.
     */
    const extraCost =
      Math.abs(effectiveSavings);

    const includedPackage = packages.find(
      (pkg) => pkg.priceSource === "included"
    );
    const includedEffectiveSavings = includedPackage
      ? getEffectiveSavings(includedPackage)
      : null;

    if (
      includedPackage &&
      includedEffectiveSavings !== null &&
      includedPackage.packageKey !== bestCoveredPackage.packageKey &&
      includedEffectiveSavings > effectiveSavings
    ) {
      const upgradeExtraCost =
        includedEffectiveSavings - effectiveSavings;

      return {
        title:
          `Mantener ${includedPackage.packageName} es más económico que mejorar`,

        summary:
          `${bestCoveredPackage.packageName} cubre completamente lo que has indicado, pero mantener ${includedPackage.packageName} y pagar solo las bebidas que deja fuera cuesta menos.`,

        reason:
          `Con esta estimación, el upgrade a ${bestCoveredPackage.packageName} costaría aproximadamente ${formatCurrency(
            upgradeExtraCost,
            bestCoveredPackage.currency ?? "EUR"
          )} más.`,

        secondaryReason:
          "Por eso DrinkPilot recomienda conservar el paquete que ya tienes incluido.",

        tone: "warning",
      };
    }

    return {
      title:
        "Tus preferencias están cubiertas, pero el paquete no compensa",

      summary:
        `${bestCoveredPackage.packageName} cubre completamente lo que has indicado, pero pagar las bebidas por separado sigue siendo más económico.`,

      reason:
        `Con esta estimación, ${bestCoveredPackage.packageName} costaría aproximadamente ${formatCurrency(
          extraCost,
          bestCoveredPackage.currency ?? "EUR"
        )} más que comprar las bebidas por separado.`,

      secondaryReason:
        "Por eso DrinkPilot no recomienda contratarlo únicamente por motivos económicos.",

      tone: "warning",
    };
  }

  /*
   * CASO 3
   *
   * Ningún paquete cubre completamente
   * el perfil solicitado.
   */
  const bestCoveragePackage =
    findBestCoveragePackage(packages);

  if (bestCoveragePackage) {
    const missing =
      formatCategories(
        bestCoveragePackage.uncoveredCategories
      );

    return {
      title:
        "Ningún paquete cubre completamente tu perfil",

      summary:
        `${bestCoveragePackage.packageName} es la opción que más se aproxima, con una cobertura del ${bestCoveragePackage.coverageScore.toFixed(
          0
        )} %.`,

      reason:
        missing
          ? `Quedarían fuera estas preferencias o categorías: ${missing}.`
          : "No existe actualmente una opción con cobertura completa.",

      secondaryReason:
        "En este caso conviene revisar las condiciones concretas del crucero antes de contratar.",

      tone: "neutral",
    };
  }

  /*
   * CASO DE SEGURIDAD
   */
  return {
    title:
      "No hemos podido generar una recomendación",

    summary:
      "No hay suficientes paquetes disponibles para realizar una comparación.",

    reason:
      "Revisa los datos disponibles e inténtalo de nuevo.",

    tone: "neutral",
  };
}
