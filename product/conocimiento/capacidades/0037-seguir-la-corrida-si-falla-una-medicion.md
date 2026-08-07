---
id: CAP-0037
capacidad: Seguir la corrida cuando falla una pieza que sólo mide, y entregar el resultado con el aviso.
modulo: MOD-0012
reglas: [REG-0055, REG-0057]
firmeza: abierto
origen: escuchado
estado: con-huecos
paso: Sesión 3 con el experto
alta: 2026-08-06T19:46:14-06:00
confirmado:
marcado: 2026-08-06T19:46:14-06:00
---

<capacidad>

<en-sus-palabras>
La gracia del desacople es que si truena una pieza no se lleva a las otras entre las patas. Aplicado al flujo: el paso que sólo mide o anota no es línea de producción, y si truena al escribir, el código atrapa la falla y la corrida entrega su resultado igual, con el aviso de lo que falló. Lo mismo el inventario de lo ya escrito: si falla, la corrida sigue, porque construir a ciegas produce duplicados que después hay que juntar, pero no construir no produce nada. El mismo principio alcanzaría a las mediciones de una tanda, y ahí todavía no se cumple: hoy corren esperándose todo o nada, así que la primera que revienta mata a las hermanas aunque ya hubieran terminado bien, y con eso se pierden de golpe las que le dan la última palabra al núcleo. Lo propuesto es esperarlas todas pase lo que pase y recibir cada resultado por separado, respetando la que sí corrió y marcando la que reventó.
</en-sus-palabras>

<de-donde-salio>
Él nombró la gracia del desacople —que si algo falla no falle lo demás— al cerrar la explicación de la copia y el original, y de ahí se recorrieron los pasos del flujo que ya lo cumplen y los que no. La grieta de la tanda se le contó al llegar a los pasos que no lo cumplen.
</de-donde-salio>

<que-queda-abierto>
Si las mediciones de una tanda se cambian para esperarlas todas pase lo que pase, en vez de todo o nada. Se le contó la grieta y no dijo si se cambia: pasó al tema siguiente.

- Quedo sin cerrar al construir el registro.
- El examen quedo a-medias en: «¿Qué pasa con las mediciones que sí terminaron bien cuando otra medición de la misma tanda revienta?»

Auditoría del 2026-08-06: mal marcado. Un módulo entero que nadie escribió, con siete capacidades colgando de él. MOD-0012 no existe como archivo —modulos/ salta de 0011 a 0013— y siete capacidades lo declaran su módulo: CAP-0035, CAP-0037, CAP-0038, CAP-0039, CAP-0040, CAP-0041 y CAP-0054. El propio MOD-0011 anuncia esa mitad que falta: «la otra sólo aparece cuando una corrida está andando o se cayó».
</que-queda-abierto>

</capacidad>
