---
id: CAP-0016
capacidad: Construir hablando el mapa de lo que un sistema tiene que hacer, sin ver una terminal ni escribir código.
modulo: MOD-0004
reglas: [REG-0001, REG-0026, REG-0029]
firmeza: dicho
origen: escuchado
estado: con-huecos
paso: que es Nemawashi y por que se pierde lo que el experto dice
alta: 2026-08-04T15:19:13-06:00
confirmado:
marcado: 2026-08-06T13:35:39-06:00
---

<capacidad>

<en-sus-palabras>
El experto dijo para qué existe el programa: que alguien que sabe de su negocio pueda sentarse a construir el mapa de lo que necesita que haga un sistema, hablando con una IA, sin ver nunca una terminal ni escribir una línea de código. Ésa es la segunda mitad de la regla escrita como REG-0001, «ni terminal ni una línea de código para usarlo»: la primera mitad dice cómo llega y se abre el programa, y ésta dice qué hace quien se sienta frente a él. Esta capacidad es lo que hay que poder hacer para cumplirla del lado de quien lo usa, no una verdad nueva. Nadie se lo devolvió con otras palabras, así que queda dicha y sin revisar.
</en-sus-palabras>

<de-donde-salio>
Del primer turno del experto en el paso «que es Nemawashi y por que se pierde lo que el experto dice», donde dijo para qué existe el programa antes de contar qué se pierde hoy: construir el mapa de lo que necesita que haga un sistema hablando con una IA, sin ver nunca una terminal ni escribir una línea de código. La regla REG-0001 recoge esa verdad; lo que este paso agrega es el lado de lo que alguien tiene que poder hacer para que se cumpla.
</de-donde-salio>

<que-queda-abierto>
nada

Lo que señalaron las mediciones al leer este registro:

- Esto no esta dicho en la platica: «la primera mitad dice cómo llega y se abre el programa»
- El examen quedo a-medias en: «¿Qué tiene que poder hacer el sistema que se está mapeando?»
- El examen quedo a-medias en: «¿Qué reglas gobiernan cada una de esas cosas que el sistema tiene que poder hacer?»
- El examen quedo a-medias en: «¿Cómo pasa una cosa de dicha a confirmada?»

Auditoría del 2026-08-04:

- Inventado. «la primera mitad dice cómo llega y se abre el programa». Nadie dijo nunca nada sobre cómo llega el programa — ni en la grabación (el turno 1 dice «un programa de escritorio que instalas y abres como cualquier otro», y ningún turno posterior lo toca) ni en las respuestas de después (que son sobre `origen` y `de-donde-salio`). REG-0001 tampoco lo dice: su renglón es «se instala y se abre», no «cómo llega». La pieza está marcada `origen: escuchado`, así que su contenido se prueba en el crudo, y esta frase no está. El propio archivo la trae señalada en la línea 30 («Esto no esta dicho en la platica: ...») y aun así sigue puesta en el cuerpo, dentro del campo donde va lo que el experto dijo.
- Mal marcado. Enlace de un solo lado, CAP-0016 → REG-0001. `product/conocimiento/capacidades/0016-construir-hablando-el-mapa-del-sistema.md` línea 5 declara `reglas: [REG-0001]`, y REG-0001 sigue con `capacidades: [CAP-0001]`, sin nombrarla de vuelta.
- No le alcanza a quien no estuvo. Líneas 18 y 30 — el archivo señala abajo que una frase de su cuerpo no está dicha en la plática y la deja puesta arriba, dentro de `en-sus-palabras`: quien lee en frío no tiene cómo saber cuál mitad del párrafo sostener.
</que-queda-abierto>

</capacidad>
