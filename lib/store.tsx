"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import type {
  CruiseLineKey,
} from "@/data/cruiseLines";

export type CustomPackagePrices = Record<
  string,
  number | null
>;

export type WizardData = {
  /*
   * Naviera activa.
   */
  cruiseLine: CruiseLineKey;

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
   */
  bottledWaterDailyAllowance: boolean;
  bottledWaterUnlimited: boolean;

  /*
   * MODELO UNIVERSAL DE PRECIOS
   *
   * packageKey -> precio real
   * introducido por el usuario.
   */
  customPackagePrices:
    CustomPackagePrices;

  people: number;
};

/*
 * Estructura antigua almacenada
 * en localStorage.
 *
 * Estos campos NO forman parte del
 * estado actual de DrinkPilot.
 *
 * Existen exclusivamente para poder
 * migrar sesiones creadas antes del
 * modelo customPackagePrices.
 */
type LegacyStoredWizardData =
  Partial<WizardData> & {
    myDrinksSoftCustomPrice?:
      number | null;

    myDrinksCustomPrice?:
      number | null;

    myDrinksPlusCustomPrice?:
      number | null;
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

/*
 * Precios iniciales de Costa.
 *
 * Cuando incorporemos nuevas navieras,
 * esta inicialización podrá generarse
 * desde la configuración activa.
 */
const initialCustomPackagePrices:
  CustomPackagePrices = {
    myDrinksSoft: null,
    myDrinks: null,
    myDrinksPlus: null,
  };

const initialData: WizardData = {
  cruiseLine: "costa",

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

  customPackagePrices: {
    ...initialCustomPackagePrices,
  },

  people: 1,
};

const StoreContext =
  createContext<StoreContextType | null>(
    null
  );

function sanitizePrice(
  value: unknown
): number | null {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  )
    ? value
    : null;
}

function sanitizeCustomPackagePrices(
  value: unknown
): CustomPackagePrices {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  const result:
    CustomPackagePrices = {};

  for (
    const [key, rawValue] of
    Object.entries(value)
  ) {
    result[key] =
      sanitizePrice(rawValue);
  }

  return result;
}

export function StoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [data, setData] =
    useState<WizardData>(
      initialData
    );

  const [
    hydrated,
    setHydrated,
  ] = useState(false);

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
          ) as LegacyStoredWizardData;

        /*
         * MIGRACIÓN LEGACY
         *
         * Recuperamos precios guardados
         * antes de customPackagePrices.
         */
        const legacySoftPrice =
          sanitizePrice(
            parsedData
              .myDrinksSoftCustomPrice
          );

        const legacyMyDrinksPrice =
          sanitizePrice(
            parsedData
              .myDrinksCustomPrice
          );

        const legacyPlusPrice =
          sanitizePrice(
            parsedData
              .myDrinksPlusCustomPrice
          );

        /*
         * Recuperamos el nuevo modelo
         * si la sesión ya lo contiene.
         */
        const storedCustomPrices =
          sanitizeCustomPackagePrices(
            parsedData
              .customPackagePrices
          );

        /*
         * El modelo nuevo tiene
         * prioridad.
         *
         * Si una clave concreta no
         * existe todavía, utilizamos
         * el precio legacy correspondiente.
         */
        const customPackagePrices:
          CustomPackagePrices = {
            ...initialCustomPackagePrices,

            myDrinksSoft:
              "myDrinksSoft" in
              storedCustomPrices
                ? storedCustomPrices
                    .myDrinksSoft
                : legacySoftPrice,

            myDrinks:
              "myDrinks" in
              storedCustomPrices
                ? storedCustomPrices
                    .myDrinks
                : legacyMyDrinksPrice,

            myDrinksPlus:
              "myDrinksPlus" in
              storedCustomPrices
                ? storedCustomPrices
                    .myDrinksPlus
                : legacyPlusPrice,

            ...storedCustomPrices,
          };

        setData({
          /*
           * Actualmente solo Costa está
           * registrada como opción válida.
           */
          cruiseLine:
            parsedData.cruiseLine ===
            "costa"
              ? parsedData.cruiseLine
              : initialData.cruiseLine,

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

          customPackagePrices,

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
      /*
       * A partir de esta versión,
       * solo se persiste WizardData
       * moderno.
       *
       * Los campos legacy dejan de
       * escribirse en localStorage.
       */
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
  }, [
    data,
    hydrated,
  ]);

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

    setData({
      ...initialData,

      customPackagePrices: {
        ...initialCustomPackagePrices,
      },
    });
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
    useContext(
      StoreContext
    );

  if (!context) {
    throw new Error(
      "useStore debe utilizarse dentro de StoreProvider"
    );
  }

  return context;
}