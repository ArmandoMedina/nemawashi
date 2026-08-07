---
id: CAP-0041
capacidad: Abrir a ojo el conocimiento escrito, aunque el estado de las corridas viva en otro lado.
modulo: MOD-0012
reglas: [REG-0064]
firmeza: abierto
origen: propuesto
estado: con-huecos
paso: Sesión 3 con el experto
alta: 2026-08-06T19:46:14-06:00
confirmado:
marcado: 2026-08-06T19:46:14-06:00
---

<capacidad>

<en-sus-palabras>
El caso contado fue el de reinventar a mano las dos piezas del corazón de una base de datos: escribir a un lado y renombrar al final es lo que hace al confirmar, y borrar por la marca de la corrida es lo que hace al deshacer. De ahí se sacó separar dos cosas que hoy viven igual. El conocimiento escrito con sus enlaces conviene seguir viéndolo como archivos que se abren y se leen a ojo. El estado de las corridas —quién va en qué paso y qué se hizo— encajaría en una base de datos: envolviendo cada paso en una transacción, la base deshace sola lo que quedó a medias y nadie escribe la lógica de limpiar, que es la parte más peligrosa de hacerlo a mano. El costo es una dependencia nueva y que esos datos dejan de ser archivos legibles.
</en-sus-palabras>

<de-donde-salio>
Él mismo dijo que eso ya le sonaba a base de datos y preguntó qué tanto se puede meter algo así en los flujos. La separación entre el conocimiento y el estado de corrida se le ofreció como respuesta y no la cerró.
</de-donde-salio>

<que-queda-abierto>
Dónde vive el estado de las corridas: si en archivos sueltos o en una base de datos. Falta averiguar cómo se hace, qué impacto tendría y si vale la pena; él dijo que sin esa información no se define nada y lo mandó al lugar de lo que hay que investigar.

- Quedo sin cerrar al construir el registro.
- El examen quedo a-medias en: «¿Dónde se guarda el estado de una corrida: en archivos sueltos o en una base de datos?»

Auditoría del 2026-08-06: mal marcado. Un módulo entero que nadie escribió, con siete capacidades colgando de él. MOD-0012 no existe como archivo —modulos/ salta de 0011 a 0013— y siete capacidades lo declaran su módulo: CAP-0035, CAP-0037, CAP-0038, CAP-0039, CAP-0040, CAP-0041 y CAP-0054. El propio MOD-0011 anuncia esa mitad que falta: «la otra sólo aparece cuando una corrida está andando o se cayó».
</que-queda-abierto>

</capacidad>
