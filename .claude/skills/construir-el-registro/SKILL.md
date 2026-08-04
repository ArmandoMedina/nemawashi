---
name: construir-el-registro
description: Carta del auditor para armar el registro enlazado de un paso — sacar las reglas dichas, proponer las capacidades y los módulos, enlazarlos en los dos sentidos, marcar firmeza y origen, y anotar las dudas que hay que devolverle al experto. Úsala después de levantar el examen y antes de escribir nada a disco.
---

<carta nombre="construir-el-registro" agente="auditor" momento="antes de escribir">

<objetivo>
Devuelves un registro enlazado —reglas, capacidades y módulos, ligados entre sí— más la lista de
dudas para el experto.

**No escribes archivos.** Eso es del escribano. Tú entregas el material con la forma que él va a
rellenar, y él no interpreta nada.
</objetivo>

<lo-que-te-llega>
<advertencia>
Cinco cosas, y **ninguna la deduces tú**. Si falta una, no la inventes: dilo, y no entregues las
piezas que dependían de ella.
</advertencia>

<dato nombre="la platica" si-no-llega="No hay nada que construir. Se reporta y se para">
Los turnos del experto y del consultor, ya sin lo que metió la máquina: llamadas a herramientas,
razonamiento del agente, avisos del sistema. **Nadie dijo eso.**
</dato>

<dato nombre="el examen" si-no-llega="Se construye igual, y se declara que se construyó a ciegas">
Las preguntas que se levantaron **antes** de que existiera una sola pieza.
</dato>

<dato nombre="el paso" va-al-campo="paso" si-no-llega="Se reporta. No se apoda ni se numera">
Un paso es **un tramo de conversación que el consultor cerró y nombró** — el pedazo de sesión sobre
el que corre todo esto. Te llega su nombre, tal como él lo puso.
</dato>

<dato nombre="la hora" va-al-campo="alta" si-no-llega="Se reporta. Una hora inventada se ve igual de bien que una real">
ISO 8601 con huso. Es una sola para toda la corrida: todas las piezas de este paso la comparten.
</dato>

<dato nombre="que corrida es" si-no-llega="Se asume la primera, y se dice que se asumió">
Primera o segunda. Cambia si devuelves dudas o no.
</dato>

<campo-que-no-llega nombre="confirmado">
Lo llenas **sólo si la firmeza es `confirmado`**, y lleva la hora en que el experto dijo que sí:

- **Si dijo que sí en esta sesión** — lleva la misma hora que `alta`. Es la que tienes y es la
  correcta: la confirmación pasó dentro de esta corrida.
- **Si dijo que sí antes** y esa hora te llegó con la pieza, va ésa.
- **Si la firmeza no es `confirmado`** — va vacío. Vacío a propósito no es un campo que falta.
</campo-que-no-llega>

<campo-que-no-produces nombre="estado">
**Tú no lo produces, ni en la primera corrida ni en la segunda.** Lo pone el escribano al escribir,
traduciendo lo que señalaron las mediciones — y las mediciones corren después de ti.

Lo tuyo es señalar. Ver `<entregable>`: entregas aparte la lista de piezas que quedaron sin cerrar,
y esa lista cuenta como un reporte más. Poner el campo tú sería producir dos veces el mismo dato
desde dos lados, y un día dirían cosas distintas.
</campo-que-no-produces>

<sobre-el-examen>
**No vive en ningún archivo.** Viaja de una carta a otra dentro de la corrida y se pierde al
terminar. Por eso importa el orden y por eso no hay dónde ir a verlo después.

**Ya está levantado y no lo puedes tocar.** Si mientras construyes ves una pregunta que falta, la
reportas; agregarla ahora sería escribir el examen después de ver el resultado.
</sobre-el-examen>
</lo-que-te-llega>

<las-tres-piezas>
<pieza nombre="Regla" prueba="Se puede violar. Si nada la puede incumplir, no es regla">
La verdad que sostiene algo: qué se vale, qué no, con qué número.
</pieza>

<pieza nombre="Capacidad" prueba="Empieza con un verbo y alguien la pide">
Lo que el sistema tiene que **poder hacer**.
</pieza>

<pieza nombre="Modulo" prueba="Sirve para decidir dónde va una capacidad nueva">
El pedazo del negocio donde caen unas capacidades y no otras.
</pieza>

<sobre-la-forma>
La forma exacta de cada archivo la manda su plantilla en
`product/conocimiento/*/0000-plantilla.md`. **Si esta carta y la plantilla difieren sobre la forma
—qué campos hay, qué etiquetas lleva el cuerpo—, manda la plantilla.** Sobre **quién produce qué**
manda esta carta: la plantilla describe el archivo terminado, no el reparto del trabajo.
</sobre-la-forma>

<sobre-los-identificadores>
**Los `id` definitivos no existen todavía.** El `CAP-0007` sale de numerar la carpeta, y eso pasa
al escribir — después de ti y después de las mediciones.

Numera tus piezas con **un identificador de trabajo**, que vale sólo dentro de esta corrida:
`CAP-1`, `CAP-2`, `MOD-1`, `REG-1`… Con ésos enlazas, con ésos te citan las mediciones, y el
escribano los cambia por los definitivos al escribir.

**No inventes un número de carpeta.** Si adivinas `CAP-0008` y ese archivo ya existe, el registro
apunta a la pieza de otra sesión.
</sobre-los-identificadores>
</las-tres-piezas>

<metodo>

<paso n="1" nombre="Sacar las reglas dichas">
Van primero porque son lo único que se puede cotejar palabra por palabra contra la plática. Todo lo
demás se construye encima.

**Una línea, en palabras del negocio, con la verdad que sostiene.** No con el patrón que usa ni con
el nombre de la función que la implementaría.

<trampa nombre="umbral sin numero">
**Un umbral sin número no es una regla.** *«Cuando ya se pasó mucho»* no se registra ni se revisa:
o lleva el número, o su firmeza es `abierto` y la pregunta va en las dudas.
</trampa>

<trampa nombre="lista picada">
Uno por problema, no uno por frase. **La prueba:** *«¿alguien podría atender esto sin atender
aquello?»* Si la respuesta es no, es un solo hallazgo y lo demás es su detalle.

La gente cuenta el mismo problema tres veces desde ángulos distintos; quien transcribe frase por
frase termina con una lista que parece rica y sólo está picada.
</trampa>
</paso>

<paso n="2" nombre="Proponer las capacidades">
Aquí **sí propones**, y por eso el campo `origen` existe.

Una capacidad se nombra **verbo primero**, por lo que alguien tiene que poder hacer: *«Dar crédito a
un taller que apenas abre»*, no *«Gestión de crédito»* ni *«Módulo de crédito»*. Un sustantivo
suelto no dice quién lo pide ni cuándo falla.

**Casi ninguna capacidad se dice tal cual.** El experto cuenta casos, no capacidades. Sacarla del
caso es el trabajo; lo que no se vale es callar que la sacaste tú.
</paso>

<paso n="3" nombre="Proponer los modulos">
Un módulo **casi siempre nace `propuesto`**: la gente cuenta lo que hace, no cómo está dividido.
Proponer el corte no es falla; callar que se propuso, sí — y por eso su plantilla tiene un
`<de-donde-salio>` donde se dice por qué se cortó así.

**La mitad que sirve es la de afuera.** Un módulo que sólo dice qué incluye no se puede usar para
decidir dónde va una capacidad nueva, y para eso existe. Di también qué **no** cae dentro.

Si dos módulos se pelean una capacidad, **eso no lo resuelves**: va a las dudas.
</paso>

<paso n="4" nombre="Enlazar">
**El enlace va en los dos sentidos, y los dos lados se escriben.** Un enlace de un solo lado se
recorre en una dirección y se pierde en la otra: la capacidad listaría sus reglas, pero abrir la
regla no diría a quién sirve.

```
modulo.capacidades[]  ⇄  capacidad.modulo
capacidad.reglas[]    ⇄  regla.capacidades[]
```

Los enlaces **no llevan tipo todavía**. Sólo dicen que hay liga. No inventes un tipo.

<hueco nombre="capacidad sin reglas">No se sabe cuándo está bien hecha.</hueco>
<hueco nombre="regla sin capacidad">Nadie la va a aplicar; o falta la capacidad, o la regla es de otro paso.</hueco>

Ninguno de los dos se tapa inventando la pieza que falta. **Se marcan y se preguntan.**

<alcance>
Tú cazas los huecos **dentro del registro que estás armando**, que es lo único que ves. Los huecos
que cruzan pasos —una regla de hoy que le sirve a una capacidad de hace tres semanas— no son tuyos:
ésos se buscan en disco al cerrar, y hay otra carta para eso.
</alcance>
</paso>

<paso n="5" nombre="Marcar firmeza y origen">
<advertencia>
**Dos marcas, no una.** Es donde más se falla, porque parecen el mismo eje y no lo son. **Ninguno
se deriva del otro.**
</advertencia>

<eje nombre="firmeza" mide="que tan cerrado esta">
- `dicho` — lo dijo y **nadie lo devolvió para revisarlo**.
- `confirmado` — **se le devolvió y dijo que sí.** Exige las dos cosas. Que suene sólida no basta.
- `abierto` — nadie en la sesión lo pudo contestar.
</eje>

<eje nombre="origen" mide="quien lo puso ahi">
- `escuchado` — salió de la boca del experto. **Esto y sólo esto se coteja contra la plática.**
- `propuesto` — lo armaste tú para que el conjunto cerrara. Buscar la frase daría siempre que no;
  se mide contestando el examen.
</eje>

<trampa nombre="el asentimiento">
Vigila **quién dijo cada pieza**: si la propuso el consultor y el experto sólo asintió, no es
`escuchado` de él. Un asentimiento no es una respuesta.
</trampa>

<combinacion-valida>
Una capacidad puede ser `propuesto` y `confirmado` a la vez —tú la propusiste y el experto dijo que
sí—, y ésa es la combinación más valiosa que produce una sesión.
</combinacion-valida>
</paso>

<paso n="6" nombre="Cazar contradicciones y ambiguedades">
Las cinco fallas que obligan a preguntarle al experto en vez de resolverlo solo. **Van escritas
aquí completas** porque una carta que manda cazar algo tiene que decir qué es; la carta `afinar`
las trata a fondo, y quien quiera el fondo va allá.

<falla nombre="ambiguedad">Admite dos lecturas y las dos son razonables.</falla>
<falla nombre="contradiccion">Dos cosas dichas que no pueden ser ciertas al mismo tiempo.</falla>
<falla nombre="frase-a-medias">Empezó algo y no lo cerró: *«y hay otros casos, pero bueno»*.</falla>
<falla nombre="referencia-sin-cerrar">*«Los talleres grandes»*, *«los de siempre»*. ¿Cuáles, cuántos, desde cuándo?</falla>
<falla nombre="umbral-sin-numero">*«Cuando ya se pasó mucho»*, *«si tarda demasiado»*. Eso no se registra ni se revisa.</falla>

Sobre el registro enlazado se agregan dos que sólo se ven con el grafo armado:

<falla nombre="reglas-que-chocan">Dos reglas que no pueden ser ciertas al mismo tiempo y cuelgan de la misma capacidad.</falla>
<falla nombre="capacidad-sin-casa">Una capacidad que dos módulos reclaman, o que ninguno reclama.</falla>
</paso>

<paso n="7" nombre="Anotar las dudas para el experto">
**De aquí sale lo único que puede detener la corrida antes de que se escriba nada.** Si esta lista
trae algo, la corrida se para y las preguntas se le llevan al experto; si viene vacía, todo sigue
de largo. Una lista vacía tiene que ser vacía de verdad, no una que no se llenó.

Cada falla se entrega **ya convertida en la pregunta** que el consultor le va a hacer, no como
diagnóstico. Corta, una sola pregunta, en lenguaje del negocio.

> Mal: *«la capacidad 3 tiene un umbral indefinido».*
> Bien: *«¿Cuántos días de atraso tiene que traer un cliente para que ya no se le surta?»*

<no-confundir-con>
**Éstas no son las preguntas que abren la sesión siguiente.** Aquéllas las arma otra carta al
cerrar el paso, cuando el registro ya está en disco, y salen de lo que quedó marcado. Las tuyas
salen de lo que **todavía no se puede escribir**, y por eso paran la corrida.
</no-confundir-con>

<el-tope>
**El experto contesta una sola vuelta**, y por eso te llega qué corrida es.

- **Primera corrida** — devuelves las dudas y la corrida se para.
- **Segunda corrida** — **no devuelves dudas, ninguna.** Lo que siga sin cerrar se entrega con
  `firmeza: abierto`, la pregunta puesta en `<que-queda-abierto>`, y **el identificador de esa
  pieza en tu lista de señaladas**.

Un freno que no se levanta no es freno, es candado: sin este tope, cada ronda de respuestas destapa
preguntas nuevas y no se escribe nunca.
</el-tope>
</paso>

</metodo>

<reglas-duras>
<regla>**No resuelves la contradicción.** No es tuya. La reportas y sigues.</regla>
<regla>**No completas la frase a medias** con lo que suena lógico.</regla>
<regla>**No subes la firmeza** porque la pieza te parezca sólida.</regla>
<regla>**No marcas `escuchado` lo que propusiste.** Es la falla que vuelve inútil el cotejo: lo propuesto marcado como escuchado se busca en la plática, no aparece, y sale reportado como invento.</regla>
<regla>**No inventas la pieza que falta** para que un enlace cierre.</regla>
<regla>**No produces `estado`.** Ni `completa` ni `con-huecos`, en ninguna corrida.</regla>
<regla>**No inventas un número de carpeta** para los `id`.</regla>
<regla>**No tocas el examen.**</regla>
<regla>**No escribes archivos.** Ninguno.</regla>
</reglas-duras>

<entregable>
<parte n="1" nombre="El registro enlazado">
Reglas, capacidades y módulos, cada pieza con sus campos:

| Campo | De dónde sale |
|---|---|
| El renglón (`capacidad`, `modulo`, `regla`) | Lo redactas tú. Una línea, tope de 120 caracteres |
| El identificador de trabajo | Lo pones tú: `CAP-1`, `MOD-1`, `REG-1`… Vale sólo en esta corrida |
| Los enlaces (`modulo`, `capacidades`, `reglas`) | Los armas tú, **en los dos sentidos** |
| `firmeza`, `origen` | Los marcas tú. Dos ejes, ninguno se deriva del otro |
| `paso`, `alta` | **Te llegan.** Se copian tal cual |
| `confirmado` | La hora del sí, o vacío si la firmeza no es `confirmado` |
| `estado` | **No lo pones tú.** Lo pone el escribano |

Más el cuerpo de cada pieza, con las etiquetas que pide su plantilla.
</parte>

<parte n="2" nombre="Las dudas para el experto">
Las preguntas que paran la corrida. Si no quedó ninguna, lo dices con esas palabras: *«nada que
regresar»*.
</parte>

<parte n="3" nombre="Las piezas senaladas">
Los identificadores de trabajo de las piezas que **quedaron sin cerrar** — las de segunda corrida
con firmeza `abierto`, y las que arrastran un hueco de enlace.

**Esta lista es un reporte, y el escribano la traduce a `estado: con-huecos`.** Si va vacía, se
dice; una lista que no se llenó se lee igual que una lista vacía y no lo es.
</parte>

<parte n="4" nombre="Lo que no llego">
Si algo no te llegó y por eso dejaste un campo sin llenar, **se reporta aparte**. Un campo vacío sin
explicación se lee como que no había nada que poner.
</parte>
</entregable>

</carta>
