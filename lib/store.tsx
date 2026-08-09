"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  isCruiseLineKey,
  type CruiseLineKey,
} from "@/data/cruiseLines";

import {
  getAllPackages,
  getDefaultCruiseLine,
} from "@/lib/packageService";

import {
  resolveStoredCruiseContext,
} from "@/lib/cruiseContextStorage";

import {
  resolveStoredCocktailConsumption,
} from "@/lib/cocktailConsumptionStorage";

import {
  resolveStoredWizardProgress,
} from "@/lib/wizardProgressStorage";

import {
  resolveStoredWizardPreferences,
} from "@/lib/wizardPreferencesStorage";

import {
  isPositiveSafePrice,
} from "@/lib/priceValidation";

import {
  resolveStoredSelectedDrinkPrices,
  type SelectedDrinkPrices,
} from "@/lib/selectedDrinkPriceStorage";

import {
  resolveSelectedDrinkPricesForCruiseContext,
} from "@/lib/selectedDrinkPriceContext";

export type CustomPackagePrices = Record<
  string,
  number | null
>;

export type WizardData = {
  /*
   * Naviera activa.
   */
  cruiseLine: CruiseLineKey;

  /*
   * Contexto de la navegación.
   *
   * null = todavía desconocido.
   *
   * Estos campos permitirán resolver
   * reglas dependientes de mercado
   * y fecha sin inventar contexto.
   */
  market: string | null;

  sailingRegion: string | null;

  onboardCurrency: string | null;

  sailingDate: string | null;

  days: number;

  coffee: number;
  water: number;
  soda: number;
  beer: number;
  wine: number;
  cocktail: number;

  /*
   * Consumption v2.
   *
   * null = composición de cócteles
   * todavía desconocida.
   */
  alcoholicCocktail:
    number | null;

  nonAlcoholicCocktail:
    number | null;

  /*
   * Preferencias de cobertura.
   */
  alcoholicCocktails: boolean;
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

  /*
   * Precios concretos de bebidas
   * introducidos por el usuario.
   *
   * category -> SelectedDrinkPrice
   */
  selectedDrinkPrices:
    SelectedDrinkPrices;

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

    market: null,

    sailingRegion: null,

    onboardCurrency: null,

    sailingDate: null,

    days: 0,

    coffee: 0,
    water: 0,
    soda: 0,
    beer: 0,
    wine: 0,
    cocktail: 0,

    alcoholicCocktail:
      null,

    nonAlcoholicCocktail:
      null,

    alcoholicCocktails:
      false,

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

    selectedDrinkPrices:
      {},

    /*
     * 0 = paso Personas todavía
     * no confirmado.
     *
     * PeopleForm propone visualmente 1,
     * pero el estado solo se vuelve
     * positivo cuando el usuario confirma
     * explícitamente el paso.
     */
    people: 0,
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
  return isPositiveSafePrice(value)
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

        const storedCruiseContext =
          resolveStoredCruiseContext({
            market:
              parsedData.market,

            sailingRegion:
              parsedData.sailingRegion,

            onboardCurrency:
              parsedData.onboardCurrency,

            sailingDate:
              parsedData.sailingDate,
          });

        const hydratedCruiseContext = {
          cruiseLine,

          ...storedCruiseContext,
        };

        const storedSelectedDrinkPrices =
          resolveSelectedDrinkPricesForCruiseContext({
            cruiseContext:
              hydratedCruiseContext,

            selectedDrinkPrices:
              resolveStoredSelectedDrinkPrices(
                parsedData.selectedDrinkPrices
              ),
          });

        const storedCocktailConsumption =
          resolveStoredCocktailConsumption(
            {
              cocktail:
                parsedData.cocktail,

              alcoholicCocktail:
                parsedData
                  .alcoholicCocktail,

              nonAlcoholicCocktail:
                parsedData
                  .nonAlcoholicCocktail,
            },
            baseData.cocktail
          );

        const storedWizardProgress =
          resolveStoredWizardProgress(
            parsedData,
            baseData
          );

        const storedWizardPreferences =
          resolveStoredWizardPreferences(
            parsedData,
            baseData
          );

        /*
         * La hidratación posmontaje desde
         * localStorage evita divergencias
         * entre servidor y cliente.
         */
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData({
          cruiseLine,

          market:
            hydratedCruiseContext
              .market,

          sailingRegion:
            hydratedCruiseContext
              .sailingRegion,

          onboardCurrency:
            hydratedCruiseContext
              .onboardCurrency,

          sailingDate:
            hydratedCruiseContext
              .sailingDate,

          days:
            storedWizardProgress
              .days,

          coffee:
            storedWizardProgress
              .coffee,

          water:
            storedWizardProgress
              .water,

          soda:
            storedWizardProgress
              .soda,

          beer:
            storedWizardProgress
              .beer,

          wine:
            storedWizardProgress
              .wine,

          cocktail:
            storedCocktailConsumption
              .cocktail,

          alcoholicCocktail:
            storedCocktailConsumption
              .alcoholicCocktail,

          nonAlcoholicCocktail:
            storedCocktailConsumption
              .nonAlcoholicCocktail,

          alcoholicCocktails:
            storedWizardPreferences
              .alcoholicCocktails,

          nonAlcoholicCocktails:
            storedWizardPreferences
              .nonAlcoholicCocktails,

          premiumCocktails:
            storedWizardPreferences
              .premiumCocktails,

          bottledBeer:
            storedWizardPreferences
              .bottledBeer,

          premiumSpirits:
            storedWizardPreferences
              .premiumSpirits,

          bottledWaterDailyAllowance:
            storedWizardPreferences
              .bottledWaterDailyAllowance,

          bottledWaterUnlimited:
            storedWizardPreferences
              .bottledWaterUnlimited,

          customPackagePrices,

          selectedDrinkPrices:
            storedSelectedDrinkPrices,

          people:
            storedWizardProgress
              .people,
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
