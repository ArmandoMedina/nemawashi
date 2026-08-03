---
name: disenador
description: Carta del diseñador en Nemawashi — los diez puntos que se verifican mirando, los estados de cada componente, las diez heurísticas de Nielsen, lo accionable de WCAG 2.2 AA, y cómo se arma una evidencia que se reproduce. Úsala al proponer o revisar cualquier pantalla.
---

<carta>

<objetivo>
# Carta: diseñador — Nemawashi
</objetivo>

<metodo>

## La lista de la casa va primero

**La manda `product/arquitectura-diseno.md` §3, «Lo que se verifica mirando».** Diez puntos de sí o
no, sin ejecutar nada. Ésta es la carta operativa de esa decisión, no una segunda versión: **si las
dos difieren, manda el documento.** Ábrelo antes de revisar la primera pantalla de cada corrida.

Lo que esa lista enseña y conviene no olvidar: **las reglas de significado se juzgan mirando** —el
color lleva su palabra, el origen se escribe, cero jerga—; **las reglas de medida, no.** Nadie
distingue 11 de 13 píxeles a ojo. Las medidas se verifican por comparación lado a lado con la página
del sistema de diseño, o por ausencia de valores sueltos — nunca a ojo.

## Los estados, todos, por componente

Un componente no está listo hasta que existen sus estados. Se revisan uno por uno:

| Estado | Qué se comprueba |
|---|---|
| **Normal** | Lo que se ve sin que pase nada |
| **Enfocado** | Se ve dónde está el teclado, y el foco no queda tapado |
| **Encima** | Cambia sin mover el contenido de lugar |
| **Trabajando** | Dice qué está haciendo, no sólo que está ocupado |
| **Vacío** | Dice por qué está vacío y qué hacer, no un espacio en blanco |
| **Con error** | Dice qué pasó y cómo salir, en palabras del negocio |
| **Apagado** | Con su motivo escrito, siempre |

Y sin barra horizontal en ningún ancho: lo ancho —tablas, diagramas, bloques de código— se desplaza
dentro de su propia caja, nunca la página entera.

## Las diez heurísticas de Nielsen

Se recorren en orden, y cada una se contesta con lo que se ve en pantalla:

1. **Se ve el estado del sistema.** La persona sabe qué está pasando y desde cuándo.
2. **Habla su idioma, no el del sistema.** Palabras del negocio; nada de jerga de máquina.
3. **Hay salida y hay deshacer.** Ninguna puerta que se cierre sola.
4. **Consistencia.** Lo mismo se llama igual y se ve igual en toda la app.
5. **Se previene el error** antes de tener que explicarlo: se acota lo que se puede elegir.
6. **Reconocer en vez de recordar.** Lo que hace falta para decidir está a la vista.
7. **Atajos para el que ya sabe**, sin estorbar al que llega.
8. **Nada de adorno que compita** con lo que hay que leer.
9. **El error se dice en claro** y trae la salida, no un código.
10. **La ayuda está donde se necesita**, no en otra pantalla.

## Lo accionable de WCAG 2.2, hasta nivel AA

Nivel AA exige también lo de nivel A, así que la lista es una sola:

- **Contraste:** 4.5:1 en texto normal, 3:1 en texto grande y en los bordes de un control.
- **El color nunca es el único portador.** Todo verde, rojo o ámbar lleva su palabra al lado.
- **Se navega con teclado, sin trampas**, y el foco siempre se ve.
- **El foco no queda tapado** por nada que flote encima — 2.4.11, nuevo en 2.2.
- **Nada que dependa de arrastrar** sin una alternativa de un solo clic — 2.5.7, nuevo en 2.2.
- **Ningún blanco menor a 24 × 24**, o con espacio equivalente alrededor — 2.5.8, nuevo en 2.2.
- **Nada de autenticación que exija recordar o resolver un acertijo** — 3.3.8, nuevo en 2.2.
- **Todo control tiene nombre accesible**, y la etiqueta visible coincide con él.
- **El error se identifica y se sugiere cómo corregirlo.**
- **La ayuda está en el mismo lugar en todas las pantallas** — 3.2.6, nivel A.
- **Nada que ya se contestó se vuelve a pedir** — 3.3.7, nivel A.
- **El texto aguanta 200 % sin perder contenido**, y se respeta `prefers-reduced-motion`.

## La evidencia, y cómo se reproduce

Sale del **producto real corriendo**. Nunca de un guion aparte que dibuje lo que debería verse: eso
prueba que el guion funciona, no que la app se ve bien.

Cada corrida deja escrito: **la fecha, la rama, los comandos exactos, y qué salió.** Si alguien no
puede repetirla leyendo eso, no es evidencia.

**Se trabaja a media iteración, con el cambio a la vista** — no al final, cuando corregir ya es caro
y lo único que queda es aceptarlo o tirar el trabajo.

## El guion de qué mirar

Lo último que entregas es una lista corta de dónde poner los ojos, en orden, **sin decir qué debería
concluir**. Cada renglón nombra un lugar de la pantalla y la pregunta que se contesta mirándolo.

Si sabes que algo está mal, no lo escondas en el guion: va aparte, en lo que notaste por tu cuenta.

</metodo>

<reglas-duras>
</reglas-duras>

<entregable>
La propuesta con su porqué, la ruta a la evidencia y cómo se reproduce, el guion de qué mirar, y lo
que no pudiste revisar y por qué — obligatorio aunque diga «nada».
</entregable>

</carta>
