---
id: CAP-0038
capacidad: Retomar una corrida interrumpida desde el último paso terminado, corriendo de nuevo el que iba a medias.
modulo: MOD-0012
reglas: [REG-0058, REG-0059]
firmeza: confirmado
origen: escuchado
estado: con-huecos
paso: Sesión 3 con el experto
alta: 2026-08-06T19:46:14-06:00
confirmado: 2026-08-06T19:46:14-06:00
marcado: 2026-08-06T19:46:14-06:00
---

<capacidad>

<en-sus-palabras>
El avance de una corrida se sostiene guardando el resultado de cada paso cuando termina, para que el siguiente lo lea. Guardar el estado entre pasos es lo fácil; reanudar un paso que iba en curso es lo complicado, y por eso el paso a medias no se reanuda: se tira y se corre desde el principio. Sale mucho más simple que guardar estados internos, y lo que hace falta a cambio es que el paso no ensucie al repetirse.
</en-sus-palabras>

<de-donde-salio>
Salió al poner sobre la mesa qué se perdería al orquestar con código propio en vez de con la maquinaria que hoy corre los flujos. Él contestó que en el peor de los casos guardar el estado por paso es sencillo, y que lo que iba en curso se arregla empezándolo desde cero. No es lo mismo que retomar la sesión siguiente con el experto: aquí se habla de una corrida del flujo que se cortó a la mitad.
</de-donde-salio>

<que-queda-abierto>
nada

Auditoría del 2026-08-06: mal marcado. Un módulo entero que nadie escribió, con siete capacidades colgando de él. MOD-0012 no existe como archivo —modulos/ salta de 0011 a 0013— y siete capacidades lo declaran su módulo: CAP-0035, CAP-0037, CAP-0038, CAP-0039, CAP-0040, CAP-0041 y CAP-0054. El propio MOD-0011 anuncia esa mitad que falta: «la otra sólo aparece cuando una corrida está andando o se cayó».
</que-queda-abierto>

</capacidad>
