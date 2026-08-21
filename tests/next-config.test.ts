import { describe, expect, it } from "vitest";

import nextConfig from "../next.config";

describe("configuración de desarrollo en red local", () => {
  it("permite cargar los recursos de Next desde el iPhone actual", () => {
    expect(nextConfig.allowedDevOrigins).toContain("192.168.1.84");
  });
});
