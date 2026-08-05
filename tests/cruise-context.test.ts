import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createCruiseContext,
  isIsoSailingDate,
} from "@/lib/cruiseContext";

describe(
  "cruise context",
  () => {
    it(
      "crea un contexto mínimo sin inventar mercado ni fecha",
      () => {
        expect(
          createCruiseContext(
            "msc"
          )
        ).toEqual({
          cruiseLine: "msc",
          market: null,
          sailingDate: null,
        });
      }
    );

    it(
      "acepta una fecha ISO básica",
      () => {
        expect(
          isIsoSailingDate(
            "2026-08-15"
          )
        ).toBe(true);
      }
    );

    it(
      "rechaza formatos de fecha no ISO",
      () => {
        expect(
          isIsoSailingDate(
            "15/08/2026"
          )
        ).toBe(false);

        expect(
          isIsoSailingDate(
            ""
          )
        ).toBe(false);

        expect(
          isIsoSailingDate(
            null
          )
        ).toBe(false);
      }
    );
  }
);
