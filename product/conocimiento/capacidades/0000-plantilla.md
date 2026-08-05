---
id: CAP-0000
capacidad: Una linea, en palabras del negocio, con lo que el sistema tiene que poder hacer
modulo: MOD-0000
reglas: [REG-0000]
firmeza: dicho
origen: escuchado
estado: completa
paso: como se llamo el tramo de sesion donde salio
alta: AAAA-MM-DDTHH:MM:SS-06:00
confirmado:
marcado:
---

<capacidad>

<en-sus-palabras>
Lo que se dijo, entero y sin recortar. Aqui no hay tope de letras: el pedazo cortado no aparece en
ningun lado, y esa es la unica falla que no tiene arreglo despues.

**Casi ninguna capacidad se dice tal cual** — la gente cuenta casos, no capacidades. Cuando el
`origen` es `propuesto`, aqui va el caso que se conto, con sus palabras, y en seguida la capacidad
que se saco de el. Que nadie la haya nombrado no es permiso para dejar el hueco en blanco.
</en-sus-palabras>

<de-donde-salio>
Que pregunta la destapo, o de que caso concreto. Se cuenta, no se apoda: si el renglon nombra algo
que no esta escrito en ningun archivo del repositorio, esta apodado y hay que contarlo.

Si el `origen` es `propuesto`, aqui se dice por que el conjunto no cerraba sin ella.
</de-donde-salio>

<que-queda-abierto>
La pregunta pendiente, cuando la firmeza es `abierto` o el estado es `con-huecos`. Si no queda nada,
se escribe «nada» — el silencio no se interpreta.
</que-queda-abierto>

</capacidad>

<!--
Como se llena cada campo:

  id          CAP-NNNN, consecutivo. Vive aqui adentro, no en el nombre del archivo:
              renombrar el archivo no convierte esto en otra capacidad.
  capacidad   Una linea, verbo primero: «Dar credito a un taller que apenas abre».
              Sin nombres de personas ni datos de nadie. Tope de 120 caracteres.
  modulo      El id del modulo que la contiene. Ese modulo tiene que nombrarla de vuelta.
  reglas      Los ids de las reglas que la sostienen. Cada una tiene que nombrarla de vuelta.
              Vacio, `[]`, mientras no haya ninguna — y eso es un hueco.
  firmeza     dicho | confirmado | abierto. No hay una cuarta.
  origen      escuchado | propuesto. Otro eje: no sustituye a la firmeza y no se deriva de ella.
              Solo lo `escuchado` se coteja contra la platica.
  estado      completa | con-huecos. Es el campo por el que abre la sesion siguiente.
              Lo decide la medicion y lo escribe el escribano traduciendo los reportes:
              `con-huecos` si algun reporte senalo esta pieza, `completa` si ninguno la senalo.
              Basta uno. Quien construye el registro no lo pone.
              OJO: `completa` NO quiere decir que no falte nada. Una pieza con firmeza `abierto`
              puede estar `completa` — se escribio bien, con su pregunta puesta, y nadie la senalo.
              `con-huecos` obliga a que `que-queda-abierto` diga cual.
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
