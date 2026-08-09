import {
  expect,
  test,
} from "@playwright/test";

test(
  "landing abre el wizard",
  async ({ page }) => {

    await page.goto("/");

    await expect(
      page.getByRole(
        "heading",
        {
          name:
            "DrinkPilot",
        }
      )
    ).toBeVisible();


    await page
      .getByRole(
        "link",
        {
          name:
            "Empezar análisis",
        }
      )
      .click();


    await expect(
      page
    ).toHaveURL(
      /\/wizard$/
    );


    await expect(
      page.getByRole(
        "heading",
        {
          name:
            "Cuéntanos tu crucero",
        }
      )
    ).toBeVisible();

  }
);
