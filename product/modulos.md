---
tipo: recursos
estado: vigente
---
# Módulos y orden de construcción — Nemawashi

> **Los módulos completos desde el día 1, y el orden para irlos construyendo.** No para
> construirlos todos, sino para que ninguno se invente a medio camino.

## Por qué existe este documento

Dos fallas hunden un proyecto de este tamaño, y llegan juntas: explorar y construir a la
vez, y encadenarlo todo entre sí. Cada una tiene su antídoto:

| Falla | Antídoto |
|---|---|
| Explorar y construir a la vez | Se separan en el tiempo: primero se decide y se escribe (`plano-desarrollo.md`), luego se teclea |
| Todo encadenado entre sí | **Regla de módulo autónomo**, abajo |

---

## Regla dura — módulo autónomo

**Un módulo sirve solo o no es módulo.**

Si el módulo N no le sirve a nadie hasta que exista el N+1, no son dos módulos: es un
programa partido en carpetas, y se derrumba igual que si nunca lo hubieras partido.

La prueba es una pregunta: *«si me detengo aquí y no construyo nada más, ¿alguien usa
esto?»* Si la respuesta es no, el corte está mal puesto.

**Consecuencia práctica:** se puede parar después de cualquier módulo. Ir lento no
significa dejar un sistema a medias — significa dejar un sistema más chico que funciona.

---

## Regla dura — dependencia en una sola dirección

Un módulo puede usar a los que vienen **antes** que él. Nunca a los que vienen después.

Sin esta regla la lista de abajo es un orden decorativo: alguien construye el 5 llamando
al 7 y ya volvimos a la app encadenada.

---

## Los módulos

### M1 · Consola de parámetros

**Qué es.** Abres la app, eliges un repo, y ves y editas los parámetros de Claude Code
para ese repo — agrupados en cinco secciones:

| Sección | Qué gobierna |
|---|---|
| 1 · Criterio | El motor, la profundidad del razonamiento y las instrucciones de arranque |
| 2 · Capacidades | Agentes, instructivos, comandos y flujos |
| 3 · Reglas permanentes | El contexto que lee siempre, y de qué archivos lo saca |
| 4 · Límites | Permisos, frenos y topes |
| 5 · Conexiones | Fuentes, carpetas, navegador y variables de entorno |

Son sustantivos y no preguntas porque el índice de un plano enumera. La maqueta de las
cinco vive en [`design/pantallas/consola-de-parametros.html`](../design/pantallas/consola-de-parametros.html).

**La consola es molde, no espejo.** Estructura encima de lo que Claude Code expone — el
contexto de un agente se captura por campos con sugerencias corregibles aunque la
herramienta lo reciba como texto plano — y Nemawashi lo traduce al formato que la herramienta
acepta. El límite del molde: lo que no existe no se finge. Un control sin soporte real se
muestra apagado con su motivo (§3 · Lo no disponible), nunca como si funcionara.

**Sirve solo porque:** es una herramienta de configuración completa. Aunque nunca se
construya nada más, resuelve un problema que hoy sólo se resuelve editando JSON a mano.

**Depende de:** nada.

---

### M2 · Lanzador

**Qué es.** Toma los parámetros de M1 y arranca una sesión de Claude Code con ellos
colgados por fuera — sin escribir nada en el repo del cliente.

**Sirve solo porque:** deja probar una configuración sin abrir terminal. «Guarda y
pruébala» es la mitad del valor de M1.

**Depende de:** M1.

**Lo que resuelve:** aquí vive la promesa de no invadir (§0.4.2). Las banderas
`--plugin-dir`, `--settings` y sobre todo `--setting-sources` son el mecanismo.

---

### M3 · Sesión

**Qué es.** El chat. El ida y vuelta con Claude Code dentro de la app, sin terminal a la
vista.

**Sirve solo porque:** es una interfaz de escritorio para Claude Code. Punto. Hay gente
que la usaría sin nada de lo que sigue.

**Depende de:** M2.

**Lo que resuelve:** §0.4.3 — que el experto nunca vea una terminal.

---

### M4 · El ítem y las dos colas

**Qué es.** La forma del ítem y las dos listas donde viven. Crear, editar, buscar. **A mano.**

**El ítem va flaco.** Un renglón que se lee de un vistazo, con sus campos obligatorios y una
referencia a dónde está el detalle. El detalle nunca vive en la lista: si cupiera en el renglón, no
hacía falta la referencia; si no cupiera, la lista deja de poderse leer.

| Campo | Qué guarda |
|---|---|
| Alta | Cuándo entró. Un ítem sin fecha envejece sin que nadie lo note |
| Apetito | Cuánto tiempo de **revisión humana** se le concede. No es esfuerzo de construcción |
| Puntero | A qué documento hay que ir por el detalle |
| Procedencia | De dónde salió y qué tan firme está |

**Las dos colas, y no son la misma cosa:**

- **El roadmap** — conocimiento. Lo que el experto dijo y lo que confirmó, con su procedencia. Su
  puntero apunta al documento que **se le entrega al experto para que confirme**: por eso el
  entregable del experto no necesita módulo propio, es a dónde apunta el ítem.
- **El backlog** — trabajo. Las tareas de desarrollo, con su criterio de terminado. Su puntero
  apunta al contexto que quien implementa carga cuando toma la tarea.

**El puntero apunta a un documento con estructura definida** —informe de análisis, exploración,
ADR—, no a prosa suelta. La estructura es la misma en todos los de su clase y siempre en el mismo
orden, para que el detalle se encuentre sin leer el documento entero. Ese documento **no es parte
del ítem** (`arquitectura-desarrollo.md` §2.10): es una pieza independiente que el ítem cita.

**Sirve solo porque:** es un capturador de conocimiento con procedencia obligatoria. Se
puede usar sin IA, escribiendo tú.

**Depende de:** M1 (para saber cuál repo).

> **Ojo — este es el módulo que decide el proyecto.** Si la forma del ítem está mal, M5,
> M6, M7 y M8 heredan el error. Es el que hay que revisar más despacio.

---

### M5 · El agente que saca la sopa

**Qué es.** Las instrucciones, el flujo y los frenos que hacen que la IA conduzca al
experto: cazar los «obviamente» —lo que quien sabe da por sabido y nunca dice— y cerrar
cada hallazgo en un ítem antes de avanzar.

El freno que entra al querer dar por terminada la respuesta es la pieza crítica:
**impide que la sesión termine con hallazgos sin registrar.**

> **Cómo conduce, sin decidir.** Si el agente propone modelos para que el experto los corrija, si
> le refleja lo que entendió y pregunta lo que le falta, o si hace las dos cosas en momentos
> distintos, **está abierto**. Se cierra antes de escribir una sola instrucción de este módulo.

**Sirve solo porque:** es donde lo que el experto sabe se vuelve registro. Con M1 a M4 hay
una herramienta de captura; con M5 la captura la conduce alguien.

**Depende de:** M3 y M4.

---

### M6 · El tablero

**Qué es.** Todos los ítems por estado — dicho, confirmado, contradicho — para ver de un
vistazo qué está firme y qué sigue colgando.

**Sirve solo porque:** es el instrumento del dueño del producto. Sin él, «tenemos 200
ítems» no dice nada sobre si el trabajo sirve.

**Depende de:** M4.

---

### M7 · La traducción a backlog

**Qué es.** Lo que convierte un roadmap confirmado en tareas de desarrollo. Toma el conocimiento
que el experto ya firmó y produce ítems de backlog con su criterio de terminado y su puntero al
contexto.

**El nivel de la traducción es «qué y por qué», nunca «cómo».** El ítem define comportamiento
observable y reglas de negocio; la columna, el esquema y las funciones las decide quien implementa,
con el contexto fresco del momento. Una especificación técnica escrita antes de que exista código
envejece mal y se tira: la creatividad tiene que vivir donde hay más información, no donde hay
menos.

**Sirve solo porque:** un roadmap confirmado sin traducir no lo puede tomar nadie. Con esto, quien
desarrolla tiene trabajo tomable aunque no exista ninguna vista encima.

**Depende de:** M4 y M6.

---

### M8 · La vista del dev

**Qué es.** El backlog listo para tomar, con sus punteros a la fuente para cuando quien
desarrolla dude.

**Sirve solo porque:** es el entregable. Es lo que justifica todo lo anterior ante quien
paga.

**Depende de:** M7.

---

## El orden, y por qué ese

```
M1 ──> M2 ──> M3 ──┐
 │                 ├──> M5
 └──> M4 ──────────┘
       │
       └──> M6 ──> M7 ──> M8
```

Se construyen **en número**, M1 primero. Dos razones:

1. **Cada uno deja algo usable.** Parar en cualquier punto deja una herramienta, no un
   esqueleto.
2. **El orden va de lo conocido a lo incierto.** M1 y M2 son mecánica verificada — las
   banderas existen y están documentadas. M5 es lo que nadie ha hecho y donde va a haber
   más error. Llegar ahí con el resto sólido significa que cuando algo falle, se sabe
   dónde.

**M4 se puede adelantar** si urge la forma del ítem — sólo depende de M1. Es la única
licencia que da este orden.

---

## Lo que este mapa NO decide

- **Qué hay dentro de cada módulo.** Eso se decide al abrirlo, no hoy.
- **Cuánto tarda cada uno.** No hay estimación y no se va a inventar una.
- **Si hay un M9.** Probablemente sí. Se agrega aquí antes de construirlo, nunca durante.

---

> **Procedencia.** Escrito el **2026-07-29** a partir de la conversación de arranque con
> el dueño del producto, sobre su lección declarada del proyecto anterior. Ningún módulo
> está construido: este documento es intención, no medición.
>
> **2026-07-30** — M4 se reescribe: el ítem se declara flaco, con sus campos obligatorios y su
> puntero, y se separan las **dos colas** —roadmap para conocimiento, backlog para trabajo— que la
> versión anterior tenía revueltas en una sola definición. Entra **M7, la traducción a backlog**,
> que ninguna versión anterior contemplaba, y la vista del dev pasa a **M8** porque depende de
> ella y la regla de dependencia va en una sola dirección. El entregable del experto **no** gana
> módulo: es el documento al que apunta el ítem del roadmap. Decisiones del dueño del producto;
> ningún módulo está construido, así que la renumeración no rompe nada.
