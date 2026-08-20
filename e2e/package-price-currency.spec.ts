import { expect, test } from "@playwright/test";
import { startAtCruiseStep } from "./wizard-helpers";

test("distingue la moneda de referencia de la moneda de la reserva", async ({
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

  await expect(page).toHaveURL(/\/wizard\/consumption$/);

  await page
    .getByRole("button", { name: /Aumentar.*Cafés/i })
    .click();

  await page
    .getByRole("link", { name: "Continuar" })
    .click();

  await expect(page).toHaveURL(/\/wizard\/preferences$/);

  await page
    .getByRole("link", { name: "Continuar" })
    .click();

  await expect(page).toHaveURL(/\/wizard\/prices$/);

  const includedPackageHelp = page
    .locator("details")
    .filter({ hasText: "¿Tu tarifa ya incluye bebidas?" });

  await expect(includedPackageHelp).toBeVisible();
  await expect(includedPackageHelp).not.toHaveAttribute("open", "");

  await includedPackageHelp.locator("summary").click();

  await expect(
    includedPackageHelp.getByText("Todo Incluido", { exact: true })
  ).toBeVisible();
  await expect(
    includedPackageHelp.getByText("My Drinks", { exact: true })
  ).toBeVisible();
  await expect(
    includedPackageHelp.getByText("Todo Incluido Suite", { exact: true })
  ).toBeVisible();
  await expect(
    includedPackageHelp.getByText("My Drinks Plus", { exact: true })
  ).toBeVisible();
  await expect(
    includedPackageHelp.getByText(
      /No deducimos automáticamente qué paquete tienes/i
    )
  ).toBeVisible();
  await expect(
    includedPackageHelp.getByRole("link", {
      name: "Consultar fuente oficial de Costa",
    })
  ).toHaveAttribute(
    "href",
    "https://www.costacruceros.es/la-experiencia/paquetes-de-bebidas.html"
  );
  await expect(
    includedPackageHelp.getByText("Revisado el 14/08/2026")
  ).toBeVisible();

  const packageCurrencyGroup = page.getByRole("group", {
    name: "Moneda del precio de tu reserva",
  });

  const eurButton = packageCurrencyGroup.getByRole("button", {
    name: "EUR (€)",
    exact: true,
  });

  const usdButton = packageCurrencyGroup.getByRole("button", {
    name: "USD ($)",
    exact: true,
  });

  await expect(eurButton).toHaveAttribute(
    "aria-pressed",
    "true"
  );

  await expect(
    page.getByText(/Precio estimado EUR/i).first()
  ).toBeVisible();

  const includedPackageButton = page
    .getByRole("button", { name: "Ya tengo este paquete incluido" })
    .first();

  await includedPackageButton.click();
  await expect(
    page.getByRole("button", { name: "✓ Incluido en mi reserva" })
  ).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(
    page.getByText(/su coste para esta comparación será 0 €/i)
  ).toBeVisible();
  await expect(
    page.getByText("Coste del upgrade por adulto y noche").first()
  ).toBeVisible();
  await expect(
    page.getByText(
      "Introduce solo la diferencia de precio para cambiar desde tu paquete actual."
    ).first()
  ).toBeVisible();

  await usdButton.click();

  await expect(usdButton).toHaveAttribute(
    "aria-pressed",
    "true"
  );

  await expect(
    page.getByText(
      /Las referencias se mantienen en su moneda original/i
    )
  ).toBeVisible();

  await expect(
    page.getByText(/Precio estimado EUR/i).first()
  ).toBeVisible();

  await expect(
    page.getByText(/Referencia original EUR/i)
  ).toHaveCount(0);

  await expect(
    page
      .getByLabel(
        "Moneda del precio de tu reserva: USD"
      )
      .first()
  ).toHaveText("$");

  /*
   * La moneda debe conservarse aunque todavía
   * no se haya introducido ningún precio.
   */
  await page.getByRole("link", { name: "Continuar" }).click();
  await expect(page).toHaveURL(/\/wizard\/review$/);

  await page.goto("/wizard/prices");

  await expect(
    page
      .getByRole("group", {
        name: "Moneda del precio de tu reserva",
      })
      .getByRole("button", {
        name: "USD ($)",
        exact: true,
      })
  ).toHaveAttribute("aria-pressed", "true");
});
