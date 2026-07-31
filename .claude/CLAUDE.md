# Nemawashi

Un ejecutable de escritorio que envuelve a Claude Code para que un experto de negocio y una IA
construyan juntos el roadmap de un sistema, sin que el experto vea nunca una terminal.

Todo se escribe en español.

## El mapa

| Dónde | Qué hay |
|---|---|
| `product/` | Lo que rige: arquitectura de desarrollo, de diseño, y los módulos |
| `docs/decisions/` | Las decisiones tomadas, una por archivo |
| `design/` | El sistema de diseño y las maquetas de las pantallas |
| `src/` | El código |

## Lo que no se discute por archivo

Está decidido en `product/`. Se resume aquí porque una revisión de código o una sesión
cualquiera no carga las cartas de los oficios, y sin esto trabajaría por costumbre general.
**Si este resumen y el documento difieren, manda el documento.**

- **Paradigma mixto, con regla de reparto.** El núcleo es funcional: datos planos y funciones
  que devuelven un dato nuevo sin tocar el original. Los adaptadores usan objetos. Si es una
  transformación, es función; si tiene estado que vive en el tiempo, ese estado es un dato
  plano del núcleo y el objeto del adaptador sólo lo sostiene — nunca guarda reglas.
- **Puertos y adaptadores.** Pocos puertos. Prohibido crear una interfaz con una sola
  implementación y ninguna prueba que la use.
- **Patrones permitidos, tres:** repositorio, resultado en vez de excepción (sólo en el
  núcleo), validar en la frontera. **Prohibidos, dos:** *singleton* y herencia de más de un
  nivel.
- **La pared entre los dos mundos.** La pantalla no toca archivos ni procesos, nunca. Todo
  pasa por la lista corta de `src/contratos/mensajes.ts`: lo que no está escrito ahí, la
  pantalla no lo puede pedir.
- **Ni un color ni una medida escritos a mano**, ni en las maquetas ni en el código: salen de
  `design/fundamentos/valores.css`. Y ningún texto visible dentro de un componente.
- **Las pantallas se diseñan antes en `design/`.** Nada de inventar interfaz al implementar.
- **Sin dato personal, cita textual ni identificador de cliente** en ningún archivo
  versionado. No hay excepción para las pruebas ni para los ejemplos.
- **Todo en español**, y una función se nombra por la verdad que sostiene, no por el patrón
  que usa.

## Los oficios

Hay dos agentes, y cada uno trae su propia carta con el método de este repositorio.

**`desarrollador`** — para implementar cualquier cosa, y para arreglar lo que QA diagnosticó. Su
carta trae lo que la arquitectura ya decidió: paradigma, patrones permitidos y prohibidos, la pared
entre los dos mundos y la suite de cierre.

**`qa`** — cuando algo se declare listo, cuando cambie el comportamiento del núcleo o de la pared, y
antes de cualquier cierre. Su carta trae las capas de prueba y cómo se clasifica un caso.

**Cada carta es del agente que la lleva: la carga él solo y no se invoca desde fuera.** Si necesitas
saber cómo se hace algo aquí, llama al agente — no leas su carta para hacerlo por tu cuenta.

El reparto entre los dos: el desarrollador escribe código y su prueba; QA juzga y caza pruebas que
pasan sin medir nada. **QA no escribe código de producción y el desarrollador no dictamina por
medición ajena.**
