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

  dailyDrinkCost: number;

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

  const coffeeCost =
    input.coffee * input.coffeePrice;

  const waterCost =
    input.water * input.waterPrice;

  const sodaCost =
    input.soda * input.sodaPrice;

  const beerCost =
    input.beer * input.beerPrice;

  const wineCost =
    input.wine * input.winePrice;

  const cocktailCost =
    input.cocktail * input.cocktailPrice;

  const dailyDrinkCost =
    coffeeCost +
    waterCost +
    sodaCost +
    beerCost +
    wineCost +
    cocktailCost;

  const drinksCost =
    dailyDrinkCost *
    input.days *
    input.people;

  const packageCost =
    input.packagePricePerDay *
    input.days *
    input.people;

  const savings =
    drinksCost - packageCost;

  const totalDrinksPerDay =
    input.coffee +
    input.water +
    input.soda +
    input.beer +
    input.wine +
    input.cocktail;

  const averageDrinkPrice =
    totalDrinksPerDay > 0
      ? dailyDrinkCost / totalDrinksPerDay
      : 0;

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