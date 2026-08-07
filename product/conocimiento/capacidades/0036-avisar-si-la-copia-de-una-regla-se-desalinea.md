---
id: CAP-0036
capacidad: Avisar cuando la copia de una regla dentro del flujo dejó de decir lo mismo que su original.
modulo: MOD-0011
reglas: [REG-0052, REG-0053, REG-0054]
firmeza: confirmado
origen: escuchado
estado: completa
paso: Sesión 3 con el experto
alta: 2026-08-06T19:46:14-06:00
confirmado: 2026-08-06T19:46:14-06:00
marcado:
---

<capacidad>

<en-sus-palabras>
El flujo corre como cuerpo de función suelto, con unos pocos identificadores inyectados y sin poder traer nada de otro archivo. Por eso, lo que las dos puntas necesitan —el núcleo para detener la corrida y el flujo para no pasar un dato inventado— vive escrito dos veces: el original en el núcleo, con sus pruebas al lado, y una copia pegada a mano dentro del flujo. El desacople no es físico sino de autoridad: el original es el que se prueba, el que se rompe a propósito y el que manda; la copia es tonta a propósito, sólo ejecuta, y nunca se toca directo. Tener la misma lógica escrita dos veces sólo es seguro si algo truena cuando las dos dejan de decir lo mismo: el peligro sin eso es callado, se cambia la regla en el original, se corren sus pruebas, todo pasa, se olvida actualizar la copia, y el flujo valida con la regla vieja sin que nadie se entere.
</en-sus-palabras>

<de-donde-salio>
Salió al preguntar por qué la validación de la forma de la hora está duplicada y no todo lo demás. Después se preguntó si había algo que tronara cuando la copia y el original difieren, y él contestó que sí lo hay y que ya lo había visto en su propio flujo.
</de-donde-salio>

<que-queda-abierto>
nada
</que-queda-abierto>

</capacidad>
