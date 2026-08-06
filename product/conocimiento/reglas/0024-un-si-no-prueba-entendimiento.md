---
id: REG-0024
regla: Un sí del experto no prueba entendimiento: el acuerdo tapa lo que cada quien entendió y el desacuerdo lo destapa.
capacidades: [CAP-0004, CAP-0030]
firmeza: confirmado
origen: escuchado
estado: con-huecos
paso: Consultoría
alta: 2026-08-06T09:04:12-06:00
confirmado: 2026-08-06T09:04:12-06:00
marcado: 2026-08-06T09:04:12-06:00
---

<regla>

<en-sus-palabras>
El trato entre quien pregunta y quien contesta suele ser muy cordial y de camarada, y en cuanto los dos se sienten seguros de que se entendieron, ya nadie profundiza. Llega a pasar que ambos afirman entenderse y después, hablando de lo mismo, no logran ponerse de acuerdo porque estaban hablando de cosas diferentes creyendo que hablaban de la misma. Cuando eso salta, se descubre que no se habían entendido, se corrige y se salvan — pero es casualidad, no un hecho del proceso. El caso caro que lo prueba: en una plataforma de conciliación de transacciones se entendió que el usuario entraría y adentro podría cambiar de cliente con filtros, cuando lo que el negocio quería era que el usuario viniera casado a un cliente, de modo que entrar con ese usuario fuera entrar siempre a ese cliente. No faltó información: nadie preguntó y los dos creyeron haberse entendido. Costó un rediseño completo de la arquitectura.
</en-sus-palabras>

<de-donde-salio>
Salió de pedirle el detalle más caro que haya aparecido al ver el software funcionando. Contó el caso de la plataforma de conciliación. Se le devolvió la lectura equivocada a propósito —que el experto siempre lo supo y sólo nunca se lo preguntaron— y él corrigió: fue un problema de comunicación, quien preguntaba asumió por haber trabajado plataformas parecidas, el experto se sintió entendido, y nadie profundizó hasta la entrega.
</de-donde-salio>

<que-queda-abierto>
No existe procedimiento para cazar un acuerdo falso antes de llegar al prototipo. El experto no lo tiene en su proceso de consultoría, no sabe si existe, y le cuesta imaginarlo porque los procedimientos de cada negocio son muy distintos. Falta decidir con qué se caza, si es que se puede.

Quedo sin cerrar al construir el registro.

Auditoría del 2026-08-06: mal marcado. Enlace roto sin declarar: este archivo cita CAP-0004, que no lo devuelve. No está en la lista de deuda declarada (`DEUDA_DE_ENLACE`), que hoy sólo tiene cinco entradas y todas de corridas anteriores. Prueba: `npx vitest run src/contratos/el-conocimiento-no-se-escapa.test.ts` falla con «11 enlace(s) roto(s) sin declarar».

Auditoría del 2026-08-06: mal marcado. `firmeza: confirmado` sobre una mitad que el experto nunca aceptó. La segunda mitad del renglón, «el acuerdo tapa lo que cada quien entendió y el desacuerdo lo destapa», es formulación de quien conducía la plática: la enunció él y en el mismo turno preguntó otra cosa (si la técnica del reflejo equivocado sustituía al prototipo). El turno siguiente del experto contestó sólo sobre el prototipo —«nada sustituye el prototipo»— y jamás volvió sobre el acuerdo y el desacuerdo. No hay un sí suyo sobre esa mitad ni en la grabación ni en las respuestas de después. La primera mitad —que un sí no prueba entendimiento— sí la sostuvo él con su propio caso, y ésa no está en discusión. `origen: escuchado` sobre esa mitad tiene el mismo problema.

El auditor probó que la segunda mitad del renglón no está en el crudo y la pieza está marcada `firmeza: confirmado` y `origen: escuchado` sobre ella; hay que preguntarle al experto si la dijo.
</que-queda-abierto>

</regla>
