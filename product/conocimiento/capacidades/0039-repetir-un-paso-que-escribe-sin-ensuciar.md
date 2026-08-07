---
id: CAP-0039
capacidad: Repetir un paso que escribe sin dejar basura ni archivos a medias que alguien alcance a leer.
modulo: MOD-0012
reglas: [REG-0060, REG-0063]
firmeza: dicho
origen: escuchado
estado: con-huecos
paso: Sesión 3 con el experto
alta: 2026-08-06T19:46:14-06:00
confirmado:
marcado: 2026-08-06T19:46:14-06:00
---

<capacidad>

<en-sus-palabras>
Si un paso sólo calcula y devuelve, repetirlo es gratis y se puede correr las veces que haga falta. El problema son los que tocan disco a medias: escribieron tres archivos de cinco y tronaron, y correrlos otra vez sin limpiar mezcla basura con lo bueno. Entonces todo paso que escribe tiene que cumplir una de dos: no tocar nada hasta el final y escribir todo de un jalón, o saber deshacer lo suyo antes de reintentar. La forma fina de la primera es no limpiar nunca el desastre: el paso escribe todo en un archivo aparte con su marca y sólo cuando terminó completo lo renombra al nombre bueno de un solo golpe; renombrar o pasó o no pasó, nunca queda a medias, y si el paso truena, el temporal queda colgado pero el archivo bueno nunca se ensució.
</en-sus-palabras>

<de-donde-salio>
Él lo puso como la condición de su propia solución de tirar el paso y correrlo desde cero: dijo que había que aplicar las medidas en los que escriben, que deshagan los cambios. La afinación de escribir a un lado y renombrar al final se le ofreció después, y él la reconoció como algo que ya le sonaba a base de datos.
</de-donde-salio>

<que-queda-abierto>
nada

Auditoría del 2026-08-06: mal marcado. Un módulo entero que nadie escribió, con siete capacidades colgando de él. MOD-0012 no existe como archivo —modulos/ salta de 0011 a 0013— y siete capacidades lo declaran su módulo: CAP-0035, CAP-0037, CAP-0038, CAP-0039, CAP-0040, CAP-0041 y CAP-0054. El propio MOD-0011 anuncia esa mitad que falta: «la otra sólo aparece cuando una corrida está andando o se cayó».
</que-queda-abierto>

</capacidad>
