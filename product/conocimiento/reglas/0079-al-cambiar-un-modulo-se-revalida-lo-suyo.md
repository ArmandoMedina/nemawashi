---
id: REG-0079
regla: Al cambiar un módulo se revalidan todos sus casos de uso; los demás, sólo si se tocó un puerto compartido.
capacidades: [CAP-0046]
firmeza: abierto
origen: propuesto
estado: con-huecos
paso: Sesión 3 con el experto
alta: 2026-08-06T19:46:14-06:00
confirmado:
marcado:
---

<regla>

<en-sus-palabras>
La revalidación no es de todo el sistema: se revisa a fondo el módulo que se tocó, todos sus casos de uso, y de los demás módulos sólo se revisa si el cambio tocó un puerto compartido. Si no se tocó ningún puerto, los otros módulos no se pudieron romper y no se revisan. Eso es lo que devuelve el aislamiento que se pagó al separar puertos y núcleo.
</en-sus-palabras>

<de-donde-salio>
Él planteó la duda de escala —si validar sólo ese módulo o también los demás— y él mismo apuntó que precisamente ésa cree que es la gracia del esquema hexagonal. La regla se armó del lado de quien conducía y él no la devolvió con sus palabras.
</de-donde-salio>

<que-queda-abierto>
Con qué se da cuenta el sistema, solo, de que un cambio tocó un puerto compartido. Se le preguntó de frente y contestó que no tiene idea, que es un buen punto y que hay que investigarlo; lo marcó como importante.

- Quedo sin cerrar al construir el registro.
</que-queda-abierto>

</regla>
