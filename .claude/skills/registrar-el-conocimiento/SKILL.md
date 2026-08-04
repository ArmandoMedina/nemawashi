---
name: registrar-el-conocimiento
description: Carta del escribano del conocimiento — dónde escribe las capacidades, los módulos y las reglas, la forma que mandan las plantillas, los campos que le llegan, y cómo marca lo que quedó a medias para que la sesión siguiente lo encuentre. Úsala al escribir cualquier archivo de product/conocimiento/.
---

<carta nombre="registrar-el-conocimiento" agente="escribano" momento="al escribir">

<objetivo>
Recibes el registro ya construido y ya medido, y lo escribes a disco. **Copias, no interpretas.**

Esta carta **no es `asentar`**. Aquélla escribe en `roadmap/` y dice que no se escribe nada fuera de
ahí. Ésta escribe en `product/conocimiento/` y no toca `roadmap/`. Se carga una o la otra, nunca las
dos.
</objetivo>

<donde-escribes>
<advertencia>**El esqueleto ya existe. Tú no lo diseñas: lo rellenas.**</advertencia>

| Ruta | Qué va ahí |
|---|---|
| `product/conocimiento/dominios/NNNN-nombre.md` | El dominio. Aquí escribes tú |
| `product/conocimiento/capacidades/NNNN-nombre.md` | La capacidad. Aquí escribes tú |
| `product/conocimiento/modulos/NNNN-nombre.md` | El módulo. Aquí escribes tú |
| `product/conocimiento/reglas/NNNN-nombre.md` | La regla. Aquí escribes tú |
| `product/conocimiento/*/0000-plantilla.md` | **La forma. Léela antes de escribir el primero de cada tipo** |
| `product/conocimiento/README.md` | Qué es cada cosa, cómo se enlazan y cómo se busca un hueco |

**No creas carpetas, no inventas rutas y no propones una estructura distinta.** Si lo que tienes que
escribir no cabe en la plantilla, **no la estires: repórtalo.**
</donde-escribes>

<como-se-numera>
**Un archivo por pieza.** Número consecutivo de cuatro dígitos y nombre corto en minúsculas, sin
acentos y con guiones: `product/conocimiento/capacidades/0007-credito-a-taller-nuevo.md`.

Antes de numerar, mira qué números ya existen **en esa carpeta** y sigue desde el último. Las tres
carpetas numeran por separado. **Los huecos están permitidos**; volver a usar un número, no. La
plantilla `0000` no cuenta.

<el-cambio-de-identificador>
**Las piezas te llegan con un identificador de trabajo** —`CAP-1`, `MOD-1`, `REG-1`— que vale sólo
dentro de la corrida. Los definitivos los produces tú al numerar: `CAP-0007`, `MOD-0003`.

Esto lo haces **antes de escribir un solo archivo**, porque los enlaces se citan entre sí:

1. Numeras todas las piezas y armas la correspondencia completa, de trabajo a definitivo.
2. **Traduces también los enlaces.** Una capacidad que llegó apuntando a `REG-1` se escribe
   apuntando a `REG-0012`. Un enlace sin traducir apunta a la nada, o peor, a la pieza de otra
   sesión que casualmente tiene ese número.
3. Hasta entonces escribes.

**La correspondencia va en tu reporte.** Los reportes de las mediciones citan piezas por el
identificador de trabajo, y sin la tabla nadie puede volver a encontrar de qué archivo hablaban.
</el-cambio-de-identificador>

**El identificador va dentro del archivo, no sólo en el nombre.** Renombrar un archivo no lo
convierte en otra pieza.

<sobre-la-palabra-apodo>
**«Apodo» significa dos cosas opuestas en este repositorio, y las dos aparecen en esta carta.** En
el **nombre del archivo** es lo que se pide: un nombre corto que lo distinga de un vistazo. En el
**cuerpo** es el defecto prohibido: una etiqueta que sólo abre quien vivió el caso. Un nombre de
archivo corto está bien; un cuerpo apodado, no.
</sobre-la-palabra-apodo>
</como-se-numera>

<la-forma>
**La mandan las plantillas.** Ábrelas antes de escribir el primero de cada tipo: si esta carta y la
plantilla difieren sobre la forma, manda la plantilla.

El cuerpo va con **etiquetas XML**, no con títulos ni negritas. Las etiquetas y su orden salen de la
plantilla; no agregues unas nuevas y no dejes fuera ninguna.

<campos-que-te-llegan>
**`alta`, `paso` y `confirmado` vienen con cada pieza, ya puestos por quien construyó el registro.**
Tú los copias tal cual.

- **`alta`** lleva hora y huso. No la deduzcas, no la redondees, no pongas las doce.
- **`paso`** es como el consultor llamó al tramo de sesión. No lo apodes ni lo numeres.
- **`confirmado`** viene con hora sólo si la firmeza es `confirmado`. **No lo llenas tú ni aunque la
  firmeza diga `confirmado`**: si los dos campos se contradicen, eso es un defecto del registro y se
  reporta, no se arregla aquí.

<no-confundir>
**Un campo vacío a propósito no es un campo que falta.** `confirmado` viene vacío en toda pieza cuya
firmeza no sea `confirmado`, y eso es correcto: se escribe vacío y no se reporta nada.

Lo que para la escritura de un archivo es que **falte un campo que esa pieza sí debía traer** — una
pieza sin `alta`, una sin `paso`, una `confirmado` sin su hora. Entonces **no escribes ese archivo y
lo reportas.** Un dato inventado se ve igual de bien que uno real, y ésa es justo la razón por la
que es peor.
</no-confundir>
</campos-que-te-llegan>

<el-cuerpo-se-cuenta-entero>
**Aquí no hay tope de letras ni carpeta de documentos.** El renglón del frontmatter sí es corto —se
lee en lista—, pero lo que va entre las etiquetas se escribe completo.

Esto sale de un defecto medido: el 2026-07-31, diecisiete de cincuenta y nueve ítems del roadmap
salieron **apodados** porque el tope apretaba y el desahogo estaba prohibido.

**La prueba es de una línea:** si tu renglón nombra algo que no está escrito en ningún archivo del
repositorio, está apodado.
</el-cuerpo-se-cuenta-entero>

<los-enlaces-de-los-dos-lados>
Te llegan enlazados en los dos sentidos y así se escriben. **Escribir sólo un lado es la falla que
no se ve al revisar el archivo que sí quedó bien.**

```
dominio.modulos[]     ⇄  modulo.dominio
modulo.capacidades[]  ⇄  capacidad.modulo
capacidad.reglas[]    ⇄  regla.capacidades[]
```

Antes de terminar, recorre lo que escribiste y comprueba que **cada id que citaste existe como
archivo**. Un id que apunta a la nada es peor que un campo vacío: el campo vacío se ve.

<las-piezas-que-ya-existian>
A veces llega una pieza con **un id de carpeta** —`REG-0012`, no `REG-1`—. Ésa no es nueva: ya está
escrita, y viene porque esta plática le agregó un enlace o la completó.

**No la numeras y no la escribes.** Tú creas archivos; tocar uno que ya existe no es tuyo, y hacerlo
por tu cuenta borraría lo que otra sesión dejó ahí.

Va entera a `noEscritos`, con su id y con lo que traía de nuevo. **Hoy no hay quien lo aplique**, y
callarlo sería peor que decirlo: quedaría un enlace que alguien creyó escrito.
</las-piezas-que-ya-existian>
</los-enlaces-de-los-dos-lados>
</la-forma>

<marcar-lo-que-quedo-a-medias>
<por-que>
**Ésta es la segunda mitad de tu trabajo, y la que hace que el registro sirva mañana.**

Medido el 2026-07-31: un dictamen «no sirve» salió impreso como «sin fallas», y diecisiete de
cincuenta y nueve ítems quedaron mal sin que nadie se enterara. **Una medición que no cuenta es una
medición que no se hizo.**
</por-que>

<que-son-los-reportes>
Junto al registro te llegan **los reportes de lo que se midió**. Cada uno señala piezas por su
identificador de trabajo. **No hay un número fijo de reportes** — te dicen cuáles corrieron; lo que
no puede pasar es que no llegue ninguno y tú lo tomes por bueno.
</que-son-los-reportes>

<la-regla-de-traduccion>
> **Una pieza señalada por cualquier reporte se escribe `con-huecos`. Una pieza que ningún reporte
> señaló se escribe `completa`.**

**Basta uno.** No promedias, no pesas cuál medición importa más y no perdonas la señal porque las
otras hayan salido limpias. Cada medición mira algo que las otras no ven.

<que-significa-completa>
**`completa` no quiere decir que no falte nada.** Quiere decir que **ningún reporte señaló esa
pieza**. Una regla que el experto nunca pudo cerrar puede salir `firmeza: abierto` y
`estado: completa` a la vez: se registró bien, con su pregunta puesta, y nadie la señaló.
</que-significa-completa>
</la-regla-de-traduccion>

<que-va-en-que-queda-abierto>
El cuerpo te llega escrito, con `<que-queda-abierto>` ya redactado por quien construyó el registro.
Y los reportes traen sus propias razones. **La precedencia, para que no haya dos autores:**

1. **Lo que llegó escrito se copia tal cual, primero.** No lo reescribes, no lo resumes, no lo
   mejoras.
2. **Debajo, y sólo si un reporte señaló esta pieza, agregas lo que el reporte dice** — copiado, no
   redactado. Vas a componer un renglón nuevo sólo si el reporte no traía ninguno, y entonces se
   copia su texto entero.

Un `con-huecos` con `<que-queda-abierto>` vacío no sirve de nada: la sesión siguiente lo encuentra
y no sabe qué cerrar.
</que-va-en-que-queda-abierto>

<no-confundir nombre="medicion que fallo contra medicion que no corrio">
Son dos cosas distintas y sólo una para la escritura:

- **La medición corrió y señaló piezas** — eso no para nada. **Se escribe igual**, con la marca
  puesta. Una corrida larga que se traba nunca cierra, y llamar la atención sobre el defecto es una
  salida tan válida como corregirlo. **Escribir sin marca es lo único prohibido.**
- **No llegó ningún reporte** — entonces no hubo medición, y escribir `completa` sería declarar
  medido lo que nadie midió. **Eso sí para: se reporta y no se escribe.**
</no-confundir>

<lo-que-no-es-tuyo>
Un reporte puede señalar **algo que hizo falta y no existe como pieza** — una pregunta que ninguna
capacidad contestaba. Eso **no tiene archivo donde marcarse** y no es tuyo: pásalo entero en tu
reporte, sin traducirlo a nada. Lo recoge quien arma lo que falta preguntar.
</lo-que-no-es-tuyo>
</marcar-lo-que-quedo-a-medias>

<reglas-duras>
<regla>**No cambias la firmeza ni el origen.** Llegan marcados. No los subes porque la pieza te parezca sólida.</regla>
<regla>**No decides el `estado` por tu lectura.** Sale de la regla de traducción y de nada más.</regla>
<regla>**No escribes nada fuera de `product/conocimiento/`.** En particular, no tocas `roadmap/`, `backlog/`, `docs/` ni el resto de `product/`.</regla>
<regla>**No escribes un archivo al que le falte un campo que sí debía traer.** Lo reportas.</regla>
<regla>**No escribes si no llegó ningún reporte de medición.**</regla>
<regla>**No inventas piezas** para las señales que no corresponden a ninguna.</regla>
</reglas-duras>

<entregable>
<parte n="1">La lista de archivos escritos, cada uno con su ruta y su id definitivo.</parte>
<parte n="2">**La correspondencia** de identificador de trabajo a definitivo, completa. Sin ella los reportes de las mediciones quedan huérfanos.</parte>
<parte n="3">**Cuántos quedaron `con-huecos`**, y cuáles.</parte>
<parte n="4">**Lo que no pudiste escribir y por qué.**</parte>
<parte n="5">**Las señales que no correspondían a ninguna pieza**, pasadas tal cual.</parte>

Si no escribiste ninguno, lo dices con esas palabras.
</entregable>

</carta>
