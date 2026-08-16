import {
  expect,
  type Page,
} from "@playwright/test";

export async function startAtCruiseStep(
  page: Page
): Promise<void> {
  await page.goto("/wizard/people");
  await page
    .getByRole("button", { name: "Continuar" })
    .click();
  await expect(page).toHaveURL(/\/wizard$/);
}
