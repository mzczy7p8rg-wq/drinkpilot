import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveStoredCruiseContext,
} from "@/lib/cruiseContextStorage";

describe(
  "stored cruise context migration",
  () => {
    it(
      "migra una sesión antigua sin contexto a null",
      () => {
        expect(
          resolveStoredCruiseContext(
            {}
          )
        ).toEqual({
          market: null,
          sailingRegion: null,
          sailingDate: null,
        });
      }
    );

    it(
      "conserva el contexto de una sesión moderna",
      () => {
        expect(
          resolveStoredCruiseContext({
            market: "ES",
            sailingRegion: "MED",
            sailingDate:
              "2026-08-15",
          })
        ).toEqual({
          market: "ES",
          sailingRegion: "MED",
          sailingDate:
            "2026-08-15",
        });
      }
    );

    it(
      "normaliza espacios accidentales",
      () => {
        expect(
          resolveStoredCruiseContext({
            market:
              "  ES  ",
            sailingRegion:
              "  MED  ",
            sailingDate:
              "  2026-08-15  ",
          })
        ).toEqual({
          market: "ES",
          sailingRegion: "MED",
          sailingDate:
            "2026-08-15",
        });
      }
    );

    it(
      "descarta valores vacíos o de tipo incorrecto",
      () => {
        expect(
          resolveStoredCruiseContext({
            market: "   ",
            sailingRegion: [],
            sailingDate:
              12345,
          })
        ).toEqual({
          market: null,
          sailingRegion: null,
          sailingDate: null,
        });
      }
    );
  }
);
