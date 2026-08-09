import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveStoredWizardPreferences,
} from "@/lib/wizardPreferencesStorage";

describe(
  "stored wizard preferences migration",
  () => {
    it(
      "conserva preferencias booleanas válidas",
      () => {
        expect(
          resolveStoredWizardPreferences({
            alcoholicCocktails: true,
            nonAlcoholicCocktails: false,
            premiumCocktails: true,
            bottledBeer: false,
            premiumSpirits: true,
            bottledWaterDailyAllowance: true,
            bottledWaterUnlimited: false,
          })
        ).toEqual({
          alcoholicCocktails: true,
          nonAlcoholicCocktails: false,
          premiumCocktails: true,
          bottledBeer: false,
          premiumSpirits: true,
          bottledWaterDailyAllowance: true,
          bottledWaterUnlimited: false,
        });
      }
    );

    it(
      "descarta valores almacenados que no son booleanos",
      () => {
        expect(
          resolveStoredWizardPreferences({
            alcoholicCocktails: 1,
            nonAlcoholicCocktails: "true",
            premiumCocktails: null,
            bottledBeer: {},
            premiumSpirits: [],
            bottledWaterDailyAllowance: 1,
            bottledWaterUnlimited: "false",
          })
        ).toEqual({
          alcoholicCocktails: false,
          nonAlcoholicCocktails: false,
          premiumCocktails: false,
          bottledBeer: false,
          premiumSpirits: false,
          bottledWaterDailyAllowance: false,
          bottledWaterUnlimited: false,
        });
      }
    );

    it(
      "hace que el agua ilimitada incluya cobertura diaria",
      () => {
        expect(
          resolveStoredWizardPreferences({
            bottledWaterDailyAllowance: false,
            bottledWaterUnlimited: true,
          })
        ).toMatchObject({
          bottledWaterDailyAllowance: true,
          bottledWaterUnlimited: true,
        });
      }
    );

    it(
      "permite cobertura diaria sin agua ilimitada",
      () => {
        expect(
          resolveStoredWizardPreferences({
            bottledWaterDailyAllowance: true,
            bottledWaterUnlimited: false,
          })
        ).toMatchObject({
          bottledWaterDailyAllowance: true,
          bottledWaterUnlimited: false,
        });
      }
    );

    it(
      "respeta fallbacks válidos y normaliza también su agua",
      () => {
        expect(
          resolveStoredWizardPreferences(
            {},
            {
              alcoholicCocktails: true,
              nonAlcoholicCocktails: true,
              premiumCocktails: false,
              bottledBeer: true,
              premiumSpirits: false,
              bottledWaterDailyAllowance: false,
              bottledWaterUnlimited: true,
            }
          )
        ).toEqual({
          alcoholicCocktails: true,
          nonAlcoholicCocktails: true,
          premiumCocktails: false,
          bottledBeer: true,
          premiumSpirits: false,
          bottledWaterDailyAllowance: true,
          bottledWaterUnlimited: true,
        });
      }
    );
  }
);
