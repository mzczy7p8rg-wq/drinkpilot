import type {
  OnboardPriceKey,
} from "@/lib/onboardPriceService";

import type {
  DrinkPriceEvidence,
} from "@/lib/drinkPriceEvidence";

/*
 * PRECIOS MSC PROCEDENTES DE MENÚS DOCUMENTADOS
 *
 * Esta colección representa precios observados
 * en cartas o menús MSC documentados.
 *
 * No equivale a una publicación oficial vigente
 * de MSC para toda la flota.
 *
 * Cada referencia debe conservar el contexto
 * disponible y nunca generalizarse más allá
 * de lo que permita su evidencia.
 */

export type MscDocumentedDrinkPrice = {
  id: string;

  category:
    OnboardPriceKey;

  productName:
    string;

  format:
    string | null;

  price:
    number;

  currency:
    "EUR" | "USD";

  evidence:
    Extract<
      DrinkPriceEvidence,
      "documented-menu"
    >;

  sourceUrl:
    string | null;

  sourceDocument?:
    string;

  observedAt?:
    string | null;

  ship?:
    string | null;

  /*
   * Zona geográfica documentada por la
   * carta. No representa el mercado de
   * compra o reserva del usuario.
   */
  sailingRegion?:
    string | null;

  itinerary?:
    string | null;

  menuName?:
    string | null;

  notes?:
    string;

  packageCoverage?: Readonly<
    Partial<
      Record<
        | "mscEasy"
        | "mscPremiumExtra"
        | "mscAlcoholFree"
        | "mscMinors",
        | "included"
        | "notIncluded"
        | "unknown"
      >
    >
  >;
};

const mscCocktailsAndMoreDocument =
  "00c6f9_e331c43a1e7d43198142e527483cd3d4.pdf";

const includedInHistoricalEasyAndPremium = {
  mscEasy: "included",
  mscPremiumExtra: "included",
} as const;

const historicalPremiumOnly = {
  mscEasy: "notIncluded",
  mscPremiumExtra: "included",
} as const;

const historicalEasyIncludedPremiumUnknown = {
  mscEasy: "included",
  mscPremiumExtra: "unknown",
} as const;

const historicalEasyExcludedPremiumUnknown = {
  mscEasy: "notIncluded",
  mscPremiumExtra: "unknown",
} as const;

function slugifyMscDocumentedProduct(
  value: string
): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function mscCocktailsAndMoreDrink(
  input: Pick<
    MscDocumentedDrinkPrice,
    | "category"
    | "productName"
    | "format"
    | "price"
    | "packageCoverage"
  >
): MscDocumentedDrinkPrice {
  return {
    id: `msc-cocktails-more-2023-${slugifyMscDocumentedProduct(
      input.productName
    )}-${slugifyMscDocumentedProduct(input.format ?? "serving")}`,
    ...input,
    currency: "EUR",
    evidence: "documented-menu",
    sourceUrl: null,
    sourceDocument: mscCocktailsAndMoreDocument,
    observedAt: "2023-03",
    ship: null,
    sailingRegion: null,
    itinerary: null,
    menuName: "MSC Cocktails & more",
    notes:
      "Carta histórica MSC en EUR. No representa una tarifa vigente universal ni demuestra por sí sola cobertura actual.",
  };
}

/*
 * Se mantiene vacío hasta incorporar
 * una referencia documental concreta
 * con contexto suficiente.
 */
export const mscDocumentedDrinkPrices:
  readonly MscDocumentedDrinkPrice[] = [
  {
    id:
      "msc-world-america-passion-fruit-martini-2025-07",

    category:
      "cocktail",

    productName:
      "Passion Fruit Martini",

    format:
      null,

    price:
      14,

    currency:
      "USD",

    evidence:
      "documented-menu",

    sourceUrl:
      "https://cruise.blog/2025/msc-cruises-drink-menu-and-prices",

    observedAt:
      "2025-07",

    ship:
      "MSC World America",

    sailingRegion:
      "North America",

    itinerary:
      null,


  menuName:
    "Fleetwide menu",

    notes:
      "Precio observado en una carta atribuida a MSC World America; no debe generalizarse a toda la flota ni a otros mercados.",
  },

  {
    id:
      "msc-world-america-heineken-draft-14oz-2025-07",

    category:
      "beer",

    productName:
      "Heineken Draft",

    format:
      "14 oz",

    price:
      9,

    currency:
      "USD",

    evidence:
      "documented-menu",

    sourceUrl:
      "https://cruise.blog/2025/msc-cruises-drink-menu-and-prices",

    observedAt:
      "2025-07",

    ship:
      "MSC World America",

    sailingRegion:
      "North America",

    itinerary:
      null,


  menuName:
    "Fleetwide menu",

    notes:
      "Precio observado para formato draft de 14 oz; la misma carta documenta un formato de 7 oz con precio diferente.",
  },

  {
    id:
      "msc-world-america-canned-soda-2025-07",

    category:
      "soda",

    productName:
      "Canned Soda",

    format:
      "can",

    price:
      3.5,

    currency:
      "USD",

    evidence:
      "documented-menu",

    sourceUrl:
      "https://cruise.blog/2025/msc-cruises-drink-menu-and-prices",

    observedAt:
      "2025-07",

    ship:
      "MSC World America",

    sailingRegion:
      "North America",

    itinerary:
      null,


  menuName:
    "Fleetwide menu",

    notes:
      "Precio observado en carta documentada de MSC World America; no representa un precio medio MSC.",
  },

  {
    id:
      "msc-world-america-espresso-fleetwide-2025-07",

    category:
      "coffee",

    productName:
      "Espresso",

    format:
      null,

    price:
      2.5,

    currency:
      "USD",

    evidence:
      "documented-menu",

    sourceUrl:
      "https://cruise.blog/2025/msc-cruises-drink-menu-and-prices",

    observedAt:
      "2025-07",

    ship:
      "MSC World America",

    sailingRegion:
      "North America",

    itinerary:
      null,

    menuName:
      "Fleetwide menu",

    notes:
      "Espresso del menú general documentado. No debe confundirse con el Espresso de Coffee Emporium, que tiene un precio distinto.",
  },

  {
    id:
      "msc-world-america-water-16oz-fleetwide-2025-07",

    category:
      "water",

    productName:
      "Still/Sparkling Water",

    format:
      "16 oz",

    price:
      3.25,

    currency:
      "USD",

    evidence:
      "documented-menu",

    sourceUrl:
      "https://cruise.blog/2025/msc-cruises-drink-menu-and-prices",

    observedAt:
      "2025-07",

    ship:
      "MSC World America",

    sailingRegion:
      "North America",

    itinerary:
      null,

    menuName:
      "Fleetwide menu",

    notes:
      "Precio documentado para formato de 16 oz; la carta también muestra un formato de 32 oz con precio diferente.",
  },

  {
    id:
      "msc-world-america-valdo-prosecco-glass-2025-07",

    category:
      "wine",

    productName:
      "Valdo, Prosecco",

    format:
      "glass",

    price:
      14,

    currency:
      "USD",

    evidence:
      "documented-menu",

    sourceUrl:
      "https://cruise.blog/2025/msc-cruises-drink-menu-and-prices",

    observedAt:
      "2025-07",

    ship:
      "MSC World America",

    sailingRegion:
      "North America",

    itinerary:
      null,

    menuName:
      "Fleetwide menu",

    notes:
      "Precio por copa documentado; la misma carta muestra también precio por botella.",
  },

  {
    id:
      "msc-world-america-heineken-draft-7oz-2025-07",

    category:
      "beer",

    productName:
      "Heineken Draft",

    format:
      "7 oz",

    price:
      6,

    currency:
      "USD",

    evidence:
      "documented-menu",

    sourceUrl:
      "https://cruise.blog/2025/msc-cruises-drink-menu-and-prices",

    observedAt:
      "2025-07",

    ship:
      "MSC World America",

    sailingRegion:
      "North America",

    itinerary:
      null,

    menuName:
      "Fleetwide menu",

    notes:
      "Segundo formato documentado de Heineken draft; el formato de 14 oz tiene un precio diferente.",
  },


  {
    id:
      "msc-world-america-espresso-coffee-emporium-2025-07",

    category:
      "coffee",

    productName:
      "Espresso",

    format:
      null,

    price:
      4,

    currency:
      "USD",

    evidence:
      "documented-menu",

    sourceUrl:
      "https://cruise.blog/2025/msc-cruises-drink-menu-and-prices",

    observedAt:
      "2025-07",

    ship:
      "MSC World America",

    sailingRegion:
      "North America",

    itinerary:
      null,

    menuName:
      "Coffee Emporium",

    notes:
      "Precio documentado en Coffee Emporium; se mantiene separado del Espresso de 2.50 USD del Fleetwide menu.",
  },

  ...[
    ["Zumos de fruta en botella", "20 cl", 4, "juice", includedInHistoricalEasyAndPremium],
    ["Zumos de fruta por vaso", "20 cl", 3, "juice", includedInHistoricalEasyAndPremium],
    ["Agua mineral natural o con gas", "1 l", 3.25, "water", includedInHistoricalEasyAndPremium],
    ["Agua mineral natural o con gas", "50 cl", 2.25, "water", includedInHistoricalEasyAndPremium],
    ["Vaso de agua", "20 cl", 0.75, "water", includedInHistoricalEasyAndPremium],
    ["Refresco en lata", "33 cl", 3.5, "soda", includedInHistoricalEasyAndPremium],
    ["Té frío", "33 cl", 3.5, "soda", includedInHistoricalEasyAndPremium],
    ["Fever-Tree Tonic", "20 cl", 3, "soda", historicalPremiumOnly],
    ["Refresco por vaso", "30 cl", 3, "soda", includedInHistoricalEasyAndPremium],
    ["Red Bull", "25 cl", 4.5, "soda", historicalPremiumOnly],
    ["Espresso", null, 2, "coffee", includedInHistoricalEasyAndPremium],
    ["Café descafeinado", null, 2, "coffee", includedInHistoricalEasyAndPremium],
    ["Café americano", null, 2, "coffee", includedInHistoricalEasyAndPremium],
    ["Café americano con leche", null, 2.5, "coffee", includedInHistoricalEasyAndPremium],
    ["Cappuccino", null, 3.75, "coffee", includedInHistoricalEasyAndPremium],
    ["Caffè latte", null, 3.75, "coffee", includedInHistoricalEasyAndPremium],
    ["Café de cebada", null, 2.25, "coffee", includedInHistoricalEasyAndPremium],
    ["Café de ginseng grande", null, 3, "coffee", includedInHistoricalEasyAndPremium],
    ["Café de ginseng pequeño", null, 2.25, "coffee", includedInHistoricalEasyAndPremium],
    ["Chocolate caliente", null, 3.75, "coffee", includedInHistoricalEasyAndPremium],
    ["Vaso de leche", null, 1.5, "coffee", includedInHistoricalEasyAndPremium],
    ["Té caliente", null, 3.75, "coffee", includedInHistoricalEasyAndPremium],
    ["Coffee Delights", null, 9, "coffee", historicalPremiumOnly],
  ].map(([productName, format, price, category, packageCoverage]) =>
    mscCocktailsAndMoreDrink({
      category: category as OnboardPriceKey,
      productName: String(productName),
      format: format === null ? null : String(format),
      price: Number(price),
      packageCoverage:
        packageCoverage as MscDocumentedDrinkPrice["packageCoverage"],
    })
  ),

  ...[
    ["Heineken de barril", "40 cl", 7, historicalEasyIncludedPremiumUnknown],
    ["Heineken de barril", "20 cl", 4, historicalEasyIncludedPremiumUnknown],
    ["Radler / Panaché / Shandy", "40 cl", 7, historicalPremiumOnly],
    ["Radler / Panaché / Shandy", "20 cl", 4, historicalPremiumOnly],
    ["Budweiser", "33 cl", 7, historicalEasyExcludedPremiumUnknown],
    ["Dos Equis", "33 cl", 7, historicalEasyExcludedPremiumUnknown],
    ["Heineken", "33 cl", 7, historicalEasyIncludedPremiumUnknown],
    ["San Miguel", "33 cl", 7, historicalEasyExcludedPremiumUnknown],
    ["Stella Artois", "33 cl", 7, historicalEasyExcludedPremiumUnknown],
    ["Amstel Light", "33 cl", 7, historicalEasyExcludedPremiumUnknown],
    ["Desperados", "33 cl", 7.5, historicalEasyExcludedPremiumUnknown],
    ["Beck's", "33 cl", 7, historicalEasyExcludedPremiumUnknown],
    ["Nastro Azzurro", "33 cl", 7, historicalEasyExcludedPremiumUnknown],
    ["Newcastle Brown Ale", "33 cl", 7, historicalEasyExcludedPremiumUnknown],
    ["Paulaner", "50 cl", 7.5, historicalEasyExcludedPremiumUnknown],
    ["Guinness", "33 cl", 8, historicalEasyExcludedPremiumUnknown],
    ["Baladin Nazionale", "33 cl", 8, historicalEasyExcludedPremiumUnknown],
    ["Baladin Wayan", "33 cl", 8, historicalEasyExcludedPremiumUnknown],
    ["Heineken 0.0", "33 cl", 7, historicalEasyExcludedPremiumUnknown],
    ["Strongbow", "33 cl", 7, historicalEasyExcludedPremiumUnknown],
  ].map(([productName, format, price, packageCoverage]) =>
    mscCocktailsAndMoreDrink({
      category: "beer",
      productName: String(productName),
      format: String(format),
      price: Number(price),
      packageCoverage:
        packageCoverage as MscDocumentedDrinkPrice["packageCoverage"],
    })
  ),

  ...[
    ["Elderflower G&T", 13],
    ["Engine G&T", 13],
    ["Mango & Lime G&T", 13],
    ["Aloe & Cucumber G&T", 13],
    ["0.0% Passion Fruit G&T", 10],
    ["Aperol The Original", 9],
    ["Hugo", 9],
    ["The Tunisian", 12],
    ["The Italian", 12],
    ["The Queens", 12],
    ["Aviation Martini", 13],
    ["Santa Teresa Manhattan", 13],
    ["Gold Rush", 13],
    ["MSC Signature Martini", 13],
    ["Mule Le Poire", 13],
    ["Lavender Margarita", 13],
    ["Sapphire Martini", 9],
    ["Royal Manhattan", 9],
    ["Cuban Daiquiri", 9],
    ["Absolut Cosmo", 9],
    ["Classic Margarita", 9],
    ["Original Moscow Mule", 9],
    ["Absolut Cape Cod", 9],
    ["Mimosa Blossom", 9],
    ["Bombay Fizz", 9],
    ["Jalisco Sunrise", 9],
    ["Absolut Bloody Mary", 9],
    ["Ultimate Iced Tea", 9],
    ["Bacardi Mojito", 9],
    ["White Russian", 9],
    ["Baileys Alexander", 9],
    ["Negroni", 9],
    ["Pink & Pink", 9],
    ["Ultimate Mai-Tai", 12],
    ["Purple Rain", 12],
    ["Coco Loco", 12],
    ["Jamaican Paradise", 12],
    ["Miami Beach Iced Tea", 12],
    ["Razz Mojito", 12],
    ["Mango Mojito", 12],
    ["Aloe Vera Mojito", 12],
    ["Mango Tropical Trooper", 9],
    ["Rock Lobster", 9],
    ["Ultimate Piña Colada", 9],
    ["B.B.C.", 9],
    ["Miami Vice", 9],
    ["Original Strawberry Daiquiri", 9],
  ].map(([productName, price]) =>
    mscCocktailsAndMoreDrink({
      category: "cocktail",
      productName: String(productName),
      format: null,
      price: Number(price),
      packageCoverage: historicalPremiumOnly,
    })
  ),

  ...[
    "Piña Colada Zero",
    "Strawberry Daiquiri Zero",
    "Mojito Zero",
    "Coco Loco Zero",
    "Sea Breeze Zero",
    "Aloha",
    "Magic Island",
    "Dirty Banana Shake",
    "Fruit Smoothie",
  ].map((productName) =>
    mscCocktailsAndMoreDrink({
      category: "cocktail",
      productName,
      format: null,
      price: 7,
      packageCoverage:
        includedInHistoricalEasyAndPremium,
    })
  ),

  ...[
    ["Jacquart Mosaïque Brut", 14],
    ["Asti DOCG, Fontanafredda", 8],
    ["Cruasé Rosé Metodo Classico DOCG, Torti", 9],
    ["Prosecco DOC, Valdo", 8],
    ["Prosecco Superiore DOCG, Aneri", 10],
    ["Chardonnay Borgo Tesis DOC, Fantinel", 7.5],
    ["Chardonnay, Woodbridge", 10],
    ["Côtes des Roses Chardonnay, Gérard Bertrand", 11],
    ["Greco di Tufo DOCG, Mastroberardino", 10],
    ["Pinot Grigio DOC, Bastianich", 12],
    ["Pinot Grigio Friuli Grave DOC, Forchir", 7.5],
    ["Riesling Mosel, Dr. Loosen", 8],
    ["Sauvignon Friuli DOC, Tenuta Villanova", 9],
    ["Verdicchio Superiore DOC, Fulvia Tombolini", 10],
    ["Viognier Terre Siciliane DOC, Baglio di Grisì", 8],
    ["Bardolino Chiaretto Classico DOC, Casetto", 7.5],
    ["Côte des Roses Rosé, Gérard Bertrand", 11],
    ["Rosé d'Anjou, Barton & Gustier", 8],
    ["Barón de Pardo Crianza DOCa, Nava Rioja", 8],
    ["Bordeaux Rouge, Château Bel Air", 9],
    ["Cabernet Cicogna DOC, Cavazza", 13],
    ["Cabernet Sauvignon, 770 Miles", 10],
    ["Chianti DOCG, Zonin", 7.5],
    ["Côte des Roses Pinot Noir, Gérard Bertrand", 11],
    ["Dolcetto d'Alba DOC, Batasiolo", 10],
    ["Merlot Borgo Tesis DOC, Fantinel", 7.5],
    ["Merlot Colli Orientali del Friuli DOC, Forchir", 10],
    ["Santa Cristina Toscana IGT, Antinori", 9],
  ].map(([productName, price]) =>
    mscCocktailsAndMoreDrink({
      category: "wine",
      productName: String(productName),
      format: "copa",
      price: Number(price),
      packageCoverage: historicalPremiumOnly,
    })
  ),

];
