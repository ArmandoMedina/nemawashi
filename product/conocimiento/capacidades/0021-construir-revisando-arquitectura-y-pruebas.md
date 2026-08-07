---
id: CAP-0021
capacidad: Construir el software revisando arquitectura, escalabilidad, prácticas y pruebas antes de darlo por bueno.
modulo: MOD-0007
reglas: [REG-0045, REG-0044, REG-0029]
firmeza: abierto
origen: escuchado
estado: con-huecos
paso: Consultoría
alta: 2026-08-06T09:04:12-06:00
confirmado:
marcado: 2026-08-06T09:04:12-06:00
---

<capacidad>

<en-sus-palabras>
Después de las historias de usuario, otro flujo se encarga del diseño de lo que va por detrás y va revisando que se cumplan los criterios de arquitectura decididos, que el código sea escalable, que tenga buenas prácticas y buenos paradigmas de programación, y que se hagan todas las pruebas. El experto presentó este tramo como propuesta suya, dijo que todavía no está seguro del flujo y pidió ayuda para hacerlo más claro. Los criterios los nombró de pasada y con ejemplos: un monolito modular, y un arreglo de bases de datos con una base por cliente más una compartida para lo administrativo. Del arreglo de bases de datos dijo después que era sólo un ejemplo suyo y que no tiene nada que ver con lo que se está construyendo; del monolito modular no volvió a decir nada.
</en-sus-palabras>

<de-donde-salio>
Salió en la descripción inicial del recorrido completo, cuando contó qué pasa con las historias de usuario una vez que están completas y seleccionadas. Al devolvérsele el mapa condensado en seis pasos, éste quedó como el quinto y no lo corrigió.
</de-donde-salio>

<que-queda-abierto>
Contra qué criterios escritos verifica ese flujo. El experto dijo que el tramo entero es propuesta suya y que todavía no está seguro del flujo. El ejemplo de las bases de datos lo retiró él mismo por ser de otro sistema; el del monolito modular quedó dicho de pasada y nadie se lo devolvió, así que falta que diga si ése rige aquí o era también ejemplo ajeno.

Quedo sin cerrar al construir el registro.
El examen quedo sin-contestar en: «¿Contra qué se compara un hallazgo para saber si obliga a corregir?»

Auditoría del 2026-08-06: no le alcanza a quien no estuvo. El renglón «El examen quedo sin-contestar en: …» usa «El examen», que no está definido: la tabla «Las palabras de la casa» de product/conocimiento/README.md define paso, corrida, devolver algo, pieza y reporte, y no examen; ese README lo menciona una sola vez sin explicarlo, y el examen no se guarda en disco.
</que-queda-abierto>

</capacidad>
