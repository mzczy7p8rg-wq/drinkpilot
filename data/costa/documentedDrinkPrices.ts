import type {
  DrinkPriceEvidence,
} from "@/lib/drinkPriceEvidence";

import type {
  OnboardPriceKey,
} from "@/lib/onboardPriceService";

export type CostaDocumentedDrinkPrice = {
  id: string;
  category: OnboardPriceKey;
  productName: string;
  format: string | null;
  price: number;
  currency: "EUR" | "USD";
  evidence: Extract<
    DrinkPriceEvidence,
    "documented-menu"
  >;
  sourceUrl: string;
  observedAt?: string | null;
  ship?: string | null;
  sailingRegion?: string | null;
  itinerary?: string | null;
  menuName?: string | null;
  notes?: string;
  packageCoverage: Readonly<
    Record<
      | "myDrinksPlus"
      | "myDrinks"
      | "myDrinksSoft",
      | "included"
      | "notIncluded"
      | "limitedAllowance"
    >
  >;
};

export const costaBarListSourceUrl =
  "https://00c6f9b6-80c4-42a1-a483-0f4d44d2549a.usrfiles.com/ugd/00c6f9_568325f9b411432682f077fc5d8339aa.pdf";

const includedInAllCostaPackages = {
  myDrinksPlus: "included",
  myDrinks: "included",
  myDrinksSoft: "included",
} as const;

const includedInPlusAndMyDrinks = {
  myDrinksPlus: "included",
  myDrinks: "included",
  myDrinksSoft: "notIncluded",
} as const;

const includedInPlusOnly = {
  myDrinksPlus: "included",
  myDrinks: "notIncluded",
  myDrinksSoft: "notIncluded",
} as const;

function slugifyCostaProduct(
  productName: string
): string {
  return productName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function costaBarListDrink(
  input: Pick<
    CostaDocumentedDrinkPrice,
    | "id"
    | "category"
    | "productName"
    | "format"
    | "price"
    | "packageCoverage"
  >
): CostaDocumentedDrinkPrice {
  return {
    ...input,
    currency: "EUR",
    evidence: "documented-menu",
    sourceUrl: costaBarListSourceUrl,
    menuName: "Costa Bar List",
  };
}

export const costaDocumentedDrinkPrices:
  readonly CostaDocumentedDrinkPrice[] = [
    {
      id: "costa-bar-list-tonic-water",
      category: "soda",
      productName: "Tónica",
      format: null,
      price: 4,
      currency: "EUR",
      evidence: "documented-menu",
      sourceUrl: costaBarListSourceUrl,
      menuName: "Costa Bar List",
      packageCoverage: {
        myDrinksPlus: "included",
        myDrinks: "included",
        myDrinksSoft: "included",
      },
      notes:
        "Los tres puntos de la carta documentan inclusión en My Drinks Plus, My Drinks y My Soft Drinks.",
    },
    {
      id: "costa-bar-list-red-bull",
      category: "soda",
      productName: "Red Bull",
      format: null,
      price: 5,
      currency: "EUR",
      evidence: "documented-menu",
      sourceUrl: costaBarListSourceUrl,
      menuName: "Costa Bar List",
      packageCoverage: {
        myDrinksPlus: "included",
        myDrinks: "notIncluded",
        myDrinksSoft: "notIncluded",
      },
      notes:
        "Solo el punto de My Drinks Plus aparece junto al producto; no se modelan promociones.",
    },
    {
      id: "costa-bar-list-corona-33cl",
      category: "beer",
      productName: "Corona",
      format: "33 cl",
      price: 4.5,
      currency: "EUR",
      evidence: "documented-menu",
      sourceUrl: costaBarListSourceUrl,
      menuName: "Costa Bar List",
      packageCoverage: {
        myDrinksPlus: "included",
        myDrinks: "notIncluded",
        myDrinksSoft: "notIncluded",
      },
      notes:
        "El punto de la carta documenta inclusión únicamente en My Drinks Plus.",
    },
    {
      id: "costa-bar-list-estrella-damm-33cl",
      category: "beer",
      productName: "Estrella Damm",
      format: "33 cl",
      price: 4.5,
      currency: "EUR",
      evidence: "documented-menu",
      sourceUrl: costaBarListSourceUrl,
      menuName: "Costa Bar List",
      packageCoverage: {
        myDrinksPlus: "included",
        myDrinks: "included",
        myDrinksSoft: "notIncluded",
      },
      notes:
        "Los puntos de la carta documentan inclusión en My Drinks Plus y My Drinks.",
    },
    ...[
      "Pepsi",
      "Pepsi Light",
      "Pepsi Zero",
      "7UP",
      "Aranciata",
      "Té frío Lipton limón",
      "Té frío Lipton melocotón",
      "Té frío Lipton Green Lemon",
      "Ginger Ale",
      "Sirope sin alcohol",
    ].map((productName) =>
      costaBarListDrink({
        id: `costa-bar-list-${productName
          ? slugifyCostaProduct(productName)
          : "unknown"}`,
        category: "soda",
        productName,
        format: null,
        price: 4,
        packageCoverage:
          includedInAllCostaPackages,
      })
    ),
    ...[
      ["Colibrì", 7.5],
      ["Fruit Punch", 7.5],
      ["Pink Panther", 7.5],
      ["Squok", 7.5],
      ["Cosmopolitan Long Virgin", 8],
      ["Mojito Zero", 8],
      ["Strawberry Caipiroska Zero", 8],
      ["Sex on the Beach Zero", 8],
      ["Passion Fruit Caipiroska Zero", 8],
    ].map(([productName, price]) =>
      costaBarListDrink({
        id: `costa-bar-list-${String(productName)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")}`,
        category: "cocktail",
        productName: String(productName),
        format: null,
        price: Number(price),
        packageCoverage:
          includedInAllCostaPackages,
      })
    ),
    ...[
      ["Espresso", 2.2, includedInAllCostaPackages],
      ["Espresso descafeinado", 2.2, includedInAllCostaPackages],
      ["Café frío con hielo", 2.2, includedInAllCostaPackages],
      ["Café shakerato", 4.2, includedInPlusAndMyDrinks],
      ["Cappuccino", 3, includedInAllCostaPackages],
      ["Café corretto", 4.7, includedInPlusAndMyDrinks],
      ["Marocchino", 4.2, includedInPlusAndMyDrinks],
    ].map(([productName, price, packageCoverage]) =>
      costaBarListDrink({
        id: `costa-bar-list-${slugifyCostaProduct(
          String(productName)
        )}`,
        category: "coffee",
        productName: String(productName),
        format: null,
        price: Number(price),
        packageCoverage:
          packageCoverage as CostaDocumentedDrinkPrice["packageCoverage"],
      })
    ),
    ...[
      "Benvenuto Italiano",
      "Caribbean Coffee",
      "Irish Coffee",
      "Mexican Coffee",
    ].map((productName) =>
      costaBarListDrink({
        id: `costa-bar-list-${slugifyCostaProduct(productName)}`,
        category: "coffee",
        productName,
        format: null,
        price: 6.7,
        packageCoverage:
          includedInPlusOnly,
      })
    ),
    ...[
      "Pistacchio",
      "Tiramisù",
      "Nocciola",
      "Nocciola & Cacao",
      "Cremino",
    ].map((productName) =>
      costaBarListDrink({
        id: `costa-bar-list-${slugifyCostaProduct(productName)}`,
        category: "coffee",
        productName,
        format: null,
        price: 4.2,
        packageCoverage:
          includedInPlusOnly,
      })
    ),
    ...[
      "Té negro",
      "Té verde clásico",
      "Té negro aromatizado",
      "Té verde aromatizado",
      "Tisana",
    ].map((productName) =>
      costaBarListDrink({
        id: `costa-bar-list-${slugifyCostaProduct(productName)}`,
        category: "coffee",
        productName,
        format: null,
        price: 3.1,
        packageCoverage:
          includedInAllCostaPackages,
      })
    ),
    ...[
      [
        "Looza ACE, pera, melocotón y albaricoque",
        "vaso",
        4.5,
        includedInPlusAndMyDrinks,
      ],
      [
        "Zumos de fruta por vaso",
        "vaso",
        3.5,
        includedInAllCostaPackages,
      ],
      [
        "Zumo de naranja recién exprimido",
        "vaso",
        6,
        includedInPlusOnly,
      ],
      [
        "Centrifugados de fruta y verdura",
        "vaso",
        6,
        includedInPlusOnly,
      ],
    ].map(
      ([productName, format, price, packageCoverage]) =>
        costaBarListDrink({
          id: `costa-bar-list-${slugifyCostaProduct(
            String(productName)
          )}`,
          category: "juice",
          productName: String(productName),
          format: String(format),
          price: Number(price),
          packageCoverage:
            packageCoverage as CostaDocumentedDrinkPrice["packageCoverage"],
        })
    ),
    ...[
      ["Carlsberg", "33 cl", 4.5, includedInPlusOnly],
      ["Beck's", "33 cl", 4.5, includedInPlusOnly],
      ["Nastro Azzurro", "33 cl", 4.5, includedInPlusOnly],
      ["Weissbier", "50 cl", 8.5, includedInPlusOnly],
      ["Cerveza sin alcohol", "33 cl", 4.5, includedInPlusAndMyDrinks],
      ["Asahi", "33 cl", 7, includedInPlusOnly],
      ["Tsingtao", "64 cl", 8.5, includedInPlusOnly],
    ].map(
      ([productName, format, price, packageCoverage]) =>
        costaBarListDrink({
          id: `costa-bar-list-${slugifyCostaProduct(
            String(productName)
          )}-${slugifyCostaProduct(String(format))}`,
          category: "beer",
          productName: String(productName),
          format: String(format),
          price: Number(price),
          packageCoverage:
            packageCoverage as CostaDocumentedDrinkPrice["packageCoverage"],
        })
    ),
  ];
