import {
  isCruiseLineKey,
} from "@/data/cruiseLines";

import {
  describe,
  expect,
  it,
} from "vitest";

describe("isCruiseLineKey", () => {
  it("acepta las claves propias del registro", () => {
    expect(
      isCruiseLineKey("costa")
    ).toBe(true);

    expect(
      isCruiseLineKey("msc")
    ).toBe(true);
  });

  it("rechaza claves que no están registradas", () => {
    expect(
      isCruiseLineKey("unknown")
    ).toBe(false);
  });

  it("rechaza propiedades heredadas de Object.prototype", () => {
    expect(
      isCruiseLineKey("constructor")
    ).toBe(false);

    expect(
      isCruiseLineKey("toString")
    ).toBe(false);

    expect(
      isCruiseLineKey("__proto__")
    ).toBe(false);
  });

  it("rechaza valores que no son cadenas", () => {
    expect(
      isCruiseLineKey(null)
    ).toBe(false);

    expect(
      isCruiseLineKey({})
    ).toBe(false);

    expect(
      isCruiseLineKey(1)
    ).toBe(false);
  });
});
