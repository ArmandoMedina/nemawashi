---
id: MOD-0004
modulo: El programa en manos de quien no sabe de computadoras: cómo llega a su máquina, cómo se abre y qué le exige saber.
dominio:
capacidades: [CAP-0015, CAP-0016]
firmeza: abierto
origen: propuesto
estado: con-huecos
paso: que es Nemawashi y por que se pierde lo que el experto dice
alta: 2026-08-04T15:19:13-06:00
confirmado:
marcado: 2026-08-04T15:19:13-06:00
---

<modulo>

<en-sus-palabras>
El experto nunca nombró este pedazo ni dijo cómo está dividido lo que contó: el agrupamiento lo propone quien escribe. Lo que él dijo fue qué es Nemawashi, antes de nombrar el dolor: un programa de escritorio que se instala y se abre como cualquier otro, para que alguien que sabe de su negocio pueda sentarse a construir el mapa de lo que necesita que haga un sistema, hablando con una IA, sin ver nunca una terminal ni escribir una línea de código. De ese turno salen dos capacidades que no son un paso de la sesión ni algo que quede escrito: llegar a la máquina de quien lo va a usar e instalarse y abrirse ahí como cualquier otro programa (CAP-0015), y construir hablando el mapa de lo que un sistema tiene que hacer, sin ver una terminal ni escribir código (CAP-0016). Las dos aplican la misma verdad ya escrita, REG-0001 —ni terminal ni una línea de código para usarlo—, que hasta hoy no tenía ninguna capacidad colgando. Este módulo es el pedazo donde esas dos viven.

De lo que el renglón promete, sólo una mitad se dijo: que el programa se instala y se abre como cualquier otro, y que quien se sienta no necesita saber de computadoras. La otra mitad —cómo llega el programa hasta esa máquina— nunca se dijo ni se preguntó: no hay palabra sobre si se descarga, si viene en un instalador, quién lo instala, cómo se actualiza ni en qué sistemas tiene que correr. Por eso el módulo queda abierto y no dicho: el corte no se le devolvió al experto con otras palabras, y además le falta contestada la mitad que sostiene CAP-0015.
</en-sus-palabras>

<que-agrupa>
Cae dentro todo lo que pasa antes de que haya una plática y alrededor de ella: cómo llega el programa a la máquina de quien lo va a usar, cómo se instala y se abre ahí, qué tiene que saber de computadoras quien se sienta —nada— y con qué trabaja: hablando, sin terminal y sin escribir código. La prueba para meter aquí una capacidad nueva es que siga siendo cierta con el programa cerrado y sin ninguna sesión encima.

NO cae dentro nada que ocurra ya con el programa abierto y una plática en curso: escoger el proyecto, fijar en una línea de qué se habla hoy, avisar que la plática se fue del tema, devolver lo entendido, cerrar el tramo o decidir por dónde abre la siguiente sesión —eso es MOD-0001. Tampoco cae lo que queda escrito y con qué marcas queda —eso es MOD-0002—, ni la lectura de quien no estuvo antes de guardar —eso es MOD-0003—.

El renglón que decide el caso dudoso: CAP-0016 habla del medio con el que se trabaja y de lo que no hay que saber para usarlo, no de ningún paso dentro de la sesión; por eso queda aquí y no en MOD-0001, aunque las dos hablen de platicar. Si una capacidad nombra un momento de la sesión, es de MOD-0001; si nombra la condición que se cumple en todos los momentos por igual, es de aquí.
</que-agrupa>

<de-donde-salio>
Se cortó así porque las tres agrupaciones que ya están escritas empiezan las tres con el programa ya abierto y una plática en curso: MOD-0001 es la sesión —escoger proyecto, fijar el tema, conducir la plática y decidir por dónde sigue—, MOD-0002 es lo que queda escrito con su firmeza y su procedencia, y MOD-0003 es la revisión en frío antes de guardar. Ninguna de las tres sirve para ubicar una capacidad sobre cómo llega el programa a la máquina, ni sobre qué pone y qué no pone quien se sienta a usarlo; y ninguna capacidad nueva sobre eso tendría dónde caer. Sin este módulo, CAP-0015 y CAP-0016 quedaban sin casa y REG-0001 sin ningún pedazo del negocio donde vivieran las capacidades que la cumplen. El corte lo propone quien escribe, no el experto.
</de-donde-salio>

<que-queda-abierto>
Cómo llega el programa hasta la máquina de quien lo va a usar. Se dijo que se instala y se abre como cualquier otro, pero no cómo llega hasta ahí, y ese pedazo es la mitad que el renglón de este módulo promete y que CAP-0015 exige. La pregunta para el experto: ¿cómo llega Nemawashi a la máquina de quien lo va a usar —lo descarga él, se lo pasa alguien, viene en un instalador—, quién lo instala y quién lo actualiza cuando sale una versión nueva? Mientras eso no se conteste, tampoco se puede decidir si la llegada y la instalación son un pedazo aparte del negocio o caen dentro de éste.

Lo que señalaron las mediciones al leer este registro:

- Quedo sin cerrar al construir el registro.
- El examen quedo a-medias en: «¿Qué tiene que poder hacer el sistema que se está mapeando?»
- El examen quedo a-medias en: «¿Cómo pasa una cosa de dicha a confirmada?»
- El examen quedo sin-contestar en: «¿Cómo llega el programa a la máquina de quien lo va a usar?»
- El examen quedo sin-contestar en: «¿En qué proyecto se está trabajando?»
- El examen quedo sin-contestar en: «¿De qué se habla en esta sesión?»
- El examen quedo a-medias en: «¿Qué pasa cuando la plática se va a un tema distinto del que se fijó al empezar?»
- El examen quedo a-medias en: «¿Qué se le regresa a la persona antes de que se levante de la silla?»
- El examen quedo sin-contestar en: «¿Por dónde abre la sesión siguiente?»
- El examen quedo sin-contestar en: «¿Qué tiene que tener enfrente, y qué no puede tener enfrente, quien hace esa lectura antes del guardado?»

Auditoría del 2026-08-04:

- Mal marcado. Enlace de un solo lado, DOM-0001 → MOD-0004. `product/conocimiento/dominios/0001-el-levantamiento-hablado-del-negocio.md` línea 4 declara `modulos: [MOD-0004, MOD-0002]`, y este archivo, línea 4, tiene `dominio:` vacío. La plantilla lo exige de las dos puntas: «dominio — El id del dominio que lo contiene. Ese dominio tiene que nombrarlo de vuelta» (`product/conocimiento/modulos/0000-plantilla.md`). Las dos piezas se escribieron en la misma corrida (`alta: 2026-08-04T15:19:13-06:00` en las dos), así que las dos puntas estaban a la mano.
- Mal marcado. Enlace de un solo lado, MOD-0004 → CAP-0015. Línea 5 de este archivo declara `capacidades: [CAP-0015, CAP-0016]`, y `product/conocimiento/capacidades/0015-instalar-y-abrir-como-cualquier-programa.md` línea 4 tiene `modulo:` vacío. La plantilla de capacidades: «modulo — El id del modulo que la contiene. Ese modulo tiene que nombrarla de vuelta». CAP-0016 sí nombra de vuelta a MOD-0004; CAP-0015 no.
- Mal marcado. Afirmación falsa sobre el estado de los enlaces. Línea 18: dice de REG-0001 «que hasta hoy no tenía ninguna capacidad colgando». En disco, REG-0001 lista `capacidades: [CAP-0001]` y `product/conocimiento/capacidades/0001-escoger-o-crear-proyecto.md` lista `reglas: [REG-0001]` — el enlace existe de los dos lados desde la corrida de las 09:42. El módulo se justifica en parte con un hecho que el propio registro desmiente.
- No le alcanza a quien no estuvo. Las cuatro piezas no se pueden recorrer hacia arriba: desde MOD-0004 no se llega a DOM-0001 (`dominio:` vacío) y desde CAP-0015 no se llega a MOD-0004 (`modulo:` vacío), así que quien caiga en cualquiera de esas dos piezas no encuentra el pedazo ni el área a la que pertenece, que es justo lo que el registro promete en sus plantillas.
</que-queda-abierto>

</modulo>
