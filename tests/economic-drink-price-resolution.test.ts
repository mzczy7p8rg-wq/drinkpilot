import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveEconomicDrinkPrice,
  resolveEconomicDrinkPriceForCurrency,
  resolveEconomicDrinkPrices,
  resolveEffectiveDrinkPrices,
} from "@/lib/economicDrinkPriceResolution";

describe("economic drink price resolution", () => {
  it("rechaza precios fuera del rango seguro", () => {
    expect(
      resolveEconomicDrinkPrice({
        price:
          Number.MAX_SAFE_INTEGER + 1,
        currency: "USD",
        source: "user",
      })
    ).toBeNull();
  });

  it("acepta un precio introducido por el usuario", () => {
    expect(
      resolveEconomicDrinkPrice({
        price: 4,
        currency: "USD",
        source: "user",
      })
    ).toBe(4);
  });

  it("acepta un precio oficial", () => {
    expect(
      resolveEconomicDrinkPrice({
        price: 3.25,
        currency: "USD",
        source: "official",
      })
    ).toBe(3.25);
  });

  it("acepta un precio documentado con contexto exacto", () => {
    expect(
      resolveEconomicDrinkPrice({
        price: 9,
        currency: "USD",
        source: "documented-menu",
        contextRelevance: "exact",
      })
    ).toBe(9);
  });

  it("no acepta económicamente un precio documentado solo compatible", () => {
    expect(
      resolveEconomicDrinkPrice({
        price: 9,
        currency: "USD",
        source: "documented-menu",
        contextRelevance: "compatible",
      })
    ).toBeNull();
  });

  it("expone la misma elegibilidad económica que utiliza la interfaz", () => {
    expect(
      resolveEconomicDrinkPriceForCurrency(
        {
          price: 9,
          currency: "USD",
          source: "documented-menu",
          contextRelevance:
            "compatible",
        },
        "USD"
      )
    ).toBeNull();

    expect(
      resolveEconomicDrinkPriceForCurrency(
        {
          price: 9,
          currency: "USD",
          source: "documented-menu",
          contextRelevance: "exact",
        },
        "usd"
      )
    ).toBe(9);
  });

  it("rechaza para la interfaz una selección expresada en otra moneda", () => {
    expect(
      resolveEconomicDrinkPriceForCurrency(
        {
          price: 5,
          currency: "USD",
          source: "user",
        },
        "EUR"
      )
    ).toBeNull();
  });

  it("resuelve una cesta económica sin inventar precios ausentes", () => {
    const result =
      resolveEconomicDrinkPrices({
        coffee: {
          price: 4,
          currency: "USD",
          source: "user",
        },

        water: {
          price: 3.25,
          currency: "USD",
          source: "documented-menu",
          contextRelevance: "exact",
        },

        beer: {
          price: 9,
          currency: "USD",
          source: "documented-menu",
          contextRelevance: "compatible",
        },
      });

    expect(result).toEqual({
      coffee: 4,
      water: 3.25,
      soda: null,
      beer: null,
      wine: null,
      cocktail: null,
    });
  });

  it("superpone selecciones válidas y conserva el resto de referencias", () => {
    const result =
      resolveEffectiveDrinkPrices(
        {
          coffee: 3,
          water: 2,
          soda: 4,
          beer: 8,
          wine: 10,
          cocktail: 12,
        },
        {
          coffee: {
            price: 5,
            currency: "EUR",
            source: "user",
          },
          beer: {
            price: 9,
            currency: "EUR",
            source: "documented-menu",
            contextRelevance:
              "compatible",
          },
        }
      );

    expect(result).toEqual({
      coffee: 5,
      water: 2,
      soda: 4,
      beer: 8,
      wine: 10,
      cocktail: 12,
    });
  });

  it("no mezcla una selección expresada en otra moneda", () => {
    const result =
      resolveEffectiveDrinkPrices(
        {
          coffee: 3,
          water: 2,
          soda: 4,
          beer: 8,
          wine: 10,
          cocktail: 12,
        },
        {
          coffee: {
            price: 7,
            currency: "USD",
            source: "user",
          },
        },
        "EUR"
      );

    expect(result.coffee).toBe(3);
  });
});
