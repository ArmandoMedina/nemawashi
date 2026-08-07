---
tipo: recursos
estado: propuesta
---
# La sesión, dibujada — `orquestador`

> **Esto dibuja una personalidad de sesión, no un agente.** El orquestador vive en
> `.claude/output-styles/orquestador.md`: no se le llama, se enciende y conduce la sesión entera.
>
> **Si el dibujo y la carta difieren, manda la carta.** El dibujo se hizo leyéndola, y lo que agrega
> de su cosecha está declarado abajo, renglón por renglón.

**El método de dibujar —cómo se abre, con qué reglas, cuánto texto lleva y cómo se comprueba— está
en [`README.md`](README.md) y no se repite aquí.**

## Los archivos

| Archivo | Qué dibuja | El «cómo» de ese puesto |
|---|---|---|
| `orquestador.bpmn` | La sesión entera, en cuatro planos | — |
| `agente-desarrollador.bpmn` | El desarrollador | [`skills/desarrollador`](../../.claude/skills/desarrollador/SKILL.md) |
| `agente-qa.bpmn` | QA | [`skills/qa`](../../.claude/skills/qa/SKILL.md) |
| `agente-auditor.bpmn` | El auditor con su carta `auditar` | [`skills/auditar`](../../.claude/skills/auditar/SKILL.md) |
| `agente-escribano.bpmn` | El escribano con su carta `asentar` | [`skills/asentar`](../../.claude/skills/asentar/SKILL.md) |

**Ninguna caja de esos cuatro dibujos se explica aquí.** Lo que hace cada puesto por dentro lo dice
su carta, y ahí se lee. El dibujo sólo pone el orden y los frenos.

Los cuatro planos de `orquestador.bpmn`: la sesión, *Abrir la sesión*, *Decidir juntos* y *Mandar a
trabajar*. Los cuatro archivos de agente se abren por separado.

## Cuánto se comparte hoy, medido

Los agentes se sacaron a archivo propio para que dos flujos llamen al mismo dibujo. Lo que hoy
comparten de verdad:

| Flujo | A quién llama, y con qué carta |
|---|---|
| El molino (`levanta-el-conocimiento.js`) | auditor con `levantar-el-examen`, `construir-el-registro`, `leer-en-frio`, `cotejar`, `contestar-el-examen`, `auditar`, `armar-lo-que-falta`; escribano con `registrar-el-conocimiento` y `marcar-lo-auditado` |
| La sesión del orquestador | desarrollador, qa, auditor y escribano — **sin carta nombrada** en la personalidad |

**Cartas que hoy comparten los dos, por escrito: una** — `auditar`. Las demás llamadas se dibujaron
con la carta que la tabla de reparto de la personalidad implica, no con una que esté escrita. Es
menos de lo que la idea de compartir promete.

**El molino no se tocó:** sigue con sus subprocesos dentro de su propio archivo. Migrarlo a
actividades de llamada no está decidido.

## Las desviaciones propias de este dibujo

Las dos que valen para los tres dibujos están en el [`README`](README.md). Éstas son sólo de aquí:

1. **Un solo participante.** El dueño del producto no es un pool aparte. Toda la sesión es
   conversación con él, así que un pool propio pondría una flecha de mensaje en casi cada caja. Vive
   en los nombres: *Llega el dueño del producto*, *Preguntarle qué ve él*.
2. **El rombo que reparte el trabajo tiene cuatro salidas**, una por puesto, en vez de dos.
3. **El desvío cuelga de un solo lugar.** Sale algo que no es de hoy en cualquier momento; dibujarlo
   así costaría un evento de frontera en cada caja. Cuelga de *Decidir juntos*, que es donde más
   aparece, y es **no interruptor**: se aparca y la decisión sigue.

## Lo que el diagrama fija

| Qué | Por qué |
|---|---|
| **La hoja se escribe antes de trabajar nada** | La línea del objetivo es la vara de la sesión entera, y sin ella no hay contra qué medir un desvío |
| **Un hecho se contesta; sólo lo que es suyo pasa por el rebote** | Preguntarle qué ve él sobre un hecho es hacerle perder el tiempo |
| **Preguntarle qué ve él va ANTES de dar la posición** | Que se comprometa con algo primero es lo que evita que acepte lo del otro por inercia |
| **El rebote es un ciclo, y sólo lo cierra un sí en sus palabras** | Un «bueno, como digas» no es un sí. Recomendar no es decidir |
| **Lo que no cierra sale por su propio final** | Lo no decidido se marca como no decidido, y no se escribe como si estuviera cerrado |
| **Repartir es una pregunta, no un impulso** | «¿Hay un agente cuya carta cubra esto?» Si la hay, no es del orquestador — y si no la hay, mandar cuesta más de lo que ahorra |
| **Medir lo que volvió es una caja del flujo, no un adorno** | El reporte de un subagente es una afirmación; la medición es de quien encargó |
| **Lo que falló vuelve al encargo, no a la síntesis** | Un reporte que no aguantó la medición no es material para tejer |
| **La síntesis es la única caja que ningún puesto puede tomar** | Es lo único de este trabajo que no se delega |
| **La sesión tiene dos finales** | «Con el objetivo cumplido» y «con lo aparcado pendiente» no son lo mismo, y el nombre lo dice |

## Lo que el dibujo agrega y la carta no dice

Cinco cosas que salieron de leer la carta, no de leerla al pie de la letra. **Si alguna está mal, se
corrige aquí y en la carta, no sólo aquí:**

- **El ciclo del rebote tiene una salida por «el tema dejó de estar vivo».** La carta dice que el
  rebote sigue hasta el compromiso y no hasta el cansancio, pero no dice qué termina un rebote que
  no cierra.
- **`Recibir lo que pide` es una caja propia**, y con ella el bucle de la sesión. La carta describe
  el trabajo de una petición, no cómo se encadenan varias.
- **`Devolver el encargo con lo que falló` regresa a *Mandar a trabajar*.** La carta manda medir y
  no creerle al subagente, pero no dice qué se hace cuando la medición lo desmiente.
- **`Revisar lo aparcado` cierra la sesión antes de los dos finales.** La carta dice que al cerrar
  se revisa; el orden respecto del cierre lo puso el dibujo.
- **Los cuatro puestos del rombo de reparto** son los cuatro de la tabla de la carta. Disenador y
  devops existen en el repositorio y no están dibujados, porque esa tabla no los nombra.

## Lo que el diagrama NO decide

- **Con qué carta llama el orquestador al auditor y al escribano.** Se dibujó `auditar` y `asentar`
  porque es lo que su tabla implica; ningún renglón lo escribe.
- **Qué pasa cuando dos agentes se contradicen.** La carta manda decirlo; el dibujo no tiene la caja.
- **Cuántas vueltas aguanta `Devolver el encargo`.** No hay tope dibujado — el mismo hueco que el
  molino resolvió con un número y aquí no está.
- **Dónde vive la hoja entre una sesión y la siguiente.** El dibujo dice que se escribe en el
  scratchpad; nadie dice qué pasa con ella al día siguiente.
- **Qué cuenta como «medir lo que volvió»** para un encargo que no produce un archivo.
- **Si el molino y esta sesión llaman de verdad a la misma `auditar`**, o a dos lecturas distintas
  de la misma carta.

---

> **Procedencia.** Dibujado el **2026-08-06**, leyendo `.claude/output-styles/orquestador.md` y las
> cuatro cartas dibujadas. Los métodos que sostienen el contenido —A3, nemawashi, catchball, genchi
> genbutsu, lenguaje llano— están declarados en la personalidad y no se repiten aquí.
>
> **Sin fuente declarada:** las tres desviaciones propias y las cinco cosas que el dibujo agrega.
> Salieron de aquí y nadie las ha medido.
