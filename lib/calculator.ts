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

export type CalculationResult = {
  packageCost: number;
  drinksCost: number;
  savings: number;
  recommended: boolean;

  // Coste diario por persona
  dailyDrinkCost: number;

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
   * Coste total de cada bebida durante
   * todo el crucero y para todas las personas
   */

  const coffeeCost =
    dailyCoffeeCost *
    input.days *
    input.people;

  const waterCost =
    dailyWaterCost *
    input.days *
    input.people;

  const sodaCost =
    dailySodaCost *
    input.days *
    input.people;

  const beerCost =
    dailyBeerCost *
    input.days *
    input.people;

  const wineCost =
    dailyWineCost *
    input.days *
    input.people;

  const cocktailCost =
    dailyCocktailCost *
    input.days *
    input.people;

  /*
   * Coste total pagando bebidas individualmente
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
    input.days *
    input.people;

  /*
   * Diferencia
   *
   * Positivo = el paquete ahorra dinero
   * Negativo = pagar por separado es más barato
   */

  const savings =
    drinksCost - packageCost;

  /*
   * Número total de bebidas consumidas
   * por persona y día
   */

  const totalDrinksPerDay =
    input.coffee +
    input.water +
    input.soda +
    input.beer +
    input.wine +
    input.cocktail;

  /*
   * Precio medio real de las bebidas
   * según el patrón de consumo del usuario
   */

  const averageDrinkPrice =
    totalDrinksPerDay > 0
      ? dailyDrinkCost / totalDrinksPerDay
      : 0;

  /*
   * Bebidas necesarias al día para que
   * el coste estimado iguale el precio
   * diario del paquete
   */

  const breakEvenDrinksPerDay =
    averageDrinkPrice > 0
      ? input.packagePricePerDay / averageDrinkPrice
      : 0;

  return {
    packageCost,
    drinksCost,
    savings,

    recommended: savings > 0,

    dailyDrinkCost,

    coffeeCost,
    waterCost,
    sodaCost,
    beerCost,
    wineCost,
    cocktailCost,

    breakEvenDrinksPerDay,
  };
}