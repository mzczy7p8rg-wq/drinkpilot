import { expect, test } from "@playwright/test";
import { startAtCruiseStep } from "./wizard-helpers";

test("restaura una sesión válida en Review", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "drinkpilot-wizard",
      JSON.stringify({
        storageSchemaVersion: 2,
        cruiseLine: "costa",
        cruiseNights: 7,
        coffee: 1,
        people: 2,
      })
    );
  });

  await page.goto("/wizard/review");

  await expect(
    page.getByRole("heading", { name: "Revisa tu análisis" })
  ).toBeVisible();
  await expect(page.getByText("7 noches")).toBeVisible();
  await expect(page.getByText("2 adultos")).toBeVisible();
});

test("pide confirmar las noches de una sesión legacy ambigua", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "drinkpilot-wizard",
      JSON.stringify({
        cruiseLine: "costa",
        days: 8,
        coffee: 1,
        people: 2,
      })
    );
  });

  await page.goto("/wizard/review");

  await expect(page).toHaveURL(
    /\/wizard$/
  );

  const nights = page.getByLabel(
    "¿Cuántas noches dura tu crucero?"
  );

  await expect(nights).toHaveValue("");
  await expect(
    page.getByText(
      "Si tu itinerario muestra 8 días / 7 noches, introduce 7."
    )
  ).toBeVisible();
});

test("las sesiones nuevas persisten cruiseNights y no vuelven a escribir days", async ({
  page,
}) => {
  await startAtCruiseStep(page);

  await page
    .getByLabel(
      "¿Cuántas noches dura tu crucero?"
    )
    .fill("7");

  await page
    .getByRole("button", {
      name: "Continuar",
    })
    .click();

  await expect(page).toHaveURL(
    /\/wizard\/consumption$/
  );

  const stored = await page.evaluate(
    () =>
      JSON.parse(
        window.localStorage.getItem(
          "drinkpilot-wizard"
        ) ?? "{}"
      ) as Record<string, unknown>
  );

  expect(stored).toMatchObject({
    storageSchemaVersion: 2,
    cruiseNights: 7,
  });
  expect(stored).not.toHaveProperty(
    "days"
  );
});

test("recupera el wizard ante una sesión corrupta", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("drinkpilot-wizard", "{no-json");
  });

  await page.goto("/wizard");

  await expect(
    page.getByRole("heading", { name: "¿Con quién navegas?" })
  ).toBeVisible();
  await expect(page.getByLabel("¿Cuántas noches dura tu crucero?")).toHaveValue("");
});

test("normaliza sesiones antiguas con más de 10 personas", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "drinkpilot-wizard",
      JSON.stringify({
        storageSchemaVersion: 2,
        cruiseLine: "costa",
        cruiseNights: 7,
        coffee: 1,
        people: 25,
      })
    );
  });

  await page.goto("/wizard/people");

  await expect(
    page.getByLabel("Cantidad de adultos")
  ).toContainText("10");

  await expect(
    page.getByRole("button", { name: "Aumentar adultos" })
  ).toBeDisabled();
});

test("expone errores accesibles para límites de noches y personas", async ({
  page,
}) => {
  await page.goto("/wizard");

  const nights = page.getByLabel("¿Cuántas noches dura tu crucero?");
  await nights.fill("366");

  await expect(nights).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("entre 1 y 365")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continuar" })
  ).toBeDisabled();

  await page.addInitScript(() => {
    window.localStorage.setItem(
      "drinkpilot-wizard",
      JSON.stringify({
        storageSchemaVersion: 2,
        cruiseLine: "costa",
        cruiseNights: 7,
        coffee: 1,
      })
    );
  });
  await page.goto("/wizard/people");

  const decreasePeople = page.getByRole("button", {
    name: "Disminuir adultos",
  });

  const increasePeople = page.getByRole("button", {
    name: "Aumentar adultos",
  });

  const peopleQuantity = page.getByLabel(
    "Cantidad de adultos"
  );

  await expect(peopleQuantity).toContainText("1");
  await expect(decreasePeople).toBeDisabled();

  for (let index = 0; index < 9; index += 1) {
    await increasePeople.click();
  }

  await expect(peopleQuantity).toContainText("10");
  await expect(increasePeople).toBeDisabled();

  await expect(
    page.getByRole("button", { name: "Continuar" })
  ).toBeEnabled();
});
