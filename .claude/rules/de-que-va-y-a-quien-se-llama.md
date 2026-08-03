# De qué va esto, y a quién se llama

Nemawashi es un ejecutable de escritorio que envuelve a Claude Code para que un experto de negocio y
una IA construyan juntos el roadmap de un sistema, **sin que el experto vea nunca una terminal.**

## Dónde está cada cosa

| Dónde | Qué hay |
|---|---|
| `product/` | Lo que rige: arquitectura de desarrollo, de diseño, y los módulos |
| `docs/decisions/` | Las decisiones tomadas, una por archivo |
| `design/` | El sistema de diseño y las maquetas de las pantallas |
| `src/` | El código |
| `.claude/` | Los agentes, sus cartas, los flujos y estas reglas. El índice está en su `README.md` |

## A quién se llama

**Cada carta es del agente que la lleva: la carga él, y no se invoca desde fuera.** Si necesitas
saber cómo se hace algo aquí, **llama al agente** — no leas su carta para hacerlo por tu cuenta. La
lista de quién hay y qué carta lleva cada uno vive en [`.claude/README.md`](../README.md), y no se
repite aquí.

**Quien juzga no arregla lo que juzga.** El que escribe código escribe su prueba; el que mide no
escribe código de producción y no dictamina por medición ajena. Si el mismo que hizo el trabajo se
lo aprueba, no queda nadie que lo mida.
