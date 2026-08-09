import type {
  CruiseLineKey,
} from "@/data/cruiseLines";

import type {
  CruiseContext,
} from "@/lib/cruiseContext";

export type CruiseContextFixture =
  Pick<
    CruiseContext,
    "cruiseLine"
  > &
  Partial<
    Omit<
      CruiseContext,
      "cruiseLine"
    >
  >;

export type PackageRulesContextFixture =
  | CruiseLineKey
  | CruiseContextFixture;

export function createCruiseContextFixture(
  input: CruiseContextFixture
): CruiseContext {
  return {
    market: null,
    sailingRegion: null,
    onboardCurrency: null,
    sailingDate: null,
    ...input,
  };
}

export function resolvePackageRulesContextFixture(
  input: PackageRulesContextFixture
): CruiseLineKey | CruiseContext {
  return typeof input === "string"
    ? input
    : createCruiseContextFixture(
        input
      );
}
