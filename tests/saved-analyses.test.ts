import { describe, expect, it } from "vitest";

import {
  createSavedAnalysis,
  duplicateSavedAnalysis,
  formatAnalysisSailingDate,
  parseStoredAnalyses,
  resolveStoredAnalyses,
  serializeSavedAnalyses,
  upsertSavedAnalysis,
} from "@/lib/savedAnalyses";
import type { WizardData } from "@/lib/store";

const data = {
  cruiseLine: "costa",
  market: null,
  sailingRegion: null,
  onboardCurrency: null,
  sailingDate: null,
  days: 7,
  coffee: 1,
  water: 1,
  soda: 0,
  beer: 0,
  wine: 0,
  cocktail: 0,
  alcoholicCocktail: null,
  nonAlcoholicCocktail: null,
  alcoholicCocktails: false,
  nonAlcoholicCocktails: false,
  draftBeer: false,
  premiumCocktails: false,
  bottledBeer: false,
  premiumSpirits: false,
  bottledWaterDailyAllowance: false,
  bottledWaterUnlimited: false,
  customPackagePrices: {},
  packagePriceCurrency: null,
  selectedDrinkPrices: {},
  people: 2,
  adults: 2,
  minors: 0,
} satisfies WizardData;

describe("saved analyses", () => {
  it("formatea la fecha de salida para identificar el crucero", () => {
    expect(formatAnalysisSailingDate("2026-09-15")).toBe("15 sept 2026");
    expect(formatAnalysisSailingDate("sin-fecha")).toBe("sin-fecha");
  });

  it("descarta registros corruptos y elimina ids duplicados", () => {
    const valid = createSavedAnalysis(data, {
      id: "analysis-1",
      now: "2026-08-15T10:00:00.000Z",
    });

    expect(resolveStoredAnalyses([null, {}, valid, valid])).toEqual([valid]);
    expect(
      resolveStoredAnalyses(JSON.parse(serializeSavedAnalyses([valid])))
    ).toEqual([valid]);
    expect(parseStoredAnalyses("{broken-json")).toEqual([]);
  });

  it("actualiza un análisis sin cambiar su fecha de creación", () => {
    const initial = createSavedAnalysis(data, {
      id: "analysis-1",
      now: "2026-08-15T10:00:00.000Z",
    });

    const updated = upsertSavedAnalysis(
      [initial],
      initial.id,
      { ...data, days: 10 },
      "2026-08-15T11:00:00.000Z"
    );

    expect(updated[0].createdAt).toBe(initial.createdAt);
    expect(updated[0].updatedAt).toBe("2026-08-15T11:00:00.000Z");
    expect(updated[0].data.days).toBe(10);
  });

  it("duplica con identidad propia sin compartir los datos", () => {
    const initial = createSavedAnalysis(data, {
      id: "analysis-1",
      now: "2026-08-15T10:00:00.000Z",
    });

    const duplicated = duplicateSavedAnalysis([initial], initial.id, {
      duplicateId: "analysis-2",
      now: "2026-08-15T12:00:00.000Z",
    });

    expect(duplicated).toHaveLength(2);
    expect(duplicated[0].id).toBe("analysis-2");
    expect(duplicated[0].data).toEqual(initial.data);
    expect(duplicated[0].data).not.toBe(initial.data);
  });
});
