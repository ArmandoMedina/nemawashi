---
tipo: recursos
estado: en_revision
---
# Arquitectura de diseño — Nemawashi

> **Los patrones de interfaz que se dan por tomados, para no re-discutirlos en cada pantalla.**
> Un patrón es una solución con nombre a un problema que se repite. Se cita por su nombre en una
> revisión: *«esto no cumple “la palabra viaja con el color”»*.

> **Qué NO vive aquí — y es la mitad del contrato.**
>
> - **Los flujos no.** Qué pasa después de qué, en qué orden trabaja el experto, cuál es el primer
>   paso de cada pantalla: **no se conoce todavía y no se inventa aquí.** De las siete piezas del
>   producto sólo una está dibujada; lo demás no tiene ni boceto. Cada vez que un patrón necesita
>   saber el flujo para poder escribirse, se declara `pendiente` con su disparador.
> - **Los valores no.** Los colores, tamaños y espacios exactos viven en el sistema de diseño
>   (§4). Aquí sólo van las **reglas de uso** de esos valores.
> - **El código no.** El stack, la organización y los patrones de programación son
>   [`arquitectura-desarrollo.md`](arquitectura-desarrollo.md).

> **Estado.** `en_revision`. Los patrones nacidos de la única pantalla dibujada están medidos; los
> demás son decisión sin medición y se marcan como tal. Y §0 hereda hechos de un documento que
> todavía se declara borrador sin firmar — lo que se apoya en ellos hereda esa fragilidad.

---

## §0 · El suelo

*No son decisiones: son las condiciones en las que esta interfaz se va a mirar. Si aquí se adivina, todos los patrones heredan la adivinanza.*

### 0.1 Quién mira

Dos personas frente a la misma pantalla, y ninguna es diseñadora:

- **El experto de negocio.** Quince años de oficio, cero de software. Su atención está en la
  conversación, no en la interfaz. **No va a aprender el vocabulario de la herramienta**, y no
  tiene por qué.
- **El consultor.** Conoce la herramienta, y su trabajo es que el experto no tenga que conocerla.

Hay un tercer lector que no está presente: **el desarrollador**, que consume el resultado leyendo
markdown. La interfaz no se diseña para él.

### 0.2 En qué condiciones

Monitor de escritorio, sesiones de horas, a veces dos personas señalando la misma pantalla. Windows
hoy.

*Origen: **sin medir y sin fuente**. «Windows hoy» sí está en `arquitectura-desarrollo.md`; lo
demás —el tamaño de pantalla, la duración de una sesión, las dos personas— no lo declara ningún
documento. Es supuesto de esta arquitectura y hereda el riesgo de serlo. **Disparador para
cerrarlo: la primera sesión real con un experto.***

### 0.3 Qué exige accesibilidad, y qué no se va a hacer

- **Sí:** contraste legible en los dos temas, todo alcanzable con teclado, foco siempre visible, y
  el ajuste de «menos movimiento» del sistema operativo obedecido.
- **No:** no hay compromiso con lectores de pantalla ni auditoría formal. Declararlo evita que
  alguien lo suponga cubierto. Se reabre si un cliente lo exige.

### 0.4 El desempate

Cuando dos patrones choquen, gana el que sirva a la cualidad más alta, en este orden:

1. **Procedencia** — nada existe sin decir de dónde salió y qué tan firme está.
2. **No invadir** — el repositorio del cliente sólo recibe resultados.
3. **Que el experto nunca vea una terminal.**

Y explícitamente **no** se optimiza para: escala, velocidad de respuesta, ni belleza de la interfaz.

---

## §1 · La identidad

Es un valor de marca, no un patrón: no resuelve un problema recurrente, decide de qué está hecho
el mundo visual.

**El producto se ve como un plano de ingeniería.** Papel frío, azul de Prusia como único acento,
anotaciones técnicas en versalitas, esquinas casi rectas, marco doble en la ventana.

**Porque** el documento que gobierna este producto se llama *el plano*, y el vocabulario del método
—cajetín, revisión, medición— es el de un taller, no el de una aplicación de consumo. Lo redondeado
y lo suave dicen «consumo»; esto es un instrumento de trabajo.

**El elemento firma es el cajetín:** la franja inferior que declara qué configuración es, su
revisión, cuándo se guardó y dónde vive. Todo plano lleva uno. Aquí es la procedencia de la
herramienta aplicada a sí misma.

---

## §2 · Los patrones

*Cada uno lleva: el problema, la solución, dónde aplica y dónde no, y qué se rompe si falta. Si algo no cabe en eso, no es un patrón: es un ADR.*

### 2.A · Patrones de significado

#### «Semáforo reservado»

- **Problema:** si el color de estado se usa para decorar, deja de significar estado.
- **Solución:** **ámbar, verde y rojo son estado, nunca acento.** Ámbar avisa; verde permite o
  confirma; rojo prohíbe o contradice. Todo lo demás se pinta con el azul o con los neutros.
- **Aplica** a toda la interfaz, sin excepción. **No aplica** a nada: no hay caso donde decorar con
  ámbar esté bien.
- **Si no se usa:** cientos de elementos ámbar decorativos, y el aviso que sí muerde se pierde entre
  ellos.

#### «La palabra viaja con el color»

- **Problema:** el estado de un ítem —dicho, confirmado, contradicho— se pierde si sólo lo carga el
  color.
- **Solución:** el estado **siempre escribe su palabra**; el color acompaña. *Dicho* en neutro,
  *confirmado* en verde, *contradicho* en rojo.
- **Aplica** a todo estado en cualquier vista. **No aplica** al azul de selección, que no es un
  estado del conocimiento sino de la interfaz.
- **Si no se usa:** en una captura en blanco y negro, o para quien no distingue verde de rojo, el
  documento entero pierde su información más importante.

> **Por qué *dicho* no es ámbar:** «dicho» es el estado normal de trabajo, no una alarma. Cientos de
> ítems dichos pintados de ámbar destruirían el ámbar — es «semáforo reservado» aplicado a sí mismo.

#### «Frontera escrita»

- **Problema:** la promesa de no invadir el repositorio del cliente sólo vale si se puede verificar
  mirando la pantalla, sin saber git.
- **Solución:** **el origen se escribe, nunca se infiere por color o posición.** Lo que viene del
  repositorio del cliente muestra su ruta en mono y su origen en palabras; lo que vive en Nemawashi lo
  dice el texto junto a la acción.
- **Aplica** a todo dato y a toda acción que escriba. **No aplica** a acciones de sólo lectura —
  rotularlas todas devalúa el letrero.
- **Si no se usa:** la promesa de no invadir se vuelve un acto de fe, y un solo susto cuesta la
  confianza del cliente.

#### «Icono acompañado»

- **Problema:** un icono solo se interpreta mal, y quien lo dibujó es el único que sabe qué quiso
  decir.
- **Solución:** **ningún icono va solo**; siempre lleva su palabra al lado o debajo.
- **Aplica** a toda la interfaz. **No aplica** al icono puramente ornamental — que no debería
  existir.
- **Si no se usa:** el experto adivina, se equivoca, y culpa a la herramienta con razón.

### 2.B · Patrones de estructura

#### «Marco constante»

- **Problema:** si el armazón cambia al cambiar de pantalla, se pierde de vista dónde se está.
- **Solución:** el marco —hoja, barra de título con el repositorio, índice y cajetín— **no cambia
  nunca**. Cambia lo que va dentro.
- **Aplica** a toda pantalla del producto. **No aplica** antes de elegir repositorio: sin
  repositorio no hay hoja.
- **Si no se usa:** cada pantalla se siente una aplicación distinta.

#### «Editar en su lugar»

- **Problema:** editar una pieza en una ventana aparte hace perder el contexto de dónde se estaba.
- **Solución:** el editor de una pieza **se abre debajo del renglón que lo abrió**, en la misma
  lista, y sólo hay uno abierto a la vez. `Esc` lo cierra y devuelve el foco a ese renglón.
- **Aplica** a toda lista de piezas editables. **No aplica** a la edición de contenido largo, que
  todavía no tiene pantalla.
- **Si no se usa:** una pila de ventanas y la pregunta «¿de cuál era esto?».

#### «Todo a la vista»

- **Problema:** paginar o cargar por tramos esconde ítems.
- **Solución:** **sin paginación y sin carga progresiva.** Todos los ítems se muestran; para
  encontrar se filtra, no se navega por páginas.
- **Aplica** hasta la escala real del producto — cientos de ítems, no millones. **No aplica** si esa
  escala cambia, y entonces se reabre con ADR.
- **Si no se usa:** esconder ítems **miente sobre el estado del conocimiento**, que es justo lo que
  este producto existe para no hacer.

### 2.C · Patrones de conducta

#### «Pantalla quieta»

- **Problema:** el movimiento decorativo distrae de una conversación que ya es exigente.
- **Solución:** **nada se mueve solo.** No hay entradas deslizándose, ni pulsos, ni brillos. Se
  animan sólo los cambios de estado que alguien provocó, y brevemente.
- **Aplica** a toda la interfaz. **No aplica** al texto de la IA que llega en pedazos, que no es
  animación sino la llegada real del contenido.
- **Si no se usa:** una pantalla nerviosa en una sesión de horas cansa, y el cansancio degrada la
  entrevista.

#### «Nada gris mudo»

- **Problema:** un control apagado sin explicación es un callejón sin salida.
- **Solución:** **todo control deshabilitado escribe su motivo** junto a él.
- **Aplica** a todo control que se pueda apagar. **No aplica** a lo que nunca se apaga.
- **Si no se usa:** tres clics, nada pasa, y la conclusión es que está roto.

#### «El botón dice qué está haciendo»

- **Problema:** una espera sin explicación se lee como cuelgue.
- **Solución:** el control **escribe la acción en curso** —«Guardando…»— y conserva el mismo verbo
  de principio a fin: lo que dice «Guardar» confirma «Guardado».
- **Aplica** a toda acción que tarde. **No aplica** a lo instantáneo, donde el cambio ya es la
  respuesta.
- **Si no se usa:** clics repetidos, y con dos escritores sobre el mismo repositorio eso sí hace
  daño.

#### «El vacío enseña»

- **Problema:** una pantalla vacía se lee como error o como fin del camino.
- **Solución:** **toda pantalla tiene sus tres variantes** —vacía, con error y cargando— tratadas
  como pantallas de primera clase. La vacía invita a actuar; la de error dice qué pasó y qué hacer;
  la de carga dice qué se está leyendo.
- **Aplica** a toda pantalla. **Pendiente:** *cuál* es el primer paso que enseña cada vacío — eso
  es flujo. *Disparador: dibujar cada pantalla.*
- **Si no se usa:** la herramienta parece no funcionar la primera vez que se abre, que es el peor
  momento posible.

#### «El aviso deja pasar, el bloqueo destraba»

- **Problema:** confundir «esto te va a morder» con «esto no se puede» hace que se ignoren los dos.
- **Solución:** **un aviso nunca usa rojo y siempre deja continuar. Un bloqueo nunca se disfraza de
  aviso y siempre dice cómo destrabarse.**
- **Aplica** a toda interrupción. **Pendiente:** qué cosas avisan y qué cosas bloquean — la lista
  completa exige conocer todos los puntos donde la app interrumpe. *Disparador: cada pantalla
  declara los suyos al dibujarse.*
- **Si no se usa:** o se aprende a ignorar los avisos, o la herramienta se siente hostil.

#### «Nunca la terminal cruda»

- **Problema:** la salida técnica de la IA rompe la promesa de que el experto no vea una terminal.
- **Solución:** cuando la IA toca el disco, **se muestra como un hecho legible con su ruta** —
  «escribió `items/0042.md`» — nunca como texto crudo de herramienta.
- **Aplica** a toda actividad de la IA visible. **Pendiente:** *dónde* aparece ese hecho — en el
  hilo, al lado, o al cerrar el turno. *Disparador: dibujar la pantalla de sesión.*
- **Si no se usa:** el experto ve tripas, se asusta o se pierde, y la cualidad 3 muere.

#### «El foco sigue la lectura»

- **Problema:** un orden de tabulación ilógico interrumpe a quien no usa ratón.
- **Solución:** **el orden con teclado es el orden de lectura de la pantalla**, y el foco siempre se
  ve.
- **Aplica** a toda pantalla, que declara su propio orden al dibujarse. **No aplica** como secuencia
  única para toda la app: la de la consola no sirve para el chat, que tiene una caja de texto.
- **Si no se usa:** cada salto ilógico interrumpe la conversación, que es el trabajo real.

### 2.D · Patrones de voz

#### «Ayuda-consecuencia»

- **Problema:** una ayuda que define el campo no ayuda a decidir.
- **Solución:** **toda ayuda explica la consecuencia, no la definición.** La prueba: la ayuda debe
  poder empezar con «si lo cambias…».
- **Aplica** a todo campo con ayuda. **No aplica** al nombre del campo, que sí define.
- **Si no se usa:** se lee la ayuda, se sigue sin saber qué elegir, y se elige al azar.

#### «Sin jerga de la máquina»

- **Problema:** el vocabulario de la herramienta obliga al experto a aprender lo que no le toca.
- **Solución:** las cosas se nombran **por lo que la persona controla**, no por cómo está construido
  el sistema. «No deja cerrar si quedaron hallazgos sin registrar», no el nombre técnico del
  enganche.
- **Aplica** a todo texto visible. **No aplica** a las rutas de archivo, que son el dato real y se
  muestran tal cual.
- **Si no se usa:** el experto se siente tonto frente a la herramienta y deja de corregirla — que es
  exactamente lo que se necesita de él.

#### «El error dice qué pasó y qué hacer»

- **Problema:** un error vago o que se disculpa no resuelve nada.
- **Solución:** el error **nombra lo que pasó y el siguiente paso**. Sin disculpas y sin vaguedad.
- **Aplica** a todo error visible. **No aplica** a lo que no es error: una contradicción abierta no
  es un fallo.
- **Si no se usa:** cada error se convierte en una llamada de soporte.

### 2.E · Patrones propios de Nemawashi

*Los anteriores los traería cualquier sistema de diseño. Estos no: nacen de que aquí un experto corrige a una IA, y de que todo tiene que decir de dónde salió.*

#### «A lápiz y a tinta»

- **Problema:** lo que la IA pone en pantalla es **provisional hasta que el experto lo confirme**, y
  no puede verse ni como error del sistema ni como verdad establecida.
- **Solución:** en un plano lo provisional va a lápiz y lo aprobado se pasa a tinta. Toda propuesta
  de la IA se muestra a lápiz —tinta media, fondo de hoja secundaria, y la anotación escrita
  **«propuesto — corrígelo»**—. Al confirmarse pasa a tinta: tinta plena y etiqueta verde. **Nunca
  ámbar ni rojo:** lo propuesto no es aviso ni conflicto, es el material normal de trabajo.
- **Aplica** a todo modelo, hipótesis o resumen que la IA ponga en pantalla. **No aplica** a sus
  respuestas conversacionales ni a los ítems ya registrados, que tienen sus tres estados.
- **Si no se usa:** el experto lee la propuesta equivocada como «la computadora se equivocó» y
  pierde confianza, o la lee como verdad y la deja pasar. En los dos casos el registro queda
  envenenado sin que nadie lo note.

#### «Tachar, no redactar»

- **Problema:** corregir es la acción más frecuente y más valiosa de toda la app, y quien corrige no
  escribe rápido ni quiere escribir.
- **Solución:** las propuestas llegan partidas en **afirmaciones cortas, una por renglón**, no en
  párrafos. Cada renglón se puede confirmar de un golpe, **tachar** de un golpe —y el tachado queda
  visible, como en un plano corregido—, o tachar y dictar la corrección en un campo de una línea que
  se abre ahí mismo. **Corregir nunca exige reescribir un párrafo.**
- **Aplica** a toda propuesta a lápiz. **No aplica** al ítem ya redactado, que se edita normal.
- **Si no se usa:** si corregir cuesta más que explicar, el experto vuelve a explicar — y el
  producto se convierte en un chat cualquiera.

#### «Tres tintas»

- **Problema:** en la misma pantalla conviven lo que el experto dijo, lo que la IA infirió y lo que
  se midió en el código. Confundirlos es mentir sobre el origen.
- **Solución:** cada afirmación lleva su origen **escrito**, con tres fórmulas fijas que no cambian:
  **«lo dijiste tú»** con su fecha, **«lo propuso la IA»**, **«medido en el código»** con su ruta.
  El tratamiento visual acompaña; la palabra manda.
- **Aplica** a todo contenido de conocimiento. **No aplica** al cascarón de la app —menús,
  formularios de configuración—, que no afirma nada del negocio.
- **Si no se usa:** una inferencia de la IA se cuela como palabra del experto, un desarrollador
  construye sobre ella, y la procedencia queda rota en el único lugar donde importaba.

#### «La firma al pie»

- **Problema:** la procedencia es obligatoria en todo, y mostrarla completa en todo ahogaría la
  pantalla en metadatos.
- **Solución:** cada ítem lleva **un solo renglón de firma** —origen, fecha, estado— en fórmula
  fija, al pie, como el cajetín firma la hoja. El detalle completo —cita textual, contradicciones
  ligadas, historial— se abre desde esa firma, en el lugar. **La firma nunca se oculta; el detalle
  nunca se impone.**
- **Aplica** a todo ítem en cualquier vista. **No aplica** como sustituto del registro completo, que
  existe siempre detrás.
- **Si no se usa:** o la pantalla se ahoga en metadatos que nadie lee, o la procedencia se esconde a
  un clic y deja de ser la cualidad número uno.

#### «La contradicción con folio»

- **Problema:** dos fuentes se contradicen y hay que mostrarlo **sin exigir resolverlo ya**. Una
  contradicción abierta es conocimiento valioso, no un error.
- **Solución:** la contradicción es una pieza de primera clase **con su propio folio**, con las dos
  versiones lado a lado y su firma cada una. Etiqueta roja «contradicho» más la anotación **«sigue
  abierta — no urge»**. Nada parpadea, nada cuenta el tiempo, no aparece entre los avisos.
- **Aplica** a contradicciones entre fuentes registradas. **No aplica** a errores de la app ni a
  bloqueos, que tienen su propio patrón.
- **Si no se usa:** el experto la siente como falla que debe tapar, la resuelve al vapor o la
  esconde — y se pierde justo lo que el método considera el entregable.

#### «El letrero de frontera»

- **Problema:** el experto no sabe git y tiene que poder verificar que su repositorio no se está
  tocando.
- **Solución:** toda acción que escribe dice **en el botón mismo, antes de ejecutarse**, de qué lado
  cae: «se guarda en el repositorio del cliente» con su ruta, o «se guarda dentro de Nemawashi — tu
  repositorio no se toca».
- **Aplica** a todo botón que guarde, registre o genere. **No aplica** a lo de sólo lectura.
- **Si no se usa:** la cualidad 2 se vuelve un acto de fe.

#### «La cosecha antes de cerrar»

- **Problema:** la sesión no puede cerrarse con hallazgos sin registrar, pero un «no puedes salir»
  se siente castigo.
- **Solución:** al intentar cerrar, la pantalla muestra **la cosecha**: «hoy salieron 3 hallazgos que
  aún no quedan registrados», listados a lápiz, cada uno registrable de un clic o tachable si no
  vale. **El tono es de valor por capturar, no de requisito incumplido:** verde y neutro, jamás
  rojo. Cerrar se habilita cuando la lista queda decidida — registrada o tachada.
- **Aplica** al cierre de una sesión de trabajo. **No aplica** a salir de configuración ni del
  tablero: frenar ahí le robaría autoridad al freno que sí importa.
- **Si no se usa:** o los hallazgos se evaporan y la sesión de horas no dejó nada auditable, o el
  freno se siente un castigo y el experto aprende a odiar el final de cada sesión.

> **Estos patrones no descansan sobre una tesis firmada.** Cómo conduce la sesión el agente —si
> propone modelos para que el experto los corrija, si le refleja lo que entendió y pregunta lo que
> le falta, o si hace las dos cosas en momentos distintos— **está sin decidir**. De eso depende cuál
> de estos patrones carga el peso, y ninguno puede reclamarlo todavía. Se conservan porque cada uno
> resuelve un problema de pantalla que existe en cualquiera de esas lecturas, no porque el mecanismo
> esté cerrado.
>
> «A lápiz y a tinta» y «tachar, no redactar» son gemelos: el primero hace **seguro** corregir, el
> segundo lo hace **barato**. Se diseñan juntos — y los dos suponen que corregir ocurre **en
> pantalla**, supuesto que la modalidad de la sesión todavía puede desmentir.

---

## §3 · Lo que se verifica mirando

*Diez puntos, todos de sí o no, sin ejecutar nada y sin saber diseño. Es la lista que se aplica a cada pantalla nueva antes de aceptarla.*

1. En el cambio no aparece **ningún color escrito a mano**: todos vienen del archivo de valores.
2. En el cambio no aparece **ningún texto visible escrito dentro de un componente**: todo texto sale
   del módulo de textos.
3. **Todo verde, rojo o ámbar lleva su palabra escrita** al lado.
4. **Nada decorativo está pintado** de ámbar, verde o rojo.
5. Búsqueda en los textos de la pantalla: *subagente, enganche, habilidad, servidor, instrucción de
   sistema, token* — **cero apariciones**.
6. **Todo dato del repositorio del cliente muestra su ruta y su origen escrito**; todo lo que se
   guarda en Nemawashi lo dice en palabras.
7. **Existen las tres variantes**: vacía, con error y cargando.
8. **Ningún control apagado sin motivo escrito**, y ningún botón trabajando sin decir qué hace.
9. Puesta **lado a lado con su página del sistema de diseño**, la pantalla se ve idéntica — en tema
   claro y en oscuro. *Si hay duda con una esquina o un espacio, no se mide: se compara.*
10. **Nada se mueve solo**, y no hay ninguna ventana emergente salvo las declaradas.

> **La distinción que hace esta lista útil:** las reglas de **significado** —el color lleva palabra,
> el origen se escribe, cero jerga— se juzgan mirando. Las reglas de **medida** —cuántos píxeles,
> cuál color exacto— no: nadie distingue 11 de 13 píxeles a ojo. Por eso ninguna medida está en esta
> lista; se verifican por comparación (punto 9) o por ausencia de valores sueltos (puntos 1 y 2).

---

## §4 · Los valores

**La fuente de verdad es `design/` en este repositorio**, con seis páginas: color, tipografía,
controles, listas y editor, la hoja con su cajetín, y la consola completa. Cada valor —color,
tamaño, espacio, radio— vive ahí y **no se repite en este documento**: dos copias del mismo número
divergen en cuanto una se edita.

Lo que sí rige desde aquí:

- **Tres voces tipográficas**, todas del sistema operativo. Ninguna se descarga. La tercera —la
  **anotación técnica**: mono, versalitas, muy espaciada— es la distintiva, y **carga todas las
  etiquetas**. Con eso el cuerpo del texto no necesita crecer ni engordar para marcar jerarquía.
- **El espacio se llama por su nombre**, nunca por su número. Ningún píxel suelto en el código.
- **Un solo acento.** El azul. Todo lo demás es neutro o estado.
- **No hay cuadrícula de ocho.** El ritmo lo da el renglón de texto, como en un plano.

**Las seis páginas viven en `design/`**, en la raíz del repositorio, con su índice en
[`design/README.md`](../design/README.md). El punto 9 de la lista de comprobación se puede
aplicar abriendo un archivo del repo, sin depender de nada publicado.

**Dónde vive un valor, y por qué hay copias.** La fuente es
[`design/fundamentos/valores.css`](../design/fundamentos/valores.css). **La app lo importa tal
cual**, así que del lado del código no existe ninguna copia. Las páginas del sistema sí llevan la
suya dentro, y es a propósito: cada una tiene que abrir sola, sin depender de nada publicado.

Esas copias son el mismo acoplamiento invisible que `arquitectura-desarrollo.md` §2.4 rechaza —si
alguien cambia un número, las demás se rompen igual, sólo que nadie avisa—, y se resuelven igual que
allá: **no con disciplina, con herramienta.**
[`src/contratos/valores-de-diseno.test.ts`](../src/contratos/valores-de-diseno.test.ts) compara cada
bloque de cada página contra la fuente, uno por uno, y nombra el archivo, el bloque y los dos
valores cuando no cuadran. Bloque por bloque y no fundidos: una página declara el mismo tema dos
veces, y al fundirlos el segundo tapa al primero.

**Deuda declarada — el disparador ya se cumplió, y la divergencia crece.** El repositorio tiene
**diez** páginas y el panel publicado muestra **seis**: faltan `conocimiento`, `sesión`, `tablero` y
`elegir-repositorio`. Empezó en tres y va en cuatro, porque cada página nueva ensancha el hueco
mientras nadie publique. Manda la copia del repositorio: es la que el punto 9 abre y la que el diff
de un cambio expone. **Publicar es un acto deliberado y de una persona** —escribe en algo publicado—
así que no se automatiza sin decidirlo. *Pendiente: decidir cada cuánto se publica, y contra qué se
comprueba que las dos copias coinciden.*

---

## §5 · Gobierno

- **Ningún componente nace dentro de una pantalla.** Se agrega primero al sistema de diseño, con su
  página de muestra en los dos temas, y desde ahí se usa. Un componente nacido dentro de una
  pantalla es el mecanismo por el que un sistema de diseño muere.
- **Cuando una pantalla necesita algo que no existe**, hay tres salidas y sólo tres: se resuelve con
  lo que hay, se agrega al sistema como componente nuevo, o se declara que el sistema no alcanza y
  se abre un ADR. **Inventarlo dentro de la pantalla no es una de las tres.**
- **Este documento se revisa cada vez que se dibuja una pantalla nueva**, porque cada pantalla nueva
  convierte un `pendiente` en decisión o descubre un patrón que falta.

### De la maqueta al código

Una pantalla pasa de `design/` a `src/` cuando cumple las cuatro, y no antes:

1. **Está completa, con sus tres variantes** —vacía, con error y cargando—. Es el punto 7 de la
   lista de comprobación, y hoy no lo pasa ninguna. Implementar sin ellas no ahorra el trabajo: lo
   traslada al código, donde cada quien inventa la suya y ya nadie las compara contra un dibujo.
2. **Sus componentes ya viven en el sistema**, no dentro de ella. Si falta uno, se resuelve por las
   tres salidas de arriba **antes** de tocar `src/`.
3. **Se implementa importando los valores con nombre.** Ni un color ni una medida escritos a mano:
   un número suelto en el código es una copia nueva, y las copias divergen.
4. **Su prueba nace con ella** — el componente montado suelto, la capa 3 de
   `arquitectura-desarrollo.md`. Una pantalla implementada sin prueba obliga a abrir la app entera
   para ver cualquier error suyo.

**El hueco, declarado:** las cuatro condiciones gobiernan el traspaso, **no lo que pasa después**.
Colores y medidas no pueden divergir —los ata el contrato de valores—, pero la estructura y las
palabras sí: nada compara la maqueta con la pantalla implementada una vez que las dos existen. El
andamio de `design/_adherence.oxlintrc.json` se creó para esto y **llega sin poblar, así que no
comprueba nada**. *Disparador: la primera pantalla implementada — hasta entonces no hay dos cosas
que puedan divergir.*

---

## §6 · Glosario

*Los términos que este documento usa y que no tienen por qué saberse de antes.*

| Término | Qué es |
|---|---|
| **Valor con nombre** (token) | Un color o una medida guardada en un solo archivo; los componentes la usan por su nombre, nunca por su número |
| **Versalitas** | Mayúsculas pequeñas, del alto de una minúscula |
| **Tracking** | El espacio extra entre letras |
| **Mono** | Letra donde todos los caracteres miden lo mismo |
| **Numerales tabulares** | Cifras que ocupan lo mismo, para que alineen en columna sin bailar |
| **Hover** | Cuando el puntero pasa por encima sin hacer clic |
| **Foco** | El elemento que va a recibir lo que se teclee; aquí se marca con contorno azul |
| **Menos movimiento** | El ajuste del sistema operativo con el que alguien pide «sin animaciones». La app lo obedece |
| **Cambio** (diff) | La lista de modificaciones exactas, renglón por renglón. Es donde se revisa |
| **ADR** | El documento donde se registra una decisión grande y su porqué |
| **Texto que llega en pedazos** (streaming) | La respuesta de la IA aparece conforme se escribe, no toda de golpe |
| **Componente** | Una pieza de interfaz reutilizable — un botón, un campo, un renglón de lista |

---

## §7 · Contradicciones abiertas

*Este documento y el de desarrollo no dicen lo mismo en cuatro puntos. Se dejan visibles en vez de resolverse por decreto: una contradicción entre fuentes es el entregable, no el defecto.*

1. **¿Existe un lado «dentro de Nemawashi» donde guardar algo?** El patrón «el letrero de frontera»
   promete un botón que dice *«se guarda dentro de Nemawashi — tu repositorio no se toca»*;
   `arquitectura-desarrollo.md` dice que **la app no guarda nada propio fuera del repositorio del
   cliente**, y que borrar esa carpeta borra todo. **Un documento promete un lugar que el otro
   prohíbe.** Es la más seria de las cuatro: toca la cualidad de no invadir y la salida limpia del
   cliente.
2. **El aviso de OneDrive: ¿avisa o bloquea?** Aquí un aviso «siempre deja continuar»;
   `arquitectura-desarrollo.md` dice que la app avisa **antes de dejar empezar**. Una de las dos
   está mal.
3. **Las ventanas emergentes.** `arquitectura-desarrollo.md` exige **preguntar** cuando el archivo
   cambió mientras se editaba — y eso es una emergente. **Este documento no tiene política de
   emergentes**: el punto 10 de §3 dice «salvo las declaradas» y no hay ninguna declarada. El hueco
   es de este lado. *Disparador para cerrarlo: la primera pantalla que necesite interrumpir.*
4. **Cuándo se compromete un dato.** La consola guarda la configuración completa desde el cajetín;
   el ítem exige guardado **uno por uno con verificación**. No puede haber una sola regla para los
   dos, y ninguno de los dos documentos lo dice.

*Ninguna se resuelve aquí. La primera es decisión del dueño del producto y no se revierte; las otras tres necesitan saber su flujo, y los flujos no se conocen.*

---

## §8 · Lo que se decidió no decidir

*Cada uno con el disparador que obligará a cerrarlo. Un `pendiente` con dueño no es un hueco.*

- **Cuáles pantallas existen y cómo se cambia entre ellas.** Hoy hay una dibujada; «entre» no existe
  todavía. El techo de tres niveles de navegación y el marco constante sí rigen. *Disparador: la
  segunda pantalla maquetada.*
- **Si el método impone secuencia obligatoria.** El freno de cierre sí obliga a un orden; el resto de
  la app no debería. Dónde va la frontera exige conocer el flujo de la sesión. *Disparador: dibujar
  la sesión.*
- **La composición del chat**: si es un hilo con desplazamiento, dónde caen los hechos de disco, qué
  pasa con el desplazamiento cuando llega texto nuevo. *Disparador: dibujar la sesión.*
- **La forma del tablero**: si es lista, columnas por estado, u otra cosa. De eso depende si «filtro
  más orden visible» es la solución o ni aplica. *Disparador: dibujar el tablero.*
- **Qué interrumpe y qué sólo avisa**, como lista completa. *Disparador: cada pantalla declara los
  suyos al dibujarse.*
- **El primer paso que enseña cada pantalla vacía.** *Disparador: dibujar cada pantalla.*
- **La tipografía fuera de Windows.** Las tres voces son fuentes de Windows. *Disparador: el primer
  arranque en macOS o Linux.*
- **La biblioteca de iconos.** *Disparador: la tercera pantalla que pida un icono.*
- **Los adjuntos** —capturas y documentos que el experto quiera pegar—. *Disparador: el mismo que en
  `arquitectura-desarrollo.md`.*

---

> **Procedencia.**
>
> **Medido el 2026-07-29** contra las seis páginas de `design/`. Lo que existe
> ahí —identidad, voces tipográficas, valores, y los patrones de significado, estructura y voz que
> la consola ya encarna— está comprobado. Todo lo que describe pantallas aún no dibujadas es
> **decisión sin medición**, y los patrones propios de Nemawashi (§2.E) lo son por completo: se
> escribieron antes de que exista la pantalla que los va a probar.
>
> **§0 es la parte más débil de este documento.** De sus condiciones, sólo «Windows hoy» tiene
> fuente. El tamaño de pantalla, la duración de una sesión y las dos personas frente a ella son
> **supuestos de esta arquitectura, sin medir y sin fuente** — no vienen de ningún otro documento,
> aunque una versión anterior de este párrafo afirmaba que sí. Lo que se apoya en §0 hereda esa
> fragilidad.
>
> **Bitácora de revisión:**
>
> - **2026-07-29** — Cuatro revisiones independientes con lentes distintos: clasificación
>   patrón-contra-valor, caza de flujos supuestos, utilidad como lista de comprobación, y patrones
>   faltantes propios del producto. Resultado: los patrones ganaron nombre citable; los valores
>   salieron del cuerpo; siete secciones que describían el comportamiento de pantallas no dibujadas
>   bajaron a `pendiente` con disparador; se agregaron los siete patrones de §2.E, la lista de
>   comprobación de §3, el glosario de §6 y las contradicciones de §7.
> - **2026-07-29 (tercera revisión)** — Las seis páginas bajaron a `design/` en el repositorio, con
>   lo que §4 deja de deber su casa y el punto 9 de §3 pasa a ser aplicable. La consola se rehízo:
>   el índice pasó de cinco preguntas en segunda persona a cinco sustantivos —Criterio,
>   Capacidades, Reglas permanentes, Límites, Conexiones—, porque una pregunta en el índice
>   contradice la identidad de plano de §1. El punto 5 de §3 obligó a renombrar dos piezas del
>   vocabulario visible: lo que la herramienta llama *skills* se nombra **instructivos** y sus
>   *hooks* se nombran **frenos**. Entraron al sistema cuatro componentes que la consola necesitaba
>   —matriz de permisos, campo con unidad, aviso de campo y control no disponible con motivo—, por
>   §5 y antes de usarse. Los tres parámetros que Claude Code no expone se dibujan como no
>   disponibles con su motivo escrito, aplicando «nada gris mudo» a una limitación de la herramienta
>   en vez de fingir un control.
> - **2026-07-29 (segunda revisión)** — Una revisión de coherencia contra
>   `arquitectura-desarrollo.md` confirmó las tres contradicciones declaradas y encontró tres
>   defectos propios de este documento, ya corregidos: una **cita falsa** —§0.2 atribuía a
>   `arquitectura-desarrollo.md` hechos que ese documento no contiene—, una **autocita vacía** —§7
>   citaba una política de ventanas emergentes que este documento nunca escribió— y un **término con
>   dos significados**: «semáforo» nombraba a la vez la regla de colores de aquí y el candado de
>   sólo lectura de allá. El candado se renombró en el documento de desarrollo. Se agregó la
>   contradicción sobre si existe un lado «dentro de Nemawashi», que nadie había declarado.
