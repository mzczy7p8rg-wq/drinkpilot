import {
  expect,
  test,
} from "@playwright/test";
import { startAtCruiseStep } from "./wizard-helpers";

test(
  "landing abre el wizard",
  async ({ page }) => {

    await page.goto("/");

    await expect(
      page.getByRole(
        "heading",
        {
          name:
            "El paquete correcto, sin navegar a ciegas.",
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
        "Estimación transparente."
      )
    ).toBeVisible();

    await expect(
      page.getByText(
        /Nunca asumimos precios, mercados o condiciones que no conozcamos\./
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
      /\/wizard\/people$/
    );


    await expect(
      page.getByRole(
        "heading",
        {
          name:
            "¿Quién viaja?",
        }
      )
    ).toBeVisible();

  }
);

test(
  "Continuar análisis conserva el progreso anterior",
  async ({ page }) => {
    await startAtCruiseStep(page);

    await page
      .getByRole("button", {
        name: /MSC Cruises/i,
      })
      .click();

    await page
      .getByLabel("¿Cuántas noches dura tu crucero?")
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
      page.getByLabel("¿Cuántas noches dura tu crucero?")
    ).toHaveValue("7");
  }
);

test(
  "Empezar análisis descarta la búsqueda anterior",
  async ({ page }) => {
    await startAtCruiseStep(page);

    await page
      .getByRole("button", {
        name: /MSC Cruises/i,
      })
      .click();

    await page
      .getByLabel("¿Cuántas noches dura tu crucero?")
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

    await expect(page).toHaveURL(/\/wizard\/people$/);

    await expect(page.getByLabel("Cantidad de adultos")).toContainText("1");
    await expect(page.getByLabel("Cantidad de menores")).toContainText("0");

    await page.getByRole("button", { name: "Continuar" }).click();

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
      page.getByLabel("¿Cuántas noches dura tu crucero?")
    ).toHaveValue("");
  }
);
