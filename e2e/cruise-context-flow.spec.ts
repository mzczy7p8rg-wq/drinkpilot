import { expect, test } from "@playwright/test";
import { startAtCruiseStep } from "./wizard-helpers";

test("permite ajustar las noches con controles visibles", async ({ page }) => {
  await page.goto("/wizard");

  const duration = page.getByLabel("¿Cuántas noches dura tu crucero?");
  await expect(duration).toHaveValue("");

  await page.getByRole("button", { name: "Añadir una noche" }).click();
  await expect(duration).toHaveValue("1");

  await page.getByRole("button", { name: "Añadir una noche" }).click();
  await expect(duration).toHaveValue("2");

  await page.getByRole("button", { name: "Quitar una noche" }).click();
  await expect(duration).toHaveValue("1");
  await expect(
    page.getByRole("button", { name: "Quitar una noche" })
  ).toBeDisabled();
});

test("conserva mercado y región hasta la revisión", async ({ page }) => {
  await startAtCruiseStep(page);

  await page
    .getByRole("button", { name: /MSC Cruises/i })
    .click();
  await page.getByLabel("¿Cuántas noches dura tu crucero?").fill("7");
  await page
    .getByLabel("Mercado de la reserva")
    .selectOption({ label: "Estados Unidos" });
  await page
    .getByLabel("Región de navegación")
    .selectOption({ label: "Norteamérica" });
  await page.getByRole("button", { name: "Continuar" }).click();

  await page
    .getByRole("button", { name: /Aumentar.*Cafés/i })
    .click();
  await page.getByRole("link", { name: "Continuar" }).click();

  await expect(page).toHaveURL(/\/wizard\/preferences$/);
  await expect(
    page.getByRole("heading", {
      name: "¿Qué preferencias te gustaría tener incluidas en tu paquete?",
    })
  ).toBeVisible();
  await page.getByRole("link", { name: "Continuar" }).click();

  await expect(page).toHaveURL(/\/wizard\/prices$/);
  await expect(
    page.getByRole("heading", { name: "¿Tienes el precio de tu reserva?" })
  ).toBeVisible();
  await expect(
    page.getByText("¿Tu tarifa ya incluye bebidas?")
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Continuar" }).click();

  await expect(page).toHaveURL(/\/wizard\/review$/);
  await expect(page.getByText("MSC Cruises").first()).toBeVisible();
  await expect(page.getByText("Estados Unidos")).toBeVisible();
  await expect(page.getByText("Norteamérica")).toBeVisible();
});

test("reinicia el consumo al cambiar de naviera", async ({ page }) => {
  await startAtCruiseStep(page);

  await page
    .getByRole("button", { name: /Costa Cruceros/i })
    .click();
  await page.getByLabel("¿Cuántas noches dura tu crucero?").fill("7");
  await page
    .getByRole("button", { name: "Continuar" })
    .click();

  await expect(page).toHaveURL(/\/wizard\/consumption$/);

  const beerCounter = page.getByRole("group", {
    name: "Cervezas",
  });
  const coffeeCounter = page.getByRole("group", {
    name: "Cafés",
  });
  const juiceCounter = page.getByRole("group", {
    name: "Zumos",
  });

  await beerCounter
    .getByRole("button", { name: "Aumentar Cervezas" })
    .click();

  await coffeeCounter
    .getByRole("button", { name: "Aumentar Cafés" })
    .click();

  await juiceCounter
    .getByRole("button", { name: "Aumentar Zumos" })
    .click();

  await expect(
    beerCounter.getByLabel("Cantidad de Cervezas")
  ).toHaveText("1");

  await expect(
    coffeeCounter.getByLabel("Cantidad de Cafés")
  ).toHaveText("1");

  await expect(
    juiceCounter.getByLabel("Cantidad de Zumos")
  ).toHaveText("1");

  await page
    .getByRole("link", { name: "Atrás" })
    .click();

  await expect(page).toHaveURL(/\/wizard$/);

  await page
    .getByRole("button", { name: /MSC Cruises/i })
    .click();

  await page
    .getByRole("button", { name: "Continuar" })
    .click();

  await expect(page).toHaveURL(/\/wizard\/consumption$/);

  const nextBeerCounter = page.getByRole("group", {
    name: "Cervezas",
  });
  const nextCoffeeCounter = page.getByRole("group", {
    name: "Cafés",
  });
  const nextJuiceCounter = page.getByRole("group", {
    name: "Zumos",
  });

  await expect(
    nextBeerCounter.getByLabel("Cantidad de Cervezas")
  ).toHaveText("0");

  await expect(
    nextCoffeeCounter.getByLabel("Cantidad de Cafés")
  ).toHaveText("0");

  await expect(
    nextJuiceCounter.getByLabel("Cantidad de Zumos")
  ).toHaveText("0");
});

test("muestra el aviso solo al cambiar de naviera", async ({ page }) => {
  await page.goto("/wizard");

  const notice = page.getByText(/Has cambiado de naviera/);
  const costaButton = page.getByRole("button", {
    name: /Costa Cruceros/i,
  });

  await expect(notice).toBeHidden();

  await costaButton.click();

  await expect(notice).toBeHidden();

  await page
    .getByRole("button", { name: /MSC Cruises/i })
    .click();

  await expect(notice).toBeVisible();
  await expect(
    page.getByText(
      /Mantendremos tus preferencias/
    )
  ).toBeVisible();
});

test("muestra Europa como región de referencia de Costa", async ({ page }) => {
  await page.goto("/wizard");

  const costaButton = page.getByRole("button", {
    name: /Costa Cruceros/i,
  });

  await expect(costaButton).toContainText(
    "Región de referencia: Europa"
  );
});

test("permite volver desde el paso de crucero a seleccionar pasajeros", async ({
  page,
}) => {
  await page.goto("/wizard");

  await page.getByRole("link", { name: "Atrás" }).click();

  await expect(page).toHaveURL(/\/wizard\/people$/);
  await expect(
    page.getByRole("heading", { name: "¿Quién viaja?" })
  ).toBeVisible();
});

test("explica la cobertura y comparación de cada naviera", async ({ page }) => {
  await page.goto("/wizard");

  const cruiseLineGroup = page.getByRole("group", {
    name: "Naviera",
  });
  const costaButton = cruiseLineGroup.getByRole("button", {
    name: /Costa Cruceros/i,
  });
  const mscButton = cruiseLineGroup.getByRole("button", {
    name: /MSC Cruises/i,
  });

  await expect(costaButton).toContainText(
    "Información del paquete disponible"
  );
  await expect(costaButton).toContainText(
    "Algunos precios están pendientes"
  );

  await expect(mscButton).toContainText(
    "Información del paquete disponible"
  );
  await expect(mscButton).toContainText(
    "Algunos precios están pendientes"
  );
});

test("avisa de la edad mínima de alcohol cuando el contexto puede implicar Estados Unidos", async ({
  page,
}) => {
  await page.goto("/wizard");

  await page
    .getByLabel("Mercado de la reserva")
    .selectOption("US");

  const notice = page
    .locator("details")
    .filter({ hasText: "Edad mínima para bebidas con alcohol" });

  await expect(notice).toBeVisible();
  await expect(notice).not.toHaveAttribute("open", "");

  await notice.locator("summary").click();

  await expect(
    notice.getByText(/Costa establece 21 años para cruceros que salen de puertos de Estados Unidos/i)
  ).toBeVisible();
  await expect(
    notice.getByText(/no confirma por sí sola que la regla se aplique/i)
  ).toBeVisible();
  await expect(
    notice.getByRole("link", { name: "Fuente oficial Costa" })
  ).toBeVisible();

  await page
    .getByRole("button", { name: /MSC Cruises/i })
    .click();

  await expect(
    notice.getByText(/MSC aplica 21 años cuando el itinerario incluye un puerto de Estados Unidos/i)
  ).toBeVisible();
  await expect(
    notice.getByRole("link", { name: "Fuente oficial MSC" })
  ).toBeVisible();

  await page
    .getByLabel("Mercado de la reserva")
    .selectOption("");
  await page
    .getByLabel("Región de navegación")
    .selectOption("MED");

  await expect(notice).toHaveCount(0);
});
