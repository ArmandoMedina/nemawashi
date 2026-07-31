# El oficio desarrollador

**Hipótesis de prototipo.** Nada de lo que hay aquí es decisión cerrada: es la segunda etapa del
circuito — del roadmap al backlog — escrita para medirla, igual que nació el oficio consultor.

## Qué es

La otra orilla del roadmap. El consultor conversa con el experto de negocio y deja ítems; este
oficio conversa con **quien va a construir**, toma esos ítems y los convierte en tareas del backlog:
el qué y el porqué, nunca el cómo. Cada tarea apunta con `origen` a los ítems RM de donde salió.

## Las piezas

| Pieza | Qué hace |
|---|---|
| `output-styles/desarrollador.md` | La personalidad de la sesión: elegir → aterrizar → bordear → confirmar |
| `agents/auditor.md` | Mide en dos momentos: afina antes de escribir, audita después. Opus, porque juzga |
| `agents/escribano.md` | Rellena la plantilla del backlog. Sonnet, porque copia, no interpreta |
| `workflows/levanta-el-backlog.js` | La licuadora: Afinar → Asentar → Auditar, con el paro de línea y el tope de una ronda |

## Por qué tiene su propio escribano

Regla firmada en la sesión del 2026-07-31: **cada escribiente escribe en un solo lugar, el que su
carta le marca.** El escribano del consultor solo toca `roadmap/`; éste solo toca `backlog/`. Así,
cuando algo aparece donde no debe, se sabe quién fue sin preguntarle a nadie.

## Cómo se prueba a mano

```
claude --plugin-dir ./.claude/oficios/desarrollador
```

En el producto terminado lo monta el lanzador; el repo del cliente no recibe ninguno de estos
archivos.

## Deudas que este oficio hereda del hermano

Están registradas como ítems del roadmap y aplican igual aquí: el arranque del workflow por nombre
está trabado (se llama por ruta), el molino instruye sus topes pero aún no los verifica con código,
y el sacador de turnos del registro crudo no existe todavía.
