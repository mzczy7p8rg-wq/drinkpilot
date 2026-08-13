export const commonRestrictions = [
  /*
   * Condiciones generales verificadas
   * en la documentación utilizada
   * por DrinkPilot.
   */
  "El paquete debe contratarse para los pasajeros sujetos a las condiciones de la misma reserva y/o camarote indicadas por Costa.",

  "Los paquetes no son válidos en los restaurantes Archipelago y Casanova.",

  "Algunos bares y restaurantes temáticos pueden ofrecer una selección limitada de bebidas.",

  "Para pasajeros de 3 a 17 años, el paquete asociado no incluye bebidas alcohólicas.",

  /*
   * Protección frente a diferencias entre
   * barcos, tarifas, mercados y reservas.
   */
  "Las condiciones concretas del paquete deben comprobarse antes de la compra y pueden depender del crucero, tarifa y reserva.",
];

export const myDrinksSoftRestrictions = [
  ...commonRestrictions,

  "No incluye bebidas alcohólicas.",

  "La información detallada de My Drinks Soft continúa pendiente de verificación oficial suficiente para el mercado y crucero seleccionados.",
];

export const myDrinksRestrictions = [
  ...commonRestrictions,

  "No incluye la selección ampliada de marcas y bebidas premium reservada a My Drinks Plus.",

  "No incluye artículos del minibar del camarote salvo que las condiciones concretas de la reserva indiquen expresamente lo contrario.",

  "Incluye únicamente las bebidas contempladas en la selección My Drinks publicada por Costa.",

  "La asignación de agua embotellada depende de las condiciones de la reserva y del camarote; DrinkPilot no la considera una botella diaria individual garantizada.",
];

export const myDrinksPlusRestrictions = [
  ...commonRestrictions,

  "Incluye una selección más amplia de bebidas y marcas premium según la selección publicada por Costa.",

  "Incluye agua embotellada sin límite de acuerdo con las condiciones publicadas para My Drinks Plus.",

  "Incluye una selección ampliada de cervezas embotelladas, zumos, cócteles y destilados.",

  "La disponibilidad concreta de marcas y productos puede variar según barco, itinerario y punto de venta.",
];

export const premiumRestrictions = [
  ...commonRestrictions,

  "Las bebidas premium incluidas dependen de la selección específica indicada por Costa para el paquete contratado.",

  "La disponibilidad concreta de determinadas marcas puede variar a bordo.",
];
