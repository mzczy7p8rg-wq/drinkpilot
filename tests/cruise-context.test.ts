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
          sailingRegion: null,
          onboardCurrency: null,
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

    it(
      "rechaza fechas de calendario imposibles",
      () => {
        expect(
          isIsoSailingDate(
            "2026-02-31"
          )
        ).toBe(false);

        expect(
          isIsoSailingDate(
            "2026-13-01"
          )
        ).toBe(false);

        expect(
          isIsoSailingDate(
            "2026-04-31"
          )
        ).toBe(false);
      }
    );

    it(
      "distingue correctamente los años bisiestos",
      () => {
        expect(
          isIsoSailingDate(
            "2028-02-29"
          )
        ).toBe(true);

        expect(
          isIsoSailingDate(
            "2026-02-29"
          )
        ).toBe(false);

        expect(
          isIsoSailingDate(
            "2100-02-29"
          )
        ).toBe(false);

        expect(
          isIsoSailingDate(
            "2000-02-29"
          )
        ).toBe(true);
      }
    );
  }
);
