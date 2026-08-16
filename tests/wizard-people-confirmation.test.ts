import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveStoredWizardProgress,
} from "@/lib/wizardProgressStorage";

import {
  resolveWizardRedirect,
} from "@/lib/wizardProgress";

describe(
  "wizard people confirmation",
  () => {
    it(
      "no considera completado Personas cuando una sesión guardada no contiene ese dato",
      () => {
        const restored =
          resolveStoredWizardProgress({
            coffee: 1,
            water: 0,
            soda: 0,
            beer: 0,
            wine: 0,

            /*
             * La sesión nunca confirmó
             * el paso Personas.
             */
          });

        const redirect =
          resolveWizardRedirect(
            {
              ...restored,
              cruiseNights: 7,
              cocktail: 0,
              consumptionConfirmed: true,
            },
            "people"
          );

        expect(
          redirect
        ).toBe(
          "/wizard/people"
        );
      }
    );
  }
);
