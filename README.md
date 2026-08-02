# DrinkPilot

DrinkPilot es una miniapp para ayudar a viajeros de crucero a decidir si un paquete de bebidas compensa económicamente según su consumo, preferencias y precios disponibles.

## Estado del proyecto

MVP funcional para Costa Cruceros.

DrinkPilot permite:

- indicar la duración del crucero;
- estimar el consumo diario por persona;
- seleccionar preferencias premium;
- introducir precios reales de la reserva;
- comparar automáticamente My Drinks y My Drinks Plus;
- evaluar cobertura y ahorro;
- mostrar una recomendación explicada;
- distinguir entre precios de referencia y datos verificados;
- revisar los datos antes de calcular el resultado.

## Flujo actual

1. Duración
2. Consumo
3. Preferencias
4. Precios de la reserva
5. Personas
6. Revisión
7. Resultado

## Motor de recomendación

DrinkPilot recomienda un paquete únicamente cuando:

- genera ahorro positivo;
- cubre completamente las categorías y preferencias indicadas.

Entre los paquetes válidos, se prioriza el que genera mayor ahorro estimado.

Si ningún paquete cumple ambas condiciones, DrinkPilot recomienda pagar las bebidas por separado.

## Precios personalizados

El usuario puede introducir el precio diario que aparece en su reserva para:

- My Drinks
- My Drinks Plus

Si no introduce un precio, DrinkPilot utiliza precios de referencia.

Los precios personalizados tienen prioridad sobre los valores de referencia durante el cálculo.

## Calidad de los datos

DrinkPilot distingue entre:

- información verificada sobre inclusiones y restricciones;
- precios de referencia utilizados para realizar estimaciones;
- precios reales introducidos por el usuario.

Los precios reales pueden variar según crucero, tarifa, mercado y momento de compra.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- App Router
- LocalStorage para persistencia del wizard

## Desarrollo local

Instala dependencias:

```bash
npm install