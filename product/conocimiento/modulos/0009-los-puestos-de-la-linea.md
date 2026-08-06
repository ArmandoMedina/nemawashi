---
id: MOD-0009
modulo: Los puestos de la línea: el agente que hace de cuerpo, la carta del puesto, las reglas de todos y los enganches.
dominio: DOM-0004
capacidades: [CAP-0025, CAP-0026, CAP-0027]
firmeza: abierto
origen: propuesto
estado: completa
paso: Consultoría
alta: 2026-08-06T09:04:12-06:00
confirmado:
marcado:
---

<modulo>

<en-sus-palabras>
El experto nunca nombró este pedazo ni dijo cómo está dividido lo que contó: el agrupamiento lo propone quien escribe. Lo que él dijo fue para qué sirve cada pieza con que gobierna a la inteligencia artificial. El agente describe el comportamiento de una función en particular, de forma genérica: es el cuerpo y el conocimiento básico compartido, y puso como ejemplo el que escribe, encargado de sincronizar el código con la documentación y de otras tareas de escritura. Las cartas son los brazos: aunque el agente traiga cierta preparación, sólo con sus herramientas o sus cartas puede realizar la tarea, y un mismo agente lleva una carta específica para una parte de un flujo y otra para otra parte; lo explicó con la imagen de un centro comercial, donde hay empleados generales —el agente— y hay puestos, cajero, el que recoge los carritos, el que acomoda, el que inventaría —las cartas—, todos partiendo de un conocimiento básico compartido. Las reglas sirven para darle reglas a todos los agentes en general, sin depender de la carta que tomen ese día. Los hooks sirven para realizar tareas inmediatamente antes o inmediatamente después de que los agentes hacen algo, entre otras cosas; dijo que son muy útiles pero que él no los ha implementado mucho. Nombró también los estilos de salida sin explicarlos, y cerró diciendo que hay muchísimas más cosas y que se irá acordando conforme se aterricen. Y antes había dicho por qué hace falta repartir: el que mucho abarca poco aprieta, y la inteligencia artificial puede hacer tantas cosas distintas que en la mezcla entrega un producto imperfecto, así que el objetivo es acotar ese potencial a una tarea en particular para que sea más potente, con varios agentes especializados atacando un mismo problema en conjunto.
</en-sus-palabras>

<que-agrupa>
Cae dentro cómo queda armado cada puesto de la línea antes de que trabaje: repartir el trabajo entre agentes especializados en vez de encargárselo todo a una sola inteligencia, qué trae el agente de suyo y qué le da la carta del puesto que toma para una parte del flujo, qué reglas valen para todos por igual sin depender de la carta, y qué corre pegado al momento en que un agente actúa sin pasar por su criterio. NO cae dentro lo que un agente produce en un paso —eso vive en el paso donde ocurre—, ni lo que se hace con el contexto que se pierde entre sesiones o se recorta al juntarse, que es del módulo del contexto. La prueba para meter aquí una capacidad nueva: que diga cómo queda armado un puesto antes de que trabaje. Si dice qué información se le pasa, se le pierde o se le recorta, es del contexto; si dice qué produce, es del paso.
</que-agrupa>

<de-donde-salio>
Se propone aquí, no lo dijo como pedazo del negocio. El conjunto no cerraba sin él: quedaban tres capacidades sueltas —repartir el trabajo entre agentes acotados en vez de encargárselo todo a una sola IA, darle a un mismo agente la carta del puesto que le toca sobre las reglas que valen para todos, y colgar del momento en que un agente actúa las comprobaciones que no pueden quedar a su criterio— y ninguna es un paso de la línea: no ocurren en la consultoría, ni en el prototipo, ni en la construcción, porque se cumplen en todos por igual. Los módulos escritos el 2026-08-04 tampoco las reclaman: MOD-0001 pide al experto enfrente, MOD-0002 decide qué dice el archivo y MOD-0003 es la lectura de quien no estuvo antes de guardar. Sin este corte, ninguna capacidad nueva sobre cómo queda armado un agente tendría dónde caer. Las preguntas que lo destaparon: qué se perdería si el experto no estuviera, y después cuál de las piezas que nombró de corrido usa más y para qué sirve.
</de-donde-salio>

<que-queda-abierto>
Qué se cuelga exactamente en los enganches que corren pegados al acto de un agente, y en qué momentos de esta línea: el experto dijo que los ha implementado poco. Y qué otras piezas del andamiaje hay: nombró los estilos de salida y no los explicó, y cerró con que hay muchísimas más cosas y que se irá acordando conforme se aterricen. Mientras eso no se conteste, no se puede decidir si los enganches son un pedazo aparte o caen dentro de éste.
</que-queda-abierto>

</modulo>
