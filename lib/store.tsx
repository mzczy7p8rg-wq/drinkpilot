"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type WizardData = {
  days: number;

  coffee: number;
  water: number;
  soda: number;
  beer: number;
  wine: number;
  cocktail: number;

  drinksPerDay: number;

  /*
   * Preferencias de cobertura.
   */
  nonAlcoholicCocktails: boolean;
  premiumCocktails: boolean;
  bottledBeer: boolean;
  premiumSpirits: boolean;

  /*
   * Agua embotellada v2.
   *
   * dailyAllowance:
   * el usuario valora disponer al menos
   * de una botella diaria.
   *
   * unlimited:
   * el usuario necesita agua embotellada
   * sin límite.
   */
  bottledWaterDailyAllowance: boolean;
  bottledWaterUnlimited: boolean;

  /*
   * Precios personalizados introducidos
   * por el usuario desde su reserva.
   *
   * null = usar precio de referencia.
   */
  myDrinksCustomPrice: number | null;
  myDrinksPlusCustomPrice: number | null;

  people: number;
};

type StoreContextType = {
  data: WizardData;

  setData: React.Dispatch<
    React.SetStateAction<WizardData>
  >;

  hydrated: boolean;

  resetData: () => void;
};

const STORAGE_KEY =
  "drinkpilot-wizard";

const initialData: WizardData = {
  days: 0,

  coffee: 0,
  water: 0,
  soda: 0,
  beer: 0,
  wine: 0,
  cocktail: 0,

  drinksPerDay: 0,

  nonAlcoholicCocktails: false,
  premiumCocktails: false,
  bottledBeer: false,
  premiumSpirits: false,

  bottledWaterDailyAllowance: false,
  bottledWaterUnlimited: false,

  myDrinksCustomPrice: null,
  myDrinksPlusCustomPrice: null,

  people: 1,
};

const StoreContext =
  createContext<StoreContextType | null>(
    null
  );

export function StoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [data, setData] =
    useState<WizardData>(initialData);

  const [hydrated, setHydrated] =
    useState(false);

  useEffect(() => {
    try {
      const savedData =
        window.localStorage.getItem(
          STORAGE_KEY
        );

      if (savedData) {
        const parsedData =
          JSON.parse(
            savedData
          ) as Partial<WizardData>;

        setData({
          days:
            typeof parsedData.days ===
            "number"
              ? parsedData.days
              : initialData.days,

          coffee:
            typeof parsedData.coffee ===
            "number"
              ? parsedData.coffee
              : initialData.coffee,

          water:
            typeof parsedData.water ===
            "number"
              ? parsedData.water
              : initialData.water,

          soda:
            typeof parsedData.soda ===
            "number"
              ? parsedData.soda
              : initialData.soda,

          beer:
            typeof parsedData.beer ===
            "number"
              ? parsedData.beer
              : initialData.beer,

          wine:
            typeof parsedData.wine ===
            "number"
              ? parsedData.wine
              : initialData.wine,

          cocktail:
            typeof parsedData.cocktail ===
            "number"
              ? parsedData.cocktail
              : initialData.cocktail,

          drinksPerDay:
            typeof parsedData.drinksPerDay ===
            "number"
              ? parsedData.drinksPerDay
              : initialData.drinksPerDay,

          nonAlcoholicCocktails:
            typeof parsedData.nonAlcoholicCocktails ===
            "boolean"
              ? parsedData.nonAlcoholicCocktails
              : initialData.nonAlcoholicCocktails,

          premiumCocktails:
            typeof parsedData.premiumCocktails ===
            "boolean"
              ? parsedData.premiumCocktails
              : initialData.premiumCocktails,

          bottledBeer:
            typeof parsedData.bottledBeer ===
            "boolean"
              ? parsedData.bottledBeer
              : initialData.bottledBeer,

          premiumSpirits:
            typeof parsedData.premiumSpirits ===
            "boolean"
              ? parsedData.premiumSpirits
              : initialData.premiumSpirits,

          bottledWaterDailyAllowance:
            typeof parsedData.bottledWaterDailyAllowance ===
            "boolean"
              ? parsedData.bottledWaterDailyAllowance
              : initialData.bottledWaterDailyAllowance,

          bottledWaterUnlimited:
            typeof parsedData.bottledWaterUnlimited ===
            "boolean"
              ? parsedData.bottledWaterUnlimited
              : initialData.bottledWaterUnlimited,

          myDrinksCustomPrice:
            typeof parsedData.myDrinksCustomPrice ===
              "number" &&
            parsedData.myDrinksCustomPrice > 0
              ? parsedData.myDrinksCustomPrice
              : null,

          myDrinksPlusCustomPrice:
            typeof parsedData.myDrinksPlusCustomPrice ===
              "number" &&
            parsedData.myDrinksPlusCustomPrice >
              0
              ? parsedData.myDrinksPlusCustomPrice
              : null,

          people:
            typeof parsedData.people ===
            "number"
              ? parsedData.people
              : initialData.people,
        });
      }
    } catch (error) {
      console.error(
        "No se pudieron recuperar los datos de DrinkPilot:",
        error
      );
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error(
        "No se pudieron guardar los datos de DrinkPilot:",
        error
      );
    }
  }, [data, hydrated]);

  function resetData() {
    try {
      window.localStorage.removeItem(
        STORAGE_KEY
      );
    } catch (error) {
      console.error(
        "No se pudieron borrar los datos de DrinkPilot:",
        error
      );
    }

    setData(initialData);
  }

  return (
    <StoreContext.Provider
      value={{
        data,
        setData,
        hydrated,
        resetData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context =
    useContext(StoreContext);

  if (!context) {
    throw new Error(
      "useStore debe utilizarse dentro de StoreProvider"
    );
  }

  return context;
}