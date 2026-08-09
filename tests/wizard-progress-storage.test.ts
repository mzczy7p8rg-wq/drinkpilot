import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveStoredWizardProgress,
} from "@/lib/wizardProgressStorage";

describe(
  "stored wizard progress migration",
  () => {
    it(
      "conserva los contadores enteros válidos",
      () => {
        expect(
          resolveStoredWizardProgress({
            days: 7,
            coffee: 2,
            water: 3,
            soda: 1,
            beer: 2,
            wine: 1,
            people: 4,
          })
        ).toEqual({
          days: 7,
          coffee: 2,
          water: 3,
          soda: 1,
          beer: 2,
          wine: 1,
          people: 4,
        });
      }
    );

    it(
      "conserva cero como estado vacío de días y bebidas",
      () => {
        expect(
          resolveStoredWizardProgress({
            days: 0,
            coffee: 0,
            water: 0,
            soda: 0,
            beer: 0,
            wine: 0,
            people: 1,
          })
        ).toEqual({
          days: 0,
          coffee: 0,
          water: 0,
          soda: 0,
          beer: 0,
          wine: 0,
          people: 1,
        });
      }
    );

    it(
      "descarta negativos, decimales, no finitos y tipos incorrectos",
      () => {
        expect(
          resolveStoredWizardProgress({
            days: -7,
            coffee: 1.5,
            water: Number.POSITIVE_INFINITY,
            soda: "2",
            beer: -1,
            wine: null,
            people: 0,
          })
        ).toEqual({
          days: 0,
          coffee: 0,
          water: 0,
          soda: 0,
          beer: 0,
          wine: 0,
          people: 1,
        });
      }
    );

    it(
      "respeta fallbacks explícitos durante una migración",
      () => {
        expect(
          resolveStoredWizardProgress(
            {
              days: "7",
              people: -2,
            },
            {
              days: 3,
              coffee: 1,
              water: 1,
              soda: 1,
              beer: 1,
              wine: 1,
              people: 2,
            }
          )
        ).toEqual({
          days: 3,
          coffee: 1,
          water: 1,
          soda: 1,
          beer: 1,
          wine: 1,
          people: 2,
        });
      }
    );
  }
);
