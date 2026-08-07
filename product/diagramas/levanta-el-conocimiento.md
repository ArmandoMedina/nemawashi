---
tipo: recursos
estado: propuesta
---
# El molino, dibujado — `levanta-el-conocimiento`

> **La fuente de verdad es el código.** Este dibujo se hizo leyendo
> `.claude/workflows/levanta-el-conocimiento.js`, y lo que no corre ahí no se dibuja. Si los dos
> difieren, manda el `.js` — y la diferencia se arregla aquí.

**El método de dibujar —cómo se abre, con qué reglas, cuánto texto lleva y cómo se comprueba— está
en [`README.md`](README.md) y no se repite aquí.**

## Qué se ve

Cinco planos: el molino entero, y cuatro subprocesos — *Sacar lo que dijo el experto*, *Construir el
registro*, *Medir y corregir* y *Anotar la corrida*.

Dos carriles, que son dos puestos. **Ninguna caja explica el oficio de su puesto:** eso lo dice su
carta.

| Caja | Quién la hace | Con qué carta |
|---|---|---|
| Sacar la plática · Leer las respuestas · Inventariar · Anotar la hora de cierre | auditor | ninguna: son mecánicas |
| Levantar el examen | auditor | [`levantar-el-examen`](../../.claude/skills/levantar-el-examen/SKILL.md) |
| Las cuatro de *Construir* y *Corregir* | auditor | [`construir-el-registro`](../../.claude/skills/construir-el-registro/SKILL.md) |
| Leer el registro en frío | auditor | [`leer-en-frio`](../../.claude/skills/leer-en-frio/SKILL.md) |
| Cotejar lo dicho | auditor | [`cotejar`](../../.claude/skills/cotejar/SKILL.md) |
| Contestar el examen | auditor | [`contestar-el-examen`](../../.claude/skills/contestar-el-examen/SKILL.md) |
| Registrar los archivos | escribano | [`registrar-el-conocimiento`](../../.claude/skills/registrar-el-conocimiento/SKILL.md) |
| Auditar lo escrito | auditor | [`auditar`](../../.claude/skills/auditar/SKILL.md) |
| Marcar lo que el auditor encontró | escribano | [`marcar-lo-auditado`](../../.claude/skills/marcar-lo-auditado/SKILL.md) |
| Armar lo que falta preguntar | auditor | [`armar-lo-que-falta`](../../.claude/skills/armar-lo-que-falta/SKILL.md) |
| Anotar la corrida | escribano | ninguna: es mecánica |

## Dos palabras que no son sinónimos

| Palabra | Qué es | Cuántas hay |
|---|---|---|
| **Vuelta** | Un ciclo de *Corregir sólo lo marcado* sobre lo que las mediciones señalaron | Dos como máximo, y el tope lo pone el código |
| **Corrida** | El molino entero de punta a punta | Dos: la primera deja dudas, la segunda llega con las respuestas |

## Lo que el diagrama fija

| Qué | Por qué |
|---|---|
| **La hora del alta se mide al sacar, y si no trae huso la corrida para en seco** | Sin ella el escribano rechaza entero lo que se muela, y eso se sabría al final, con la corrida ya gastada |
| **Las respuestas del experto entran por ruta y las lee un agente** | Tecleadas dentro de la llamada rompen la reanudación, y una versión recortada se cuela sin que nadie lo note |
| **Que el lector traiga algo dentro es lo que marca la segunda corrida** | Una ruta por sí sola no basta para cerrar `listo` sin que el experto haya contestado nada |
| **Las preguntas se levantan antes de construir** | El examen no toca disco: el orden de las llamadas es la única garantía de que no se escribió con el resultado enfrente |
| **Las cuatro llamadas de construir van en cadena** | Cada una cita lo que armó la anterior. Y partirlas fue medición, no diseño: juntas el clasificador las rechazaba |
| **Al lector en frío no le llega ninguna flecha de datos** | Su ceguera es el instrumento |
| **Las tres mediciones corren en paralelo** | Son independientes; en fila tardan la suma en vez de la más lenta |
| **Corregir no vuelve a construir** | Corrige sólo las piezas marcadas y se funde con el registro que ya estaba |
| **Las dudas cortan antes que el registro vacío** | Con dudas y cero piezas, la corrida se va por las dudas: es lo que el experto puede contestar |
| **La segunda vuelta va sólo por lo que el cotejador siga marcando** | Lo que no se entiende solo y lo que el examen no contesta se cierran con el experto después; una frase que nadie dijo, no: mientras siga escrita se lee como respaldada |
| **Si ninguna llamada de corregir contestó, no se vuelve a medir** | Medir otra vez lo mismo gasta tres agentes para repetir el resultado |
| **El experto contesta una sola corrida** | Un freno que no se levanta no es freno, es candado |
| **Todo camino que llega al final pasa por *Anotar la corrida*, los paros incluidos** | Una corrida que no deja renglón no se puede comparar con la siguiente |
| **Anotar no puede tumbar la corrida, y tampoco la garantiza** | Sus dos llamadas van envueltas: si truenan, se dice y se cierra igual — sin renglón. Anotar es medición, no la línea |
| **Corregir es una llamada por tipo de pieza, y basta que una conteste para volver a medir** | Nadie comprueba que haya cambiado algo: lo que se mide es si el corrector contestó |

## Los ocho estados con que cierra

El renglón de `docs/mediciones/corridas.jsonl` lleva uno de éstos. **Los siete paros se ven cada uno
en su lugar** —dentro del subproceso donde ocurren, y con su propia salida en el tronco—; el tronco
los junta en un solo final porque los siete acaban igual: anotados y sin registro.

| Estado | De dónde sale |
|---|---|
| `sin-material` | La plática llegó vacía, o el registro salió sin una sola pieza |
| `sin-hora` | La hora del alta no llegó con huso |
| `sin-respuestas` | Llegó ruta de respuestas y no se pudieron leer — o llegó el argumento viejo |
| `sin-examen` | La plática no dio ninguna pregunta |
| `sin-medicion` | Un agente no contestó: el sacador, quien levanta el examen, o alguna de las cuatro llamadas de construir. Cada una tiene su rombo `¿Contestó?` |
| `dudas-devueltas` | Quedaron dudas y es la primera corrida |
| `sin-registro` | El escribano no escribió |
| `listo` · `con-huecos` | El cierre normal, según si algo quedó señalado |

## Lo que el dibujo NO muestra, a propósito

- **El freno al argumento viejo.** Si llega `args.respuestas` con texto en vez de `rutaRespuestas`,
  la corrida para antes de gastar un agente, y anota `sin-respuestas`. Es compatibilidad con una
  llamada vieja, no un paso del método — **y es el único camino de paro que no está dibujado.**
- **Qué decide el estado del cierre.** Sale de cuatro cosas juntas: lo que las mediciones señalaron,
  lo que quedó con huecos, que el auditor diga que no sirve, y las fallas contra el crudo. Una pieza
  señalada que el escribano no reportó como marcada **cuenta igual**: manda la medición, no el
  reporte.
- **Que las otras veinte llamadas van sin red.** Sólo las dos de *Anotar* están envueltas contra una
  excepción; si truena cualquier otra, la corrida muere sin llegar a anotar.
- **Cómo se saca la plática por dentro.** Eso lo hace `src/nucleo/sacar-turnos.ts`, y ahí se lee.
- **Que cuando una medición, el auditor o quien arma lo que falta no contestan, la corrida sigue**,
  con el hueco anotado en el renglón. Sólo los paros están dibujados.
- **Que el inventario alimenta también las cuatro llamadas de construir**, no sólo su propia caja.

- **Que el número de corrida del renglón sale de la ruta sola.** Lo que decide si es segunda
  corrida —y con eso el comportamiento— es que el lector traiga texto; el número que se anota, no.

**Y dos desviaciones a sabiendas:**

1. *Anotar la corrida* cae en el carril del escribano, pero dentro son dos puestos — el auditor mide
   la hora de cierre y el escribano escribe el renglón. El carril de un subproceso no puede decir
   dos cosas; se abre la caja y se ven las dos.
2. El rombo del cierre va **después** de anotar, y el estado se decide **antes**: lo trae el camino
   por donde salió la corrida. Por eso el rombo pregunta *con qué estado se anotó* y no *con cuál
   cierra*: ahí no se decide nada, sólo se enruta al final que corresponde.

## Lo que el diagrama NO decide

- **Qué es «pasar» una medición** — ni cero hallazgos, ni un umbral, ni quién dictamina.
- **Qué tipo lleva cada enlace** — contiene, usa, requiere, contradice.
- **Qué pasa con una pieza que ya existía y esta plática cambia.** El escribano no toca lo ya
  escrito, así que la reporta sin escribirla. Hoy nadie aplica ese cambio.
- **Si `pendientes`, `dudas`, `huecos` y `lo señalado` son cuatro cosas o una.**
- **Cuánto material cabe en una llamada de construir.** Lo medido es que 7806 caracteres de esquema
  truenan y 954 pasan; entre esos dos números no hay medición.

---

> **Procedencia.** Rehecho el **2026-08-06** leyendo el `.js`, cuando el dibujo anterior y el código
> ya no decían lo mismo. Lo que se quitó por no existir en el código: **el bucle por tramos** —
> *Construir* son cuatro llamadas en cadena sobre la plática entera, no una pasada por tramo—, el
> plano que dibujaba por dentro el sacador, y el plano que desglosaba la carta del examen. Lo que se
> agregó por existir y no estar: la fase *Anotar*, el freno de la hora, la lectura de las
> respuestas, el paro por registro vacío, y que *Marcar* sólo corre si hay fallas.
>
> Las preguntas de competencia como criterio de aceptación se toman de la ingeniería de ontologías
> conversacional —marco OntoChat, ESWC 2024—, que las levanta antes de construir y valida
> contestándolas una por una. El freno que para antes de escribir y la auditoría contra el registro
> crudo son jidoka y genchi genbutsu.
>
> **Sin fuente declarada:** el corte de dos vueltas y el reparto de las cajas entre los dos puestos.
> Salieron de este proyecto y nadie los ha medido contra un método establecido.
>
> **Lo que este diagrama fija se sigue midiendo cada vez que se corre, no cuando se dibujó.**
