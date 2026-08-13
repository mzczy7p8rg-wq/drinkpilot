import { expect, test } from "@playwright/test";

test("completa el wizard y muestra la recomendación", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("img", {
      name: "DrinkPilot · Tu guía para disfrutar más",
    })
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Empezar análisis" })
    .click();

  await expect(page).toHaveURL(/\/wizard\/people$/);
  await expect(
    page.getByRole("heading", { name: "¿Quién viaja?" })
  ).toBeVisible();
  await page.getByRole("button", { name: "Aumentar adultos" }).click();
  await page.getByRole("button", { name: "Aumentar menores" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(page).toHaveURL(/\/wizard$/);
  await expect(
    page.getByRole("heading", { name: "¿Con quién navegas?" })
  ).toBeVisible();

  await page
    .getByRole("button", { name: /Costa Cruceros/i })
    .click();
  await page.getByLabel("Duración del crucero").fill("7");
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(page).toHaveURL(/\/wizard\/consumption$/);
  await expect(
    page.getByRole("heading", {
      name: "¿Qué sueles beber?",
    })
  ).toBeVisible();

  await page
    .getByRole("button", { name: /Aumentar.*Cafés/i })
    .click({ clickCount: 2 });
  await page
    .getByRole("button", { name: /Aumentar.*Agua/i })
    .click();
  await page
    .getByRole("button", { name: /Aumentar.*Cervezas/i })
    .click({ clickCount: 2 });
  await page.getByRole("link", { name: "Continuar" }).click();

  await expect(page).toHaveURL(/\/wizard\/preferences$/);
  await expect(
    page.getByRole("heading", { name: "¿Qué te gustaría tener incluido?" })
  ).toBeVisible();
  const bottledBeerPreference = page.getByRole("checkbox", {
    name: /Cerveza embotellada/i,
  });
  await page
    .getByText("Opciones premium (opcional)", { exact: true })
    .click();
  await bottledBeerPreference.check();
  await expect(bottledBeerPreference).toBeChecked();
  await page.getByRole("link", { name: "Continuar" }).click();

  await expect(page).toHaveURL(/\/wizard\/prices$/);
  await expect(
    page.getByRole("heading", { name: "¿Tienes el precio de tu reserva?" })
  ).toBeVisible();
  await page.getByLabel(/My Drinks$/).fill("32.50");
  await page.getByRole("link", { name: "Continuar" }).click();

  await expect(page).toHaveURL(/\/wizard\/review$/);
  await expect(
    page.getByRole("heading", { name: "Revisa tu análisis" })
  ).toBeVisible();
  await expect(page.getByText("Costa Cruceros").first()).toBeVisible();
  await expect(page.getByText("7 días")).toBeVisible();
  await expect(page.getByText("2 adultos · 1 menor")).toBeVisible();
  await expect(page.getByText("Cerveza embotellada")).toBeVisible();
  await expect(page.getByText("32,50")).toBeVisible();

  await page.getByRole("button", { name: "Ver recomendación" }).click();

  await expect(page).toHaveURL(/\/results$/);
  await expect(
    page.getByRole("heading", { name: /Tu recomendación DrinkPilot/i })
  ).toBeVisible();
  await expect(
    page.getByText("ℹ️ Resultado orientativo", { exact: true })
  ).toBeVisible();
  const feedbackLink = page.getByRole("link", {
    name: "Enviar opinión",
  });
  await expect(feedbackLink).toBeVisible();
  await expect(feedbackLink).toHaveAttribute(
    "href",
    "https://tally.so/r/LZxG1y"
  );
  await expect(feedbackLink).toHaveAttribute("target", "_blank");
  await expect(
    page.getByRole("img", {
      name: "DrinkPilot · Tu guía para disfrutar más",
    })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Tus preferencias están cubiertas, pero el paquete no compensa",
    })
  ).toBeVisible();
  await expect(
    page.getByText("Sin opción completa con resultado favorable")
  ).toBeVisible();

  const packageWarning = page
    .locator("details")
    .filter({ hasText: "Cómo interpretar este resultado" })
    .first();

  await expect(packageWarning).toBeVisible();
  await expect(packageWarning).not.toHaveAttribute("open", "");

  await packageWarning.locator("summary").click();

  await expect(packageWarning).toHaveAttribute("open", "");

  const dataDetailsButton = page.getByText(
    "Ver detalle de calidad de los datos",
    { exact: true }
  );

  await expect(dataDetailsButton).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Datos verificados",
    })
  ).toBeHidden();

  await dataDetailsButton.click();

  await expect(
    page.getByRole("heading", {
      name: "Datos verificados",
    })
  ).toBeVisible();

  await page
    .getByRole("link", {
      name: "Empezar de nuevo",
    })
    .click();

  await expect(page).toHaveURL(
    /\/wizard\/people$/
  );
  await expect(
    page.getByRole("heading", {
      name: "¿Quién viaja?",
    })
  ).toBeVisible();
  await expect(
    page.getByLabel(
      "Cantidad de adultos"
    )
  ).toContainText("1");
  await expect(
    page.getByLabel(
      "Cantidad de menores"
    )
  ).toContainText("0");
});
