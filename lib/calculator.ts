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

export type DrinkBreakdown = {
  icon: string;
  name: string;
  quantity: number;
  unitPrice: number;
  dailyCost: number;
  cruiseCost: number;
};

export type CalculationResult = {
  packageCost: number;
  drinksCost: number;
  dailyDrinkCost: number;
  totalDrinksPerDay: number;
  savings: number;
  recommended: boolean;
  breakEvenDrinksPerDay: number;
  breakdown: DrinkBreakdown[];
};

export function calculateRecommendation(
  input: CalculationInput
): CalculationResult {

  const breakdown: DrinkBreakdown[] = [
    {
      icon: "☕",
      name: "Café",
      quantity: input.coffee,
      unitPrice: input.coffeePrice,
      dailyCost: input.coffee * input.coffeePrice,
      cruiseCost:
        input.coffee *
        input.coffeePrice *
        input.days *
        input.people,
    },

    {
      icon: "💧",
      name: "Agua",
      quantity: input.water,
      unitPrice: input.waterPrice,
      dailyCost: input.water * input.waterPrice,
      cruiseCost:
        input.water *
        input.waterPrice *
        input.days *
        input.people,
    },

    {
      icon: "🥤",
      name: "Refrescos",
      quantity: input.soda,
      unitPrice: input.sodaPrice,
      dailyCost: input.soda * input.sodaPrice,
      cruiseCost:
        input.soda *
        input.sodaPrice *
        input.days *
        input.people,
    },

    {
      icon: "🍺",
      name: "Cervezas",
      quantity: input.beer,
      unitPrice: input.beerPrice,
      dailyCost: input.beer * input.beerPrice,
      cruiseCost:
        input.beer *
        input.beerPrice *
        input.days *
        input.people,
    },

    {
      icon: "🍷",
      name: "Vinos",
      quantity: input.wine,
      unitPrice: input.winePrice,
      dailyCost: input.wine * input.winePrice,
      cruiseCost:
        input.wine *
        input.winePrice *
        input.days *
        input.people,
    },

    {
      icon: "🍸",
      name: "Cócteles",
      quantity: input.cocktail,
      unitPrice: input.cocktailPrice,
      dailyCost: input.cocktail * input.cocktailPrice,
      cruiseCost:
        input.cocktail *
        input.cocktailPrice *
        input.days *
        input.people,
    },
  ];

  const dailyDrinkCost = breakdown.reduce(
    (sum, drink) => sum + drink.dailyCost,
    0
  );

  const drinksCost = breakdown.reduce(
    (sum, drink) => sum + drink.cruiseCost,
    0
  );

  const packageCost =
    input.packagePricePerDay *
    input.days *
    input.people;

  const savings = drinksCost - packageCost;

  const totalDrinksPerDay = breakdown.reduce(
    (sum, drink) => sum + drink.quantity,
    0
  );

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
    dailyDrinkCost,
    totalDrinksPerDay,
    savings,
    recommended: savings > 0,
    breakEvenDrinksPerDay,
    breakdown,
  };
}