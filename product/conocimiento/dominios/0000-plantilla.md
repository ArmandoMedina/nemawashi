---
id: DOM-0000
dominio: El area del negocio, en la palabra que usa quien trabaja en ella
modulos: [MOD-0000]
firmeza: dicho
origen: propuesto
estado: completa
paso: como se llamo el tramo de sesion donde salio
alta: AAAA-MM-DDTHH:MM:SS-06:00
confirmado:
marcado:
---

<dominio>

<en-sus-palabras>
Como nombra el experto esta area de su negocio. Si nunca la nombro y el corte lo propuso el agente,
se dice aqui con esas palabras y el `origen` va en `propuesto`.
</en-sus-palabras>

<quien-lo-sabe>
**Este es el campo que distingue un dominio de un modulo.** Que papel del negocio sabe contestar lo
de aqui adentro. No la persona -no entra ningun nombre- sino el papel: quien cobra, quien surte,
quien autoriza.

Un dominio se levanta en sesiones aparte, con quien lo sabe. Si para hablar de dos dominios hace
falta siempre la misma persona en la sala, no son dos.
</quien-lo-sabe>

<que-agrupa>
Que modulos caen dentro Y CUALES NO. La segunda mitad es la que sirve: sin ella no se puede decidir
donde va un modulo nuevo.
</que-agrupa>

<que-queda-abierto>
La pregunta pendiente, cuando la firmeza es `abierto` o el estado es `con-huecos`. Si no queda nada,
se escribe «nada» — el silencio no se interpreta.
</que-queda-abierto>

</dominio>

<!--
Como se llena cada campo:

  id          DOM-NNNN, consecutivo. Vive aqui adentro, no en el nombre del archivo.
  dominio     Una linea. El area, no el patron de software. Tope de 120 caracteres.
  modulos     Los ids de los modulos que contiene. Cada uno tiene que nombrarlo de vuelta
              en su campo `dominio`. Vacio, `[]`, mientras no haya ninguno — y eso es un hueco.
  firmeza     dicho | confirmado | abierto. No hay una cuarta.
  origen      escuchado | propuesto. Otro eje: no sustituye a la firmeza y no se deriva de ella.
              Un dominio casi siempre nace `propuesto`, mas todavia que un modulo: la gente cuenta
              lo que hace, no como esta repartido su negocio.
  estado      completa | con-huecos. Es el campo por el que abre la sesion siguiente.
              Lo decide la medicion y lo escribe el escribano traduciendo los reportes:
              `con-huecos` si algun reporte senalo esta pieza, `completa` si ninguno la senalo.
              Basta uno. Quien construye el registro no lo pone.
              OJO: `completa` NO quiere decir que no falte nada. Una pieza con firmeza `abierto`
              puede estar `completa` — se escribio bien, con su pregunta puesta, y nadie la senalo.
  paso        El mismo nombre que uso el consultor. Un paso es un tramo de conversacion que el
              consultor cerro y nombro.
  alta        ISO 8601 con hora y huso, por ejemplo un 31 de julio a las 09:20 en horario del
              centro de Mexico. La hora llega con la pieza; NO SE DEDUCE Y NO SE COPIA DE AQUI.
              Este renglon trae letras a proposito: una fecha de ejemplo verosimil se copia sola,
              y asi fue como quince items del roadmap salieron con las doce en punto el 2026-07-31.
  confirmado  ISO 8601, con la misma forma. Vacio mientras la firmeza no sea `confirmado`,
              y eso es correcto: vacio a proposito no es un campo que falte.
  marcado     ISO 8601. Cuando una auditoria posterior marco esta pieza. Vacio si nunca la marcaron.
              Lo escribe la carta `marcar-lo-auditado` y nadie mas.
-->
