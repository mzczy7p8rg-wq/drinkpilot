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
            "¿Te compensa el paquete de bebidas?",
        }
      )
    ).toBeVisible();

    await expect(
      page.getByRole("link", {
        name: "Continuar análisis",
      })
    ).toBeHidden();

    await expect(
      page.getByText(
        "DrinkPilot ofrece una estimación orientativa."
      )
    ).toBeVisible();

    await expect(
      page.getByText(
        /Los precios reales pueden variar según la naviera, la ruta, la fecha, los impuestos, las propinas y las condiciones a bordo\./
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
  "Continuar análisis conserva el progreso anterior",
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

    await page.goto("/");

    await page
      .getByRole("link", {
        name: "Continuar análisis",
      })
      .click();

    await expect(page).toHaveURL(/\/wizard$/);

    await expect(
      page.getByRole("button", {
        name: /MSC Cruises/i,
      })
    ).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    await expect(
      page.getByLabel("Duración del crucero")
    ).toHaveValue("7");
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
