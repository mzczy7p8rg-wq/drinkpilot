"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  cruiseLines,
  type CruiseLineKey,
} from "@/data/cruiseLines";

import {
  getAllPackages,
  getDefaultCruiseLine,
} from "@/lib/packageService";

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
   * Agua embotellada.
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
 * Estructura histórica almacenada
 * por versiones anteriores.
 *
 * Estas propiedades NO forman parte
 * del estado moderno.
 *
 * Existen únicamente para migrar
 * sesiones antiguas.
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
 * NAVIERA POR DEFECTO
 *
 * Store ya no conoce el literal
 * de ninguna compañía.
 */
const DEFAULT_CRUISE_LINE =
  getDefaultCruiseLine();

/*
 * Crea el mapa vacío de precios
 * correspondiente a una naviera.
 *
 * Si mañana una naviera tiene:
 *
 * packageA
 * packageB
 * packageC
 *
 * devolverá automáticamente:
 *
 * {
 *   packageA: null,
 *   packageB: null,
 *   packageC: null
 * }
 */
function createEmptyPackagePrices(
  cruiseLine: CruiseLineKey
): CustomPackagePrices {
  return Object.fromEntries(
    getAllPackages(
      cruiseLine
    ).map(
      (pkg) => [
        pkg.key,
        null,
      ]
    )
  );
}

function createInitialData(
  cruiseLine:
    CruiseLineKey =
      DEFAULT_CRUISE_LINE
): WizardData {
  return {
    cruiseLine,

    days: 0,

    coffee: 0,
    water: 0,
    soda: 0,
    beer: 0,
    wine: 0,
    cocktail: 0,

    drinksPerDay: 0,

    nonAlcoholicCocktails:
      false,

    premiumCocktails:
      false,

    bottledBeer:
      false,

    premiumSpirits:
      false,

    bottledWaterDailyAllowance:
      false,

    bottledWaterUnlimited:
      false,

    customPackagePrices:
      createEmptyPackagePrices(
        cruiseLine
      ),

    people: 1,
  };
}

const initialData =
  createInitialData();

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

/*
 * Comprueba que una clave almacenada
 * corresponde realmente a una naviera
 * registrada.
 */
function isCruiseLineKey(
  value: unknown
): value is CruiseLineKey {
  return (
    typeof value === "string" &&
    value in cruiseLines
  );
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
      sanitizePrice(
        rawValue
      );
  }

  return result;
}

/*
 * Filtra los precios almacenados para
 * conservar únicamente packageKeys que
 * pertenecen a la naviera activa.
 *
 * Esto evita mezclar accidentalmente
 * paquetes de compañías diferentes.
 */
function resolvePackagePrices(
  cruiseLine: CruiseLineKey,
  storedPrices:
    CustomPackagePrices
): CustomPackagePrices {
  const emptyPrices =
    createEmptyPackagePrices(
      cruiseLine
    );

  const result:
    CustomPackagePrices = {
      ...emptyPrices,
  };

  for (
    const packageKey of
    Object.keys(
      emptyPrices
    )
  ) {
    if (
      packageKey in
      storedPrices
    ) {
      result[packageKey] =
        storedPrices[
          packageKey
        ];
    }
  }

  return result;
}

export function StoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    data,
    setData,
  ] = useState<WizardData>(
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
         * NAVIERA GUARDADA
         *
         * Si la clave ya no existe o
         * la sesión es antigua,
         * utilizamos la naviera
         * configurada por defecto.
         */
        const cruiseLine:
          CruiseLineKey =
            isCruiseLineKey(
              parsedData.cruiseLine
            )
              ? parsedData
                  .cruiseLine
              : DEFAULT_CRUISE_LINE;

        const baseData =
          createInitialData(
            cruiseLine
          );

        /*
         * Recuperamos precios del
         * modelo moderno.
         */
        const storedCustomPrices =
          sanitizeCustomPackagePrices(
            parsedData
              .customPackagePrices
          );

        /*
         * MIGRACIÓN HISTÓRICA
         *
         * Las sesiones anteriores al
         * mapa customPackagePrices
         * almacenaban tres propiedades
         * independientes.
         *
         * Esa estructura pertenecía a
         * la antigua naviera por defecto.
         *
         * Solo aplicamos esta migración
         * cuando la sesión corresponde
         * precisamente a esa naviera.
         */
        if (
          cruiseLine ===
          DEFAULT_CRUISE_LINE
        ) {
          const legacySoftPrice =
            sanitizePrice(
              parsedData
                .myDrinksSoftCustomPrice
            );

          const legacyStandardPrice =
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
           * IMPORTANTE:
           *
           * Estas tres claves solo
           * aparecen aquí porque son
           * nombres históricos que
           * debemos reconocer.
           *
           * Store no las utiliza para
           * crear el estado moderno.
           */
          if (
            !(
              "myDrinksSoft" in
              storedCustomPrices
            ) &&
            legacySoftPrice !==
              null
          ) {
            storedCustomPrices
              .myDrinksSoft =
              legacySoftPrice;
          }

          if (
            !(
              "myDrinks" in
              storedCustomPrices
            ) &&
            legacyStandardPrice !==
              null
          ) {
            storedCustomPrices
              .myDrinks =
              legacyStandardPrice;
          }

          if (
            !(
              "myDrinksPlus" in
              storedCustomPrices
            ) &&
            legacyPlusPrice !==
              null
          ) {
            storedCustomPrices
              .myDrinksPlus =
              legacyPlusPrice;
          }
        }

        /*
         * Solo dejamos pasar precios
         * pertenecientes a los paquetes
         * de la naviera activa.
         */
        const customPackagePrices =
          resolvePackagePrices(
            cruiseLine,
            storedCustomPrices
          );

        setData({
          cruiseLine,

          days:
            typeof parsedData.days ===
            "number"
              ? parsedData.days
              : baseData.days,

          coffee:
            typeof parsedData.coffee ===
            "number"
              ? parsedData.coffee
              : baseData.coffee,

          water:
            typeof parsedData.water ===
            "number"
              ? parsedData.water
              : baseData.water,

          soda:
            typeof parsedData.soda ===
            "number"
              ? parsedData.soda
              : baseData.soda,

          beer:
            typeof parsedData.beer ===
            "number"
              ? parsedData.beer
              : baseData.beer,

          wine:
            typeof parsedData.wine ===
            "number"
              ? parsedData.wine
              : baseData.wine,

          cocktail:
            typeof parsedData.cocktail ===
            "number"
              ? parsedData.cocktail
              : baseData.cocktail,

          drinksPerDay:
            typeof parsedData.drinksPerDay ===
            "number"
              ? parsedData.drinksPerDay
              : baseData.drinksPerDay,

          nonAlcoholicCocktails:
            typeof parsedData.nonAlcoholicCocktails ===
            "boolean"
              ? parsedData
                  .nonAlcoholicCocktails
              : baseData
                  .nonAlcoholicCocktails,

          premiumCocktails:
            typeof parsedData.premiumCocktails ===
            "boolean"
              ? parsedData
                  .premiumCocktails
              : baseData
                  .premiumCocktails,

          bottledBeer:
            typeof parsedData.bottledBeer ===
            "boolean"
              ? parsedData
                  .bottledBeer
              : baseData
                  .bottledBeer,

          premiumSpirits:
            typeof parsedData.premiumSpirits ===
            "boolean"
              ? parsedData
                  .premiumSpirits
              : baseData
                  .premiumSpirits,

          bottledWaterDailyAllowance:
            typeof parsedData.bottledWaterDailyAllowance ===
            "boolean"
              ? parsedData
                  .bottledWaterDailyAllowance
              : baseData
                  .bottledWaterDailyAllowance,

          bottledWaterUnlimited:
            typeof parsedData.bottledWaterUnlimited ===
            "boolean"
              ? parsedData
                  .bottledWaterUnlimited
              : baseData
                  .bottledWaterUnlimited,

          customPackagePrices,

          people:
            typeof parsedData.people ===
            "number"
              ? parsedData.people
              : baseData.people,
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
       * Persistimos únicamente
       * WizardData moderno.
       *
       * Los campos históricos no
       * vuelven a escribirse.
       */
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          data
        )
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

    setData(
      createInitialData()
    );
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