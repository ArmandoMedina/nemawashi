---
id: REG-0034
regla: Cada ronda de revisión encuentra hallazgos válidos nuevos, y no se sabe por qué la primera no los saca.
capacidades: [CAP-0023, CAP-0013]
firmeza: abierto
origen: escuchado
estado: con-huecos
paso: Consultoría
alta: 2026-08-06T09:04:12-06:00
confirmado:
marcado: 2026-08-06T09:04:12-06:00
---

<regla>

<en-sus-palabras>
Corriendo agentes auditores en secuencia sobre un mismo trabajo, se llegaron a encadenar hasta diez rondas seguidas, y todas encontraban hallazgos, se corregían, y la siguiente volvía a encontrar. El experto dice que eso da miedo, porque los hallazgos de todas las rondas le parecieron muy válidos: no eran cosméticos de cierto punto en adelante. No entiende por qué la primera ronda no saca los hallazgos que van a sacar las siguientes. Nunca supo cómo dar por satisfecha la revisión, y sospecha que a las personas les pasa igual: si se mete a un experto a revisar código saca hallazgos, se corrigen, se mete a otro del mismo nivel o mayor y saca otros de otro tipo, y aun así se construyen edificios. Su otra sospecha, que él mismo marcó como sospecha y no como hecho: quien repara los hallazgos rompe otras cosas o abre hallazgos nuevos al repararlos, de modo que la reparación sería la fuente.
</en-sus-palabras>

<de-donde-salio>
Salió al preguntarle si algún hallazgo de la ronda ocho o nueve le importó de verdad, o si de cierto punto en adelante ya eran cosméticos. Contestó que todas sacaban cosas muy válidas y que no está seguro de qué hacer en ese caso.
</de-donde-salio>

<que-queda-abierto>
Por qué rondas sucesivas siguen encontrando fallas válidas, y si quien repara es la fuente de los hallazgos siguientes. El experto lo dio como sospecha, sin medir: falta comprobar si los hallazgos tardíos tocan justo lo que se acaba de reparar.

Quedo sin cerrar al construir el registro.
El examen quedo a-medias en: «¿Por qué rondas sucesivas de revisión siguen encontrando fallas válidas?»
El examen quedo sin-contestar en: «¿Contra qué se compara un hallazgo para saber si obliga a corregir?»

Auditoría del 2026-08-06: mal marcado. Enlace roto sin declarar: este archivo cita CAP-0013, que no lo devuelve. No está en la lista de deuda declarada (`DEUDA_DE_ENLACE`), que hoy sólo tiene cinco entradas y todas de corridas anteriores. Prueba: `npx vitest run src/contratos/el-conocimiento-no-se-escapa.test.ts` falla con «11 enlace(s) roto(s) sin declarar».

Auditoría del 2026-08-06: no le alcanza a quien no estuvo. Los renglones «El examen quedo a-medias en: …» y «El examen quedo sin-contestar en: …» usan «El examen», que no está definido: la tabla «Las palabras de la casa» de product/conocimiento/README.md define paso, corrida, devolver algo, pieza y reporte, y no examen; ese README lo menciona una sola vez sin explicarlo, y el examen no se guarda en disco.
</que-queda-abierto>

</regla>
