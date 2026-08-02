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

  premiumCocktails: "cócteles premium",
  bottledBeer: "cerveza embotellada",
  premiumSpirits: "destilados premium",
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
     *
     * Este es el caso típico de:
     * My Drinks vs My Drinks Plus
     * cuando existen preferencias premium.
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
        `Es la opción que combina cobertura completa y ahorro positivo para tu perfil.`,

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

  /*
   * Existe al menos un paquete que
   * cubre completamente al usuario,
   * pero económicamente no compensa.
   *
   * Caso típico QA-4.
   */
  if (fullyCoveredPackages.length > 0) {
    const bestCoveredPackage =
      [...fullyCoveredPackages].sort(
        (a, b) => b.savings - a.savings
      )[0];

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