---
id: REG-0045
regla: El workflow de construcción verifica arquitectura, escalabilidad, buenas prácticas y pruebas antes de entregar.
capacidades: [CAP-0021, CAP-0022]
firmeza: dicho
origen: escuchado
estado: con-huecos
paso: Consultoría
alta: 2026-08-06T09:04:12-06:00
confirmado:
marcado: 2026-08-06T09:04:12-06:00
---

<regla>

<en-sus-palabras>
Después de las historias de usuario, otro flujo se encarga del diseño de lo que va por detrás y va revisando que se cumplan los criterios de arquitectura decididos, que el código sea escalable, que tenga buenas prácticas y buenos paradigmas de programación, y que se hagan todas las pruebas. Al final entra lo de operaciones —máquinas virtuales y despliegue— y un flujo de validación. El experto presentó todo este tramo como propuesta suya, dijo que todavía no está seguro del flujo y pidió ayuda para hacerlo más claro. De los criterios que ese flujo revisaría sólo nombró de pasada dos ejemplos: una arquitectura de monolito modular, que dejó ahí sin fijarla para esta línea, y un arreglo de bases de datos que él mismo descartó después por venir de otro sistema y no tener relación con lo que se construye.
</en-sus-palabras>

<de-donde-salio>
Salió en la descripción inicial del recorrido completo, cuando contó qué pasa con las historias de usuario una vez que están completas y seleccionadas.
</de-donde-salio>

<que-queda-abierto>
Contra qué criterios escritos verifica ese flujo. El único que nombró —monolito modular— lo dio de pasada como ejemplo y no lo fijó para esta línea, y el de bases de datos lo descartó por ser de otro sistema. El experto dijo que el tramo entero es propuesta suya y que todavía no está seguro del flujo.

Quedo sin cerrar al construir el registro.
El examen quedo sin-contestar en: «¿Contra qué se compara un hallazgo para saber si obliga a corregir?»

Auditoría del 2026-08-06: no le alcanza a quien no estuvo. El renglón «El examen quedo sin-contestar en: …» usa «El examen», que no está definido: la tabla «Las palabras de la casa» de product/conocimiento/README.md define paso, corrida, devolver algo, pieza y reporte, y no examen; ese README lo menciona una sola vez sin explicarlo, y el examen no se guarda en disco.
</que-queda-abierto>

</regla>
