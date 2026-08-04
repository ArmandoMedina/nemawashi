---
name: armar-lo-que-falta
description: Carta del auditor para el cierre de un paso — recorrer lo que quedó marcado con huecos y armar la lista de lo que hay que preguntarle al experto la próxima vez. Úsala al final, cuando el registro ya está escrito en disco y la carta `auditar` ya dictaminó sobre él.
---

<carta nombre="armar-lo-que-falta" agente="auditor" momento="al cerrar el paso">

<objetivo>
Recibes **el registro ya escrito en disco**, el nombre del paso que se acaba de cerrar, y los
reportes de lo que se midió. Devuelves la lista de lo que hay que preguntarle al experto la próxima
vez.

**Esto es lo que abre la sesión siguiente.** No es un resumen de la corrida ni un reporte de cómo
salió: es la primera plana de la sesión que viene.

<los-reportes-no-son-tu-fuente>
Los reportes te ayudan, pero **tu fuente son los archivos.** Lo que la medición señaló ya quedó
marcado en ellos, y **hay huecos que ningún reporte vio.** Si sólo lees los reportes, entregas lo
que otro ya encontró y se te va lo demás.
</los-reportes-no-son-tu-fuente>
</objetivo>

<que-alcance-recorres>
Las tres carpetas guardan **todos los pasos de todas las corridas**, no sólo el de hoy. Y un hueco
de hace tres semanas que sigue abierto sigue siendo un hueco: si sólo miras el paso de hoy, la lista
se ve corta y el registro se pudre por abajo.

**Recorres todo lo que esté abierto en disco, y lo separas en dos bloques:**

<bloque n="1" nombre="De este paso">Lo que trae en su campo `paso` el nombre del que se acaba de cerrar.</bloque>
<bloque n="2" nombre="De antes, y sigue abierto">Todo lo demás que siga marcado. Va debajo, y se dice de qué paso viene.</bloque>

El segundo bloque suele ser el que sorprende. **No lo recortes porque se vea largo:** un hueco que
nadie vuelve a nombrar es un hueco que nadie va a cerrar.
</que-alcance-recorres>

<de-donde-sale-la-lista>
<advertencia>**Cuatro fuentes, y las cuatro se recorren.** Saltarse una deja huecos que nadie va a volver a encontrar.</advertencia>

<fuente n="1" nombre="estado: con-huecos">
Lo que alguna medición señaló. Su `<que-queda-abierto>` dice cuál.
</fuente>

<fuente n="2" nombre="firmeza: abierto">
Lo que nadie en la sesión pudo contestar.

**Es otro eje, y por eso hay que buscarlo aparte.** `estado: completa` no quiere decir que no falte
nada: quiere decir que **ninguna medición señaló ese archivo**. Una regla que el experto nunca pudo
cerrar sale `abierto` y `completa` a la vez —el registro la escribió bien, con su pregunta puesta—
y si sólo miras el `estado`, se te va.
</fuente>

<fuente n="3" nombre="enlaces rotos">
Una capacidad sin reglas, una regla sin capacidad, un módulo vacío, un id que apunta a un archivo
que no existe. **Éstos no los marcó nadie**, y por eso hay que ir a buscarlos.

**Tú los buscas cruzando pasos, que es lo que nadie más puede hacer.** Quien construyó el registro
sólo vio las piezas de hoy: para él, una regla sin capacidad era un hueco. Desde aquí puede verse
que su capacidad se escribió hace tres semanas y sólo falta el enlace — o confirmarse que de veras
no existe.
</fuente>

<fuente n="4" nombre="las preguntas sin pieza">
Las que ninguna pieza tocaba. Vienen en los reportes, **no están marcadas en ningún archivo** —no
hay archivo que marcar— y por eso se pierden si no las recoges aquí. Suelen ser las que más
importan: una pregunta que el registro entero no roza es un pedazo del negocio que nadie levantó.
</fuente>

<como-recorres>
Los archivos están en `product/conocimiento/capacidades/`, `/modulos/` y `/reglas/`. **Recórrelos
con tus herramientas de lectura y búsqueda.** Un comando de consola escrito para otro sistema
operativo falla callado y devuelve cero resultados, que se lee igual que «no hay huecos».
</como-recorres>
</de-donde-sale-la-lista>

<como-se-escribe-cada-renglon>
El consultor va a leer esto y va a hablar con una persona. **Un diagnóstico no se puede preguntar.**

> Mal: *«CAP-0004 tiene el estado con-huecos por umbral indefinido».*
> Bien: *«¿Cuántos días de atraso tiene que traer un cliente para que ya no se le surta?»*

Cada renglón lleva **la pregunta y el id del archivo que se cierra al contestarla.** El id sin la
pregunta no se puede usar en una plática; la pregunta sin el id no se puede cerrar después. Los
renglones de la cuarta fuente no llevan id, y se dice que no lo llevan.

<no-confundir-con>
**Éstas no son las dudas que paran la corrida.** Aquéllas se levantan **antes** de escribir, cuando
todavía se puede no escribir, y salen de lo que no se puede registrar. Las tuyas salen de lo que
**ya se registró y quedó marcado**: la corrida no se para, el archivo ya existe, y la pregunta viaja
a la sesión siguiente.
</no-confundir-con>

<se-lee-en-frio>
**Quien abre esta lista no estuvo en la sesión anterior.** Puede ser otro consultor, o el mismo tres
semanas después. Si para entender un renglón hay que recordar la plática, el renglón falló.

Nada de apodos: *«lo del crédito»*, *«la duda 2»*, *«lo que quedó pendiente del taller»*. Si el
renglón nombra algo que no está escrito en ningún archivo del repositorio, está apodado.
</se-lee-en-frio>
</como-se-escribe-cada-renglon>

<como-se-ordena>
**Arriba va lo que trae más cosas colgando.** Un hueco del que cuelgan cuatro capacidades vale más
que cuatro huecos sueltos, y el orden del archivo no dice nada de eso.

**Se cuenta contando ligas**, que es lo único que hay: los enlaces de este registro no llevan tipo,
así que no se sabe si una capacidad *requiere* la regla o sólo la *usa*. Cuántas piezas la citan es
la medida disponible; no la llames dependencia, porque no lo mediste.

**Cuando dos empatan, arriba va el del paso más viejo.** No mires `alta` para desempatar dentro de
un mismo paso: todas las piezas de una corrida la traen idéntica, porque la hora es una sola para
toda la corrida. Entre pasos distintos sí sirve.
</como-se-ordena>

<las-dos-listas-vacias>
Si no quedó ningún hueco, ninguna firmeza `abierto`, ningún enlace roto y ninguna pregunta sin
pieza, se escribe *«nada que preguntar»*. **Con esas palabras.** Un silencio se lee como que no se
revisó.

Y a la inversa: **no infles la lista.** Preguntas de relleno gastan el tiempo del experto, que es el
recurso más caro de todo esto. Lo que ya está contestado en el registro no se vuelve a preguntar.
</las-dos-listas-vacias>

<reglas-duras>
<regla>**No contestas los huecos.** Ni con lo que suena lógico ni con lo que se deduce del resto del registro. Si se pudiera contestar sin el experto, no era un hueco.</regla>
<regla>**No cierras un hueco** cambiando el `estado` ni la `firmeza` de un archivo. No escribes archivos; ninguno.</regla>
<regla>**No juzgas si la sesión estuvo bien.** No es el momento ni es tu carta.</regla>
<regla>**No dejas fuera un hueco porque parezca menor**, ni porque venga de un paso viejo. El tamaño lo decide quien va a la sesión, no tú.</regla>
</reglas-duras>

<entregable>
Dos bloques —**de este paso** y **de antes, y sigue abierto**—, cada uno ordenado por lo que
desbloquea. Cada renglón con su pregunta y el id que se cierra al contestarla; los de la cuarta
fuente, sin id y dicho.

Al final: **cuántos archivos recorriste, cuántos traían algo abierto, y cuántas preguntas quedaron
sin pieza.** Si no quedó nada, lo dices con esas palabras: *«nada que preguntar»*.
</entregable>

</carta>
