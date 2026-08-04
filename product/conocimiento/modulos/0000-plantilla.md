---
id: MOD-0000
modulo: Como se llama el pedazo del negocio, en la palabra que uso el experto
dominio: DOM-0000
capacidades: [CAP-0000]
firmeza: dicho
origen: propuesto
estado: completa
paso: como se llamo el tramo de sesion donde salio
alta: AAAA-MM-DDTHH:MM:SS-06:00
confirmado:
marcado:
---

<modulo>

<en-sus-palabras>
Como nombra el experto este pedazo de su negocio. Si nunca lo nombro y el agrupamiento lo propuso el
agente, se dice aqui con esas palabras y el `origen` va en `propuesto`.
</en-sus-palabras>

<que-agrupa>
Que cae dentro y que no. **La segunda mitad es la que sirve:** un modulo que solo dice lo que incluye
no se puede usar para decidir donde va una capacidad nueva.

Si dos modulos se pelean una capacidad, eso no se resuelve aqui — se anota como duda para el experto.
</que-agrupa>

<de-donde-salio>
Por que se corto asi. **Este es el campo que mas se usa de las tres plantillas**, porque un modulo
casi siempre nace `propuesto`: la gente cuenta lo que hace, no como esta dividido. Proponer el corte
no es falla; callar que se propuso, si.

Cuando el `origen` es `escuchado`, aqui va la pregunta que lo destapo o el caso donde el experto lo
nombro.
</de-donde-salio>

<que-queda-abierto>
La pregunta pendiente, cuando la firmeza es `abierto` o el estado es `con-huecos`. Si no queda nada,
se escribe «nada» — el silencio no se interpreta.
</que-queda-abierto>

</modulo>

<!--
Como se llena cada campo:

  id          MOD-NNNN, consecutivo. Vive aqui adentro, no en el nombre del archivo.
  modulo      Una linea. La palabra del negocio, no la del patron de software.
              Tope de 120 caracteres.
  dominio     El id del dominio que lo contiene. Ese dominio tiene que nombrarlo de vuelta.
              Un dominio es el area del negocio; un modulo, el pedazo dentro de esa area.
              La prueba que los separa vive en el README, junto a las de las otras piezas.
  capacidades Los ids de las capacidades que contiene. Cada una tiene que nombrarlo de vuelta
              en su campo `modulo`. Vacio, `[]`, mientras no haya ninguna — y eso es un hueco.
  firmeza     dicho | confirmado | abierto. No hay una cuarta.
  origen      escuchado | propuesto. Otro eje: no sustituye a la firmeza y no se deriva de ella.
              Un modulo `propuesto` puede acabar `confirmado` si se le devolvio y dijo que si.
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
