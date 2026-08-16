import {
  resolveLegacyCruiseDuration,
} from "@/lib/cruiseDuration";
import {
  isValidCruiseNights,
} from "@/lib/wizardNumberValidation";

export const CURRENT_WIZARD_STORAGE_VERSION =
  2;

export type StoredCruiseDurationInput = {
  storageSchemaVersion?: unknown;
  cruiseNights?: unknown;
  days?: unknown;
};

export type StoredCruiseDuration = {
  cruiseNights: number | null;
  legacyDays: number | null;
  requiresConfirmation: boolean;
};

/*
 * Solo una sesión de la versión actual con un
 * cruiseNights válido puede hidratar directamente
 * la nueva unidad canónica.
 *
 * Un `days` histórico se conserva como evidencia
 * para una futura pantalla de confirmación, pero
 * nunca se convierte automáticamente en noches.
 */
export function resolveStoredCruiseDuration(
  input: StoredCruiseDurationInput
): StoredCruiseDuration {
  if (
    input.storageSchemaVersion ===
      CURRENT_WIZARD_STORAGE_VERSION &&
    isValidCruiseNights(
      input.cruiseNights
    )
  ) {
    return {
      cruiseNights:
        input.cruiseNights,
      legacyDays: null,
      requiresConfirmation:
        false,
    };
  }

  const legacyDuration =
    resolveLegacyCruiseDuration(
      input.days
    );

  return {
    cruiseNights: null,
    legacyDays:
      legacyDuration
        .legacyDays,
    requiresConfirmation:
      legacyDuration
        .legacyDays !== null,
  };
}
