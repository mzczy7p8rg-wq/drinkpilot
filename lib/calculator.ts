export type CalculationInput = {
  days: number;
  people: number;

  packagePricePerDay: number;

  coffee: number;
  water: number;
  soda: number;
  beer: number;
  wine: number;
  cocktail: number;

  coffeePrice: number;
  waterPrice: number;
  sodaPrice: number;
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
  // y precio diario del paquete
  dailyMargin: number;

  // Porcentaje de ahorro respecto al coste
  // estimado pagando bebidas por separado
  savingsPercentage: number;

  // Coste total durante todo el crucero
  // para todas las personas
  coffeeCost: number;
  waterCost: number;
  sodaCost: number;
  beerCost: number;
  wineCost: number;
  cocktailCost: number;

  breakEvenDrinksPerDay: number;
};

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

  const dailyWineCost =
    input.wine * input.winePrice;

  const dailyCocktailCost =
    input.cocktail * input.cocktailPrice;

  const dailyDrinkCost =
    dailyCoffeeCost +
    dailyWaterCost +
    dailySodaCost +
    dailyBeerCost +
    dailyWineCost +
    dailyCocktailCost;

  /*
   * Coste total de cada tipo de bebida
   * durante todo el crucero
   */

  const multiplier =
    input.days * input.people;

  const coffeeCost =
    dailyCoffeeCost * multiplier;

  const waterCost =
    dailyWaterCost * multiplier;

  const sodaCost =
    dailySodaCost * multiplier;

  const beerCost =
    dailyBeerCost * multiplier;

  const wineCost =
    dailyWineCost * multiplier;

  const cocktailCost =
    dailyCocktailCost * multiplier;

  /*
   * Coste total pagando bebidas por separado
   */

  const drinksCost =
    coffeeCost +
    waterCost +
    sodaCost +
    beerCost +
    wineCost +
    cocktailCost;

  /*
   * Coste total del paquete
   */

  const packageCost =
    input.packagePricePerDay *
    multiplier;

  /*
   * Diferencia total
   *
   * Positivo = paquete más barato
   * Negativo = bebidas por separado más baratas
   */

  const savings =
    drinksCost - packageCost;

  /*
   * Diferencia diaria por persona
   */

  const dailyMargin =
    dailyDrinkCost -
    input.packagePricePerDay;

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
      ? input.packagePricePerDay /
        averageDrinkPrice
      : 0;

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
    beerCost,
    wineCost,
    cocktailCost,

    breakEvenDrinksPerDay,
  };
}