---
tipo: recursos
estado: propuesta
---
# Cómo se dibuja aquí

El método de dibujar, en un solo lugar. **Los dibujos no lo repiten**: cada `.md` de al lado cuenta
sólo lo que su dibujo decide y lo que deja abierto.

## Qué hay aquí

| Dibujo | Qué es | Su nota |
|---|---|---|
| `levanta-el-conocimiento.bpmn` | El molino que levanta el conocimiento de un paso | [`.md`](levanta-el-conocimiento.md) |
| `consultor.bpmn` | La sesión de la personalidad `consultor` | [`.md`](consultor.md) |
| `orquestador.bpmn` | La sesión de la personalidad `orquestador` | [`.md`](orquestador.md) |
| `agente-desarrollador.bpmn` · `agente-qa.bpmn` · `agente-auditor.bpmn` · `agente-escribano.bpmn` | Un puesto con su carta, llamado desde otros dibujos | — |

## Un dibujo no es un instructivo

**Un diagrama dice qué se hace, en qué orden y quién lo hace. No dice cómo.** El «cómo» de cada
puesto vive en su carta, en `.claude/skills/`, y ahí se queda: copiarlo al dibujo o a su nota deja
dos versiones que un día dicen cosas distintas —lo que prohíbe
[`valen-en-toda-sesion`](../../.claude/rules/valen-en-toda-sesion.md).

Los agentes se leen **como puestos de trabajo**, y de ahí sale el reparto entero:

| La pieza | Qué es en el dibujo |
|---|---|
| La **carta** del agente | La descripción del puesto: lo que ese oficio sabe hacer siempre |
| El **encargo** | La orden de trabajo de hoy, que cambia cada vez |
| El **carril** o el **archivo de agente** | Quién hace la actividad — un puesto, nunca una persona |

Quien ejecuta no necesita el contexto de la sesión que produjo el dibujo. Necesita saber qué le toca
y a quién se lo pasa; lo demás lo trae su carta.

## Cómo se abre uno

Es XML del estándar BPMN 2.0. **No se lee en frío como texto** — se arrastra a un editor de BPMN en
el navegador y se mira. Las cajas con el signo `+` se abren con doble clic o con el botón azul de su
esquina. **Cada plano necesita su propio `BPMNDiagram`**: con varios planos dentro de uno solo, el
editor abre el último y parece que el dibujo está mal armado.

## Con qué reglas están escritos

Con las de **BPMN Method and Style**, de Bruce Silver:

- Cada actividad se nombra **verbo + objeto** — *Tejer la síntesis*, no *Síntesis*.
- Cada evento de fin lleva **el estado en que quedó el proceso**, no la palabra «fin».
- Cuando un subproceso termina en varios estados, **el rombo que le sigue no vuelve a preguntar**:
  sus salidas llevan los nombres de esos estados y sólo enrutan.
- Las salidas de un rombo exclusivo son estados, y los rombos paralelos no se etiquetan.
- Un pool de proceso con carriles dentro; los participantes externos, pools vacíos.
- Todo nodo conectado de principio a fin dentro de un mismo nivel.
- **Ningún nivel pasa de diez actividades**, para que quepa en una hoja.

**Dos desviaciones a sabiendas, en los tres dibujos**, para que nadie las «arregle»:

1. Los rombos que siguen a una **tarea** llevan la pregunta y sus salidas dicen `sí`/`no`. El método
   permite las dos formas; se escogió una sola para todo.
2. Un evento de fin único conserva su nombre, aunque la regla pida quitárselo. Un fin sin nombre se
   lee peor, y los dibujos se hicieron para leerse.

Las desviaciones propias de cada dibujo van en su `.md`, no aquí.

## Cuánto texto lleva un dibujo

**En el dibujo se queda la nota sin la cual el camino se lee mal. Tres por plano como máximo, de un
renglón. Lo demás no se copia: se apunta a la carta del puesto.**

Este corte **no es de Silver** — en su método no hay ningún renglón sobre anotaciones. Sale de dos
reglas suyas que sí están escritas: que el diagrama quepa en una hoja, y que el estilo existe para
que **la lógica** se entienda del dibujo solo. Lo que no es lógica, no tiene que estar en el dibujo.

**La otra salida del estándar no sirve aquí, y se midió:** `documentation` se puede pegar a cada
elemento y no se dibuja, pero el editor de navegador con el que se miran estos archivos no tiene
panel de propiedades, así que ese texto no se ve por ningún lado. Un cajón cerrado no es un lugar
donde guardar algo.

## Qué merece dibujo propio

**Un proceso, un dibujo** — y proceso es lo que tiene disparador propio y fin. La sesión del
consultor lo tiene; un agente al que otro llama, no: su camino es un pedazo del camino de quien lo
llamó, y ahí se dibuja.

**Salvo que lo llamen dos flujos distintos.** Entonces el pedazo deja de ser de uno: dibujarlo
dentro de cada quien lo copia, y dos copias divergen el día que una cambie. Ahí se saca a su propio
archivo y los dos lo llaman con una **actividad de llamada** —la caja de borde grueso, que no
contiene el camino sino que lo referencia. **Lo que se saca es el agente con su carta, no el agente
solo:** un agente sin carta no tiene un camino, tiene varios, y no se recorren juntos.

El método lo permite justo para este caso y lo llama excepción. En modelos no ejecutables —éstos lo
son— las actividades de llamada sirven *«sólo en el caso raro de que un subproceso se use varias
veces en el mismo proceso o, posiblemente, cuando una organización estandarizó los nombres de los
subprocesos para reutilizarlos en toda la empresa»*. Lo segundo es esto: los puestos y sus cartas ya
tienen nombre fijo en [`.claude/README.md`](../../.claude/README.md).

**Y hay un precio medido:** la llamada **no abre** el archivo del otro dibujo. La caja queda opaca —
trae el signo `+` y al usarlo sólo se selecciona. Los dibujos de agente se abren a mano.

## Cómo se comprueban

Un chequeo estructural: XML bien formado, identificadores únicos, toda referencia apuntando a algo
que existe —incluidas las que cruzan de un archivo a otro—, cada `incoming`/`outgoing` casado con su
flujo, toda caja y toda línea con figura, y cada plano en su propio `BPMNDiagram`.

**Y no basta.** Un archivo pasó ese chequeo entero y aun así el editor abría el plano equivocado. La
falla no se vio midiendo el archivo; se vio abriéndolo. El orden es ése: se comprueba, y luego se
mira.

---

> **Procedencia.** Este archivo junta lo que estaba repetido en las notas de los tres dibujos, al
> separar el método de dibujar de lo que cada dibujo decide. Las reglas de estilo y la regla de la
> actividad de llamada son de *BPMN Method and Style*, de Bruce Silver. Los planos, el marcador de
> llamada y el evento de frontera son BPMN 2.0 estándar.
>
> **Sin fuente declarada:** las dos desviaciones a sabiendas, el corte de cuánto texto lleva un
> dibujo, y que la unidad que se saca sea el agente con su carta. Salieron de este proyecto y nadie
> los ha medido.
