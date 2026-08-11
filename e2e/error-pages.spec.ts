import { expect, test } from "@playwright/test";

test("muestra una página 404 propia y permite volver", async ({ page }) => {
  const response = await page.goto("/ruta-que-no-existe");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Esta página no existe" })
  ).toBeVisible();
  await page.getByRole("link", { name: "Ir al inicio" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", {
      name: "¿Te compensa el paquete de bebidas?",
    })
  ).toBeVisible();
});
