import { expect, test } from "@playwright/test";
import { startAtCruiseStep } from "./wizard-helpers";

test("separa AQUA by MSC del agua embotellada", async ({ page }) => {
  await startAtCruiseStep(page);

  await page.getByRole("button", { name: /MSC Cruises/i }).click();
  await page.getByLabel("¿Cuántas noches dura tu crucero?").fill("7");
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(
    page.getByRole("group", {
      name: "Agua no embotellada (AQUA by MSC)",
    })
  ).toBeVisible();
  await expect(
    page.getByText(/Si prefieres agua embotellada/i)
  ).toBeVisible();
});
