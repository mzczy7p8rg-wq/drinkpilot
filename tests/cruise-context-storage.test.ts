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
            sailingDate:
              "2026-08-15",
          })
        ).toEqual({
          market: "ES",
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
            sailingDate:
              "  2026-08-15  ",
          })
        ).toEqual({
          market: "ES",
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
            sailingDate:
              12345,
          })
        ).toEqual({
          market: null,
          sailingDate: null,
        });
      }
    );
  }
);
