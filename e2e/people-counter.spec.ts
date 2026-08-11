import { expect, test } from "@playwright/test";

test("selecciona entre 1 y 10 adultos con controles menos y más", async ({
  page,
}) => {
  await page.goto("/wizard");

  await page
    .getByRole("button", { name: /Costa Cruceros/i })
    .click();

  await page
    .getByLabel("Duración del crucero")
    .fill("7");

  await page
    .getByRole("button", { name: "Continuar" })
    .click();

  await expect(page).toHaveURL(/\/wizard\/consumption$/);
  await expect(
    page.getByRole("heading", {
      name: "¿Qué sueles beber?",
    })
  ).toBeVisible();

  await page
    .getByRole("button", { name: /Aumentar.*Cafés/i })
    .click();

  await page
    .getByRole("link", { name: "Continuar" })
    .click();

  await expect(page).toHaveURL(/\/wizard\/preferences$/);
  await expect(
    page.getByRole("heading", {
      name: "¿Qué te gustaría tener incluido?",
    })
  ).toBeVisible();

  await page
    .getByRole("link", { name: "Continuar" })
    .click();

  await expect(page).toHaveURL(/\/wizard\/prices$/);
  await expect(
    page.getByRole("heading", {
      name: "¿Tienes el precio de tu reserva?",
    })
  ).toBeVisible();

  await page
    .getByLabel(/My Drinks$/)
    .fill("32.50");

  await page
    .getByRole("link", { name: "Continuar" })
    .click();

  await expect(page).toHaveURL(/\/wizard\/people$/);
  await expect(
    page.getByRole("heading", {
      name: "¿Quién viaja?",
    })
  ).toBeVisible();

  const decrease = page.getByRole("button", {
    name: "Disminuir adultos",
  });

  const increase = page.getByRole("button", {
    name: "Aumentar adultos",
  });

  const quantity = page.getByLabel(
    "Cantidad de adultos"
  );

  await expect(quantity).toContainText("1");
  await expect(decrease).toBeDisabled();
  await expect(increase).toBeEnabled();

  for (let i = 0; i < 9; i += 1) {
    await increase.click();
  }

  await expect(quantity).toContainText("10");
  await expect(increase).toBeDisabled();
  await expect(decrease).toBeEnabled();

  await decrease.click();

  await expect(quantity).toContainText("9");
});
