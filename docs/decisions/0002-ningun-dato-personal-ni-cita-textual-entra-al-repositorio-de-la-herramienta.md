# ADR 0002 — Ningún dato personal, cita textual ni identificador de cliente entra al repositorio de la herramienta

- **Estado:** aceptado
- **Fecha:** 2026-07-30

## Contexto

El material que alimenta este repositorio nace de conversaciones con personas y de proyectos de
clientes. Ese material llega cargado de nombres propios, transcripciones literales y datos que
identifican a una organización o a un individuo — y llega **por diseño**, porque la cita y el nombre
son lo que permite verificar que un hallazgo se sostiene en algo que alguien dijo y no en algo que
un agente infirió.

El ADR 0001 obliga a la voz del método y manda la anécdota a campos designados, pero no dice nada
sobre nombres, citas ni datos de cliente: un documento puede cumplir 0001 al pie de la letra y aun
así nombrar a una persona, reproducir su frase textual y filtrar el detalle de su negocio.

La fuerza que obliga es doble. El producto vende que el conocimiento del cliente vive en el repo del
cliente y no sale de ahí; un repositorio de la herramienta salpicado de fragmentos de cliente
desmiente eso con evidencia. Y este repositorio es público hacia dentro del equipo, se comparte con
quien evalúe la herramienta, y su historial es permanente.

## Decisión

**El texto que entra a este repositorio va despersonalizado.** Tres reglas y una frontera.

1. **Sin nombres propios de personas.** Se nombra el papel: *el experto*, *el dueño del producto*,
   *quien revisa*, *quien implementa*. Un papel describe la fuerza que obliga; un nombre no agrega
   nada a la decisión y sí identifica a alguien.
2. **Sin cita textual de conversación.** Lo que se registra es la afirmación destilada en voz del
   método. Una cita entre comillas invita al lector a reconstruir la conversación, que es
   exactamente la dependencia que el ADR 0001 elimina.
3. **Sin dato que identifique a un cliente** — razón social, sector cuando lo singulariza, cifras de
   su operación, estructura de sus sistemas. **Un hecho entra sólo si sobrevive a quitarle la
   identidad y sigue justificando la decisión.** Si al despersonalizarlo deja de sostener nada, no
   era el hecho que mandaba: era la anécdota.

**La frontera es el acto de escribir al repositorio, no el de investigar.** El material de
trabajo —transcripciones, salida de subagentes, notas de sesión— conserva nombres y citas y vive
fuera del repositorio, porque sin ellos no se puede verificar nada. El filtro se aplica al pasar de
ese material al archivo versionado.

**Lo que pertenece al dominio del cliente no se despersonaliza: no entra.** Una regla de negocio
suya, su marco normativo, la forma de sus módulos — eso va a su propio repositorio. La
despersonalización es para lo que **sí** es del método y llegó envuelto en un caso concreto.

**Alcance: todo archivo versionado**, incluidos los mensajes de commit y los informes fechados. Esta
regla es más ancha que la del ADR 0001: aquel exceptúa al informe de medición porque su género *es*
el proceso; aquí no hay excepción, porque un informe tampoco necesita nombres para ser evidencia.

## Por qué

- **Lo que se compromete no se puede descomprometer.** El historial de git es permanente: un dato
  personal publicado y borrado en un commit posterior sigue ahí. Es la única regla del repositorio
  cuyo incumplimiento no se arregla corrigiendo el archivo, y por eso se decide antes y no después.
- **El repositorio contradice al producto si guarda cliente.** La promesa es que el conocimiento del
  cliente vive en su propio repositorio; un fragmento suyo aquí es la refutación más barata de esa
  promesa, y la va a encontrar quien evalúe la herramienta.
- **Un papel envejece mejor que un nombre.** Las personas cambian de proyecto; el papel que ocupaban
  sigue explicando por qué la decisión es la que es. Un documento poblado de nombres deja de
  entenderse en cuanto cambia el equipo.
- **La despersonalización obliga a destilar de verdad.** Un hecho que sólo se sostiene con nombre y
  cifra exacta casi siempre es un caso disfrazado de regla. Quitarle la identidad es la prueba
  barata que separa a los dos.

## El camino que NO se toma (y por qué tienta)

- **Un freno que busque una lista de nombres prohibidos.** Tienta porque, a diferencia de la voz que
  el ADR 0001 renunció a vigilar, un nombre **sí** es una cadena literal y se busca sin ambigüedad.
  Se rechaza por una razón que cierra la discusión: **la lista sería un registro de datos personales
  guardado dentro del repositorio**, es decir, el daño que la regla quiere evitar, versionado y con
  el nombre puesto. Y aun así no serviría: no atrapa un nombre que nunca vio, ni un identificador
  que no es un nombre —el papel más una cifra distintiva señala a una persona igual de bien.
- **Sustituir nombre por papel al momento de escribir, y nada más.** Tienta porque es mecánico y
  parece suficiente. Se rechaza porque deja la frase con la forma de la anécdota y sólo le cambia el
  sujeto: *«el experto dijo que…»* sigue narrando la conversación, que es lo que el ADR 0001 ya
  prohíbe. Despersonalizar no es reemplazar palabras, es reescribir la afirmación en voz del método.
- **Excluir la anécdota por completo, ni siquiera despersonalizada.** Tienta como lectura simple de
  la regla. Se rechaza porque muchas decisiones descansan en un hecho del mundo real —cuánto tiempo
  concede quien sabe, qué tan experimentado es quien revisa— y sin ese hecho quedan sin fundamento.
  Lo que se prohíbe es la identidad, no el hecho.

## Consecuencias

- **El material de trabajo y el texto del repositorio divergen a propósito.** La verificación ocurre
  antes de escribir, contra material que no se versiona. Quien revise un documento del repositorio
  no va a poder rastrear una afirmación hasta su cita: va a tener que confiar en el campo de
  procedencia, que a partir de aquí carga más peso.
- **La frontera entre este repositorio y el del cliente deja de ser una promesa y se vuelve un
  criterio de admisión** — se aplica archivo por archivo, en cada escritura.
- **Se pierde precisión y se gana vigencia.** Un hecho despersonalizado dice menos que el dato crudo;
  a cambio, no caduca cuando cambian las personas.
- **No enciende ningún freno.** Como el ADR 0001, el cumplimiento vive en la revisión antes de
  aceptar cualquier escritura.
- **Queda deuda: el material de trabajo necesita un lugar declarado.** Hoy vive donde caiga. Mientras
  no tenga sitio fijo y fuera del árbol versionado, la regla depende de que nadie lo copie por
  descuido.

## Qué NO resuelve

- **No define qué cuenta como identificable, y la frontera es real.** Un papel con un rasgo
  distintivo señala a una persona tan bien como su nombre. Quien revisa arbitra, sin criterio
  mecánico que lo respalde.
- **No audita lo ya escrito.** Rige hacia adelante. Si el corpus existente ya carga nombres o citas,
  limpiarlo es trabajo aparte — y por el historial permanente, limpieza incompleta por definición.
- **No gobierna el repositorio del cliente.** Ahí el dato del cliente es precisamente lo que
  pertenece. Esta regla rige el repositorio de la herramienta y nada más.
- **No alcanza a lo que la herramienta escribe en ejecución.** Este ADR gobierna lo que las personas
  y los agentes escriben *en este repositorio*, no lo que la app siembre en el repositorio del
  cliente cuando exista.

---

> Reglas del registro: una decisión = un archivo · al agregarlo, **lístalo en el [índice](README.md) en el mismo commit** · nunca borres una decisión: márcala *reemplazada* y enlaza la nueva.
