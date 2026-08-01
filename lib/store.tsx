"use client";

import { createContext, useContext, useState, ReactNode } from "react";

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
};

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [data, setData] = useState<WizardData>({
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
  });

  return (
    <StoreContext.Provider value={{ data, setData }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore debe utilizarse dentro de StoreProvider");
  }

  return context;
}