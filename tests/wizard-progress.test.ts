import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getTotalDrinksPerDay,
  hasValidConsumptionStep,
  resolveWizardRedirect,
} from "@/lib/wizardProgress";

const completeProgress = {
  days: 7,
  coffee: 1,
  water: 1,
  soda: 0,
  beer: 0,
  wine: 0,
  cocktail: 0,
  people: 2,
};

describe("wizard progress", () => {
  it("deriva el consumo diario de las categorías", () => {
    expect(
      getTotalDrinksPerDay(
        completeProgress
      )
    ).toBe(2);
  });

  it("rechaza contadores inseguros y totales que salen del rango seguro", () => {
    expect(
      hasValidConsumptionStep({
        ...completeProgress,
        coffee:
          Number.MAX_SAFE_INTEGER + 1,
      })
    ).toBe(false);

    expect(
      hasValidConsumptionStep({
        ...completeProgress,
        coffee:
          Number.MAX_SAFE_INTEGER,
        water: 1,
      })
    ).toBe(false);
  });

  it("redirige al inicio cuando falta la duración", () => {
    expect(
      resolveWizardRedirect(
        {
          ...completeProgress,
          days: 0,
        },
        "people"
      )
    ).toBe("/wizard");
  });

  it("redirige a consumo cuando todas las categorías están vacías", () => {
    expect(
      resolveWizardRedirect(
        {
          ...completeProgress,
          coffee: 0,
          water: 0,
        },
        "people"
      )
    ).toBe(
      "/wizard/consumption"
    );
  });

  it("redirige a personas cuando su valor no es válido", () => {
    expect(
      resolveWizardRedirect(
        {
          ...completeProgress,
          people: 0,
        },
        "people"
      )
    ).toBe("/wizard/people");
  });

  it("permite cada ruta cuando sus requisitos anteriores están completos", () => {
    expect(
      resolveWizardRedirect(
        {
          ...completeProgress,
          coffee: 0,
          water: 0,
          people: 0,
        },
        "cruise"
      )
    ).toBeNull();

    expect(
      resolveWizardRedirect(
        {
          ...completeProgress,
          people: 0,
        },
        "consumption"
      )
    ).toBeNull();

    expect(
      resolveWizardRedirect(
        completeProgress,
        "people"
      )
    ).toBeNull();
  });
});
