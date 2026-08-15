import { describe, expect, it } from "vitest";

import {
  createSavedAnalysis,
  duplicateSavedAnalysis,
  formatAnalysisSailingDate,
  parseStoredAnalyses,
  renameSavedAnalysis,
  resolveStoredAnalyses,
  serializeSavedAnalyses,
  sortSavedAnalyses,
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

  it("ordena análisis por actualización más reciente sin mutar la colección", () => {
    const older = createSavedAnalysis(data, {
      id: "older",
      now: "2026-08-13T10:00:00.000Z",
    });

    const newer = createSavedAnalysis(data, {
      id: "newer",
      now: "2026-08-15T10:00:00.000Z",
    });

    const analyses = [older, newer];
    const sorted = sortSavedAnalyses(analyses, "recent");

    expect(sorted.map((analysis) => analysis.id)).toEqual([
      "newer",
      "older",
    ]);
    expect(analyses.map((analysis) => analysis.id)).toEqual([
      "older",
      "newer",
    ]);
  });

  it("ordena por el título visible usando nombre personalizado, barco o naviera", () => {
    const named = createSavedAnalysis(
      {
        ...data,
        cruiseLine: "costa",
        shipName: "Costa Toscana",
      },
      {
        id: "named",
        name: "Viaje familiar",
        now: "2026-08-15T10:00:00.000Z",
      }
    );

    const ship = createSavedAnalysis(
      {
        ...data,
        cruiseLine: "costa",
        shipName: "Costa Smeralda",
      },
      {
        id: "ship",
        now: "2026-08-14T10:00:00.000Z",
      }
    );

    const cruiseLineOnly = createSavedAnalysis(
      {
        ...data,
        cruiseLine: "msc",
        shipName: null,
      },
      {
        id: "cruise-line",
        now: "2026-08-13T10:00:00.000Z",
      }
    );

    const sorted = sortSavedAnalyses(
      [named, cruiseLineOnly, ship],
      "name"
    );

    expect(sorted.map((analysis) => analysis.id)).toEqual([
      "ship",
      "cruise-line",
      "named",
    ]);
  });

  it("ordena por naviera y usa el más reciente como desempate", () => {
    const costaOlder = createSavedAnalysis(
      {
        ...data,
        cruiseLine: "costa",
      },
      {
        id: "costa-older",
        now: "2026-08-13T10:00:00.000Z",
      }
    );

    const costaNewer = createSavedAnalysis(
      {
        ...data,
        cruiseLine: "costa",
      },
      {
        id: "costa-newer",
        now: "2026-08-15T10:00:00.000Z",
      }
    );

    const msc = createSavedAnalysis(
      {
        ...data,
        cruiseLine: "msc",
      },
      {
        id: "msc",
        now: "2026-08-14T10:00:00.000Z",
      }
    );

    const sorted = sortSavedAnalyses(
      [msc, costaOlder, costaNewer],
      "cruise-line"
    );

    expect(sorted.map((analysis) => analysis.id)).toEqual([
      "costa-newer",
      "costa-older",
      "msc",
    ]);
  });

  it("renombra un análisis y restaura después su nombre automático", () => {
    const original = createSavedAnalysis(data, {
      id: "analysis-1",
      now: "2026-08-15T00:00:00.000Z",
    });

    const renamed = renameSavedAnalysis(
      [original],
      "analysis-1",
      "  Crucero familiar septiembre  ",
      "2026-08-15T01:00:00.000Z"
    );

    expect(renamed[0].name).toBe("Crucero familiar septiembre");
    expect(renamed[0].updatedAt).toBe("2026-08-15T01:00:00.000Z");

    const restored = renameSavedAnalysis(
      renamed,
      "analysis-1",
      "   ",
      "2026-08-15T02:00:00.000Z"
    );

    expect(restored[0].name).toBeNull();
  });

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
      name: "Crucero familiar",
      now: "2026-08-15T10:00:00.000Z",
    });

    const duplicated = duplicateSavedAnalysis([initial], initial.id, {
      duplicateId: "analysis-2",
      now: "2026-08-15T12:00:00.000Z",
    });

    expect(duplicated).toHaveLength(2);
    expect(duplicated[0].id).toBe("analysis-2");
    expect(duplicated[0].name).toBe("Crucero familiar (copia)");
    expect(duplicated[0].data).toEqual(initial.data);
    expect(duplicated[0].data).not.toBe(initial.data);
  });
});
