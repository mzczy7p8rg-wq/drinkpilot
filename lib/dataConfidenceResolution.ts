import type {
  PackageComparisonResult,
} from "@/lib/comparison";

import {
  resolveEconomicDrinkPriceForCurrency,
  type EconomicDrinkPriceSelections,
} from "@/lib/economicDrinkPriceResolution";

import {
  onboardPriceKeys,
  type OnboardPriceKey,
  type PartialOnboardPriceValues,
} from "@/lib/onboardPriceService";

export type PackagePriceConfidenceSource =
  | "user"
  | "reference"
  | "pending";

export type PackageEconomicConfidenceStatus =
  | "available"
  | "waiting-drink-prices"
  | "currency-mismatch"
  | "user-price-required"
  | "disabled";

export type PackageDataConfidence = {
  pricePerDay: number | null;

  currency: string;

  priceSource:
    PackagePriceConfidenceSource;

  economicStatus:
    PackageEconomicConfidenceStatus;

  economicExplanation: string;
};

export type PackageDataConfidenceInput = {
  economicActivation: string;

  customPrice:
    number | null | undefined;

  referencePrice:
    number | null | undefined;

  packageCurrency: string;

  economicCurrency: string;

  economicDataAvailable: boolean;

  comparedPackage?:
    Pick<
      PackageComparisonResult,
      | "packagePricePerDay"
      | "priceSource"
      | "currency"
    >;
};

export type DrinkPriceConfidenceSource =
  | "user"
  | "official"
  | "documented-menu"
  | "reference"
  | "pending";

export type DrinkPriceDataConfidence = {
  category: OnboardPriceKey;

  price: number | null;

  currency: string;

  source:
    DrinkPriceConfidenceSource;
};

function isPositiveNumber(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

function normalizeCurrency(
  value: string
): string {
  return value
    .trim()
    .toUpperCase();
}

export function resolvePackageDataConfidence(
  input:
    PackageDataConfidenceInput
): PackageDataConfidence {
  const comparedPackage =
    input.comparedPackage;

  if (comparedPackage) {
    return {
      pricePerDay:
        comparedPackage
          .packagePricePerDay,

      currency:
        comparedPackage.currency,

      priceSource:
        comparedPackage.priceSource,

      economicStatus:
        "available",

      economicExplanation:
        comparedPackage.priceSource ===
        "user"
          ? "Participa en la comparación con el precio introducido por ti."
          : "Participa en la comparación con el precio de referencia disponible.",
    };
  }

  const customPrice =
    isPositiveNumber(
      input.customPrice
    )
      ? input.customPrice
      : null;

  const referencePrice =
    isPositiveNumber(
      input.referencePrice
    )
      ? input.referencePrice
      : null;

  const hasUsableReference =
    input.economicActivation ===
      "reference-or-user" &&
    referencePrice !== null;

  const pricePerDay =
    customPrice ??
    (hasUsableReference
      ? referencePrice
      : null);

  const priceSource:
    PackagePriceConfidenceSource =
    customPrice !== null
      ? "user"
      : hasUsableReference
        ? "reference"
        : "pending";

  if (
    input.economicActivation ===
    "disabled"
  ) {
    return {
      pricePerDay,
      currency:
        input.packageCurrency,
      priceSource,
      economicStatus:
        "disabled",
      economicExplanation:
        "No participa actualmente en la comparación económica de adultos.",
    };
  }

  if (pricePerDay === null) {
    return {
      pricePerDay: null,
      currency:
        input.packageCurrency,
      priceSource:
        "pending",
      economicStatus:
        "user-price-required",
      economicExplanation:
        "Necesita un precio real introducido por el usuario para participar en la comparación económica.",
    };
  }

  if (
    normalizeCurrency(
      input.packageCurrency
    ) !==
    normalizeCurrency(
      input.economicCurrency
    )
  ) {
    return {
      pricePerDay,
      currency:
        input.packageCurrency,
      priceSource,
      economicStatus:
        "currency-mismatch",
      economicExplanation:
        "El precio está disponible, pero no se compara hasta disponer de una cesta de bebidas en la misma moneda.",
    };
  }

  if (
    !input.economicDataAvailable
  ) {
    return {
      pricePerDay,
      currency:
        input.packageCurrency,
      priceSource,
      economicStatus:
        "waiting-drink-prices",
      economicExplanation:
        "El precio está preparado; la comparación global espera una cesta completa de precios de bebidas.",
    };
  }

  return {
    pricePerDay,
    currency:
      input.packageCurrency,
    priceSource,
    economicStatus:
      "available",
    economicExplanation:
      "El precio está disponible para la comparación económica.",
  };
}

export function resolveDrinkPriceDataConfidence(
  input: {
    economicDrinkPrices:
      PartialOnboardPriceValues;

    economicCurrency: string;

    selectedDrinkPrices:
      EconomicDrinkPriceSelections;
  }
): DrinkPriceDataConfidence[] {
  return onboardPriceKeys.map(
    (category) => {
      const price =
        input.economicDrinkPrices[
          category
        ];

      if (!isPositiveNumber(price)) {
        return {
          category,
          price: null,
          currency:
            input.economicCurrency,
          source:
            "pending" as const,
        };
      }

      const selectedPrice =
        input.selectedDrinkPrices[
          category
        ];

      const selectedEconomicPrice =
        resolveEconomicDrinkPriceForCurrency(
          selectedPrice,
          input.economicCurrency
        );

      const selectedSource =
        selectedEconomicPrice ===
          price &&
        selectedPrice?.source
          ? selectedPrice.source
          : null;

      return {
        category,
        price,
        currency:
          input.economicCurrency,
        source:
          selectedSource ??
          "reference",
      };
    }
  );
}
