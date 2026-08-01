export const commonRestrictions = [
  "Uso personal e intransferible.",
  "Solo se puede pedir una bebida por persona y cada vez.",
  "No incluye productos del minibar.",
  "Las condiciones pueden variar según el mercado de compra.",
  "Costa Cruceros puede modificar precios y condiciones sin previo aviso.",
];

export const myDrinksSoftRestrictions = [
  ...commonRestrictions,
  "No incluye bebidas alcohólicas.",
  "Solo cubre bebidas incluidas en el paquete My Drinks Soft.",
];

export const myDrinksRestrictions = [
  ...commonRestrictions,
  "Incluye bebidas con un precio de hasta el límite del paquete.",
];

export const myDrinksPlusRestrictions = [
  ...commonRestrictions,
  "Incluye una selección más amplia de bebidas y marcas premium.",
];

export const premiumRestrictions = [
  ...commonRestrictions,
  "Incluye bebidas premium dentro de los límites establecidos por Costa Cruceros.",
];