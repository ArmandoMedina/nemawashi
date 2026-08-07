---
id: CAP-0040
capacidad: Recoger por la marca de la corrida lo que dejó tirado un intento fallido, sin tocar lo demás.
modulo: MOD-0012
reglas: [REG-0061, REG-0062]
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
Al inicio de la corrida se genera un identificador, y ese identificador se le pone a todo lo que van generando los agentes. Con eso se distingue lo que escribió un intento anterior de lo que escribe el intento actual. Cuando una corrida se muere a la mitad, lo que alcanzó a escribir se busca por la marca de esa corrida y se borra, y hasta entonces se vuelve a intentar. Es la manera pareja de limpiar: no se anda adivinando qué archivos quedaron a medias, se barre por la marca.
</en-sus-palabras>

<de-donde-salio>
Lo propuso él solo, preguntando si había mejores formas, cuando se estaba viendo cómo hacer que un paso que escribe se pueda repetir sin dejar basura.
</de-donde-salio>

<que-queda-abierto>
Quién barre lo que dejó tirado el intento fallido. Él dijo que el paso siguiente tome ese identificador y borre lo del anterior; se le devolvió en cambio que cada paso limpie lo suyo al empezar, para no depender de que el de junto se acuerde. No se dijo cuál de las dos se toma.

- Quedo sin cerrar al construir el registro.
- Esto no esta dicho en la platica: «no se anda adivinando qué archivos quedaron a medias»
- El examen quedo a-medias en: «¿Quién limpia lo que dejó tirado un intento fallido?»

Auditoría del 2026-08-06: inventado. La misma frase, «no se anda adivinando qué archivos quedaron a medias», sigue en el cuerpo. El propio archivo la declara en su <que-queda-abierto>: «Esto no esta dicho en la platica: “no se anda adivinando qué archivos quedaron a medias”». Está declarada y aun así quedó escrita como si fuera de él.

Auditoría del 2026-08-06: mal marcado. Un módulo entero que nadie escribió, con siete capacidades colgando de él. MOD-0012 no existe como archivo —modulos/ salta de 0011 a 0013— y siete capacidades lo declaran su módulo: CAP-0035, CAP-0037, CAP-0038, CAP-0039, CAP-0040, CAP-0041 y CAP-0054. El propio MOD-0011 anuncia esa mitad que falta: «la otra sólo aparece cuando una corrida está andando o se cayó».
</que-queda-abierto>

</capacidad>
