export const mscCommonRestrictions = [
  "Los paquetes se venden por crucero; el precio se aplica a cada día del crucero excepto el día de desembarque.",

  "Una vez activado a bordo, el paquete no puede cancelarse ni reembolsarse según las condiciones publicadas por MSC.",

  "Los paquetes deben contratarse para los huéspedes que ocupan el mismo camarote según las condiciones de MSC.",

  "Los menores sujetos a las condiciones familiares deben contratar el Minors Package cuando corresponda.",

  "No se incluyen tabaco, vasos souvenir, artículos retail, minibar, room service ni promociones salvo que MSC indique expresamente lo contrario.",

  "Las bebidas o marcas concretas pueden sustituirse según disponibilidad, barco e itinerario.",

  "Las condiciones y disponibilidad concretas pueden variar según barco, región, itinerario y fecha de navegación.",
];

export const mscEasyRestrictions = [
  ...mscCommonRestrictions,

  "Máximo de 15 bebidas alcohólicas por huésped y día.",

  "No es válido en determinados bares temáticos, restaurantes de especialidad ni islas privadas.",

  "La selección alcohólica se limita a las bebidas y marcas contempladas dentro del Easy Package.",

  "AQUA by MSC está incluida; no debe interpretarse automáticamente como agua mineral embotellada tradicional ilimitada.",
];

export const mscPremiumExtraRestrictions = [
  ...mscCommonRestrictions,

  "Máximo de 15 bebidas alcohólicas por huésped y día.",

  "La cobertura de bebidas puede estar sujeta a límites de precio específicos según la región, fecha de navegación y versión del paquete.",

  "Puede utilizarse en restaurantes de especialidad y determinadas islas privadas según las condiciones publicadas.",

  "La disponibilidad de marcas premium puede variar según barco e itinerario.",

  "AQUA by MSC está incluida; no debe interpretarse automáticamente como agua mineral embotellada tradicional ilimitada.",
];

export const mscAlcoholFreeRestrictions = [
  ...mscCommonRestrictions,

  "No incluye bebidas alcohólicas.",

  "No es válido en determinados bares temáticos, restaurantes de especialidad ni islas privadas.",

  "AQUA by MSC está incluida; no debe interpretarse automáticamente como agua mineral embotellada tradicional ilimitada.",
];

export const mscMinorsRestrictions = [
  ...mscCommonRestrictions,

  "Solo es aplicable a menores según la edad legal correspondiente al país o zona de operación.",

  "Está vinculado a familias que adquieren Easy, Alcohol-Free o Premium Extra para los adultos.",

  "Las condiciones adicionales dependen del paquete adulto asociado.",

  "No debe utilizarse todavía como paquete adulto independiente dentro del motor de recomendación.",
];