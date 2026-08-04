import {
  describe,
  expect,
  expectTypeOf,
  it,
} from "vitest";

import type {
  PackageKey,
  PackageKeyForRegistry,
} from "@/lib/packageService";

/*
 * REGISTRO FICTICIO
 *
 * Este registro existe exclusivamente
 * dentro del test.
 *
 * No modifica cruiseLines,
 * Store, UI ni datos de producción.
 */
type FakeCruiseLineRegistry = {
  firstLine: {
    packages: {
      basicPackage: {
        name: string;
      };

      premiumPackage: {
        name: string;
      };
    };
  };

  secondLine: {
    packages: {
      softPackage: {
        name: string;
      };

      deluxePackage: {
        name: string;
      };
    };
  };
};

type FakePackageKey =
  PackageKeyForRegistry<
    FakeCruiseLineRegistry
  >;

type ExpectedFakePackageKey =
  | "basicPackage"
  | "premiumPackage"
  | "softPackage"
  | "deluxePackage";

describe(
  "PackageKey multi-cruise-line architecture",
  () => {
    it(
      "construye la unión de packageKeys de navieras diferentes",
      () => {
        /*
         * Esta comprobación se valida
         * principalmente durante el
         * type-check de TypeScript.
         */
        expectTypeOf<
          FakePackageKey
        >().toEqualTypeOf<
          ExpectedFakePackageKey
        >();

        expect(true).toBe(true);
      }
    );

    it(
      "acepta claves pertenecientes a cualquiera de las navieras ficticias",
      () => {
        const basic:
          FakePackageKey =
            "basicPackage";

        const deluxe:
          FakePackageKey =
            "deluxePackage";

        expect(basic).toBe(
          "basicPackage"
        );

        expect(deluxe).toBe(
          "deluxePackage"
        );
      }
    );

    it(
      "mantiene PackageKey conectado al registro real de DrinkPilot",
      () => {
        /*
         * Esta comprobación no fija cuáles
         * deben ser todas las claves reales.
         *
         * Únicamente confirma que PackageKey
         * sigue siendo un tipo string usable
         * por el resto del motor.
         */
        expectTypeOf<
          PackageKey
        >().toMatchTypeOf<
          string
        >();

        expect(true).toBe(true);
      }
    );
  }
);