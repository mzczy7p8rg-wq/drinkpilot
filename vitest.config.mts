import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(
  new URL(".", import.meta.url)
);

export default defineConfig({
  resolve: {
    alias: {
      "@": rootDir,
    },
  },

  test: {
    environment: "node",
    exclude: [
      "e2e/**",
      "node_modules/**",
    ],
  },
});
