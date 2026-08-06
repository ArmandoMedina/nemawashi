---
id: CAP-0027
capacidad: Colgar del momento en que un agente actúa las comprobaciones que no pueden quedar a su criterio.
modulo: MOD-0009
reglas: [REG-0041]
firmeza: abierto
origen: propuesto
estado: con-huecos
paso: Consultoría
alta: 2026-08-06T09:04:12-06:00
confirmado:
marcado:
---

<capacidad>

<en-sus-palabras>
El caso contado: al enumerar las piezas con que gobierna a la inteligencia artificial, el experto nombró los hooks y dijo que sirven para realizar tareas inmediatamente antes o inmediatamente después de que los agentes hacen algo, entre otras cosas; que son muy útiles, pero que él no los ha implementado mucho. Nombró también los estilos de salida sin explicarlos, y cerró diciendo que hay muchísimas más cosas y que se irá acordando conforme se aterricen. Lo que se saca de ahí: la línea necesita un lugar donde una comprobación corra sola, pegada al momento en que el agente actúa, y no dependa de que el agente se acuerde de hacerla ni de su criterio.
</en-sus-palabras>

<de-donde-salio>
Se propone aquí, no la dijo como capacidad. El conjunto no cerraba sin ella: el experto dijo que el corte del bucle de revisiones es hoy un arreglo temporal y que quiere bajar el razonamiento a un nivel determinista, y el único lugar que nombró donde algo corre sin pasar por el criterio del agente es justo antes o justo después de que actúa. Sin esa capacidad, todo lo determinista quedaría encargado al mismo agente que se está midiendo.
</de-donde-salio>

<que-queda-abierto>
Qué se cuelga ahí exactamente y en qué momentos de esta línea. Para qué más sirven esos enganches y qué otras piezas del andamiaje hay: el experto los ha implementado poco, los estilos de salida los nombró y no los explicó, y cerró con que se irá acordando conforme se aterricen.

Quedo sin cerrar al construir el registro.
</que-queda-abierto>

</capacidad>
