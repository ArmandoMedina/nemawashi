---
id: CAP-0060
capacidad: Disparar la revisión de atrás con cada turno cerrado del experto, sin que el consultor la pida.
modulo: MOD-0015
reglas: [REG-0107, REG-0108, REG-0109]
firmeza: abierto
origen: propuesto
estado: con-huecos
paso: Sesión 4 con el experto
alta: 2026-08-07T08:46:16-06:00
confirmado:
marcado:
---

<capacidad>

<en-sus-palabras>
El caso contado: un agente no actúa hasta que alguien le dice que actúe, así que para que el de atrás se entere de que hay un problema, alguien tuvo que pedirle que buscara; y no puede ser el consultor quien lo pida, porque ahí se pierde la gracia de tener un equipo detrás. Tampoco convence dejarlo en un ciclo permanente buscando cada cierto tiempo.

De ahí se sacó la capacidad: el disparo lo mete la orquestación. Cada vez que el experto cierra un turno, el turno se copia hacia atrás, el revisor mira y se apaga. Es un latido por respuesta, no un proceso vivo. El latido no se dispara por frase: si el experto suelta tres frases seguidas, se agrupan en un solo turno.

El turno baja crudo y entero, en paralelo, a cada revisor: nadie lo trocea ni lo interpreta en medio, porque cada uno necesita el mensaje completo para juzgarlo con su propio lente, y partirlo perdería contexto y gastaría un paso de más. Y si el experto vuelve a hablar mientras la revisión anterior no ha terminado, la vieja se cancela y se corre una nueva sobre el texto acumulado, porque lo más reciente ya contiene lo anterior: nunca corren dos revisiones traslapadas sobre el mismo hilo.
</en-sus-palabras>

<de-donde-salio>
Salió de la preocupación de cómo se entera el de atrás de que hay un problema si nadie le pide que busque, y de la petición expresa de definir el flujo de comunicación: si los de abajo reciben el mensaje directo o si les llega repartido desde en medio.
</de-donde-salio>

<que-queda-abierto>
Qué cuenta como turno cerrado del experto, para no echar a andar a los de atrás sobre media idea. Es el amortiguador del latido y hay que profundizarlo.

Quedo sin cerrar al construir el registro.
El examen quedo a-medias en: «¿Qué cuenta como un turno cuando el experto suelta varias frases seguidas?»
</que-queda-abierto>

</capacidad>
