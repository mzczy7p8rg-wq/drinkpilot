import { expect, test } from "@playwright/test";

test("guarda, continúa, duplica y elimina análisis", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: /Empezar análisis/i }).click();
  await expect(page).toHaveURL(/\/wizard\/people$/);

  await page.getByRole("button", { name: /Continuar/i }).click();
  await expect(page).toHaveURL(/\/wizard$/);

  await page.goto("/analyses");

  const analyses = page.locator("article");

  await expect(
    page.getByRole("heading", { name: "Mis análisis" })
  ).toBeVisible();
  await expect(analyses).toHaveCount(1);
  await expect(analyses.first()).toContainText("Costa Cruceros");
  await expect(analyses.first()).toContainText("En curso");

  await analyses.first().getByRole("button", { name: "Duplicar" }).click();
  await expect(analyses).toHaveCount(2);

  await analyses.first().getByRole("button", { name: "Eliminar" }).click();
  await analyses.first().getByRole("button", { name: "Confirmar" }).click();
  await expect(analyses).toHaveCount(1);

  await analyses.first().getByRole("button", { name: "Continuar" }).click();
  await expect(page).toHaveURL(/\/wizard$/);
});

test("identifica un análisis por barco, fecha y duración", async ({ page }) => {
  await page.goto("/wizard/people");
  await page.getByRole("button", { name: /Continuar/i }).click();

  await page.getByLabel("Nombre del barco").fill("Costa Toscana");
  await page.getByLabel("Duración del crucero").fill("7");
  await page.getByLabel("Fecha de salida").fill("2026-09-15");
  await page.getByRole("button", { name: /Continuar/i }).click();

  await page.goto("/analyses");

  const analysis = page.locator("article").first();

  await expect(analysis).toContainText("Costa Toscana");
  await expect(analysis).toContainText("Costa Cruceros");
  await expect(analysis).toContainText("7 días");
  await expect(analysis).toContainText("15 sept 2026");
});
