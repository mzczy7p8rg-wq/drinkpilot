# DrinkPilot

DrinkPilot ayuda a viajeros de crucero a decidir si un paquete de bebidas compensa según su consumo, preferencias, contexto de navegación y calidad de los precios disponibles.

## Estado del proyecto

Aplicación funcional con soporte para Costa Cruceros y MSC Cruises.

- Costa dispone de comparación económica con precios de referencia o precios reales introducidos por el usuario.
- MSC dispone de análisis de cobertura, precios documentados y reglas contextuales verificadas. DrinkPilot no calcula ahorro mientras falte una cesta completa de precios individuales fiables.
- Los costes operativos conocidos pero no cuantificables mantienen el ahorro efectivo como desconocido y no pueden producir una recomendación positiva.

## Funcionalidades

- selección de naviera y duración del crucero;
- estimación del consumo diario por persona;
- preferencias de cobertura estándar y premium;
- precios reales de paquetes y bebidas;
- análisis de cobertura y ahorro efectivo;
- recomendación explicada y conservadora;
- trazabilidad entre datos base, reglas contextuales y evidencia;
- políticas de días facturables, límites por bebida y límites diarios de alcohol;
- distinción entre precios verificados, documentados, de referencia y pendientes.

## Flujo actual

1. Naviera y duración
2. Consumo
3. Preferencias
4. Precios
5. Personas
6. Revisión
7. Resultado

## Motor de recomendación

DrinkPilot recomienda un paquete únicamente cuando:

- cubre completamente las categorías y preferencias indicadas;
- el ahorro efectivo puede calcularse;
- el ahorro efectivo es positivo.

El ahorro efectivo incorpora los costes adicionales cuantificados. Si existe un coste demostrado pero todavía no cuantificable, el paquete no puede convertirse en la mejor opción.

## Política de datos

DrinkPilot distingue entre:

- información oficial verificada;
- evidencia documentada con relevancia contextual;
- precios de referencia utilizados para estimaciones;
- precios reales introducidos por el usuario;
- datos pendientes que no participan en el cálculo.

No se utilizan precios cero ni valores inventados para completar información ausente. Los precios y condiciones pueden variar según naviera, mercado, región, moneda, barco, itinerario y fecha.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- App Router
- LocalStorage para persistencia del wizard
- Vitest

## Desarrollo local

```bash
npm install
npm test
npm run lint
npm run build
```
