---
id: REG-0064
regla: El conocimiento se sigue leyendo a ojo como archivos; dónde vive el estado de las corridas no está decidido.
capacidades: [CAP-0041]
firmeza: abierto
origen: propuesto
estado: con-huecos
paso: Sesión 3 con el experto
alta: 2026-08-06T19:46:14-06:00
confirmado:
marcado: 2026-08-06T19:46:14-06:00
---

<regla>

<en-sus-palabras>
Se propuso separar dos cosas que hoy viven igual. El conocimiento escrito con sus enlaces conviene seguir viéndolo como archivos que se abren y se leen a ojo. El estado de las corridas —quién va en qué paso y qué se hizo— encajaría en una base de datos: envolviendo cada paso en una transacción, la base deshace sola lo que quedó a medias y nadie escribe la lógica de limpiar, que es la parte más peligrosa de hacerlo a mano. El costo es una dependencia nueva y que esos datos dejan de ser archivos legibles.
</en-sus-palabras>

<de-donde-salio>
Salió porque escribir a un lado y renombrar al final es lo que una base de datos hace al confirmar, y borrar por la marca de la corrida es lo que hace al deshacer: las dos piezas reinventadas a mano. Él mismo dijo que eso ya le sonaba a base de datos y preguntó qué tanto se puede meter algo así en los flujos.
</de-donde-salio>

<que-queda-abierto>
No se decidió. Falta averiguar cómo se hace, qué impacto tendría y si vale la pena; él dijo que sin esa información no se define nada y que va al lugar de lo que hay que investigar.

- Quedo sin cerrar al construir el registro.
- El examen quedo a-medias en: «¿Dónde se guarda el estado de una corrida: en archivos sueltos o en una base de datos?»

Auditoría del 2026-08-06: mal marcado. Catorce reglas nuevas quedaron con capacidades: [] aunque una capacidad nueva de la misma corrida las cita: REG-0049, REG-0050, REG-0051, REG-0057, REG-0062, REG-0064, REG-0065, REG-0067, REG-0068, REG-0077, REG-0080, REG-0081, REG-0084 y REG-0090. Ejemplo: capacidades/0033 cita REG-0049 y reglas/0049-el-codigo-del-flujo-se-reparte-en-cuatro-piezas.md no la devuelve. Liga escrita de un solo lado, y las dos puntas son de esta corrida.
</que-queda-abierto>

</regla>
