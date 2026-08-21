# Fase 5 — auditoría de consumo por viajero

## Alcance de esta fase

Este documento caracteriza el modelo actual y diseña la migración. No cambia
el comportamiento de producción.

## Evidencia del modelo actual

- `WizardData` conserva una única cesta diaria (`coffee`, `water`, `beer`,
  etc.) y un único reparto de cócteles.
- El paso Consumo edita directamente esa cesta y la presenta como consumo
  «por persona / día».
- `calculateRecommendation` calcula el coste diario de esa cesta y lo
  multiplica por `cruiseNights * people`.
- `compareDrinkPackages` reutiliza la misma cesta para cobertura, límites
  operativos, costes fuera del paquete y recomendación.
- Review y Results muestran una única cesta por persona.
- La persistencia acepta únicamente contadores enteros. Un promedio de grupo
  que requiera 0,5 unidades no puede guardarse sin pérdida.
- Los análisis guardados clonan el `WizardData` completo y todavía usan la
  versión 1 de su contenedor; el estado activo usa la versión 2.

## Impacto demostrado

Caso de regresión:

- Adulto 1: 3 cafés y 2 cervezas al día.
- Adulto 2: 1 café, 1 agua y 2 cócteles al día.
- 7 noches.
- Precios de caracterización: café 4 €, agua 3 €, cerveza 6 € y cóctel 10 €.

El coste correcto del grupo es 357 €. Repetir el perfil del adulto 1 produce
336 € y repetir el del adulto 2 produce 378 €. El promedio requeriría 0,5
aguas por adulto, valor que la persistencia actual descarta.

Además del error de coste, un promedio puede ocultar que un adulto supera un
límite diario de alcohol aunque la media del grupo quede por debajo.

## Contrato recomendado

Añadir una colección canónica con un elemento por adulto:

```ts
type AdultConsumptionProfile = {
  id: string;
  label: string;
  coffee: number;
  water: number;
  soda: number;
  juice: number;
  beer: number;
  wine: number;
  cocktail: number;
  alcoholicCocktail: number | null;
  nonAlcoholicCocktail: number | null;
  consumptionConfirmed: boolean;
};
```

`WizardData` debería incorporar `adultConsumptionProfiles`. Las preferencias
de cobertura pueden seguir siendo globales en el primer incremento de Fase 5;
no deben mezclarse silenciosamente con consumos individuales.

## Reglas económicas

1. Sumar el coste de bebidas de cada perfil durante todas las noches.
2. Calcular el coste del paquete con las unidades facturables y los adultos
   obligados por la regla documentada de la naviera, no con un promedio.
3. Evaluar límites diarios y cargos adicionales por perfil.
4. Agregar después los resultados individuales para la comparación del grupo.
5. Mantener separados cobertura, disponibilidad económica y recomendación.

## Migración compatible

1. Elevar la versión del estado activo al introducir el nuevo modelo.
2. Un análisis legacy válido con `people = N` debe crear `N` perfiles idénticos
   a partir de la cesta común. Esto conserva exactamente el resultado actual.
3. No inferir perfiles distintos a partir de promedios ni repartir cantidades.
4. Migrar también cada elemento de análisis guardado; no basta con hidratar el
   análisis activo.
5. Durante una transición controlada, los campos superiores pueden mantenerse
   solo como compatibilidad derivada. No deben existir dos fuentes canónicas.
6. Si cambia el número de adultos, los perfiles nuevos deben quedar pendientes
   de confirmar; reducir adultos no debe reasignar consumos silenciosamente.

## Tests requeridos antes de producción

- Migración legacy de 1, 2 y 10 adultos sin cambiar resultados.
- Dos perfiles heterogéneos producen 357 € en el caso principal.
- El paquete conserva 560 € para dos adultos, 7 unidades y 40 € por unidad.
- Un límite alcohólico se evalúa por adulto y no por media del grupo.
- Valores cero y composición desconocida de cócteles se conservan por perfil.
- Cambio del número de adultos crea o retira perfiles de forma explícita.
- Guardar, cargar, duplicar y reiniciar conserva o limpia todos los perfiles.
- Review y Results muestran desglose por adulto y total del grupo.
- Costa y MSC mantienen sus reglas de unidades facturables.

## Orden de implementación recomendado

1. Tipos puros, normalización y migración de persistencia.
2. Agregador económico por perfiles, todavía sin conectarlo a producción.
3. Tests de equivalencia legacy y casos heterogéneos.
4. Store y análisis guardados.
5. UI de Consumo y Revisión.
6. Comparación, límites operativos y Resultados.
7. E2E en Chromium, Android, WebKit e iPad.
