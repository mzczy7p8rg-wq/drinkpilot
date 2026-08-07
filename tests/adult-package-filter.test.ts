import {
  describe,
  expect,
  it,
} from "vitest";

import {
  filterAdultPackageItems,
} from "@/lib/adultPackageFilter";

import {
  getPackageOperationalRules,
} from "@/lib/packageRules";

describe(
  "adult package filter",
  () => {
    it(
      "elimina cualquier elemento asociado a un paquete exclusivo de menores",
      () => {
        const rules =
          getPackageOperationalRules(
            "msc"
          );

        const items = [
          {
            packageKey:
              "mscEasy" as const,

            value:
              "adult",
          },

          {
            packageKey:
              "mscMinors" as const,

            value:
              "minor",
          },
        ];

        expect(
          filterAdultPackageItems(
            items,
            rules
          )
        ).toEqual([
          {
            packageKey:
              "mscEasy",

            value:
              "adult",
          },
        ]);
      }
    );

    it(
      "conserva todos los elementos cuando no existen paquetes minorsOnly",
      () => {
        const rules =
          getPackageOperationalRules(
            "costa"
          );

        const items = [
          {
            packageKey:
              "myDrinks" as const,
          },

          {
            packageKey:
              "myDrinksPlus" as const,
          },
        ];

        expect(
          filterAdultPackageItems(
            items,
            rules
          )
        ).toEqual(items);
      }
    );
  }
);
