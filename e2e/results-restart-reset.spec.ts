import { expect, test } from "@playwright/test";

test("Nuevo análisis vuelve al primer paso con los datos limpios", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (window.sessionStorage.getItem("restart-test-seeded") === null) {
      window.localStorage.setItem(
        "drinkpilot-wizard",
        JSON.stringify({
          cruiseLine: "msc",
          days: 7,
          coffee: 1,
          people: 2,
          adults: 2,
          minors: 1,
        })
      );
      window.sessionStorage.setItem("restart-test-seeded", "true");
    }
  });

  await page.goto("/results");

  await page
    .getByRole("link", { name: "Nuevo análisis" })
    .click();

  await expect(page).toHaveURL(/\/wizard\/people$/);
  await expect(
    page.getByRole("heading", { name: "¿Quién viaja?" })
  ).toBeVisible();
  await expect(
    page.getByRole("paragraph").filter({ hasText: "Paso 1 de 6" })
  ).toBeVisible();
  await expect(page.getByLabel("Cantidad de adultos")).toContainText("1");
  await expect(page.getByLabel("Cantidad de menores")).toContainText("0");
});
