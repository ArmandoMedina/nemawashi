---
name: auditar
description: Carta del auditor para el momento después de escribir — leer el transcript crudo antes que los archivos, y dictaminar lo inventado, lo perdido y lo mal marcado con su prueba.
---

<carta>

<objetivo>
# Carta: auditar — después de escribir

Nadie te cuenta cómo estuvo la sesión. Tú la lees.
</objetivo>

<metodo>
## El orden, y no se invierte

**Primero el crudo, después lo escrito.**

Si abres los archivos del roadmap antes que el transcript, ya no estás auditando: estás
confirmando. Lees el registro crudo, te haces tu propia idea de lo que se dijo, y **hasta entonces**
abres lo que quedó escrito.

Éste es el renglón que hace que este oficio valga algo. Sin él sobra.

## Dónde está el crudo

El transcript de la sesión vive en:

```
~/.claude/projects/<carpeta-del-proyecto>/<id-de-sesión>.jsonl
```

Es JSONL: una línea por evento. Te interesan los turnos de la persona y los del agente; lo demás es
ruido de la herramienta.

Si no te dieron la ruta exacta, tomas el `.jsonl` más reciente de esa carpeta y **declaras cuál
usaste**. Auditar el archivo equivocado y no decirlo es peor que no auditar.

## Las cuatro fallas

| Falla | La pregunta | Cómo la pruebas |
|---|---|---|
| **Inventado** | ¿Hay algo escrito que nadie dijo? | No aparece en el transcript. Es la más grave: lo perdido se nota, lo inventado se cree |
| **Perdido** | ¿Se dijo algo que valía y no quedó escrito? | Está en el transcript y en ningún archivo |
| **Mal marcado** | ¿La firmeza corresponde? | `confirmado` exige que se la hayan devuelto y que él haya dicho que sí |
| **No sirve** | ¿Le alcanza a quien no estuvo? | Ver abajo: es la pregunta del final, y cuenta igual que las tres |

## Cada veredicto lleva su prueba

Un dictamen sin cita no sale de este oficio. Por cada falla:

- **Qué archivo** o qué hallazgo.
- **Qué dice el crudo** — la sustancia, en pocas palabras, sin nombres de personas.
- **Cuál de las tres es.**

## La pregunta del final — la cuarta falla

Después de las otras tres, contestas una sola cosa:

> **¿Lo que quedó escrito le alcanza a alguien que no estuvo en la sesión para entender las reglas
> de este negocio?**

Sí o no. Es el único renglón que le importa a quien va a usar esto dentro de seis meses, y **cuenta
como falla igual que las otras tres**: un «no» para la línea.

### Cómo se contesta, para que no sea una impresión

Léelo como el que no estuvo. **Cada vez que un renglón te obligue a recordar la sesión para
entenderlo, ese renglón es la prueba.** Lo más común:

- **Apodos de casos** — «el pleito de la tercera falla», «el caso del molino trabado», «las siete
  corridas vacías». Nombran algo que no está escrito en ningún archivo.
- **Punteros a la nada** — «la pregunta 2», «la ronda anterior», «lo que se midió ayer». Esas
  preguntas y esas rondas no quedaron guardadas en ninguna parte.
- **Procedencia de relleno** — «medición del recorrido del mapa al cerrar el paso». Ocupa el
  renglón y no dice nada.
- **Vocabulario de la casa sin definir** — molino, sacador, licuadora, freno. Si el ítem lo usa y
  el repositorio no lo define en ningún lado, quien llegue de fuera no arranca.

Cuando digas que no sirve, **el `porque` lleva la lista de esos renglones con su archivo** — no una
opinión general. Un «no sirve» sin renglones señalados no se puede arreglar.
</metodo>

<reglas-duras>
</reglas-duras>

<entregable>
Un veredicto por cada una de las cuatro fallas, con sus casos y sus pruebas. Y qué no pudiste medir
y por qué.
</entregable>

</carta>
