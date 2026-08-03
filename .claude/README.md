# Índice de `.claude/`

La diferencia entre un agente y una carta está en [`agente-y-carta.md`](agente-y-carta.md).

## Los agentes

| Agente | Modelo | Qué hace |
|---|---|---|
| [`auditor`](agents/auditor.md) | opus | Mide sin sesgo y no toca nada |
| [`escribano`](agents/escribano.md) | sonnet | Escribe lo ya cerrado, donde su carta le marque |
| [`desarrollador`](agents/desarrollador.md) | sonnet | Implementa con la prueba en el mismo cambio |
| [`qa`](agents/qa.md) | sonnet | Cierra por medición, nunca por palabra |

El auditor y el escribano no declaran cartas en su fichita: quien los llama les dice cuál cargar.

## Las cartas

| Carta | Quién la lleva | Para qué momento |
|---|---|---|
| [`afinar`](skills/afinar/SKILL.md) | auditor | Antes de escribir: saca los hallazgos y caza lo que hay que preguntarle al experto |
| [`leer-en-frio`](skills/leer-en-frio/SKILL.md) | auditor | Antes de escribir: leerlos como el que no estuvo |
| [`cotejar`](skills/cotejar/SKILL.md) | auditor | Antes de escribir: contra todo lo que dijo el experto |
| [`juntar`](skills/juntar/SKILL.md) | auditor | Antes de escribir: señalar los que son un mismo problema |
| [`auditar`](skills/auditar/SKILL.md) | auditor | Después de escribir: contra el registro crudo |
| [`asentar`](skills/asentar/SKILL.md) | escribano | Al escribir cualquier ítem o documento del roadmap |
| [`afinar-el-backlog`](skills/afinar-el-backlog/SKILL.md) | auditor | Antes de escribir: las cinco fallas de una tarea candidata |
| [`auditar-el-backlog`](skills/auditar-el-backlog/SKILL.md) | auditor | Después de escribir: contra el registro crudo |
| [`asentar-el-backlog`](skills/asentar-el-backlog/SKILL.md) | escribano | Al escribir cualquier tarea o documento del backlog |
| [`desarrollador`](skills/desarrollador/SKILL.md) | desarrollador | Al implementar cualquier cosa |
| [`qa`](skills/qa/SKILL.md) | qa | Al escribir, clasificar o juzgar cualquier prueba |

Las tres del backlog no tienen flujo que las llame hoy: el suyo se dio de baja con el oficio
desarrollador.

## Los flujos

| Flujo | Sus fases, en orden |
|---|---|
| [`levanta-el-roadmap`](workflows/levanta-el-roadmap.js) | Sacar · Afinar · Leer en frío · Cotejar · Juntar · Asentar · Auditar |

## Las personalidades de sesión

| Oficio | Archivo |
|---|---|
| consultor | [`output-styles/consultor.md`](oficios/consultor/output-styles/consultor.md) |
| sin dev | [`output-styles/sin-dev.md`](output-styles/sin-dev.md) |
