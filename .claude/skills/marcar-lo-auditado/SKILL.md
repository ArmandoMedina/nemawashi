---
name: marcar-lo-auditado
description: Carta del escribano para después de la auditoría — llevar el dictamen a los archivos que ya están escritos, marcando su estado y agregando lo que el auditor encontró, sin borrar ni reescribir nada. Úsala sólo con un dictamen en la mano.
---

<carta nombre="marcar-lo-auditado" agente="escribano" momento="despues de auditar">

<objetivo>
Recibes **el dictamen del auditor** y los archivos que ya están escritos en disco. Llevas lo que el
dictamen dice a esos archivos.

**Ésta es la única carta de este repositorio que toca un archivo que ya existía.** Todas las demás
crean archivos nuevos; ésta los abre y los cambia. Por eso su disciplina es más estrecha que la de
cualquier otra: casi todo lo que puedes hacer está prohibido, y lo poco que queda es lo que haces.
</objetivo>

<por-que-existe>
Sin esta carta el dictamen se imprime y se pierde. El archivo se queda diciendo `estado: completa`
aunque el auditor haya probado que lo que dice nadie lo dijo, y quien lo abra dentro de seis meses
se lo cree.

Medido el 2026-07-31 y **vuelto a medir el 2026-08-04**: la primera vez, un dictamen «no sirve»
salió impreso como «sin fallas» y diecisiete de cincuenta y nueve ítems quedaron mal sin que nadie
se enterara. La segunda, el molino ya contaba el dictamen para su estado de salida —y aun así
ningún archivo cambió, porque nadie tenía permiso de tocarlos.

**Una medición que no cuenta es una medición que no se hizo.** Que cuente quiere decir que llegue
al archivo, no al reporte.
</por-que-existe>

<lo-que-te-llega>
<dato nombre="el dictamen">
Las cuatro fallas del auditor —inventado, perdido, mal marcado, y si le alcanza a quien no estuvo—
cada una con **el archivo que nombra** y la prueba contra el crudo.
</dato>

<dato nombre="la hora" va-al-campo="marcado" si-no-llega="No marcas y lo reportas">
ISO 8601 con huso. La misma disciplina de siempre: te llega, no la deduces.
</dato>

<advertencia>
**Si el dictamen no nombra archivos, no marcas nada.** Un «no sirve» sin renglones señalados no se
puede aplicar, y aplicarlo a ojo sería marcar por tu cuenta. Se reporta y se para.
</advertencia>
</lo-que-te-llega>

<metodo>

<que-cambias>
En cada archivo que el dictamen nombre, y sólo en ésos:

<cambio campo="estado">
Pasa a **`con-huecos`**. Nunca al revés: **una marca no se quita desde aquí.** Si ya estaba
`con-huecos`, se queda igual y lo de abajo se agrega de todos modos.
</cambio>

<cambio campo="que-queda-abierto">
**Se agrega al final, nunca se reemplaza.** Lo que ya estuviera escrito ahí se queda tal cual, y
debajo va lo del auditor. Si decía «nada», esa palabra se borra —ya no es cierto— y en su lugar va
lo nuevo.

El renglón que agregas dice **qué falla es y qué probó el auditor**, copiado de su dictamen:

> Auditoría del 2026-08-04: inventado. En el crudo no está dicho que la lectura en frío la haga el
> mismo programa; el crudo lo lista como abierto.

**No lo redactas con tus palabras.** Copias las suyas.
</cambio>

<cambio campo="marcado">
La hora en que se marcó. Es el campo que permite saber después si una marca es de esta auditoría o
de otra anterior.
</cambio>
</que-cambias>

<el-caso-de-la-firmeza-y-el-origen>
**Por regla, no los tocas.** Llegaron marcados por quien construyó el registro y no es tu lectura la
que los cambia.

**La única excepción**, y sólo si el dictamen la prueba con la cita del crudo: cuando el auditor
demuestra que una pieza dice `origen: escuchado` y no está dicha en ningún lado. Entonces:

- El campo `origen` **no se cambia** — cambiarlo a `propuesto` sería decidir que el agente la
  propuso, y eso no lo sabes.
- Lo que haces es **decirlo en `<que-queda-abierto>`**, con la cita: *«el auditor probó que esto no
  está en el crudo y está marcado como escuchado; hay que preguntarle al experto si lo dijo».*

Así la contradicción queda a la vista sin que nadie decida por el experto.
</el-caso-de-la-firmeza-y-el-origen>

<el-caso-de-lo-perdido>
Lo **perdido** es lo que se dijo y no quedó escrito. **No tiene archivo donde marcarse** — ése es el
punto: no existe.

No lo inventes como pieza nueva. Va entero en tu reporte, con las palabras del auditor, y lo recoge
quien arma lo que falta preguntar.
</el-caso-de-lo-perdido>

<el-caso-de-las-reglas-que-se-sustituyen>
A veces una pieza dice de sí misma que sustituye a otra, y la otra sigue en pie sin enterarse.

Cuando el dictamen lo nombre, se marcan **las dos**:

- En la vieja: `estado: con-huecos`, y en `<que-queda-abierto>` que hay otra que dice sustituirla,
  con su id.
- En la nueva: lo mismo al revés.

**No borras ninguna y no decides cuál gana.** Ésa es una pregunta para el experto, y las dos tienen
que estar marcadas para que llegue a hacerse.
</el-caso-de-las-reglas-que-se-sustituyen>

</metodo>

<reglas-duras>
<regla>**No borras un archivo.** Ninguno, por ninguna razón.</regla>
<regla>**No reescribes el cuerpo.** Ni `<en-sus-palabras>`, ni `<de-donde-salio>`, ni `<que-agrupa>`. Lo que está escrito se queda; lo tuyo se agrega.</regla>
<regla>**No quitas una marca.** El `estado` sólo va de `completa` a `con-huecos`, nunca de vuelta.</regla>
<regla>**No cambias `firmeza`, `origen`, `alta`, `paso` ni los enlaces.**</regla>
<regla>**No tocas un archivo que el dictamen no nombre.** Aunque al abrirlo veas algo que te parezca mal: eso no lo mediste tú.</regla>
<regla>**No creas piezas nuevas.** Lo perdido se reporta, no se escribe.</regla>
<regla>**No escribes fuera de `product/conocimiento/`.**</regla>
</reglas-duras>

<entregable>
<parte n="1">Los archivos que marcaste, con su ruta, su id, y qué falla del dictamen le tocó a cada uno.</parte>
<parte n="2">**Lo perdido, entero y con las palabras del auditor** — no tiene archivo y se pierde si no lo pasas.</parte>
<parte n="3">Los archivos que el dictamen nombró y **no pudiste abrir o no existen**. Un dictamen que apunta a un archivo que no está es un dato, no un descuido que se calla.</parte>
<parte n="4">Cuántos archivos nombraba el dictamen y cuántos quedaron marcados. Si los dos números no son el mismo, se dice por qué.</parte>
</entregable>

</carta>
