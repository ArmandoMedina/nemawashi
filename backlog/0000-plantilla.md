---
id: BL-0000
tarea: Una linea. El comportamiento observable que hoy no existe y va a existir
origen: [RM-0000]
puntero:
apetito:
alta: 2026-01-01T00:00:00-06:00
---

**Para quién y para qué.** Quién lo necesita y qué gana cuando exista. En palabras del negocio.

**Criterio de terminado.** Cómo se sabe que ya. Observable desde afuera: se hace esto y pasa
aquello. Si para saber si está listo hay que leer el código, el criterio está mal escrito.

**Sugerencias.** Opcional, y se pueden ignorar sin pedir permiso. Aquí va lo que se sabía al
traducir y le puede ahorrar tiempo a quien implemente — nunca el cómo.

**Lo que este ítem NO incluye.** El borde. Es lo que evita que la tarea crezca sola.

<!--
Como se llena cada campo:

  id        BL-NNNN, consecutivo. Vive aqui adentro, no en el nombre del archivo.
  tarea     Una linea. Que va a existir, no como se construye.
  origen    Los ids del roadmap de donde salio. Nunca vacio: un item de backlog
            sin origen es trabajo que nadie pidio.
  puntero   Ruta relativa a `documentos/`. Ahi vive el contexto que se carga al
            tomar la tarea. Vacio mientras ese documento no exista.
  apetito   Cuanto tiempo de revision humana se le concede. No es esfuerzo de
            construccion.
  alta      ISO 8601 con hora y huso.
-->
