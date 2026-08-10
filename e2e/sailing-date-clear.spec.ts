import { expect, test } from "@playwright/test";

test("permite quitar explícitamente la fecha de salida", async ({
  page,
}) => {
  await page.goto("/wizard");

  const sailingDate =
    page.getByLabel("Fecha de salida");

  await sailingDate.fill("2026-09-15");

  await expect(sailingDate).toHaveValue(
    "2026-09-15"
  );

  const clearDateButton = page.getByRole(
    "button",
    {
      name: "Quitar fecha",
    }
  );

  await expect(clearDateButton).toBeVisible();

  await clearDateButton.click();

  await expect(sailingDate).toHaveValue("");

  await expect(clearDateButton).toBeHidden();
});
