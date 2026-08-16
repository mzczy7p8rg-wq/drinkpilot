export type CalculationInput = {
  /*
   * Noches del crucero utilizadas como unidad
   * canónica del modelo de consumo.
   */
  cruiseNights: number;

  /*
   * Días realmente facturables del
   * paquete.
   *
   * undefined conserva el comportamiento
   * histórico y utiliza todos los días
   * del crucero.
   */
  packageChargeUnits?: number;

  people: number;

  packagePricePerChargeUnit: number;

  coffee: number;
  water: number;
  soda: number;
  juice?: number;
  beer: number;
  wine: number;
  cocktail: number;

  coffeePrice: number;
  waterPrice: number;
  sodaPrice: number;
  juicePrice?: number;
  beerPrice: number;
  winePrice: number;
  cocktailPrice: number;
};

export type RecommendationLevel =
  | "not-worth-it"
  | "very-close"
  | "worth-considering"
  | "worth-it"
  | "strongly-worth-it";

export type CalculationResult = {
  packageCost: number;
  drinksCost: number;
  savings: number;

  recommended: boolean;

  recommendationLevel: RecommendationLevel;

  // Coste diario de bebidas por persona
  dailyDrinkCost: number;

  // Diferencia diaria entre consumo estimado
  // y precio por unidad facturable del paquete
  dailyMargin: number;

  // Porcentaje de ahorro respecto al coste
  // estimado pagando bebidas por separado
  savingsPercentage: number;

  // Coste total durante todo el crucero
  // para todas las personas
  coffeeCost: number;
  waterCost: number;
  sodaCost: number;
  juiceCost: number;
  beerCost: number;
  wineCost: number;
  cocktailCost: number;

  breakEvenDrinksPerDay: number;
};

function assertSafeCalculationValues(
  values: readonly number[]
): void {
  if (
    values.some(
      (value) =>
        !Number.isFinite(value) ||
        Math.abs(value) > Number.MAX_SAFE_INTEGER
    )
  ) {
    throw new RangeError(
      "Calculation exceeds the safe numeric range"
    );
  }
}

export function calculateRecommendation(
  input: CalculationInput
): CalculationResult {
  /*
   * Coste diario por persona
   */

  const dailyCoffeeCost =
    input.coffee * input.coffeePrice;

  const dailyWaterCost =
    input.water * input.waterPrice;

  const dailySodaCost =
    input.soda * input.sodaPrice;

  const dailyBeerCost =
    input.beer * input.beerPrice;

  const dailyJuiceCost =
    (input.juice ?? 0) *
    (input.juicePrice ?? 0);

  const dailyWineCost =
    input.wine * input.winePrice;

  const dailyCocktailCost =
    input.cocktail * input.cocktailPrice;

  const dailyDrinkCost =
    dailyCoffeeCost +
    dailyWaterCost +
    dailySodaCost +
    dailyJuiceCost +
    dailyBeerCost +
    dailyWineCost +
    dailyCocktailCost;

  /*
   * Coste total de cada tipo de bebida
   * durante todo el crucero
   */

  /*
   * El consumo utiliza siempre la
   * duración completa del crucero.
   */
  const consumptionMultiplier =
    input.cruiseNights * input.people;

  const coffeeCost =
    dailyCoffeeCost *
    consumptionMultiplier;

  const waterCost =
    dailyWaterCost *
    consumptionMultiplier;

  const sodaCost =
    dailySodaCost *
    consumptionMultiplier;

  const beerCost =
    dailyBeerCost *
    consumptionMultiplier;

  const juiceCost =
    dailyJuiceCost *
    consumptionMultiplier;

  const wineCost =
    dailyWineCost *
    consumptionMultiplier;

  const cocktailCost =
    dailyCocktailCost *
    consumptionMultiplier;

  /*
   * Coste total pagando bebidas por separado
   */

  const drinksCost =
    coffeeCost +
    waterCost +
    sodaCost +
    juiceCost +
    beerCost +
    wineCost +
    cocktailCost;

  /*
   * Coste total del paquete
   */

  const packageChargeUnits =
    input.packageChargeUnits ??
    input.cruiseNights;

  const packageMultiplier =
    packageChargeUnits *
    input.people;

  const packageCost =
    input.packagePricePerChargeUnit *
    packageMultiplier;

  /*
   * Diferencia total
   *
   * Positivo = paquete más barato
   * Negativo = bebidas por separado más baratas
   */

  const savings =
    drinksCost - packageCost;

  /*
   * Coste equivalente diario del paquete
   * por persona durante todos los días
   * reales de consumo.
   *
   * Si el paquete se factura menos días
   * que la duración del crucero, repartimos
   * ese coste entre los días de consumo para
   * mantener coherentes savings, dailyMargin
   * y recommendationLevel.
   */

  const effectivePackagePricePerCruiseDay =
    input.cruiseNights > 0
      ? (
          input.packagePricePerChargeUnit *
          packageChargeUnits
        ) / input.cruiseNights
      : input.packagePricePerChargeUnit;

  /*
   * Diferencia diaria equivalente por persona
   */

  const dailyMargin =
    dailyDrinkCost -
    effectivePackagePricePerCruiseDay;

  /*
   * Porcentaje de ahorro sobre el coste
   * estimado de las bebidas por separado
   */

  const savingsPercentage =
    drinksCost > 0
      ? (savings / drinksCost) * 100
      : 0;

  /*
   * Consumo diario total
   */

  const totalDrinksPerDay =
    input.coffee +
    input.water +
    input.soda +
    input.beer +
    input.wine +
    input.cocktail;

  /*
   * Precio medio de las bebidas según
   * el patrón concreto del usuario
   */

  const averageDrinkPrice =
    totalDrinksPerDay > 0
      ? dailyDrinkCost / totalDrinksPerDay
      : 0;

  /*
   * Punto de equilibrio
   */

  const breakEvenDrinksPerDay =
    averageDrinkPrice > 0
      ? effectivePackagePricePerCruiseDay /
        averageDrinkPrice
      : 0;

  assertSafeCalculationValues([
    packageCost,
    drinksCost,
    savings,
    dailyDrinkCost,
    dailyMargin,
    savingsPercentage,
    coffeeCost,
    waterCost,
    sodaCost,
    juiceCost,
    beerCost,
    wineCost,
    cocktailCost,
    breakEvenDrinksPerDay,
  ]);

  /*
   * Nivel de recomendación
   *
   * Se basa en el margen diario por persona,
   * no en el ahorro total del crucero.
   *
   * Esto evita que un crucero largo parezca
   * una gran oportunidad únicamente por duración.
   */

  let recommendationLevel: RecommendationLevel;

  if (dailyMargin <= 0) {
    recommendationLevel = "not-worth-it";
  } else if (dailyMargin < 3) {
    recommendationLevel = "very-close";
  } else if (dailyMargin < 8) {
    recommendationLevel = "worth-considering";
  } else if (dailyMargin < 15) {
    recommendationLevel = "worth-it";
  } else {
    recommendationLevel = "strongly-worth-it";
  }

  return {
    packageCost,
    drinksCost,
    savings,

    recommended: savings > 0,

    recommendationLevel,

    dailyDrinkCost,
    dailyMargin,
    savingsPercentage,

    coffeeCost,
    waterCost,
    sodaCost,
    juiceCost,
    beerCost,
    wineCost,
    cocktailCost,

    breakEvenDrinksPerDay,
  };
}
