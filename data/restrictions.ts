export const commonRestrictions = [
  "El paquete debe reservarse para todos los pasajeros con el mismo número de reserva y/o que viajen en el mismo camarote.",
  "Los paquetes no son válidos en los restaurantes Archipelago y Casanova.",
  "Algunos bares y restaurantes temáticos pueden ofrecer una selección limitada de bebidas.",
  "Los pasajeros menores de edad no pueden utilizar paquetes con bebidas alcohólicas.",
  "Las condiciones concretas del paquete deben comprobarse antes de la compra y pueden depender de la reserva.",
];

export const myDrinksSoftRestrictions = [
  ...commonRestrictions,
  "No incluye bebidas alcohólicas.",
  "Información detallada del paquete pendiente de verificación para el mercado y crucero seleccionados.",
];

export const myDrinksRestrictions = [
  ...commonRestrictions,
  "No incluye marcas de prestigio.",
  "No incluye artículos del minibar del camarote.",
  "Incluye únicamente las bebidas contempladas en la selección My Drinks de Costa.",
];

export const myDrinksPlusRestrictions = [
  ...commonRestrictions,
  "Incluye una selección más amplia de bebidas y marcas de prestigio.",
  "Incluye agua embotellada sin límite según las condiciones publicadas por Costa.",
  "Incluye una selección ampliada de cervezas, zumos, cócteles y destilados.",
];

export const premiumRestrictions = [
  ...commonRestrictions,
  "Las bebidas incluidas dependen de la selección específica indicada por Costa para el paquete contratado.",
];