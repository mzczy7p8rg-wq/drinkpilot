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
            coffee: 2,
            water: 3,
            soda: 1,
            juice: 2,
            beer: 2,
            wine: 1,
            people: 4,
          })
        ).toEqual({
          coffee: 2,
          water: 3,
          soda: 1,
          juice: 2,
          beer: 2,
          wine: 1,
          people: 4,
        });
      }
    );

    it(
      "conserva cero como estado vacío de bebidas",
      () => {
        expect(
          resolveStoredWizardProgress({
            coffee: 0,
            water: 0,
            soda: 0,
            juice: 0,
            beer: 0,
            wine: 0,
            people: 1,
          })
        ).toEqual({
          coffee: 0,
          water: 0,
          soda: 0,
          juice: 0,
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
            coffee: 1.5,
            water: Number.POSITIVE_INFINITY,
            soda: "2",
            juice: -2,
            beer: -1,
            wine: null,
            people: 0,
          })
        ).toEqual({
          coffee: 0,
          water: 0,
          soda: 0,
          juice: 0,
          beer: 0,
          wine: 0,
          people: 0,
        });
      }
    );

    it(
      "descarta enteros que superan el rango seguro de JavaScript",
      () => {
        const unsafeInteger =
          Number.MAX_SAFE_INTEGER + 1;

        expect(
          resolveStoredWizardProgress({
            coffee: unsafeInteger,
            water: 1,
            soda: 0,
            juice: unsafeInteger,
            beer: 0,
            wine: 0,
            people: unsafeInteger,
          })
        ).toEqual({
          coffee: 0,
          water: 1,
          soda: 0,
          juice: 0,
          beer: 0,
          wine: 0,
          people: 0,
        });
      }
    );

    it(
      "descarta valores que superan los límites del dominio",
      () => {
        expect(
          resolveStoredWizardProgress({
            coffee: 101,
            water: 1,
            soda: 0,
            juice: 101,
            beer: 0,
            wine: 0,
            people: 101,
          })
        ).toEqual({
          coffee: 0,
          water: 1,
          soda: 0,
          juice: 0,
          beer: 0,
          wine: 0,
          people: 0,
        });
      }
    );

    it(
      "respeta fallbacks explícitos durante una migración",
      () => {
        expect(
          resolveStoredWizardProgress(
            {
              people: -2,
            },
            {
              coffee: 1,
              water: 1,
              soda: 1,
              juice: 1,
              beer: 1,
              wine: 1,
              people: 2,
            }
          )
        ).toEqual({
          coffee: 1,
          water: 1,
          soda: 1,
          juice: 1,
          beer: 1,
          wine: 1,
          people: 2,
        });
      }
    );

    it(
      "sustituye también fallbacks inseguros por valores iniciales válidos",
      () => {
        const unsafeInteger =
          Number.MAX_SAFE_INTEGER + 1;

        expect(
          resolveStoredWizardProgress(
            {},
            {
              coffee: unsafeInteger,
              water: unsafeInteger,
              soda: unsafeInteger,
              juice: unsafeInteger,
              beer: unsafeInteger,
              wine: unsafeInteger,
              people: unsafeInteger,
            }
          )
        ).toEqual({
          coffee: 0,
          water: 0,
          soda: 0,
          juice: 0,
          beer: 0,
          wine: 0,
          people: 0,
        });
      }
    );
  }
);
