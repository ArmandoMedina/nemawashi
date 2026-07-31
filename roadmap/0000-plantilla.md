---
id: RM-0000
regla: Una linea, en palabras del negocio, con la verdad que sostiene
paso: como se llamo el paso del mapa donde salio
firmeza: dicho
alta: 2026-01-01T00:00:00-06:00
confirmado:
puntero:
apetito:
---

**De dónde salió.** Qué pregunta lo destapó, o de qué caso concreto. Si corrigió un reflejo, se dice.

**Qué queda abierto.** La pregunta pendiente si la firmeza es `abierto`. Si no queda nada, se
escribe «nada» — el silencio no se interpreta.

<!--
Cómo se llena cada campo:

  id          RM-NNNN, consecutivo. Vive aqui adentro, no en el nombre del archivo:
              renombrar el archivo no convierte esto en otro item.
  regla       Una linea. Sin nombres de personas ni datos de nadie.
  paso        El mismo nombre que uso el consultor en la sesion.
  firmeza     dicho | confirmado | abierto. No hay una cuarta.
  alta        ISO 8601 con hora y huso. Sin huso no sirve para saber si sigue vigente.
  confirmado  ISO 8601. Vacio mientras la firmeza no sea `confirmado`.
  puntero     Ruta relativa a `documentos/`. Vacio mientras ese documento no exista.
  apetito     Cuanto tiempo de revision humana se le concede. Ver la nota del README:
              no aparecio en la medicion y M4 decide si se queda.
-->
