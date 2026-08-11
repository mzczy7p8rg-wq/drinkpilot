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

test(
  "Empezar análisis descarta la búsqueda anterior",
  async ({ page }) => {
    await page.goto("/wizard");

    await page
      .getByRole("button", {
        name: /MSC Cruises/i,
      })
      .click();

    await page
      .getByLabel("Duración del crucero")
      .fill("7");

    await page
      .getByRole("button", {
        name: "Continuar",
      })
      .click();

    await expect(page).toHaveURL(
      /\/wizard\/consumption$/
    );

    /*
     * Simula salir de DrinkPilot y volver
     * a entrar desde la portada.
     */
    await page.goto("/");

    await page
      .getByRole("link", {
        name: "Empezar análisis",
      })
      .click();

    await expect(page).toHaveURL(/\/wizard$/);

    await expect(
      page.getByRole("button", {
        name: /Costa Cruceros/i,
      })
    ).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    await expect(
      page.getByLabel("Duración del crucero")
    ).toHaveValue("");
  }
);
