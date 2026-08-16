import {
  describe,
  expect,
  it,
} from "vitest";

import {
  CURRENT_WIZARD_STORAGE_VERSION,
  resolveStoredCruiseDuration,
} from "@/lib/cruiseDurationStorage";

describe(
  "cruise duration storage migration",
  () => {
    it(
      "hidrata cruiseNights cuando procede del esquema actual",
      () => {
        expect(
          resolveStoredCruiseDuration({
            storageSchemaVersion:
              CURRENT_WIZARD_STORAGE_VERSION,
            cruiseNights: 7,
            days: 8,
          })
        ).toEqual({
          cruiseNights: 7,
          legacyDays: null,
          requiresConfirmation:
            false,
        });
      }
    );

    it(
      "no convierte los 8 días de una sesión legacy en 7 noches",
      () => {
        expect(
          resolveStoredCruiseDuration({
            days: 8,
          })
        ).toEqual({
          cruiseNights: null,
          legacyDays: 8,
          requiresConfirmation:
            true,
        });
      }
    );

    it(
      "no confía en cruiseNights sin una versión que declare su semántica",
      () => {
        expect(
          resolveStoredCruiseDuration({
            cruiseNights: 7,
            days: 8,
          })
        ).toEqual({
          cruiseNights: null,
          legacyDays: 8,
          requiresConfirmation:
            true,
        });
      }
    );

    it(
      "mantiene pendiente una sesión actual que todavía solo contiene days",
      () => {
        expect(
          resolveStoredCruiseDuration({
            storageSchemaVersion:
              CURRENT_WIZARD_STORAGE_VERSION,
            cruiseNights: null,
            days: 7,
          })
        ).toEqual({
          cruiseNights: null,
          legacyDays: 7,
          requiresConfirmation:
            true,
        });
      }
    );

    it(
      "descarta noches inválidas sin fabricar una duración",
      () => {
        expect(
          resolveStoredCruiseDuration({
            storageSchemaVersion:
              CURRENT_WIZARD_STORAGE_VERSION,
            cruiseNights: 366,
          })
        ).toEqual({
          cruiseNights: null,
          legacyDays: null,
          requiresConfirmation:
            false,
        });
      }
    );
  }
);
