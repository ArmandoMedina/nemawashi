---
id: REG-0029
regla: El software pasa por seis pasos: consultoría, destilado, prototipo, historias, construcción y entrega.
capacidades: [CAP-0016, CAP-0006, CAP-0021, CAP-0022]
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
Una línea de producción con inteligencia artificial para desarrollar productos de software, apoyada en principios de manufactura. El recorrido, tal como lo describió el experto: primero la consultoría, donde una IA experta en consultoría le saca al experto toda la información del producto; luego esa información entra a un flujo de agentes que destila la conversación; después los desarrolladores toman capacidades y arman el prototipo para el cliente; ya con eso más seguro, se crean historias de usuario formales; esas historias entran a otro flujo que hace el diseño de lo que va por detrás, verifica arquitectura y prácticas y hace las pruebas; y al final la entrega, con lo de máquinas virtuales y operaciones, y un flujo de validación. El experto presentó todo esto como propuesta suya y pidió ayuda para hacerlo más claro.
</en-sus-palabras>

<de-donde-salio>
Salió de la primera petición de la sesión: contar el proceso en tres a seis pasos, como si se explicara en un pizarrón. Él describió el recorrido completo de corrido; se le devolvió condensado en seis pasos y no lo corrigió, sino que respondió sobre lo que hay dentro de cada uno.
</de-donde-salio>

<que-queda-abierto>
Los seis pasos están a muy alto nivel y no a detalle. El experto dijo que al abrir cada uno seguramente hay juicio adentro de todos, pero no supo señalar dónde: qué decisiones de cada paso exigen criterio, y en cuáles dos personas con la misma información delante decidirían distinto, sigue sin abrirse.

Quedo sin cerrar al construir el registro.

Auditoría del 2026-08-06: mal marcado. Enlaces rotos sin declarar: este archivo cita CAP-0016 y CAP-0006, y ninguna de las dos lo devuelve. No están en la lista de deuda declarada (`DEUDA_DE_ENLACE`), que hoy sólo tiene cinco entradas y todas de corridas anteriores. Prueba: `npx vitest run src/contratos/el-conocimiento-no-se-escapa.test.ts` falla con «11 enlace(s) roto(s) sin declarar».
</que-queda-abierto>

</regla>
