import {
  ComparisonResult,
  PackageComparisonResult,
} from "@/lib/comparison";

import { CoverageCategory } from "@/lib/coverage";

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

const coverageLabels: Record<CoverageCategory, string> = {
  coffee: "café",
  water: "agua",
  soda: "refrescos",
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

function findHighestSavingsPackage(
  packages: PackageComparisonResult[]
) {
  if (packages.length === 0) {
    return null;
  }

  return [...packages].sort(
    (a, b) => b.savings - a.savings
  )[0];
}

function findBestCoveragePackage(
  packages: PackageComparisonResult[]
) {
  if (packages.length === 0) {
    return null;
  }

  return [...packages].sort((a, b) => {
    if (b.coverageScore !== a.coverageScore) {
      return b.coverageScore - a.coverageScore;
    }

    return b.savings - a.savings;
  })[0];
}

function getUnquantifiedThresholdDrinks(
  comparison: ComparisonResult,
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

  return (
    thresholdImpact?.cruiseImpact
      .drinksAboveThreshold ?? 0
  );
}

function buildThresholdUncertaintyExplanation(
  packageName: string,
  savings: number,
  affectedDrinks: number
): RecommendationExplanation {
  return {
    title:
      `${packageName} es la mejor opción provisional`,

    summary:
      `Con los costes que DrinkPilot puede cuantificar actualmente, este paquete presenta un ahorro teórico de ${savings.toFixed(
        2
      )} € durante el crucero.`,

    reason:
      `${affectedDrinks} ${
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
  comparison: ComparisonResult
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
    const affectedThresholdDrinks =
      getUnquantifiedThresholdDrinks(
        comparison,
        bestPackage.packageKey
      );

    if (affectedThresholdDrinks > 0) {
      return buildThresholdUncertaintyExplanation(
        bestPackage.packageName,
        bestPackage.savings,
        affectedThresholdDrinks
      );
    }

    const highestSavingsPackage =
      findHighestSavingsPackage(packages);

    /*
     * El mejor paquete también es
     * el que más ahorro genera.
     */
    if (
      highestSavingsPackage &&
      highestSavingsPackage.packageKey ===
        bestPackage.packageKey
    ) {
      return {
        title:
          `${bestPackage.packageName} es la mejor opción para tu perfil`,

        summary:
          `Cubre todo lo que has indicado y podría ahorrarte aproximadamente ${bestPackage.savings.toFixed(
            2
          )} € durante el crucero.`,

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
      highestSavingsPackage &&
      highestSavingsPackage.savings >
        bestPackage.savings &&
      !highestSavingsPackage.fullyCovered
    ) {
      const missing =
        formatCategories(
          highestSavingsPackage.uncoveredCategories
        );

      return {
        title:
          `${bestPackage.packageName} encaja mejor con lo que buscas`,

        summary:
          `Aunque ${highestSavingsPackage.packageName} tendría un ahorro económico mayor, no cubre completamente tus preferencias.`,

        reason:
          `${bestPackage.packageName} cubre el 100 % de lo solicitado y mantiene un ahorro estimado de ${bestPackage.savings.toFixed(
            2
          )} €.`,

        secondaryReason:
          `${highestSavingsPackage.packageName} deja fuera: ${missing}.`,

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
        `Su ahorro estimado es de ${bestPackage.savings.toFixed(
          2
        )} € y su cobertura es del ${bestPackage.coverageScore.toFixed(
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
    const bestCoveredPackage =
      [...fullyCoveredPackages].sort(
        (a, b) => b.savings - a.savings
      )[0];

    /*
     * EMPATE ECONÓMICO
     *
     * Si la diferencia es inferior a medio céntimo,
     * la tratamos como empate para evitar mensajes
     * incorrectos provocados por decimales.
     */
    const isEconomicTie =
      Math.abs(bestCoveredPackage.savings) <
      0.005;

    if (isEconomicTie) {
      return {
        title:
          "El paquete y las bebidas por separado quedan prácticamente empatados",

        summary:
          `${bestCoveredPackage.packageName} cubre completamente lo que has indicado y ambas opciones cuestan aproximadamente lo mismo.`,

        reason:
          "Con esta estimación no existe un ahorro económico claro al contratar el paquete.",

        secondaryReason:
          "En este caso puedes decidir en función de la comodidad del paquete y de las condiciones concretas de tu crucero.",

        tone: "neutral",
      };
    }

    /*
     * Existe al menos un paquete que
     * cubre completamente al usuario,
     * pero económicamente cuesta más.
     */
    const extraCost =
      Math.abs(bestCoveredPackage.savings);

    return {
      title:
        "Tus preferencias están cubiertas, pero el paquete no compensa",

      summary:
        `${bestCoveredPackage.packageName} cubre completamente lo que has indicado, pero pagar las bebidas por separado sigue siendo más económico.`,

      reason:
        `Con esta estimación, ${bestCoveredPackage.packageName} costaría aproximadamente ${extraCost.toFixed(
          2
        )} € más que comprar las bebidas por separado.`,

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