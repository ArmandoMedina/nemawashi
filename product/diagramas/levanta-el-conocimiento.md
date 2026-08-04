---
tipo: recursos
estado: vigente
---
# El molino, dibujado — `levanta-el-conocimiento`

> **Esto ya corre.** El dibujo dejó de ser propuesta el **2026-08-04**, cuando el molino se
> implementó y molió una plática de verdad. Vive en `.claude/workflows/levanta-el-conocimiento.js` y
> escribe en `product/conocimiento/`.
>
> **Si el dibujo y el `.js` difieren, manda el `.js`** — es lo que corre. Pero difieren poco a
> propósito, y cuando difirieron, el equivocado fue el código: el diagrama ya tenía la caja
> *Marcar* después de *Auditar*, y al implementar se fundió dentro del escribano. Se perdió justo
> lo que el dibujo fijaba, y recuperarlo costó una corrida entera y un dictamen «no sirve».

## Cómo se abre

El archivo es `levanta-el-conocimiento.bpmn`: XML del estándar BPMN 2.0, unas mil líneas. **No se lee
en frío como texto** — se arrastra a un editor de BPMN en el navegador y se mira.

Trae **cinco planos**: el de arriba y cuatro subprocesos con contenido. Las cajas con el signo `+`
se abren con doble clic o con el botón azul de su esquina.

## Con qué reglas está escrito

Con las de **BPMN Method and Style**, de Bruce Silver. Las que gobiernan aquí:

- Cada actividad se nombra **verbo + objeto** — *Sacar la plática*, no *Extracción*.
- Cada evento de fin lleva **el estado en que quedó el proceso**, no la palabra «fin».
- Cuando un subproceso termina en varios estados, **el rombo que le sigue no vuelve a preguntar**:
  sus salidas llevan los nombres de esos estados y sólo enrutan.
- Los rombos paralelos no se etiquetan, ni ellos ni sus salidas.
- Ningún nivel pasa de diez actividades, para que quepa en una hoja.

**Dos desviaciones a sabiendas**, para que nadie las «arregle»:

1. Los rombos que siguen a una **tarea** llevan la pregunta y las salidas dicen `sí`/`no`. El método
   permite las dos formas; se escogió una sola para todo el dibujo.
2. Un evento de fin único conserva su nombre, aunque la regla pida quitárselo. Un fin sin nombre se
   lee peor, y el diagrama se hizo para leerse.

## Lo que el diagrama fija

| Qué | Por qué |
|---|---|
| **Las preguntas se levantan antes de construir** | Un examen escrito después de ver el resultado siempre lo aprueba |
| **A las preguntas se les quitan los nombres propios** | La pregunta sirve para cualquier caso, y ningún nombre real entra a un archivo |
| **Sólo lo que el experto dijo se coteja contra la plática** | Una capacidad que propone el agente nadie la dijo: se mide contestando el examen, no buscando la frase |
| **Las tres mediciones corren en paralelo** | Son independientes; en fila tardan la suma en vez de la más lenta |
| **Se escribe siempre, aunque la medición falle** | Una corrida larga que se traba nunca cierra. Lo que no se vale es escribir sin marca: el defecto silencioso es lo único que jidoka prohíbe |
| **La marca vive en el archivo, en un campo que se busca** | Un reporte muere al cerrar la terminal; el archivo viaja a la sesión siguiente y la abre |
| **El experto contesta una sola vuelta** | Sin tope, cada revisión encuentra algo más y no se escribe nunca. Un freno que no se levanta no es freno, es candado |
| **El paso puede cerrar «con huecos»** | Escrito no es lo mismo que listo |

## Lo que el diagrama NO decide

- ~~**En qué carpeta escribe el molino.**~~ **Decidido el 2026-08-04:** en
  `product/conocimiento/`, con una carpeta por tipo — `capacidades/`, `modulos/` y `reglas/`. El
  techo `conocimiento/` existe porque «módulo» ya significa otra cosa en `product/modulos.md`.
- **Qué tipo lleva cada enlace** — contiene, usa, requiere, contradice. Sin tipo se recorre el grafo
  pero no se razona sobre él.
- ~~**Si existe un nivel entre Capacidad y Regla.**~~ **Resuelto por otro lado el 2026-08-04:** el
  nivel que faltaba no estaba en medio sino **arriba**. Entró `Dominio`, sobre Módulo. Entre
  Capacidad y Regla sigue sin haber nada, y nadie lo ha pedido.
- **Quién produce la cuenta de vueltas.** El rombo que la consulta cuelga de otro rombo, no de una
  actividad que la calcule. En el `.js` la cuenta la lleva el código, que es lo correcto — el dibujo
  todavía no lo enseña.
- **Qué pasa con una pieza que ya existía y esta plática cambia.** El escribano no toca lo ya
  escrito, así que la reporta sin escribirla. Hoy nadie aplica ese cambio, y el dibujo no lo muestra.

## Qué cambió al implementarlo

El **2026-08-04** se escribieron las seis cartas que le faltaban a las cajas, se implementó el `.js`
y se corrió de verdad. Lo que la corrida obligó a agregar al dibujo:

- **`Inventariar lo ya escrito`**, caja nueva entre *Extraer conversación* y *Gestionar las
  preguntas*. Sin ella, cada paso vuelve a proponer lo mismo con otro número: la corrida no veía
  nada de lo que otras sesiones habían escrito.
- **`Marcar lo que quedó a medias` pasó a `Marcar lo que el auditor encontró`.** La caja ya estaba
  en el dibujo desde el principio; lo que cambió es qué marca. La marca de las mediciones la pone el
  escribano al escribir; ésta lleva al archivo lo que la auditoría contra el crudo encontró después.
- **`Proponer los módulos` pasó a `Proponer módulos y dominios`.** Entró un cuarto nivel. No se
  partió en dos cajas porque es el mismo acto —cortar el negocio, mismo agente, mismo momento— y lo
  que separa un dominio de un módulo no es el tamaño: es **quién lo sabe**, el papel que puede
  contestar lo de adentro.

Y lo que sigue igual, y conviene no «arreglar»:

- **El subproceso *Extraer conversación* no se implementa.** Dibuja lo que ya hace
  `src/nucleo/sacar-turnos.ts`, y el molino lo llama en vez de reescribirlo.
- **Las tres mediciones corren juntas con `Promise.all`**, no con el `parallel()` del harness: así
  el molino usa sólo los cuatro identificadores que el runtime inyecta y se puede ejecutar entero
  desde una prueba.

---

> **Procedencia.** Dibujado el **2026-08-04** al rehacer el molino desde cero. Las preguntas de
> competencia como criterio de aceptación se toman de la ingeniería de ontologías conversacional
> —marco OntoChat, ESWC 2024—, que las levanta antes de construir y valida contestándolas una por
> una. El freno que para antes de escribir y la auditoría contra el registro crudo ya vivían en el
> molino sin nombrarse: son jidoka y genchi genbutsu.
>
> **Sin fuente declarada:** el corte de dos vueltas, el reparto de las cajas entre auditor y
> escribano, y las dos desviaciones de estilo de arriba. Salieron de este proyecto y nadie los ha
> medido contra un método establecido.
>
> **La primera corrida ya ocurrió**, el 2026-08-04, sobre una plática simulada de ocho turnos. Salió
> con `estado: con-huecos` y el auditor dictaminó «no sirve». La mayoría de sus reproches eran un
> defecto del molino —no veía las respuestas del experto— pero debajo destapó tres cosas que ningún
> papel había enseñado: que el dictamen no llegaba a los archivos, que la marca llegaba sin motivo,
> y que la corrección reemplazaba el registro en vez de fundirse con él. **Lo que este diagrama fija
> se sigue midiendo cada vez que se corre, no cuando se dibujó.**
