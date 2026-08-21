import { test, expect } from "@playwright/test";
import { startAtCruiseStep } from "./wizard-helpers";

test("usuario completa consumo y avanza al siguiente paso", async ({ page }) => {
  await startAtCruiseStep(page);

  await page
    .getByRole("button", { name: /Costa Cruceros/i })
    .click();
  await page.getByLabel("¿Cuántas noches dura tu crucero?").fill("7");
  await Promise.all([
    page.waitForURL(/\/wizard\/consumption$/),
    page.getByRole("button", { name: "Continuar" }).click(),
  ]);

  await expect(page).toHaveURL(/\/wizard\/consumption$/);
  await expect(
    page.getByRole("heading", {
      name: "¿Qué bebidas consumes al día?",
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
      name: "¿Qué preferencias te gustaría tener incluidas en tu paquete?",
    })
  ).toBeVisible();
});

test("exige confirmar Consumo y acepta un perfil confirmado con valor cero", async ({
  page,
}) => {
  await startAtCruiseStep(page);

  await page
    .getByLabel("¿Cuántas noches dura tu crucero?")
    .fill("7");
  await Promise.all([
    page.waitForURL(/\/wizard\/consumption$/),
    page.getByRole("button", { name: "Continuar" }).click(),
  ]);

  await page.goto("/wizard/preferences");
  await expect(page).toHaveURL(/\/wizard\/consumption$/);

  await expect(
    page.getByText(/Cero también es válido/i)
  ).toBeVisible();

  await page
    .getByRole("link", { name: "Continuar" })
    .click();

  await expect(page).toHaveURL(/\/wizard\/preferences$/);

  const stored = await page.evaluate(() =>
    JSON.parse(
      window.localStorage.getItem("drinkpilot-wizard") ?? "{}"
    )
  );

  expect(stored).toMatchObject({
    consumptionConfirmed: true,
    coffee: 0,
    water: 0,
    soda: 0,
    juice: 0,
    beer: 0,
    wine: 0,
    cocktail: 0,
  });
});

test("permite registrar consumos distintos para dos adultos", async ({ page }) => {
  await page.goto("/wizard/people");
  await page
    .getByRole("button", { name: "Aumentar adultos" })
    .click();
  await page
    .getByRole("button", { name: "Continuar" })
    .click();

  await page
    .getByLabel("¿Cuántas noches dura tu crucero?")
    .fill("7");
  await page
    .getByRole("button", { name: "Continuar" })
    .click();

  const coffeeCounter = page.getByRole("group", { name: "Cafés" });
  await coffeeCounter
    .getByRole("button", { name: "Aumentar Cafés" })
    .click();

  await page
    .getByRole("button", { name: "Adulto 2" })
    .click();
  await expect(
    coffeeCounter.getByLabel("Cantidad de Cafés")
  ).toHaveText("0");

  const beerCounter = page.getByRole("group", { name: "Cervezas" });
  await beerCounter
    .getByRole("button", { name: "Aumentar Cervezas" })
    .click();
  await beerCounter
    .getByRole("button", { name: "Aumentar Cervezas" })
    .click();

  await page
    .getByRole("button", { name: "Adulto 1" })
    .click();
  await expect(
    coffeeCounter.getByLabel("Cantidad de Cafés")
  ).toHaveText("1");
  await expect(
    beerCounter.getByLabel("Cantidad de Cervezas")
  ).toHaveText("0");

  await page
    .getByRole("link", { name: "Continuar" })
    .click();

  const stored = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem("drinkpilot-wizard") ?? "{}")
  );

  expect(stored.adultConsumptionProfiles).toMatchObject([
    { label: "Adulto 1", coffee: 1, beer: 0, consumptionConfirmed: true },
    { label: "Adulto 2", coffee: 0, beer: 2, consumptionConfirmed: true },
  ]);
});
