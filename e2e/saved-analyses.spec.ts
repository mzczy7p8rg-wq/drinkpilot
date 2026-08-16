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
  await page.getByLabel("¿Cuántas noches dura tu crucero?").fill("7");
  await page.getByLabel("Fecha de salida").fill("2026-09-15");
  await page.getByRole("button", { name: /Continuar/i }).click();

  await page.goto("/analyses");

  const analysis = page.locator("article").first();

  await expect(analysis).toContainText("Costa Toscana");
  await expect(analysis).toContainText("Costa Cruceros");
  await expect(analysis).toContainText("7 noches");
  await expect(analysis).toContainText("15 sept 2026");
});

test("permite poner y quitar un nombre personalizado", async ({ page }) => {
  await page.goto("/wizard/people");
  await page.getByRole("button", { name: /Continuar/i }).click();
  await page.goto("/analyses");

  const analysis = page.locator("article").first();

  await analysis.getByRole("button", { name: "Editar nombre" }).click();
  await analysis
    .getByLabel("Nombre personalizado")
    .fill("Crucero familiar septiembre");
  await analysis.getByRole("button", { name: "Guardar nombre" }).click();

  await expect(
    analysis.getByRole("heading", { name: "Crucero familiar septiembre" })
  ).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Crucero familiar septiembre" })
  ).toBeVisible();

  await analysis.getByRole("button", { name: "Editar nombre" }).click();
  await analysis.getByLabel("Nombre personalizado").fill("");
  await analysis.getByRole("button", { name: "Guardar nombre" }).click();

  await expect(
    analysis.getByRole("heading", { name: "Costa Cruceros" })
  ).toBeVisible();
});


test("ordena Mis análisis por más reciente, nombre y naviera", async ({ page }) => {
  const baseData = {
    market: null,
    sailingRegion: null,
    onboardCurrency: null,
    sailingDate: null,
    shipName: null,
    cruiseNights: 7,
    coffee: 1,
    water: 1,
    soda: 0,
    juice: 0,
    beer: 0,
    wine: 0,
    cocktail: 0,
    consumptionConfirmed: true,
    alcoholicCocktail: null,
    nonAlcoholicCocktail: null,
    alcoholicCocktails: false,
    nonAlcoholicCocktails: false,
    draftBeer: false,
    premiumCocktails: false,
    bottledBeer: false,
    premiumSpirits: false,
    bottledWaterDailyAllowance: false,
    bottledWaterUnlimited: false,
    customPackagePrices: {},
    packagePriceCurrency: null,
    selectedDrinkPrices: {},
    documentedDrinkQuantities: {},
    people: 2,
    adults: 2,
    minors: 0,
  };

  await page.addInitScript((data) => {
    window.localStorage.setItem(
      "drinkpilot-saved-analyses",
      JSON.stringify({
        version: 1,
        analyses: [
          {
            id: "costa-older",
            name: "Zeta",
            createdAt: "2026-08-13T10:00:00.000Z",
            updatedAt: "2026-08-13T10:00:00.000Z",
            data: {
              ...data,
              cruiseLine: "costa",
            },
          },
          {
            id: "msc-middle",
            name: "Alfa",
            createdAt: "2026-08-14T10:00:00.000Z",
            updatedAt: "2026-08-14T10:00:00.000Z",
            data: {
              ...data,
              cruiseLine: "msc",
            },
          },
          {
            id: "costa-newer",
            name: "Beta",
            createdAt: "2026-08-15T10:00:00.000Z",
            updatedAt: "2026-08-15T10:00:00.000Z",
            data: {
              ...data,
              cruiseLine: "costa",
            },
          },
        ],
      })
    );
  }, baseData);

  await page.goto("/analyses");

  const titles = page.locator("article h2");
  const sort = page.getByLabel("Ordenar por");

  await expect(titles).toHaveText(["Beta", "Alfa", "Zeta"]);

  await sort.selectOption("name");
  await expect(titles).toHaveText(["Alfa", "Beta", "Zeta"]);

  await sort.selectOption("cruise-line");
  await expect(titles).toHaveText(["Beta", "Zeta", "Alfa"]);

  await sort.selectOption("recent");
  await expect(titles).toHaveText(["Beta", "Alfa", "Zeta"]);
});
