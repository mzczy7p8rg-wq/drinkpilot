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
  it("acepta un precio introducido por el usuario", () => {
    expect(
      resolveEconomicDrinkPrice({
        category: "coffee",
        price: 4,
        currency: "USD",
        source: "user",
      })
    ).toBe(4);
  });

  it("acepta un precio oficial", () => {
    expect(
      resolveEconomicDrinkPrice({
        category: "water",
        price: 3.25,
        currency: "USD",
        source: "official",
      })
    ).toBe(3.25);
  });

  it("acepta un precio documentado con contexto exacto", () => {
    expect(
      resolveEconomicDrinkPrice({
        category: "beer",
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
        category: "beer",
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
          category: "beer",
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
          category: "beer",
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
          category: "coffee",
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
          category: "coffee",
          price: 4,
          currency: "USD",
          source: "user",
        },

        water: {
          category: "water",
          price: 3.25,
          currency: "USD",
          source: "documented-menu",
          contextRelevance: "exact",
        },

        beer: {
          category: "beer",
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
            category: "coffee",
            price: 5,
            currency: "EUR",
            source: "user",
          },
          beer: {
            category: "beer",
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
            category: "coffee",
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
