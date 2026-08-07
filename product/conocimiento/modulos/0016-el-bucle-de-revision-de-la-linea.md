---
id: MOD-0016
modulo: El bucle de revisión de la línea: cuándo un auditor da algo por bueno, a quién rebota y cómo se mide.
dominio: DOM-0004
capacidades: [CAP-0055, CAP-0056, CAP-0057, CAP-0065]
firmeza: abierto
origen: propuesto
estado: con-huecos
paso: Sesión 4 con el experto
alta: 2026-08-07T08:46:16-06:00
confirmado:
marcado:
---

<modulo>

<en-sus-palabras>
El experto nunca nombró este pedazo: el agrupamiento lo propone quien escribe. Lo que él contó es el problema con el que abrió el paso y lo que ya tiene puesto contra él.

Contó que tiene un flujo de agentes que se encarga de destilar toda la plática, todo lo escrito, para sacar los hallazgos y las reglas de negocio; y que dentro de él hay una serie de agentes auditores, armados como una línea de producción de Toyota, sobre cuyos principios está construido casi todo. Contó que esos auditores rebotan a dos lados: en algunos casos regresan el hallazgo a los agentes de la línea para que lo reparen ellos, y en otros regresan el hallazgo y la regla de negocio al experto para que sea él quien cierre huecos, quite ambigüedades y resuelva contradicciones.

Contó que esos bucles se le están haciendo infinitos: la inteligencia artificial no queda satisfecha con el nivel de lo que se le entrega, siempre hay más preguntas y más cosas que resolver, y con diez o quince bucles corridos sigue sacando hallazgos que él mismo califica de graves, sin que el documento cierre nunca. No estaba seguro de qué hacer para sí tener un buen documento sin dar treinta vueltas.

Contó lo que ya tiene puesto: sólo les deja tres bucles, sobre todo contra el experto, porque nadie va a querer pasar el día contestando preguntas, y si para la tercera no queda, se apunta y se continúa sin detenerse. Después aclaró que tres es a dónde se quiere llegar y que hoy corre una sola vuelta. Contó que eso no lo deja tranquilo: quiere hacer lo posible para que alguna plática sí pase a la primera o a la segunda, para que en la tabla de mediciones que lleva para el Kaizen no salga siempre que ese bucle salió mal, una y otra vez.

Y aterrizó la vara: que los auditores se midan con la vara de que no sean perfeccionistas, que cada uno tenga su propio checklist para definir más criterios y no sólo la severidad, y que de ahí salga una calificación con corte —con ocho pasa, con siete no; nueve o diez es perfecto y entre ocho y nueve queda el margen—.

De ahí se sacó este corte: todo eso es la misma máquina, la que decide si un entregable pasa, a quién se le regresa lo que no pasó, y cómo se mide si el bucle cerró pronto o no.
</en-sus-palabras>

<que-agrupa>
Cae dentro lo que hace que una revisión de la línea termine: la vara con que cada auditor da por bueno un entregable —su checklist acotado y la calificación con corte, en vez de la perfección—, a quién se le regresa el hallazgo y con cuántas vueltas contra el experto, lo que se filtra y se junta antes de gastar una de esas vueltas, y la tabla donde se anota cada bucle para subir la proporción de los que cierran a la primera o a la segunda.

NO cae dentro lo que cada estación produce, que vive en el paso donde ocurre. NO cae la revisión ligera que corre en vivo durante la plática, con sus revisores por lente y su latido por turno, que es del módulo del equipo que oye por detrás mientras el experto habla: el que dice quién mira, cada cuándo se enciende y qué le llega al consultor. NO cae la lectura en frío que hace quien no estuvo antes de guardar, que es de MOD-0003, porque ésa dictamina si lo escrito se entiende solo y no si el bucle ya puede cerrar. NO cae cómo queda armado cada auditor —el agente, su carta, las reglas de todos y los enganches—, que es de MOD-0009. Y NO cae la revisión de arquitectura, escalabilidad, prácticas y pruebas sobre código ya comprometido en una historia, que es de MOD-0007.

La prueba para meter aquí una capacidad nueva: que sirva para que un bucle de revisión termine, o para medir por qué no terminó. Si dice qué se revisa en un paso concreto, es de ese paso; si dice cuándo se deja de revisar, es de aquí.
</que-agrupa>

<de-donde-salio>
Se propone aquí. Los auditores y el bucle sí los contó él; el corte en un pedazo, no. Lo destapó la pregunta con la que abrió el paso —qué hacer para tener un buen documento sin ir treinta veces— y se aterrizó cuando se le preguntó si convenía hacer las tres cosas juntas: tope de vueltas, checklist con más criterios y consultor cazando en vivo.

El conjunto no cerraba sin este corte: quedaban cuatro capacidades sueltas —dar por bueno el entregable que cumple el checklist de su estación, rebotar el hallazgo a quien puede cerrarlo con tope de vueltas contra el experto, medir los bucles en la tabla y subir los que cierran temprano, y buscar la respuesta en lo ya dicho antes de gastar una vuelta del experto— y ninguna cabe donde ya hay. MOD-0001 pide al experto enfrente; MOD-0002 decide qué dice el archivo; MOD-0003 es la lectura de quien no estuvo antes de guardar y dictamina si algo se entiende solo, no si el bucle ya puede cerrar; MOD-0007 pide que la capacidad trabaje sobre código ya comprometido en una historia, y estas cuatro corren sobre lo destilado de una plática. No son de un paso: valen para cualquier estación de la línea que audite lo que produjo otra.
</de-donde-salio>

<que-queda-abierto>
Si los auditores de aquí son los mismos que revisan lo construido no está resuelto, y el choque ya estaba escrito antes de este paso: MOD-0007 dejó dicho que si esa revisión con auditores corriera sobre lo que producen todos los pasos de la línea, su capacidad de auditores no sería suya y su corte tendría que rehacerse. Esta plática enseña auditores corriendo sobre lo destilado de la conversación, que no es código comprometido en una historia, pero nadie dijo si son la misma estación repetida en cada paso o dos máquinas distintas.

Queda sin decidir si la revisión de entrada al borrador —la que caza términos usados sin definir, reglas sin su condición de excepción y cantidades sin unidad antes de mandarlo al experto— se queda como estación propia de este módulo o la sustituye el consultor cazando las contradicciones en vivo con el experto enfrente, que ya no sería una revisión de la línea.

Y sin los criterios con que se pondera la calificación, con qué peso lleva cada uno y sobre qué se aplica, no se puede saber qué tan grande es este pedazo: el ocho quedó dicho como ejemplo, no como número acordado. Tampoco se sabe qué lista de puntos revisa cada estación ni qué tan larga puede ser, ni con qué se decide que un hallazgo suelto no amerita otra vuelta, porque hoy la unidad que se mira es el bucle y no el hallazgo.

Quedo sin cerrar al construir el registro.
El examen quedo a-medias en: «¿Cuándo un hallazgo se le devuelve a quien produjo el documento y cuándo se le devuelve al experto?»
El examen quedo a-medias en: «¿Con qué calificación o umbral se da por bueno un entregable aunque no esté perfecto?»
El examen quedo sin-contestar en: «¿Qué lista de puntos revisa cada estación para decidir si algo pasa?»
El examen quedo a-medias en: «¿Qué defectos se buscan en un borrador antes de mandárselo al experto?»
El examen quedo a-medias en: «¿Cómo se clasifica un hallazgo para saber qué tipo de defecto rebota más seguido?»
El examen quedo sin-contestar en: «¿Cómo se mide si una conversación se resolvió en la primera o segunda vuelta?»
El examen quedo sin-contestar en: «¿Qué tan larga puede ser la lista de revisión de cada estación?»
</que-queda-abierto>

</modulo>
