---
tipo: prototipo
estado: sin firmar
---
# El consultor — de dónde salió su rutina, y por qué no está firmada

**Hipótesis de prototipo, sin firmar.**

La rutina de [`.claude/output-styles/consultor.md`](../.claude/output-styles/consultor.md) —acotar, excavar, reflejar, confirmar— sale de la
investigación del **2026-07-31** sobre cómo se le saca conocimiento a un experto de negocio:
Toyota Kata, ACTA, el método de decisión crítica y los talleres de dominio.

**No es una decisión cerrada.** `product/modulos.md` deja abierto cómo conduce el agente de M5, con
candado explícito: se cierra antes de escribir una instrucción del módulo. Esto se escribió como
prototipo para **conseguir la medición** con la que después se cierra ese ADR — no como la
decisión misma.

Para probarlo, dentro de una sesión: `/output-style` y elegir **Consultor**. Ya no se carga como
plugin — el plugin sólo servía para que la personalidad llegara sin que nadie la eligiera, y eso
mismo lo hace el ajuste `outputStyle` que escribe el ejecutable.

## Estado de las piezas

| Pieza | Estado |
|---|---|
| La personalidad (`.claude/output-styles/consultor.md`) | Escrita, sin medir |
| El escribano — quien levanta los ítems | Existe: `.claude/agents/escribano.md` con la carta `asentar` |
| El andon — el freno que impide cerrar con hallazgos sin registrar | Pendiente |

## Por qué este archivo existe aparte

Todo lo que va dentro de `consultor.md`, debajo del frontmatter, se le entrega a la sesión como
instrucción. Una nota dirigida a nosotros ahí adentro la lee ella y la confunde. Y no puede vivir
junto a la personalidad: Claude Code toma **todos** los `.md` de `output-styles/` como
personalidades, así que un archivo de notas ahí aparecería en la lista para elegir.
