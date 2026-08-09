import { test, expect } from "@playwright/test";

test("usuario completa consumo y avanza al siguiente paso", async ({ page }) => {
  await page.goto("/wizard");

  await page
    .getByRole("button", { name: /Costa Cruceros/i })
    .click();
  await page.getByLabel("Duración del crucero").fill("7");
  await page
    .getByRole("button", { name: "Continuar" })
    .click();

  await expect(page).toHaveURL(/\/wizard\/consumption$/);
  await expect(
    page.getByRole("heading", {
      name: "¿Cuántas bebidas consumes al día?",
    })
  ).toBeVisible();

  const beerCounter = page.getByRole("group", {
    name: "Cervezas",
  });
  await beerCounter
    .getByRole("button", { name: "Aumentar Cervezas" })
    .click();
  await expect(
    beerCounter.getByLabel("Cantidad de Cervezas")
  ).toHaveText("1");

  const coffeeCounter = page.getByRole("group", {
    name: "Cafés",
  });
  await coffeeCounter
    .getByRole("button", { name: "Aumentar Cafés" })
    .click();
  await expect(
    coffeeCounter.getByLabel("Cantidad de Cafés")
  ).toHaveText("1");

  await page
    .getByRole("link", { name: "Continuar" })
    .click();

  await expect(page).toHaveURL(/\/wizard\/preferences$/);
  await expect(
    page.getByRole("heading", {
      name: "¿Qué extras valoras a bordo?",
    })
  ).toBeVisible();
});
