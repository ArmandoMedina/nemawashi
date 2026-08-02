---
id: RMD-0014
titulo: Una reparación al flujo no cuenta como aplicada hasta comprobarla
items: [RM-0101]
alta: 2026-08-01T20:22:48-06:00
confirmado:
---

# Una reparación al flujo no cuenta como aplicada hasta comprobarla

> **Esto es lo que se le entrega al experto para que confirme.**

## Lo que entendimos

La regla, tal como quedó: «Una reparación al flujo que muele la conversación no cuenta como
aplicada hasta comprobarla: la corrida en vivo puede seguir ejecutando la versión vieja del
archivo aunque en disco ya esté corregido.»

El caso del que salió: el flujo que convierte lo platicado en ítems del roadmap corrió siete veces
en el día sin dejar un solo archivo escrito. Cuatro de esas paradas fueron porque al agente que
redacta los ítems no le llegaba, pegada a cada hallazgo, la fecha y hora con que se da de alta; la
primera reparación la puso como una línea suelta en el texto del encargo y no bastó, y la salida
acordada fue mandarla como parámetro del flujo. Al final del día se llamó a ese agente redactor por
separado, con un hallazgo completo y su fecha y hora, y escribió sin problema: el agente no era el
defecto. Para ubicar dónde estaba, se comparó el texto del encargo que ese agente había recibido
durante la corrida en vivo contra la versión del archivo del flujo anterior a las reparaciones, y
coincidían exactamente, aunque el archivo en disco llevaba varios minutos corregido. El defecto
vivía en el camino: la corrida en vivo ejecutó una copia vieja del flujo, no la que estaba
guardada.

## Donde aplica y donde no

El defecto no vivía en el agente que escribe los ítems: llamado por separado, con un hallazgo
completo y su hora, escribió sin problema. Vivía en el camino: la corrida en vivo ejecutó una
copia del flujo anterior a las reparaciones, aunque el archivo en disco ya estaba corregido.

## Lo que sigue sin cerrarse

Nada.

## Lo que cambia si esto esta mal

Mientras este camino no se blinde, una reparación al flujo puede quedar sin aplicarse en la
corrida real aunque el archivo ya esté corregido en disco, y nadie lo notaría sin comparar el
encargo real recibido contra la versión guardada del archivo.
