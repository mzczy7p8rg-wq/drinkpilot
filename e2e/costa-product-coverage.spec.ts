import { expect, test } from "@playwright/test";
import { startAtCruiseStep } from "./wizard-helpers";

test("permite elegir Tónica y Red Bull sin aumentar el consumo diario", async ({
  page,
}) => {
  await startAtCruiseStep(page);

  await page
    .getByRole("button", { name: /Costa Cruceros/i })
    .click();

  await page
    .getByLabel("¿Cuántas noches dura tu crucero?")
    .fill("7");

  await page
    .getByRole("button", { name: "Continuar" })
    .click();

  const increaseSoda = page.getByRole("button", {
    name: /Aumentar.*Refrescos/i,
  });

  await increaseSoda.click();
  await increaseSoda.click();

  await page
    .getByRole("link", { name: "Continuar" })
    .click();

  await expect(page).toHaveURL(/\/wizard\/preferences$/);

  await page
    .getByRole("link", { name: "Continuar" })
    .click();

  await expect(page).toHaveURL(/\/wizard\/prices$/);

  await page
    .getByRole("button", {
      name: "EUR (€)",
      exact: true,
    })
    .last()
    .click();

  const sodaSection = page
    .getByText("Refresco", { exact: true })
    .locator("..");

  const documentedMenu = sodaSection.locator(":scope > details");
  await documentedMenu.locator("summary").click();

  const tonicCard = documentedMenu
    .locator("div.rounded-lg")
    .filter({ hasText: "Tónica" });
  const redBullCard = documentedMenu
    .locator("div.rounded-lg")
    .filter({ hasText: "Red Bull" });

  await tonicCard
    .getByRole("button", { name: "Seleccionar" })
    .click();
  await redBullCard
    .getByRole("button", { name: "Seleccionar" })
    .click();

  await expect(
    tonicCard.getByRole("button", { name: "✓ Seleccionada" })
  ).toHaveAttribute("aria-pressed", "true");

  await expect(
    redBullCard.getByRole("button", { name: "✓ Seleccionada" })
  ).toHaveAttribute("aria-pressed", "true");

  await expect(documentedMenu.locator("summary")).toContainText(
    "2 seleccionadas"
  );

  await expect(
    documentedMenu
      .getByText(/alojada fuera del dominio oficial de Costa/i)
  ).toBeVisible();

  await page
    .getByRole("link", { name: "Continuar" })
    .click();

  await expect(page).toHaveURL(/\/wizard\/review$/);

  const stored = await page.evaluate(() =>
    JSON.parse(
      window.localStorage.getItem("drinkpilot-wizard") ?? "{}"
    )
  );

  expect(stored.documentedDrinkQuantities).toEqual({
    "costa-bar-list-tonic-water": 1,
    "costa-bar-list-red-bull": 1,
  });
  expect(stored.soda).toBe(2);
});
