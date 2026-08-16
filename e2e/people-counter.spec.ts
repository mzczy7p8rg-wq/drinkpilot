import { expect, test } from "@playwright/test";

test("selecciona entre 1 y 10 adultos con controles menos y más", async ({
  page,
}) => {
  await page.goto("/wizard/people");

  const decrease = page.getByRole("button", {
    name: "Disminuir adultos",
  });
  const increase = page.getByRole("button", {
    name: "Aumentar adultos",
  });
  const quantity = page.getByLabel("Cantidad de adultos");

  await expect(quantity).toContainText("1");
  await expect(decrease).toBeDisabled();
  await expect(increase).toBeEnabled();

  for (let index = 0; index < 9; index += 1) {
    await increase.click();
  }

  await expect(quantity).toContainText("10");
  await expect(increase).toBeDisabled();
  await expect(decrease).toBeEnabled();

  await decrease.click();
  await expect(quantity).toContainText("9");

  await page
    .getByRole("button", { name: "Continuar" })
    .click();
  await expect(page).toHaveURL(/\/wizard$/);

  const stored = await page.evaluate(() =>
    JSON.parse(
      window.localStorage.getItem("drinkpilot-wizard") ?? "{}"
    )
  );

  expect(stored).toMatchObject({
    people: 9,
    adults: 9,
  });
});
