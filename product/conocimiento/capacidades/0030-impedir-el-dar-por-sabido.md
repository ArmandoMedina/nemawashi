---
id: CAP-0030
capacidad: Impedir que quien conduce la plática dé por sabido lo que se parece a algo que ya vio antes.
modulo: MOD-0001
reglas: [REG-0025, REG-0024, REG-0023]
firmeza: abierto
origen: propuesto
estado: con-huecos
paso: Consultoría
alta: 2026-08-06T09:04:12-06:00
confirmado:
marcado: 2026-08-06T09:04:12-06:00
---

<capacidad>

<en-sus-palabras>
El caso contado por el experto: en una plataforma de conciliación de transacciones se entendió que el usuario entraría y adentro podría cambiar de cliente con filtros, cuando lo que el negocio quería era que el usuario viniera casado a un cliente, de modo que entrar con ese usuario fuera entrar siempre a ese cliente. Costó un rediseño completo de la arquitectura. Al devolvérsele la lectura equivocada a propósito —que el experto siempre lo supo y sólo nunca se lo preguntaron—, corrigió: fue un problema de comunicación. Quien levantó aquel requisito venía sesgado por haber trabajado antes plataformas del mismo tipo, y al escuchar cómo lo explicaba el experto asumió que era una plataforma de ésas; al validar, el experto sintió que lo estaban entendiendo y nadie profundizó en ese punto. El error se vio hasta la entrega, y fue lo primero que notaron al entrar: por qué se les dejaba escoger el cliente si el usuario ya estaba amarrado a uno. Lo que se saca de ahí: la línea tiene que poder frenar ese asumir por parecido en quien conduce la plática. Puesto enfrente que una IA conduciendo trae más patrones cargados que aquel consultor, no menos, el experto contestó que ese tipo de cosas sólo salen con el prototipo y que no sabe qué preparación tendría que tener quien pregunta para que no se le vayan.
</en-sus-palabras>

<de-donde-salio>
Se propone aquí, no la dijo como capacidad. El conjunto no cerraba sin ella: el error más caro que el experto contó no fue falta de información sino acuerdo aparente causado por el sesgo de quien preguntaba, y hoy quien pregunta es una IA con más patrones cargados que una persona. Sin una capacidad que contenga ese asumir, la línea repite el mismo caso con más fuerza, y ninguna otra pieza del registro se hace cargo de eso.
</de-donde-salio>

<que-queda-abierto>
Qué preparación evita que a quien pregunta se le vaya lo que asumió por parecido: el experto dijo no saberlo. Y sigue sin existir procedimiento para cazar un acuerdo falso antes de llegar al prototipo: no lo tiene en su proceso de consultoría, no sabe si existe, y le cuesta imaginarlo porque los procedimientos de cada negocio son muy distintos.

Quedo sin cerrar al construir el registro.

Auditoría del 2026-08-06: mal marcado. Once enlaces rotos, ninguno declarado. La prueba del propio repositorio los caza: `npx vitest run src/contratos/el-conocimiento-no-se-escapa.test.ts` falla con «11 enlace(s) roto(s) sin declarar en DEUDA_DE_ENLACE». Este archivo dice `modulo: MOD-0001` y product/conocimiento/modulos/0001-la-sesion.md no la nombra de vuelta. No está en la lista de deuda declarada, que hoy sólo tiene cinco entradas y todas de corridas anteriores.
</que-queda-abierto>

</capacidad>
