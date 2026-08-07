---
id: REG-0094
regla: El hallazgo rebota a dos lados: al agente que lo produjo para repararlo, o al experto para que cierre el hueco.
capacidades: [CAP-0056]
firmeza: abierto
origen: escuchado
estado: con-huecos
paso: Sesión 4 con el experto
alta: 2026-08-07T08:46:16-06:00
confirmado:
marcado: 2026-08-07T08:46:16-06:00
---

<regla>

<en-sus-palabras>
Los auditores no tienen un solo destino de rebote. En algunos casos regresan el hallazgo a los agentes de la línea para que lo reparen ellos. En otros regresan el hallazgo y la regla de negocio al experto, para que sea él quien cierre huecos, quite ambigüedades y resuelva contradicciones. No hay criterio que separe un caso del otro: hoy los hallazgos no se miran uno por uno, sino el bucle completo, y de ahí no hay de dónde sacarlo.
</en-sus-palabras>

<de-donde-salio>
Salió al describir cómo está armada hoy la línea de auditores, antes de plantear el problema de los bucles infinitos.
</de-donde-salio>

<que-queda-abierto>
Con qué se decide que un hallazgo se le devuelve al agente que produjo el documento y no al experto. Hoy no hay de dónde sacarlo: no se miran los hallazgos uno por uno, sino el bucle completo.

Quedo sin cerrar al construir el registro.
Esto no esta dicho en la platica: «No hay criterio que separe un caso del otro»
El examen quedo a-medias en: «¿Cuándo un hallazgo se le devuelve a quien produjo el documento y cuándo se le devuelve al experto?»

Auditoría del 2026-08-07: inventado. Escrito en el cuerpo: «No hay criterio que separe un caso del otro». En el crudo el «no hay criterio» es otra cosa: la respuesta del experto lo dice sobre si un hallazgo suelto amerita otra vuelta («los hallazgos no se revisan uno por uno... por eso no hay criterio»), nunca sobre a cual de los dos destinos —al agente que lo produjo o al experto— rebota. La pieza va marcada `origen: escuchado`. El propio archivo lo delata en su `<que-queda-abierto>` («Esto no esta dicho en la platica»), pero la frase sigue escrita como afirmacion en el cuerpo, que es donde se lee.

Auditoría del 2026-08-07: mal marcado. Enlace de un solo lado dentro de la misma corrida, nueve veces. Estas reglas nuevas declaran `capacidades: []` mientras la capacidad que las cita si las lleva en su lista: `reglas/0094-el-hallazgo-rebota-a-dos-lados.md` (la cita CAP-0056), `reglas/0095-cada-bucle-se-anota-en-la-tabla-de-mediciones.md` (CAP-0057), `reglas/0096-el-entregable-se-califica-ponderando-criterios.md` (CAP-0055), `reglas/0097-cada-auditor-mide-contra-su-checklist-acotado.md` (CAP-0055), `reglas/0107-cada-turno-cerrado-dispara-una-revision.md` (CAP-0060), `reglas/0119-los-baratos-corren-cada-turno-los-caros-cada-varios.md` (CAP-0062), `reglas/0121-lo-nuevo-se-juzga-contra-el-resumen-chico.md` (CAP-0059), `reglas/0122-quien-despacha-mantiene-al-dia-el-resumen-chico.md` (CAP-0059), `reglas/0129-arreglar-la-plantilla-cuando-un-tipo-concentra-rebotes.md` (CAP-0057). Las dos piezas se escribieron en esta misma corrida, asi que no es un enlace pendiente hacia lo viejo: es la mitad del enlace que se dejo sin escribir.

Cierre del enlace (marcar-lo-auditado): se agrega CAP-0056 a `capacidades`, que ya la cita de vuelta en su lista de `reglas`.
</que-queda-abierto>

</regla>
