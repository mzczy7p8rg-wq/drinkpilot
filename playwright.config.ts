import {
  defineConfig,
  devices,
} from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",

  reporter: "list",

  use: {
    baseURL:
      "http://127.0.0.1:3100",

    trace:
      "on-first-retry",
  },

  webServer: {
    command:
      "npm run start:e2e",

    url:
      "http://127.0.0.1:3100",

    reuseExistingServer:
      !process.env.CI,

    timeout:
      120000,
  },

  projects: [
    {
      name: "chromium",

      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "mobile-chromium",

      use: {
        ...devices["Pixel 7"],
      },
    },
    {
      name: "webkit",

      use: {
        ...devices["Desktop Safari"],
      },
    },
    {
      name: "tablet-webkit",

      use: {
        ...devices["iPad Pro 11"],
      },
    },
  ],
});
