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
  cruiseNights: 7,
  coffee: 1,
  water: 1,
  soda: 0,
  beer: 0,
  wine: 0,
  cocktail: 0,
  consumptionConfirmed: true,
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
          cruiseNights: null,
        },
        "people"
      )
    ).toBe("/wizard");
  });

  it("acepta un consumo total de cero", () => {
    expect(
      resolveWizardRedirect(
        {
          ...completeProgress,
          coffee: 0,
          water: 0,
        },
        "people"
      )
    ).toBeNull();

    expect(
      hasValidConsumptionStep({
        ...completeProgress,
        coffee: 0,
        water: 0,
      })
    ).toBe(true);
  });

  it("no confunde el estado inicial a cero con un consumo confirmado", () => {
    expect(
      resolveWizardRedirect(
        {
          ...completeProgress,
          coffee: 0,
          water: 0,
          consumptionConfirmed: false,
        },
        "people"
      )
    ).toBe("/wizard/consumption");
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

  it("prioriza viajeros cuando también faltan crucero y consumo", () => {
    expect(
      resolveWizardRedirect(
        {
          ...completeProgress,
          people: 0,
          cruiseNights: null,
          coffee: -1,
        },
        "people"
      )
    ).toBe("/wizard/people");
  });

  it("permite cada ruta cuando sus requisitos anteriores están completos", () => {
    expect(
      resolveWizardRedirect(
        completeProgress,
        "cruise"
      )
    ).toBe("/wizard/people");

    expect(
      resolveWizardRedirect(
        completeProgress,
        "consumption"
      )
    ).toBe("/wizard/people");

    expect(
      resolveWizardRedirect(
        completeProgress,
        "people"
      )
    ).toBeNull();
  });
});
