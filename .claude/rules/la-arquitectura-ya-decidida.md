# La arquitectura ya decidida

Está decidido en `product/`. Se repite aquí porque **una regla llega sola y una carta no**: una
revisión de código o una sesión cualquiera no carga las cartas de los oficios, y sin esto trabajaría
por costumbre general. **Si esta regla y el documento difieren, manda el documento.**

- **Paradigma mixto, con regla de reparto.** El núcleo es funcional: datos planos y funciones que
  devuelven un dato nuevo sin tocar el original. Los adaptadores usan objetos. Si es una
  transformación, es función; si tiene estado que vive en el tiempo, ese estado es un dato plano del
  núcleo y el objeto del adaptador sólo lo sostiene — nunca guarda reglas.
- **Puertos y adaptadores.** Pocos puertos. Prohibido crear una interfaz con una sola implementación
  y ninguna prueba que la use.
- **Patrones permitidos, tres:** repositorio, resultado en vez de excepción (sólo en el núcleo),
  validar en la frontera. **Prohibidos, dos:** *singleton* y herencia de más de un nivel.
- **La pared entre los dos mundos.** La pantalla no toca archivos ni procesos, nunca. Todo pasa por
  la lista corta de `src/contratos/mensajes.ts`: lo que no está escrito ahí, la pantalla no lo puede
  pedir.
- **Ni un color ni una medida escritos a mano**, ni en las maquetas ni en el código: salen de
  `design/fundamentos/valores.css`. Y ningún texto visible dentro de un componente.
- **Las pantallas se diseñan antes en `design/`.** Nada de inventar interfaz al implementar.
- **Una función se nombra por la verdad que sostiene**, no por el patrón que usa.
