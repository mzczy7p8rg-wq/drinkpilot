import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveLegacyCruiseDuration,
} from "@/lib/cruiseDuration";
import {
  resolvePackageChargeUnits,
} from "@/lib/packageChargeUnits";

type DocumentedCruiseDuration = {
  cruiseLine: "costa" | "msc";
  reference: string;
  departureDate: string;
  returnDate: string;
  cruiseNights: number;
  itineraryDays: number;
};

const DAY_IN_MILLISECONDS =
  24 * 60 * 60 * 1000;

/*
 * Evidencia de itinerarios reales utilizada
 * para fijar la semántica de la migración.
 *
 * La diferencia entre fechas representa las
 * noches. El itinerario incluye además la fecha
 * de desembarque y por eso contiene N + 1
 * jornadas/fechas.
 */
const documentedCruises:
  DocumentedCruiseDuration[] = [
  {
    cruiseLine: "costa",
    reference: "BCN07A8U / TO07261214",
    departureDate: "2026-12-14",
    returnDate: "2026-12-21",
    cruiseNights: 7,
    itineraryDays: 8,
  },
  {
    cruiseLine: "costa",
    reference: "HAM07A0C / FA07260920",
    departureDate: "2026-09-20",
    returnDate: "2026-09-27",
    cruiseNights: 7,
    itineraryDays: 8,
  },
  {
    cruiseLine: "costa",
    reference: "RIO09A0K / SE09270110",
    departureDate: "2027-01-10",
    returnDate: "2027-01-19",
    cruiseNights: 9,
    itineraryDays: 10,
  },
  {
    cruiseLine: "costa",
    reference: "BCN12A17 / DI12261019",
    departureDate: "2026-10-19",
    returnDate: "2026-10-31",
    cruiseNights: 12,
    itineraryDays: 13,
  },
  {
    cruiseLine: "costa",
    reference: "TYO51A03 / SE51261018",
    departureDate: "2026-10-18",
    returnDate: "2026-12-08",
    cruiseNights: 51,
    itineraryDays: 52,
  },
  {
    cruiseLine: "costa",
    reference: "TYO65A03 / SE65261018",
    departureDate: "2026-10-18",
    returnDate: "2026-12-22",
    cruiseNights: 65,
    itineraryDays: 66,
  },
  {
    cruiseLine: "msc",
    reference: "UX0G / SE20261012MIAMIA",
    departureDate: "2026-10-12",
    returnDate: "2026-10-16",
    cruiseNights: 4,
    itineraryDays: 5,
  },
  {
    cruiseLine: "msc",
    reference: "UYKV / SX20270206VLCVLC",
    departureDate: "2027-02-06",
    returnDate: "2027-02-13",
    cruiseNights: 7,
    itineraryDays: 8,
  },
  {
    cruiseLine: "msc",
    reference: "UXY9 / MR20261121MIAMIA",
    departureDate: "2026-11-21",
    returnDate: "2026-11-29",
    cruiseNights: 8,
    itineraryDays: 9,
  },
  {
    cruiseLine: "msc",
    reference: "UZOR / MA20270105GOAGOA",
    departureDate: "2027-01-05",
    returnDate: "2027-05-06",
    cruiseNights: 121,
    itineraryDays: 122,
  },
];

function differenceInUtcDays(
  startDate: string,
  endDate: string
): number {
  return (
    (
      Date.parse(`${endDate}T00:00:00Z`) -
      Date.parse(`${startDate}T00:00:00Z`)
    ) /
    DAY_IN_MILLISECONDS
  );
}

describe(
  "documented cruise duration semantics",
  () => {
    it.each(
      documentedCruises
    )(
      "$cruiseLine $reference: representa la duración por noches y no por filas del itinerario",
      (cruise) => {
        expect(
          differenceInUtcDays(
            cruise.departureDate,
            cruise.returnDate
          )
        ).toBe(
          cruise.cruiseNights
        );

        expect(
          cruise.itineraryDays
        ).toBe(
          cruise.cruiseNights + 1
        );

        expect(
          cruise.cruiseNights
        ).not.toBe(
          cruise.itineraryDays
        );
      }
    );
  }
);

/*
 * Contratos de aceptación de la migración activa.
 */
describe(
  "future cruise-night migration acceptance contract",
  () => {
    it(
      "representa Costa BCN07A8U como cruiseNights = 7 sin inventar unidades cuando la política es desconocida",
      () => {
        expect(
          resolvePackageChargeUnits({
            cruiseNights: 7,
            packageChargeUnitPolicy:
              "unknown",
          })
        ).toEqual({
          status: "unknown",
          chargeUnits: null,
          policy: "unknown",
        });
      }
    );

    it(
      "resuelve 7 unidades para Costa BCN07A8U únicamente bajo una política por noche documentada",
      () => {
        expect(
          resolvePackageChargeUnits({
            cruiseNights: 7,
            packageChargeUnitPolicy:
              "per-night",
          })
        ).toEqual({
          status: "resolved",
          chargeUnits: 7,
          policy: "per-night",
        });
      }
    );

    it(
      "mantiene 7 unidades para MSC SX20270206VLCVLC cuando la entrada canónica ya son 7 noches",
      () => {
        expect(
          resolvePackageChargeUnits({
            cruiseNights: 7,
            packageChargeUnitPolicy:
              "per-itinerary-day-excluding-disembarkation",
          })
        ).toEqual({
          status: "resolved",
          chargeUnits: 7,
          policy:
            "per-itinerary-day-excluding-disembarkation",
        });
      }
    );

    it(
      "distingue una política que facture también la jornada de desembarque",
      () => {
        expect(
          resolvePackageChargeUnits({
            cruiseNights: 7,
            packageChargeUnitPolicy:
              "per-itinerary-day",
          })
        ).toEqual({
          status: "resolved",
          chargeUnits: 8,
          policy:
            "per-itinerary-day",
        });
      }
    );

    it(
      "no convierte automáticamente un valor legacy days porque puede contener noches o jornadas",
      () => {
        expect(
          resolveLegacyCruiseDuration(
            8
          )
        ).toEqual({
          status:
            "requires-confirmation",
          cruiseNights: null,
          legacyDays: 8,
        });
      }
    );
  }
);
