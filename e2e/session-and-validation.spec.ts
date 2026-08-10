import { expect, test } from "@playwright/test";

test("restaura una sesión válida en Review", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "drinkpilot-wizard",
      JSON.stringify({
        cruiseLine: "costa",
        days: 7,
        coffee: 1,
        people: 2,
      })
    );
  });

  await page.goto("/wizard/review");

  await expect(
    page.getByRole("heading", { name: "Revisa tu análisis" })
  ).toBeVisible();
  await expect(page.getByText("7 días")).toBeVisible();
  await expect(page.getByText("2 personas")).toBeVisible();
});

test("recupera el wizard ante una sesión corrupta", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("drinkpilot-wizard", "{no-json");
  });

  await page.goto("/wizard");

  await expect(
    page.getByRole("heading", { name: "Cuéntanos tu crucero" })
  ).toBeVisible();
  await expect(page.getByLabel("Duración del crucero")).toHaveValue("");
});

test("normaliza sesiones antiguas con más de 10 personas", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "drinkpilot-wizard",
      JSON.stringify({
        cruiseLine: "costa",
        days: 7,
        coffee: 1,
        people: 25,
      })
    );
  });

  await page.goto("/wizard/people");

  await expect(
    page.getByLabel("Cantidad de personas")
  ).toContainText("10");

  await expect(
    page.getByRole("button", { name: "Aumentar personas" })
  ).toBeDisabled();
});

test("expone errores accesibles para límites de días y personas", async ({
  page,
}) => {
  await page.goto("/wizard");

  const days = page.getByLabel("Duración del crucero");
  await days.fill("366");

  await expect(days).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("entre 1 y 365")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continuar" })
  ).toBeDisabled();

  await page.addInitScript(() => {
    window.localStorage.setItem(
      "drinkpilot-wizard",
      JSON.stringify({
        cruiseLine: "costa",
        days: 7,
        coffee: 1,
      })
    );
  });
  await page.goto("/wizard/people");

  const decreasePeople = page.getByRole("button", {
    name: "Disminuir personas",
  });

  const increasePeople = page.getByRole("button", {
    name: "Aumentar personas",
  });

  const peopleQuantity = page.getByLabel(
    "Cantidad de personas"
  );

  await expect(peopleQuantity).toContainText("1");
  await expect(decreasePeople).toBeDisabled();

  for (let index = 0; index < 9; index += 1) {
    await increasePeople.click();
  }

  await expect(peopleQuantity).toContainText("10");
  await expect(increasePeople).toBeDisabled();

  await expect(
    page.getByRole("button", { name: "Revisar análisis" })
  ).toBeEnabled();
});
