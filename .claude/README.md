# Índice de `.claude/`

La diferencia entre un agente y una carta está en [`agente-y-carta.md`](agente-y-carta.md).

## Los agentes

| Agente | Modelo | Sus cartas | Qué hace |
|---|---|---|---|
| [`auditor-del-roadmap`](agents/auditor-del-roadmap.md) | opus | `afinar` `leer-en-frio` `cotejar` `juntar` `auditar` | Mide sin sesgo y no toca nada |
| [`desarrollador`](agents/desarrollador.md) | sonnet | `desarrollador` | Implementa con la prueba en el mismo cambio |
| [`qa`](agents/qa.md) | sonnet | `qa` | Cierra por medición, nunca por palabra |
| [`escribano-del-roadmap`](agents/escribano-del-roadmap.md) | sonnet | — | Escribe los hallazgos ya cerrados en `roadmap/` |

Dentro del oficio desarrollador, que se carga como plugin:

| Agente | Modelo | Sus cartas | Qué hace |
|---|---|---|---|
| [`auditor`](oficios/desarrollador/agents/auditor.md) | opus | — | Mide, contra el backlog |
| [`escribano`](oficios/desarrollador/agents/escribano.md) | sonnet | — | Rellena la plantilla del backlog |

## Las cartas

| Carta | Quién la lleva | Para qué momento |
|---|---|---|
| [`afinar`](skills/afinar/SKILL.md) | auditor | Antes de escribir: saca los hallazgos y caza lo que hay que preguntarle al experto |
| [`leer-en-frio`](skills/leer-en-frio/SKILL.md) | auditor | Antes de escribir: leerlos como el que no estuvo |
| [`cotejar`](skills/cotejar/SKILL.md) | auditor | Antes de escribir: contra todo lo que dijo el experto |
| [`juntar`](skills/juntar/SKILL.md) | auditor | Antes de escribir: señalar los que son un mismo problema |
| [`auditar`](skills/auditar/SKILL.md) | auditor | Después de escribir: contra el registro crudo |
| [`desarrollador`](skills/desarrollador/SKILL.md) | desarrollador | Al implementar cualquier cosa |
| [`qa`](skills/qa/SKILL.md) | qa | Al escribir, clasificar o juzgar cualquier prueba |

## Los flujos

| Flujo | Sus fases, en orden |
|---|---|
| [`levanta-el-roadmap`](workflows/levanta-el-roadmap.js) | Sacar · Afinar · Leer en frío · Cotejar · Juntar · Asentar · Auditar |
| [`levanta-el-backlog`](oficios/desarrollador/workflows/levanta-el-backlog.js) | Afinar · Asentar · Auditar |

## Las personalidades de sesión

| Oficio | Archivo |
|---|---|
| consultor | [`output-styles/consultor.md`](oficios/consultor/output-styles/consultor.md) |
| desarrollador | [`output-styles/desarrollador.md`](oficios/desarrollador/output-styles/desarrollador.md) |
