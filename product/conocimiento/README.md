# Conocimiento — lo que el sistema tiene que poder hacer

Lo que el experto dijo sobre **su negocio**, levantado de una sesión y enlazado. No es trabajo —eso
vive en [`backlog/`](../../backlog/README.md)— y no es la arquitectura de Nemawashi —eso vive en
[`modulos.md`](../modulos.md).

> **Ojo con la palabra «módulo».** Aquí un módulo es un pedazo del negocio del experto. En
> [`../modulos.md`](../modulos.md) un módulo es un pedazo de Nemawashi, la herramienta. Son dos
> cosas distintas con el mismo nombre, y por eso el conocimiento vive bajo su propio techo.

Quien escribe aquí es el **escribano**, y sólo después de que se levantaron las preguntas, se armó
el registro y se midió. A mano también se vale: una capacidad se puede escribir sin IA.

## Qué hay aquí

| Dónde | Qué guarda |
|---|---|
| `dominios/NNNN-nombre.md` | **El área del negocio**, la que se levanta en sesiones aparte |
| `modulos/NNNN-nombre.md` | **El pedazo dentro de esa área** donde caen unas capacidades y no otras |
| `capacidades/NNNN-nombre.md` | **Lo que el sistema tiene que poder hacer.** La pieza central |
| `reglas/NNNN-nombre.md` | **La verdad que sostiene** una capacidad: qué se vale, qué no, con qué número |
| `*/0000-plantilla.md` | La forma de cada uno. **Manda la plantilla**, no este archivo |

## Qué es cada pieza, y cómo se sabe que es ésa y no otra

**Aquí viven las definiciones, y sólo aquí.** Las cartas de los agentes remiten a este renglón en
vez de repetirlo: lo que está escrito en dos lugares, un día dice cosas distintas.

Cada una lleva **su prueba** — no una descripción bonita, sino la pregunta que se contesta para
decidir si una pieza es de ese tipo:

| Pieza | Qué es | La prueba |
|---|---|---|
| **Dominio** | El área del negocio | **Se puede levantar en una sesión aparte, con quien la sabe.** Si para hablar de dos dominios hace falta siempre la misma persona en la sala, no son dos |
| **Módulo** | El pedazo del negocio dentro de un dominio | **Sirve para decidir dónde va una capacidad nueva.** Si no puedes usarlo para eso, no es un módulo: es una etiqueta |
| **Capacidad** | Lo que el sistema tiene que poder hacer | **Empieza con un verbo y alguien la pide.** Un sustantivo suelto no dice quién la quiere ni cuándo falla |
| **Regla** | La verdad que sostiene una capacidad | **Se puede violar.** Si nada la puede incumplir, no es una regla — es una descripción |

Las dos que más se confunden son **dominio y módulo**, y lo que las separa no es el tamaño: es
**quién lo sabe**. El dominio se define por el papel del negocio que puede contestar lo de adentro;
el módulo, por servir para clasificar. Por eso la plantilla del dominio tiene `<quien-lo-sabe>` y la
del módulo no.

### Por dónde se corta un módulo

**Por el ciclo de vida de la cosa que el dominio trata**: qué le pasa, y en qué orden. En un dominio
de comisiones, los módulos son darla de alta, calcularla, pagarla y registrarla en bitácora.

Las otras dos maneras de cortar se ven razonables y las dos fallan:

- **Por tema** parte en dos lo que ocurre en un solo momento, y entonces una capacidad cuelga de dos
  módulos a la vez. Medido al levantar una operación de reparto: «la entrega» y «el cobro» salieron
  como módulos distintos aunque son la misma persona, en la misma puerta, en el mismo instante. Tres
  capacidades acabaron cruzando la frontera de un módulo, y el enlace de un solo padre dejó de
  alcanzar.
- **Por pantalla** mete una decisión del sistema en un documento que es del negocio. La pantalla se
  diseña después, en [`design/`](../../design/), y sobre esto ya levantado. Un módulo llamado como
  una ventana amarra el negocio a una interfaz que todavía no existe.

La prueba de arriba sigue mandando: si el corte no te sirve para decidir dónde va una capacidad
nueva, no es un módulo. El ciclo de vida la pasa porque una capacidad nueva siempre ocurre en algún
punto de ese ciclo.

## Las palabras de la casa

Sin esto, media página de arriba no se puede aplicar.

| Palabra | Qué es aquí |
|---|---|
| **Paso** | Un tramo de conversación que el consultor cerró y nombró. Es el pedazo de sesión sobre el que corre todo, y su nombre va al campo `paso` |
| **Corrida** | Una pasada completa del flujo sobre un paso. Hay dos como máximo: en la primera se le pueden devolver preguntas al experto, en la segunda ya no |
| **Devolver algo** | Decírselo al experto con otras palabras y esperar su respuesta. Una regla `dicho` que se devuelve y él acepta pasa a `confirmado`; si nadie se la devolvió, se queda en `dicho` por firme que suene |
| **Pieza** | Una capacidad, un módulo o una regla. Un archivo de aquí |
| **Reporte** | Lo que devuelve una medición: qué piezas señaló y por qué. No se guarda en disco |

## Cómo se enlazan

El enlace va **en los dos sentidos**, y los dos lados se escriben. Un enlace de un solo lado se
recorre en una dirección y se pierde en la otra.

| Archivo | Campo que apunta hacia arriba | Campo que apunta hacia abajo |
|---|---|---|
| Dominio | — | `modulos: [MOD-0000]` |
| Módulo | `dominio: DOM-0000` | `capacidades: [CAP-0000]` |
| Capacidad | `modulo: MOD-0000` | `reglas: [REG-0000]` |
| Regla | `capacidades: [CAP-0000]` | — |

**Esta tabla se comprueba en cada corrida.** `src/nucleo/el-enlace-va-en-los-dos-sentidos.ts`
recorre el grafo entero y falla si un id citado no existe como archivo, si existe pero es de otro
tipo, o si el enlace está escrito de un solo lado. Los que hoy están de un solo lado quedan
declarados como deuda, en una lista que sólo puede encoger: una falla nueva sin declarar pone rojo,
y una deuda ya cerrada y no retirada también.

Existe porque la escritura del registro no es atómica. Una corrida que se corta a la mitad deja
piezas apuntando a otras que nunca se escribieron, y hasta el 2026-08-05 nada lo cazaba: lo pedía la
carta del escribano, pero el que muere antes de llegar a ese párrafo no la corre.

**Los enlaces no llevan tipo todavía.** Un enlace tipado diría *contiene*, *usa*, *requiere*,
*contradice*; el de hoy sólo dice que hay liga. Sin tipo se recorre el grafo pero no se razona sobre
él, y esa decisión sigue abierta.

## Cómo se busca un hueco

Ésta es la razón de que exista el campo `estado`. Un registro escrito no es un registro listo, y lo
que quedó a medias tiene que sobrevivir al cierre de la terminal: se busca `estado: con-huecos` en
las tres carpetas.

**La sesión siguiente abre por ahí.** Lo que salió marcado no se deriva río abajo hasta que se
cierre: no se convierte en tarea del backlog ni en historia de usuario.

**Una marca puede llegar después de escrito.** Cuando la auditoría contra el crudo encuentra algo,
la carta `marcar-lo-auditado` lo lleva al archivo: pone `estado: con-huecos`, agrega lo que el
auditor probó al final de `<que-queda-abierto>`, y estampa la hora en `marcado`. **Nunca borra ni
reescribe lo que ya estaba.** Ése es el único momento en que un archivo escrito se toca.

Un archivo con `marcado` lleno es uno que una auditoría señaló. Buscar por ese campo da lo que se
descubrió mal **después** de darlo por bueno, que no es lo mismo que lo que salió marcado de origen.

**Pero `estado` y `firmeza` son dos ejes, y hay que buscar por los dos.** `completa` no quiere decir
que no falte nada — quiere decir que **ninguna medición señaló ese archivo**. Una regla que el
experto nunca pudo cerrar sale `abierto` y `completa` a la vez: se escribió bien, con su pregunta
puesta, y nadie la señaló. Buscar sólo por `estado` deja fuera justo lo que hace falta preguntar.

## Los dos ejes

Los valores y sus reglas viven en las plantillas, que son las que mandan. En corto:

- **`firmeza`** — qué tan cerrado está: `dicho`, `confirmado`, `abierto`. Son las mismas tres que
  exige `src/nucleo/el-item-va-flaco.ts` para los ítems del roadmap; se reusan aquí para no tener
  dos vocabularios. **Ese validador no revisa estos archivos**: sólo recorre `roadmap/` y
  `backlog/`. Los de aquí los revisa `src/nucleo/el-conocimiento-no-se-escapa.ts`, que mide una
  pieza a la vez —su forma, y que no delate la máquina donde se escribió—, y
  `src/nucleo/el-enlace-va-en-los-dos-sentidos.ts`, que mide el grafo entero.
- **`origen`** — quién lo puso ahí: `escuchado` o `propuesto`. **Sólo lo escuchado se coteja contra
  la plática**; lo propuesto se mide contestando el examen, porque nadie lo dijo.

**Ninguno se deriva del otro.** Una capacidad puede ser `propuesto` y `confirmado` a la vez —el
agente la propuso y el experto dijo que sí—, y ésa es la combinación más valiosa que produce una
sesión. Confundir los dos ejes es el error que hace inútil la medición.

## Sin tope de cuerpo y sin puntero

A diferencia de `roadmap/`, aquí el cuerpo no tiene tope de letras y no hay carpeta `documentos/`.

**El tope produjo el defecto que se midió:** el 2026-07-31, diecisiete de cincuenta y nueve ítems
del roadmap salieron **apodados** porque el renglón apretaba y el desahogo no existía. Un apodo, en
ese sentido, es una etiqueta que sólo abre quien vivió el caso — *«el caso del molino trabado»*,
*«la pregunta 2»*. El renglón del frontmatter sí es corto —se lee en lista—, pero el cuerpo se
cuenta entero.

> **La palabra «apodo» significa dos cosas opuestas en este repositorio.** En el nombre del archivo
> es lo que se pide: un nombre corto que lo distinga de un vistazo. En el cuerpo es el defecto de
> arriba. Un nombre de archivo corto está bien; un cuerpo apodado, no.

---

> **Esta forma es hipótesis, y no se ha corrido ninguna sesión con ella.** Salió de dibujar el flujo
> que la produce en [`diagramas/levanta-el-conocimiento.bpmn`](../diagramas/levanta-el-conocimiento.bpmn) y de
> decidir sobre papel. La primera sesión real es la medición que la puede desmentir. Si falta un
> campo para escribir algo que sí se dijo, **se reporta, no se inventa.**
