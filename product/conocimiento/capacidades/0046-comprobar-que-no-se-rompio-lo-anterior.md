---
id: CAP-0046
capacidad: Comprobar que una capacidad nueva no rompió las anteriores, sin revalidar todo el sistema.
modulo: MOD-0007
reglas: [REG-0071, REG-0075, REG-0079]
firmeza: abierto
origen: propuesto
estado: con-huecos
paso: Sesión 3 con el experto
alta: 2026-08-06T19:46:14-06:00
confirmado:
marcado:
---

<capacidad>

<en-sus-palabras>
El caso contado fue el momento en que la máquina toca núcleo, puerto y adaptador de un jalón: ahí es justo donde se puede pasar de lista y tocar de más. De ahí se sacó que la revisión no es sólo mirar el código nuevo, es medir que las capacidades viejas sigan pasando, y que cuando la máquina dice que ya quedó no se le cree: se corren las pruebas de todo lo anterior y ésas deciden. El alcance no es todo el sistema: se revisa a fondo el módulo que se tocó, todos sus casos de uso, y de los demás módulos sólo se revisa si el cambio tocó un puerto compartido. Si no se tocó ningún puerto, los otros módulos no se pudieron romper. Eso es lo que devuelve el aislamiento que se pagó al separar puertos y núcleo.
</en-sus-palabras>

<de-donde-salio>
Se le devolvió como el único cuidado sobre la mecánica que él acababa de contar, y contestó que correcto. Después él planteó la duda de escala —si validar sólo ese módulo o también los demás— y él mismo apuntó que precisamente ésa cree que es la gracia del esquema hexagonal.
</de-donde-salio>

<que-queda-abierto>
Con qué se da cuenta el sistema, solo, de que un cambio tocó un puerto compartido. Se le preguntó de frente y contestó que no tiene idea, que es un buen punto y que hay que investigarlo; lo marcó como importante.

- Quedo sin cerrar al construir el registro.
</que-queda-abierto>

</capacidad>
