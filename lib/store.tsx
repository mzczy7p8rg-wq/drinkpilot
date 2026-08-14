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
import { isValidTravelerCount } from "@/lib/wizardNumberValidation";

import {
  resolveStoredSelectedDrinkPrices,
  type SelectedDrinkPrices,
} from "@/lib/selectedDrinkPriceStorage";

import {
  resolveSelectedDrinkPricesForCruiseContext,
} from "@/lib/selectedDrinkPriceContext";
import {
  createCustomPackagePrice,
  resolveStoredCustomPackagePrice,
  type CustomPackagePrices,
} from "@/lib/customPackagePrice";
import {
  ACTIVE_ANALYSIS_KEY,
  SAVED_ANALYSES_KEY,
  createSavedAnalysis,
  parseStoredAnalyses,
  renameSavedAnalysis,
  serializeSavedAnalyses,
  upsertSavedAnalysis,
  type SavedAnalysis,
} from "@/lib/savedAnalyses";

export type { CustomPackagePrices } from "@/lib/customPackagePrice";

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

  /*
   * Nombre opcional introducido por el usuario para identificar
   * el crucero. No participa en ningún cálculo económico.
   */
  shipName?: string | null;

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
  draftBeer: boolean;
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
   * Moneda elegida para los precios
   * de paquete de la reserva.
   *
   * Se conserva aunque todavía no se
   * haya introducido ningún importe.
   */
  packagePriceCurrency:
    string | null;

  /*
   * Precios concretos de bebidas
   * introducidos por el usuario.
   *
   * category -> SelectedDrinkPrice
   */
  selectedDrinkPrices:
    SelectedDrinkPrices;

  people: number;

  /*
   * Composición real del grupo.
   * `people` se conserva como el número de adultos que participa
   * en el cálculo económico actual. Los menores se muestran como
   * contexto, sin inventar precios o consumos para ellos.
   */
  adults: number;
  minors: number;
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

  savedAnalyses: SavedAnalysis[];

  activeAnalysisId: string | null;

  loadAnalysis: (id: string) => boolean;

  duplicateAnalysis: (id: string) => string | null;

  renameAnalysis: (id: string, name: string) => boolean;

  deleteAnalysis: (id: string) => void;
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

    shipName: null,

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

    draftBeer:
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

    packagePriceCurrency:
      null,

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
    adults: 0,
    minors: 0,
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
  value: unknown,
  cruiseLine: CruiseLineKey
): CustomPackagePrices {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  const stored = value as Record<string, unknown>;
  const result: CustomPackagePrices = {};

  for (const pkg of getAllPackages(cruiseLine)) {
    if (pkg.key in stored) {
      result[pkg.key] = resolveStoredCustomPackagePrice(
        stored[pkg.key],
        pkg.currency
      );
    }
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

  const [
    savedAnalyses,
    setSavedAnalyses,
  ] = useState<SavedAnalysis[]>([]);

  const [
    activeAnalysisId,
    setActiveAnalysisId,
  ] = useState<string | null>(null);

  /*
   * La hidratación del almacenamiento del navegador solo puede ocurrir
   * después del montaje. Estas actualizaciones forman una única carga
   * inicial del estado persistido.
   */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const storedAnalyses = parseStoredAnalyses(
        window.localStorage.getItem(SAVED_ANALYSES_KEY)
      );
      const storedActiveAnalysisId =
        window.localStorage.getItem(ACTIVE_ANALYSIS_KEY);

      setSavedAnalyses(storedAnalyses);
      setActiveAnalysisId(
        storedActiveAnalysisId &&
        storedAnalyses.some(
          (analysis) => analysis.id === storedActiveAnalysisId
        )
          ? storedActiveAnalysisId
          : null
      );

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
              .customPackagePrices,
            cruiseLine
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
              createCustomPackagePrice({
                price: legacySoftPrice,
                currency: "EUR",
              });
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
              createCustomPackagePrice({
                price: legacyStandardPrice,
                currency: "EUR",
              });
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
              createCustomPackagePrice({
                price: legacyPlusPrice,
                currency: "EUR",
              });
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

          shipName:
            typeof parsedData.shipName === "string" &&
            parsedData.shipName.trim() !== ""
              ? parsedData.shipName.trim().slice(0, 80)
              : null,

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

          draftBeer:
            storedWizardPreferences
              .draftBeer,

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

          packagePriceCurrency:
            parsedData.packagePriceCurrency === "EUR" ||
            parsedData.packagePriceCurrency === "USD"
              ? parsedData.packagePriceCurrency
              : null,

          selectedDrinkPrices:
            storedSelectedDrinkPrices,

          people:
            storedWizardProgress
              .people,

          adults:
            isValidTravelerCount(parsedData.adults)
              ? parsedData.adults
              : storedWizardProgress.people,

          minors:
            Number.isSafeInteger(parsedData.minors) &&
            Number(parsedData.minors) >= 0 &&
            Number(parsedData.minors) <= 10
              ? Number(parsedData.minors)
              : 0,
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
  /* eslint-enable react-hooks/set-state-in-effect */

  /*
   * Sincroniza el análisis activo con su colección local cada vez que
   * cambia el wizard. La colección visible debe actualizarse a la vez.
   */
  /* eslint-disable react-hooks/set-state-in-effect */
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

  useEffect(() => {
    if (!hydrated || data.people <= 0) {
      return;
    }

    const analysisId = activeAnalysisId ?? createSavedAnalysis(data).id;

    if (!activeAnalysisId) {
      setActiveAnalysisId(analysisId);
      window.localStorage.setItem(ACTIVE_ANALYSIS_KEY, analysisId);
    }

    setSavedAnalyses((previous) => {
      const next = upsertSavedAnalysis(previous, analysisId, data);
      window.localStorage.setItem(SAVED_ANALYSES_KEY, serializeSavedAnalyses(next));
      return next;
    });
  }, [activeAnalysisId, data, hydrated]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function resetData() {
    try {
      window.localStorage.removeItem(
        STORAGE_KEY
      );
      window.localStorage.removeItem(
        ACTIVE_ANALYSIS_KEY
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
    setActiveAnalysisId(null);
  }

  function loadAnalysis(id: string): boolean {
    const analysis = savedAnalyses.find((item) => item.id === id);

    if (!analysis) {
      return false;
    }

    const nextData = structuredClone(analysis.data);

    setData(nextData);
    setActiveAnalysisId(id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
    window.localStorage.setItem(ACTIVE_ANALYSIS_KEY, id);

    return true;
  }

  function duplicateAnalysis(id: string): string | null {
    const source = savedAnalyses.find((item) => item.id === id);

    if (!source) {
      return null;
    }

    const duplicate = createSavedAnalysis(source.data, {
      name: source.name ? `${source.name} (copia)` : null,
    });

    setSavedAnalyses((previous) => {
      const next = [duplicate, ...previous];
      window.localStorage.setItem(SAVED_ANALYSES_KEY, serializeSavedAnalyses(next));
      return next;
    });

    return duplicate.id;
  }

  function renameAnalysis(id: string, name: string): boolean {
    if (!savedAnalyses.some((analysis) => analysis.id === id)) {
      return false;
    }

    setSavedAnalyses((previous) => {
      const next = renameSavedAnalysis(previous, id, name);
      window.localStorage.setItem(SAVED_ANALYSES_KEY, serializeSavedAnalyses(next));
      return next;
    });

    return true;
  }

  function deleteAnalysis(id: string) {
    setSavedAnalyses((previous) => {
      const next = previous.filter((analysis) => analysis.id !== id);
      window.localStorage.setItem(SAVED_ANALYSES_KEY, serializeSavedAnalyses(next));
      return next;
    });

    if (activeAnalysisId === id) {
      resetData();
    }
  }

  return (
    <StoreContext.Provider
      value={{
        data,
        setData,
        hydrated,
        resetData,
        savedAnalyses,
        activeAnalysisId,
        loadAnalysis,
        duplicateAnalysis,
        renameAnalysis,
        deleteAnalysis,
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
