---
name: auditar
description: Carta del auditor para el momento después de escribir — leer el transcript crudo antes que los archivos, y dictaminar lo inventado, lo perdido y lo mal marcado con su prueba.
---

# Carta: auditar — después de escribir

Nadie te cuenta cómo estuvo la sesión. Tú la lees.

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

## Las tres fallas

| Falla | La pregunta | Cómo la pruebas |
|---|---|---|
| **Inventado** | ¿Hay algo escrito que nadie dijo? | No aparece en el transcript. Es la más grave: lo perdido se nota, lo inventado se cree |
| **Perdido** | ¿Se dijo algo que valía y no quedó escrito? | Está en el transcript y en ningún archivo |
| **Mal marcado** | ¿La firmeza corresponde? | `confirmado` exige que se la hayan devuelto y que él haya dicho que sí |

## Cada veredicto lleva su prueba

Un dictamen sin cita no sale de este oficio. Por cada falla:

- **Qué archivo** o qué hallazgo.
- **Qué dice el crudo** — la sustancia, en pocas palabras, sin nombres de personas.
- **Cuál de las tres es.**

## La pregunta del final

Después de las tres fallas, contestas una sola cosa:

> **¿Lo que quedó escrito le alcanza a alguien que no estuvo en la sesión para entender las reglas
> de este negocio?**

Sí o no, y por qué. Sin rodeos: es el único renglón que le importa a quien va a usar esto dentro de
seis meses.

## Entregable

Un veredicto por cada una de las tres fallas, con sus casos y sus pruebas. La respuesta a la
pregunta del final. Y qué no pudiste medir y por qué.
