---
id: REG-0000
regla: Una linea, en palabras del negocio, con la verdad que sostiene
capacidades: [CAP-0000]
firmeza: dicho
origen: escuchado
estado: completa
paso: como se llamo el tramo de sesion donde salio
alta: AAAA-MM-DDTHH:MM:SS-06:00
confirmado:
---

<regla>

<en-sus-palabras>
La regla como se dijo, entera y sin recortar. Aqui no hay tope de letras.

**Un umbral sin numero no es una regla.** «Cuando ya se paso mucho» no se registra ni se revisa: o
lleva el numero, o la firmeza es `abierto` y la pregunta esta abajo.

Si el `origen` es `propuesto`, nadie la dijo con esas palabras: aqui va la regla redactada y, en
seguida, por que el conjunto no cerraba sin ella. Lo que no se vale es dejar el hueco en blanco
porque no hubo cita.
</en-sus-palabras>

<de-donde-salio>
Que pregunta la destapo, o de que caso concreto. Si corrigio un reflejo, se dice. Se cuenta, no se
apoda.
</de-donde-salio>

<que-queda-abierto>
La pregunta pendiente, cuando la firmeza es `abierto` o el estado es `con-huecos`. Si no queda nada,
se escribe «nada» — el silencio no se interpreta.
</que-queda-abierto>

</regla>

<!--
Como se llena cada campo:

  id          REG-NNNN, consecutivo. Vive aqui adentro, no en el nombre del archivo.
  regla       Una linea. Sin nombres de personas ni datos de nadie. Tope de 120 caracteres.
  capacidades Los ids de las capacidades que sostiene. Cada una tiene que nombrarla de vuelta
              en su campo `reglas`. Una regla puede sostener mas de una.
              Vacio, `[]`, mientras no haya ninguna — y eso es un hueco: una regla que no sostiene
              nada es una regla que nadie va a aplicar.
  firmeza     dicho | confirmado | abierto. No hay una cuarta.
  origen      escuchado | propuesto. Otro eje: no sustituye a la firmeza y NO SE DERIVA DE ELLA.
              Una regla casi siempre es `escuchado` — la gente cuenta sus reglas.
              Una regla `propuesto` puede acabar `confirmado` si se le devolvio y dijo que si:
              esa combinacion es valida y es de las mas valiosas. Lo que decide la firmeza es
              si se la devolvieron y que contesto, nunca quien la propuso.
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
-->
