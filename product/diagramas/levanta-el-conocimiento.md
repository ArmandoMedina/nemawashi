---
tipo: recursos
estado: propuesta
---
# El molino, dibujado — `levanta-el-conocimiento`

> **El dibujo va por delante del código, a propósito.** Parte de lo que muestra ya corre; el bucle
> por tramos todavía no. Cada caja dice de qué lado está, y la tabla del final lo resume.
>
> **Si el dibujo y el `.js` difieren en lo que ya corre, manda el `.js`.** Cuando difirieron, el
> equivocado fue el código: el diagrama ya tenía la caja *Marcar* después de *Auditar*, y al
> implementar se fundió dentro del escribano. Recuperarlo costó una corrida entera y un dictamen
> «no sirve».

## Cómo se abre

El archivo es `levanta-el-conocimiento.bpmn`: XML del estándar BPMN 2.0. **No se lee en frío como
texto** — se arrastra a un editor de BPMN en el navegador y se mira.

Trae **seis planos**: el de arriba y cinco subprocesos con contenido. Las cajas con el signo `+` se
abren con doble clic o con el botón azul de su esquina.

## Con qué reglas está escrito

Con las de **BPMN Method and Style**, de Bruce Silver. Las que gobiernan aquí:

- Cada actividad se nombra **verbo + objeto** — *Sacar la plática*, no *Extracción*.
- Cada evento de fin lleva **el estado en que quedó el proceso**, no la palabra «fin».
- Cuando un subproceso termina en varios estados, **el rombo que le sigue no vuelve a preguntar**:
  sus salidas llevan los nombres de esos estados y sólo enrutan.
- Los rombos paralelos no se etiquetan, ni ellos ni sus salidas.
- **Los objetos de datos sólo se dibujan donde contestan algo que el flujo no contesta.** Lo que
  persiste fuera del proceso es un almacén, no un objeto.
- Ningún nivel pasa de diez actividades, para que quepa en una hoja.

**Dos desviaciones a sabiendas**, para que nadie las «arregle»:

1. Los rombos que siguen a una **tarea** llevan la pregunta y las salidas dicen `sí`/`no`. El método
   permite las dos formas; se escogió una sola para todo el dibujo.
2. Un evento de fin único conserva su nombre, aunque la regla pida quitárselo. Un fin sin nombre se
   lee peor, y el diagrama se hizo para leerse.

## Tres palabras que no son sinónimos

Se separan aquí porque confundirlas rompe el dibujo entero:

| Palabra | Qué es | Cuántas hay |
|---|---|---|
| **Tramo** | Una pasada del bucle dentro de *Construir el registro*: un pedazo de plática | Las que devuelva *Partir la plática en tramos* |
| **Vuelta** | Un ciclo de *Corregir lo marcado* sobre lo que las mediciones señalaron | Dos como máximo, y el tope lo pone el código |
| **Corrida** | El molino entero de punta a punta | Dos: la primera deja dudas, la segunda llega con las respuestas |

## Lo que el diagrama fija

| Qué | Por qué |
|---|---|
| **Las preguntas se levantan antes de construir** | Un examen escrito después de ver el resultado siempre lo aprueba |
| **A las preguntas se les quitan los nombres propios** | La pregunta sirve para cualquier caso, y ningún nombre real entra a un archivo |
| **Sólo lo que el experto dijo se coteja contra la plática** | Una capacidad que propone el agente nadie la dijo: se mide contestando el examen, no buscando la frase |
| **Al lector en frío no le llega ninguna flecha de datos** | Su ceguera es el instrumento. El que estuvo en la sesión tapa el hueco al leer sin darse cuenta |
| **Las tres mediciones corren en paralelo** | Son independientes; en fila tardan la suma en vez de la más lenta |
| **Se escribe siempre, aunque la medición falle** | Una corrida larga que se traba nunca cierra. Lo que no se vale es escribir sin marca: el defecto silencioso es lo único que jidoka prohíbe |
| **La marca vive en el archivo, en un campo que se busca** | Un reporte muere al cerrar la terminal; el archivo viaja a la sesión siguiente y la abre |
| **El experto contesta una sola corrida** | Sin tope, cada revisión encuentra algo más y no se escribe nunca. Un freno que no se levanta no es freno, es candado |
| **El paso puede cerrar «con huecos»** | Escrito no es lo mismo que listo |
| **Corregir no vuelve a construir** | Corrige sólo las piezas marcadas y se funde con el registro que ya estaba. Reemplazarlo entero costó una corrida |

## Lo que el bucle por tramos agrega

*Construir el registro* deja de ser una caja y pasa a ser cinco. La razón está medida: el esquema
de salida que se le mandaba pesaba **7806 caracteres** y el clasificador lo rechazó, contra 954 del
siguiente más grande del molino.

- **`Partir la plática en tramos`** corta respetando el hilo, no el peso. Si ya hay módulos
  escritos, se corta por ellos —son temas que el experto ya validó—; lo demás por tema nuevo. El
  peso queda de techo: un tema que no cabe se parte, **y se dice que se partió**. Cuando la plática
  cabe en uno, es un tramo y nada cambia.
- **El bucle es de multi-instancia secuencial**, no paralela. Los tramos corren en fila porque cada
  uno ve el renglón de lo que los anteriores propusieron —con su firmeza y su fecha—, y eso es lo
  que permite cazar una contradicción entre el principio y el final de una junta larga.
- **`Proponer los módulos` y `Proponer los dominios` corren una sola vez**, al final, sobre todo lo
  que los tramos juntaron. Agrupar es un acto y necesita el conjunto enfrente. **De abajo hacia
  arriba**: un dominio puesto primero llegaría inventado, y los tres niveles de abajo colgarían de
  esa invención sin que nadie pudiera desmentirla.
- **Van en dos cajas por medición, no por diseño.** Juntas pesaban 3841 caracteres de esquema,
  casi el doble del tope. Si el umbral del clasificador llega a medirse y da para tanto, vuelven a
  ser una: es el mismo acto.
- **Las cuatro llamadas ven el índice completo**, no sólo las piezas de su tipo. Lo que se filtra
  es qué se le pide escribir, no qué se le deja ver — medido el 2026-08-04: quien sacaba reglas no
  veía las capacidades ya escritas, y cuatro enunciados que ya vivían como capacidad estuvieron a
  punto de volver a escribirse como regla.
- **`Coser los enlaces en los dos sentidos`** refleja hacia abajo lo que el nivel de arriba declaró.
  Un solo lugar donde se dice quién contiene a quién.

**Una contradicción no para la línea desde el tramo.** Se anota como duda y el tramo termina igual.
Lo que para la línea es el rombo del final, con las dudas de todos los tramos juntas — porque el
experto contesta una vez, no una por tramo.

## Lo que los datos dibujados contestan

Cinco objetos y un almacén, y cada uno responde una pregunta que el flujo de control no responde:

| Qué | Dónde | Qué contesta |
|---|---|---|
| `Los tramos` | Construir | Quién fija las pasadas del bucle — va enganchado al `loopDataInputRef` |
| `Lo propuesto hasta ahora` | Construir | Qué se acumula: entra y sale de la misma caja |
| `El conocimiento ya escrito` | Construir | De dónde sale el inventario, y que persiste entre corridas |
| `Lo que dijo el experto` | Medir | Que son **dos** cosas: la plática y lo que contestó a las dudas de antes |
| `El examen` | Medir | Que lo recibe quien lo contesta, y nadie más |

## Lo que el diagrama NO decide

- **De qué tamaño es el techo del tramo.** El corte por tema está fijado; el número no.
- **Si los esquemas partidos pasan el clasificador.** Lo medido es que 7806 truena y 954 pasa.
  Entre esos dos números no hay ninguna medición.
- **Cuánto cabe en `Lo propuesto hasta ahora`.** Es entrada de prompt, no esquema de salida, así que
  no es el límite que se midió — pero tampoco hay medición de ese otro.
- **Qué tipo lleva cada enlace** — contiene, usa, requiere, contradice. Sin tipo se recorre el grafo
  pero no se razona sobre él.
- **Quién produce la cuenta de vueltas.** El rombo que la consulta cuelga de otro rombo, no de una
  actividad que la calcule. En el `.js` la cuenta la lleva el código, que es lo correcto — el dibujo
  todavía no lo enseña.
- **Qué pasa con una pieza que ya existía y esta plática cambia.** El escribano no toca lo ya
  escrito, así que la reporta sin escribirla. Hoy nadie aplica ese cambio.

## Qué corre y qué no

| Parte del dibujo | Estado |
|---|---|
| El flujo troncal, las diez fases y los dos frenos | **Corre** |
| `Corregir lo marcado` yendo a *Medir*, no de vuelta a *Construir* | **Corre** — el dibujo se alineó al código |
| Los objetos de datos | **Documentan** lo que el código ya hace |
| `Construir` partido en cuatro llamadas, una por nivel | **Corre** — el mayor esquema pasó de 7806 a 1994 |
| El índice completo a las cuatro llamadas | **Corre** |
| El bucle por tramos, y el corte por tema | **No corre todavía** |

## Lo que la auditoría en frío dejó abierto

Nueve cosas que este dibujo arrastra desde antes y siguen sin resolverse. No estorban para
implementarlo, pero quien lo lea completo se va a topar con ellas:

- **`pendientes`, `dudas`, `huecos` y `lo marcado`** aparecen en el mismo dibujo sin que nada diga
  si son cuatro cosas o una.
- **`¿Las tres pasaron?` nunca dice qué es pasar** — ni cero hallazgos, ni un umbral, ni quién
  dictamina.
- **Con dudas y sin ser la primera corrida se sale por el final llamado *Sin dudas***. El nombre del
  final dice lo contrario de lo que pasó.
- **`Gestionar las preguntas` produce «el examen»**, y tres cajas distintas producen preguntas sin
  que sus nombres digan en qué se diferencian.
- **`jidoka` se usa y no se define** en ningún renglón del archivo.

---

> **Procedencia.** Dibujado el **2026-08-04** al rehacer el molino desde cero, y corregido el mismo
> día contra dos auditorías. Las preguntas de competencia como criterio de aceptación se toman de
> la ingeniería de ontologías conversacional —marco OntoChat, ESWC 2024—, que las levanta antes de
> construir y valida contestándolas una por una. El freno que para antes de escribir y la auditoría
> contra el registro crudo ya vivían en el molino sin nombrarse: son jidoka y genchi genbutsu. El
> marcador de multi-instancia secuencial y los objetos de datos son BPMN 2.0 estándar.
>
> **Sin fuente declarada:** el corte de dos vueltas, el reparto de las cajas entre auditor y
> escribano, el corte de tramos por tema con el peso de techo, y las dos desviaciones de estilo de
> arriba. Salieron de este proyecto y nadie los ha medido contra un método establecido.
>
> **Lo que este diagrama fija se sigue midiendo cada vez que se corre, no cuando se dibujó.** La
> primera corrida real ocurrió el 2026-08-04 y salió con `estado: con-huecos`. La segunda murió
> antes de construir nada, y de ahí salió el bucle por tramos.
