---
tipo: recursos
estado: vigente
---
# Todo lo que Claude Code deja configurar — Nemawashi

> **El inventario completo de perillas que cambian el comportamiento de la IA, y cuáles
> cubre hoy la consola de parámetros.** No para meterlas todas, sino para que ninguna se
> quede fuera por olvido en vez de por decisión.

## Por qué existe este documento

La consola de parámetros se diseñó a partir de lo que se recordaba que Claude Code permite.
Eso deja dos clases de error, y las dos ya aparecieron: perillas que existen y nadie puso, y
perillas que se declararon imposibles sin serlo. Un hueco decidido se planea; un hueco por
olvido se descubre en producción.

**Fuentes barridas:** `settings`, `env-vars`, `cli-reference`, `output-styles`, `memory`,
`context-window`, `sub-agents` de la documentación oficial, más `claude --help` de la versión
instalada.

**Qué se dejó fuera a propósito:** pasarelas corporativas, proveedores en la nube,
telemetría, credenciales, actualizaciones, colores y accesibilidad. Nada de eso cambia cómo
se comporta la IA frente al experto.

## Cómo leer el estado

| Marca | Significa |
|---|---|
| **está** | La maqueta ya tiene campo |
| **falta** | Existe en Claude Code y la maqueta no lo menciona |
| **falso** | La maqueta lo declara «no disponible» y sí se puede |

## Dónde se pone cada cosa

El ejecutable arranca Claude Code, así que puede escribir las cuatro:

| Dónde | Cómo llega |
|---|---|
| settings | Un `settings.json` que el ejecutable escribe y pasa con `--settings` |
| entorno | Variable de entorno del proceso que se lanza |
| bandera | Argumento en la línea de comandos |
| archivo | Un `.md` en `.claude/` — cartas, agentes, estilos, reglas |
| comando | Se teclea dentro de la sesión |

---

## Motor

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `model` · `--model` · `ANTHROPIC_MODEL` | settings · bandera · entorno | Qué modelo atiende la sesión | está |
| `fallbackModel` · `--fallback-model` | settings · bandera | A cuál se cambia si el primero no está | está |
| `FALLBACK_FOR_ALL_PRIMARY_MODELS` | entorno | Extiende el respaldo a cualquier proveedor | falta |
| `effortLevel` · `--effort` · `CLAUDE_CODE_EFFORT_LEVEL` | settings · bandera · entorno | Cuánto piensa antes de contestar | está |
| `CLAUDE_CODE_ALWAYS_ENABLE_EFFORT` | entorno | Manda el esfuerzo en cada petición, con modelos propios | falta |
| `availableModels` + `enforceAvailableModels` | settings | Cierra la lista de modelos elegibles | está |
| `alwaysThinkingEnabled` | settings | Razonamiento extendido siempre prendido | está |
| `MAX_THINKING_TOKENS` | entorno | En `0` apaga el razonamiento extendido | está |
| `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING` | entorno | Presupuesto fijo de pensamiento en vez de decidirlo turno por turno | está |
| `CLAUDE_CODE_DISABLE_1M_CONTEXT` | entorno | Apaga la ventana de un millón | falta |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | entorno | Largo máximo de cada respuesta | está |
| `API_TIMEOUT_MS` | entorno | Cuánto espera al servidor. De fábrica 600000 | está |
| `API_FORCE_IDLE_TIMEOUT` | entorno | Cambia el corte de cinco minutos sin datos | falta |
| `--advisor` · `advisorModel` · `CLAUDE_CODE_DISABLE_ADVISOR_TOOL` | bandera · settings · entorno | Un segundo modelo que aconseja al principal | falta |

**Lo que más pesa:** cerrar la lista de modelos. Sin eso, nada impide que una entrevista con
un experto corra en el modelo más barato.

---

## Instrucciones

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `--append-system-prompt` · `--append-system-prompt-file` | bandera | Suma a las instrucciones de fábrica | está |
| `--system-prompt` · `--system-prompt-file` | bandera | Reemplaza las instrucciones de fábrica completas | está |
| `outputStyle` + `.claude/output-styles/*.md` | settings · archivo | **La personalidad de la sesión.** Es lo que hace que sea consultor y no programador | está |
| `--append-subagent-system-prompt` | bandera | Un texto que se le suma a **cada** subagente | está |
| `.claude/rules/*.md` con `paths:` | archivo | Instrucciones que sólo entran al tocar ciertos archivos | está |
| `claudeMdExcludes` | settings | Salta CLAUDE.md por ruta, sin apagar frenos, cartas ni paquete | está |
| `claudeMd` | settings | Mete las reglas dentro del settings, sin archivo aparte. La maqueta usa la via de archivo; esta es la alterna | falta |
| `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD` | entorno | Carga también las reglas de las carpetas extra | falta |
| `--exclude-dynamic-system-prompt-sections` | bandera | Saca los datos de máquina del prompt de sistema | falta |

**Corregido el 2026-08-03.** Los dos «no disponible» que había aquí tenían motivo falso y se
borraron de la maqueta: `claudeMdExcludes` salta las reglas del repositorio por ruta sin tocar
frenos, instructivos ni paquete, y el estilo de salida inyecta instrucciones sin escribir nada
en el repo del cliente. Sólo las reglas que impone la organización siguen sin poderse saltar.

---

## Agentes

Cada agente es un `.md` en `.claude/agents/`. Estos son todos sus campos. Hoy la maqueta sólo
prende, apaga y edita.

| Nombre | Qué hace | Estado |
|---|---|---|
| `name` | Cómo se llama. Los frenos lo reciben como `agent_type` | está |
| `description` | Cuándo delegarle | está |
| `tools` | Lista blanca de herramientas | está |
| `disallowedTools` | Lista negra. Se aplica antes que `tools` | está |
| `model` | Su modelo: `opus`, `sonnet`, `haiku`, `fable`, `inherit` | está |
| `effort` | Cuánto piensa él, aparte de la sesión | está |
| `permissionMode` | Su propio modo de permisos | está |
| `maxTurns` | Tope de vueltas antes de rendirse | está |
| `skills` | Cartas precargadas desde el arranque, con su contenido completo | está |
| `memory` | Memoria propia: `user`, `project` o `local` | está |
| `background` | `true` = siempre corre de fondo | está |
| `isolation` | `worktree` = copia aislada del repositorio | está |
| `mcpServers` | Qué fuentes externas ve él | falta |
| `hooks` | Frenos que sólo aplican a él | falta |
| `initialPrompt` | Primer mensaje automático si corre como sesión principal | está |
| `color` | Su color en la lista de tareas | falta |
| `--agents` | *(bandera)* Define agentes en JSON al arrancar, sin archivo | falta |
| `--agent` · `agent` | *(bandera · settings)* Corre la sesión entera como ese agente | falta |
| `CLAUDE_CODE_SUBAGENT_MODEL` | *(entorno)* Un modelo para todos los subagentes de golpe | falta |
| `--forward-subagent-text` | *(bandera)* Deja ver lo que el subagente va pensando | falta |
| `disableAgentView` · `CLAUDE_CODE_DISABLE_AGENT_VIEW` | *(settings · entorno)* Apaga los agentes de fondo | falta |

**Ojo con dos:** `tools` es lo que garantiza que el auditor no pueda escribir — hoy eso vive
en la palabra del agente, no en una regla. Y un subagente de fondo pierde herramientas que sí
tendría en primer plano, así que la misma definición no se comporta igual en los dos lados.

---

## Cartas e instructivos

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `disable-model-invocation` | archivo | La carta sólo arranca si la invoca una persona, y no ocupa contexto | falta |
| `disableBundledSkills` · `CLAUDE_CODE_DISABLE_BUNDLED_SKILLS` | settings · entorno | Apaga las cartas que vienen de fábrica | falta |
| `--disable-slash-commands` | bandera | Apaga todas las cartas y comandos | falta |
| `disableSkillShellExecution` | settings | Prohíbe que una carta corra comandos | falta |
| Cargar durante la sesión | — | El interruptor que ya tiene la maqueta | está |

---

## Flujos

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `disableWorkflows` · `CLAUDE_CODE_DISABLE_WORKFLOWS` | settings · entorno | Apaga los flujos dinámicos | falta |

---

## Permisos

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `--permission-mode` | bandera | `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`, `manual` | está |
| `permissions.allow` · `deny` · `ask` | settings | La matriz de qué se puede y qué no | está |
| `additionalDirectories` · `--add-dir` | settings · bandera | Otras carpetas que puede tocar | está |
| `autoMode.allow` · `soft_deny` · `hard_deny` · `environment` | settings | Las reglas del clasificador que decide cuándo preguntar | falta |
| `autoMode.classifyAllShell` | settings | Manda **todos** los comandos por el clasificador | falta |
| `disableAutoMode` | settings | Prohíbe que se active el modo automático | falta |
| `allowManagedPermissionRulesOnly` | settings | Sólo valen las reglas de la organización | falta |
| `--permission-prompt-tool` | bandera | Quién contesta los permisos cuando no hay nadie mirando | falta |
| `sandbox.enabled` | settings | Aísla la ejecución | falta |

**Lo que falta de verdad aquí:** la maqueta ofrece «Decide solo cuándo vale la pena
preguntar», pero no deja tocar **con qué criterio** decide. Ese criterio es configurable.

---

## Herramientas

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `--tools` · `--allowedTools` · `--disallowedTools` | bandera | Qué herramientas existen en la sesión | está |
| `BASH_DEFAULT_TIMEOUT_MS` | entorno | Cuánto puede tardar un comando. De fábrica 120000 | falta |
| `BASH_MAX_TIMEOUT_MS` | entorno | El máximo que la IA puede pedir. De fábrica 600000 | falta |
| `BASH_MAX_OUTPUT_LENGTH` | entorno | Cuánto texto acepta de vuelta antes de mandarlo a archivo | falta |
| `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` | entorno | Vuelve a la carpeta del proyecto tras cada comando | falta |
| `defaultShell` | settings | `bash` o `powershell` para los comandos con `!` | falta |
| `ENABLE_TOOL_SEARCH` · `CLAUDE_CODE_DISABLE_TOOL_SEARCH` | entorno | Si carga las herramientas externas de golpe o a demanda | falta |
| `CLAUDE_CODE_DISABLE_ATTACHMENTS` | entorno | Apaga el procesamiento de adjuntos | falta |
| `disableArtifact` · `enableArtifact` · `CLAUDE_CODE_ARTIFACT_AUTO_OPEN` | settings · entorno | La herramienta de publicar páginas, y si abre el navegador sola | falta |
| `--chrome` · `--no-chrome` · `browserExternalPageTools` · `disableBrowserExternalNavigation` | bandera · settings | El navegador y hasta dónde puede salir | está a medias |
| `disableMobileSimulatorTools` | settings | Bloquea el simulador de iOS | falta |
| `CLAUDE_AUTO_BACKGROUND_TASKS` | entorno | Manda las tareas largas al fondo solo | está |

**Los tres de `BASH_`** son los que evitan que un comando atorado se coma la sesión frente al
experto. Ninguno tiene campo hoy.

---

## Frenos

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `hooks` | settings · archivo | Los frenos por momento del ciclo | está |
| `disableAllHooks` | settings | Apaga todos los frenos y la línea de estado | falta |
| `allowManagedHooksOnly` | settings | Sólo los frenos de la organización | falta |
| `allowedHttpHookUrls` | settings | A qué direcciones puede llamar un freno | falta |

---

## Contexto — sección que no existe

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `autoCompactEnabled` | settings | Resume la plática al acercarse al límite. **Prendido de fábrica** | está |
| `DISABLE_AUTO_COMPACT` | entorno | Lo mismo, por variable | falta |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | entorno | A qué porcentaje resume, de 1 a 100 | está |
| `CLAUDE_CODE_AUTO_COMPACT_WINDOW` | entorno | Con qué capacidad hace la cuenta | está |
| `/compact <instrucciones>` | comando | Resumir a mano diciendo qué conservar | falta |

**No rompe el molino.** El molino lee el `.jsonl` de disco, y ahí está todo aunque el
contexto se haya resumido. Lo que sí cambia es **lo que la IA recuerda a media entrevista**:
al resumir se repone el prompt de sistema, las reglas, la memoria y las fuentes externas —
pero del listado de cartas sólo sobreviven las que ya se usaron.

---

## Memoria — sección que no existe

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `autoMemoryEnabled` | settings | Que aprenda de una sesión a otra. **Prendido de fábrica** | está |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | entorno | Lo mismo, por variable | está |
| `autoMemoryDirectory` | settings | Dónde se guarda lo aprendido | está |
| `memory` en un agente | archivo | Memoria propia de ese agente | está |
| `/memory` | comando | Ver y editar lo guardado | falta |

**Corregido el 2026-08-03.** El «no disponible» que había aquí tenía motivo falso y se borró de
la maqueta: `autoMemoryEnabled: false` lo apaga por proyecto y no toca nada más.

---

## La espera del experto — sección que no existe

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `CLAUDE_AFK_TIMEOUT_MS` | entorno | Cuánto espera sin respuesta antes de seguir solo | está |
| `CLAUDE_AFK_COUNTDOWN_MS` | entorno | Cuándo aparece la cuenta regresiva en pantalla | está |
| `askUserQuestionTimeout` | settings | Lo mismo desde settings. De fábrica `"never"` | está |

Un experto pensando tarda, y tarda distinto que un programador. Estos tres números deciden si
la sesión lo espera o lo atropella, y hoy nadie los decidió.

---

## Deshacer — sección que no existe

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `fileCheckpointingEnabled` | settings | Guarda puntos de retorno. **Prendido de fábrica** | está |
| `CLAUDE_CODE_DISABLE_FILE_CHECKPOINTING` | entorno | Lo mismo, por variable | falta |
| `/rewind` | comando | Devuelve los archivos a como estaban | falta |
| `cleanupPeriodDays` | settings | Cuántos días se guardan las sesiones. De fábrica 30 | está |

---

## Fuentes de configuración

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `--setting-sources` | bandera | De qué archivos lee: `user`, `project`, `local` | está |
| `--settings` | bandera | Un settings propio que manda sobre los demás | está |
| `--mcp-config` · `--strict-mcp-config` | bandera | Fuentes externas propias, y sólo ésas | está |
| `--plugin-dir` · `--plugin-url` | bandera | Carga un plugin sólo para esta sesión | falta |
| `disableSideloadFlags` | settings | Prohíbe que se metan plugins y agentes por bandera | falta |

---

## Fuentes externas

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `allowedMcpServers` · `deniedMcpServers` | settings | Lista blanca y negra de fuentes | está a medias |
| `enabledMcpjsonServers` · `disabledMcpjsonServers` | settings | Aprobar o rechazar las del proyecto, una por una | falta |
| `enableAllProjectMcpServers` | settings | Aprueba todas las del proyecto sin preguntar | falta |
| `disableClaudeAiConnectors` · `allowAllClaudeAiMcps` | settings | Las conexiones que vienen de claude.ai | falta |

---

## Arranque limpio — sección que no existe

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `--bare` | bandera | Arranca sin descubrir nada: ni frenos, ni plugins, ni memoria, ni CLAUDE.md del cliente | está |
| `--safe-mode` | bandera | Todo lo personalizado apagado, para saber si lo que rompe es tuyo | está |

**Corregido el 2026-08-03.** `--bare` fue la respuesta directa a los dos «no disponible» sobre
reglas del cliente, y ya es la sección «Arranque limpio» de la maqueta. Apaga el descubrimiento
automático completo y luego lo propio se mete por `--system-prompt`, `--add-dir`, `--settings`,
`--agents` y `--plugin-dir`. Es más ancho de lo que se pedía, pero existe.

---

## Tope

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `maxTurns` en un agente | archivo | Tope de vueltas de un subagente | está |
| Tope de gasto por sesión | — | **Verificado el 2026-08-03: no existe.** Lo único que hay en Claude Code es el límite de gasto **de la cuenta**, del lado del servidor (`spendLimitCents`, `usedCents`). No hay forma de acotar una sesión. Si Nemawashi lo ofrece, lo cuenta el ejecutable y corta él | no disponible |

---

## Lo que hay que hacer con esto

Hecho el 2026-08-03 en la maqueta de la consola, con los nombres verificados uno por uno contra
el ejecutable instalado:

1. **Los tres «no disponible» se borraron.** Los tres tenían motivo falso. En su lugar quedó el
   único hueco que sí se sostiene: el tope de gasto por sesión.
2. **El estilo de salida entró en Instrucciones** como «Oficio de la sesión».
3. **Se abrieron cinco secciones:** memoria de la plática, lo que aprende, la espera del
   experto, deshacer y arranque limpio.
4. **La ficha del agente creció** con herramientas negadas, su modo de permisos, si corre de
   fondo, si va en su propia copia y su memoria propia.

Lo que queda pendiente, y por qué:

- **La ventana de un millón** no tiene interruptor propio: en la maqueta se elige como parte del
   modelo, y un segundo control diría lo mismo dos veces.
- **Los frenos y las fuentes externas por agente** (`hooks`, `mcpServers`) no se abrieron: ya
   existen como secciones globales, y meterlos también dentro de cada agente son dos lugares
   donde cabe la misma regla.
- **El color del agente** se dejó fuera, como todo lo cosmético.
- **El tope de gasto** sigue en la maqueta con su aviso: no lo pone Claude Code, lo tendría que
   contar el ejecutable. Esa decisión no está tomada.
