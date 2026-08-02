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

  packageKey: string;
  packageName: string;
  packagePrice: number;

  coffee: number;
  water: number;
  soda: number;
  beer: number;
  wine: number;
  cocktail: number;

  drinksPerDay: number;

  people: number;
};

type StoreContextType = {
  data: WizardData;
  setData: React.Dispatch<React.SetStateAction<WizardData>>;
  hydrated: boolean;
};

const STORAGE_KEY = "drinkpilot-wizard";

const initialData: WizardData = {
  days: 0,

  packageKey: "",
  packageName: "",
  packagePrice: 0,

  coffee: 0,
  water: 0,
  soda: 0,
  beer: 0,
  wine: 0,
  cocktail: 0,

  drinksPerDay: 0,

  people: 1,
};

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [data, setData] = useState<WizardData>(initialData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedData = window.localStorage.getItem(STORAGE_KEY);

      if (savedData) {
        const parsedData = JSON.parse(savedData) as Partial<WizardData>;

        setData({
          ...initialData,
          ...parsedData,
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

  return (
    <StoreContext.Provider
      value={{
        data,
        setData,
        hydrated,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error(
      "useStore debe utilizarse dentro de StoreProvider"
    );
  }

  return context;
}