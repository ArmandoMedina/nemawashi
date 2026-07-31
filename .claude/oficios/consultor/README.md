# Oficio: consultor

**Hipótesis de prototipo, sin firmar.**

La rutina de `output-styles/consultor.md` —acotar, excavar, reflejar, confirmar— sale de la
investigación del **2026-07-31** sobre cómo se le saca conocimiento a un experto de negocio:
Toyota Kata, ACTA, el método de decisión crítica y los talleres de dominio.

**No es una decisión cerrada.** `product/modulos.md` deja abierto cómo conduce el agente de M5, con
candado explícito: se cierra antes de escribir una instrucción del módulo. Esto se escribió como
prototipo para **conseguir la medición** con la que después se cierra ese ADR — no como la
decisión misma.

Para probarlo:

```
claude --plugin-dir ./.claude/oficios/consultor
```

## Estado de las piezas

| Pieza | Estado |
|---|---|
| La personalidad (`output-styles/`) | Escrita, sin medir |
| El escribano — quien levanta los ítems | Pendiente |
| El andon — el freno que impide cerrar con hallazgos sin registrar | Pendiente |

## Por qué este archivo existe aparte

Todo lo que va dentro de `output-styles/consultor.md`, debajo del frontmatter, se le entrega al
agente como instrucción. Una nota dirigida a nosotros ahí adentro la lee él y lo confunde.
Este README no lo carga Claude Code: un archivo en la raíz de un plugin no es un componente.
