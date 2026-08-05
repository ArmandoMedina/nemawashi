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

**Cómo se levantó, en dos pasadas.** La primera leyó seis páginas de la documentación oficial.
La segunda mandó tres auditorías con ángulos que no se cruzan: las catorce páginas que la
primera no leyó, el ejecutable instalado, y una revisión adversaria cuyo encargo era **tumbar**
las conclusiones de la primera. Tumbó tres. Lo que sigue ya pasó por esa criba.

**Qué se dejó fuera a propósito:** pasarelas corporativas, proveedores en la nube, telemetría,
credenciales, actualizaciones, colores y accesibilidad. Nada de eso cambia cómo se comporta la
IA frente al experto.

**Versión medida:** Claude Code 2.1.220, en la máquina de desarrollo.

## Cómo leer el estado

| Marca | Significa |
|---|---|
| **está** | La maqueta ya tiene campo |
| **falta** | Existe en Claude Code y la maqueta no lo menciona |
| **no existe** | Hace falta y Claude Code no lo da |
| **⚠ sólo -p** | Sólo funciona en modo programático. Nemawashi corre ahí, así que sirve — pero no en una terminal |
| **[sin confirmar]** | El nombre existe en el ejecutable; su efecto no se verificó |

## Dónde se pone cada cosa

El ejecutable arranca Claude Code, así que puede escribir las cinco:

| Dónde | Cómo llega |
|---|---|
| settings | Un `settings.json` que el ejecutable escribe y pasa con `--settings` |
| entorno | Variable de entorno del proceso que se lanza |
| bandera | Argumento en la línea de comandos |
| archivo | Un `.md` en `.claude/` — cartas, agentes, estilos, reglas |
| comando | Se teclea dentro de la sesión |

---

# Dos advertencias antes de cualquier campo

## 1 · Una clave mal escrita no falla: se ignora

**El esquema de settings termina en `.passthrough()`** — tres veces, sin un solo `strict`.
Es la instrucción de «lo que no reconozcas, déjalo pasar». Comprobado: pasarle
`{"clavequenoexiste": false}` arranca sin advertencia, sin error y sin nada en el registro.

Nemawashi genera su `settings.json` con código. Si alguien escribe `autoMemoryEnable` sin la
`d` final, **la consola mostrará el interruptor apagado y la sesión correrá con la memoria
prendida**. Nadie se entera.

**Y una tercera, peor que las dos:** algunas claves conocidas llevan `.catch(void 0)` en su
esquema. Eso convierte **un valor inválido en una clave válida** en «no puesta», también en
silencio. Confirmado en `askUserQuestionTimeout`:

```js
askUserQuestionTimeout: v.enum(["60s","5m","10m","never"]).optional().catch(void 0)
```

Escribir `"5min"` en vez de `"5m"` no falla ni avisa: la clave simplemente deja de existir. **Ni
siquiera se puede distinguir de una clave inventada**, porque las dos se comportan igual.

**Consecuencia:** toda perilla que Nemawashi escriba necesita una prueba que mida **el
comportamiento resultante**, no que el archivo se haya escrito. Escribir el archivo siempre
funciona; ése es el problema. **El nombre puede estar mal, el valor puede estar mal, y las tres
fallas se ven idénticas: nada.**

### El patrón, más allá de la configuración

La auditoría encontró **tres fallas mudas del mismo tipo**, y ninguna avisa por la salida
estándar:

| Qué falla | Cómo se entera hoy Nemawashi |
|---|---|
| Una clave o un valor mal escritos | No se entera |
| El listado de cartas truncado | **No se entera** — el aviso va al registro de depuración, comprobado en las corridas donde el recorte sí ocurrió |
| El molino detenido en la compuerta de permiso | No se entera — devuelve un texto, no un error |

**Si Nemawashi va a correr desatendido frente a un experto, ése es el patrón que hay que
vigilar con frenos, no con esperanza.** Los tres se detectan; ninguno se anuncia.

La lista real de claves que el ejecutable reconoce está extraída y guardada — es la única
defensa posible. Se sacó de una ventana del esquema: sirve como lista de verificación, **no
garantiza ser exhaustiva**.

## 2 · Excluir no es prohibir

`claudeMdExcludes` saca las reglas del cliente del **contexto de arranque**. No impide que el
modelo abra el archivo con `Read` y las obedezca igual — y **lo hace sin que nadie se lo pida**:
en las pruebas, ante una pregunta cualquiera, fue por su cuenta a buscar el `.claude/CLAUDE.md`
del repositorio y siguió su instrucción.

| Configuración | Resultado medido |
|---|---|
| `claudeMdExcludes` solo | **las obedeció** |
| `claudeMdExcludes` + `permissions.deny` sobre `Read` | denegado, los dos archivos |

**Ignorar las reglas del repositorio necesita dos perillas, no una.** Con sólo la primera, la
sesión arranca limpia y **se contamina en cuanto explora el repositorio** — que es exactamente
lo que hace un consultor levantando un roadmap.

Cuidado con el efecto colateral: la negación bloquea `.claude/` completo. La regla hay que
escribirla apuntando al repositorio del cliente, no a `.claude/` en abstracto.

---

## Motor

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `model` · `--model` · `ANTHROPIC_MODEL` | settings · bandera · entorno | Qué modelo atiende la sesión | está |
| `fallbackModel` · `--fallback-model` ⚠ sólo -p | settings · bandera | A cuál se cambia si el primero no está | está |
| `FALLBACK_FOR_ALL_PRIMARY_MODELS` | entorno | Extiende el respaldo a cualquier proveedor | falta |
| `effortLevel` · `--effort` · `CLAUDE_CODE_EFFORT_LEVEL` | settings · bandera · entorno | Cuánto piensa antes de contestar | está |
| `CLAUDE_CODE_ALWAYS_ENABLE_EFFORT` | entorno | Manda el esfuerzo en cada petición, con modelos propios | falta |
| `availableModels` + `enforceAvailableModels` | settings | Cierra la lista de modelos elegibles | está |
| `alwaysThinkingEnabled` | settings | Razonamiento extendido siempre prendido | está |
| `--thinking <modo>` | bandera oculta | `enabled` (adaptativo) o `disabled` | falta |
| `--thinking-display <modo>` | bandera oculta | Cómo aparece el pensamiento en la respuesta | falta |
| `MAX_THINKING_TOKENS` · `--max-thinking-tokens` | entorno · bandera | En `0` apaga el razonamiento. **La bandera está marcada deprecada** en favor de `--thinking` | está |
| `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING` | entorno | Presupuesto fijo en vez de decidirlo turno por turno | está |
| `showThinkingSummaries` | settings | Sin esto, en sesiones interactivas el razonamiento llega censurado | falta |
| `ultracode` | settings · `--effort` · `/effort` | `xhigh` **más** orquestación permanente de flujos dinámicos | falta |
| `ultrathink` | dentro del mensaje | Pide razonamiento más profundo ese turno. **«think», «think hard» y «think more» no hacen nada** | falta |
| `switchModelsOnFlag` | settings | «Cuando los salvaguardas marcan un mensaje, cambia solo de modelo para seguir platicando; apagado, la sesión se detiene» | falta |
| `CLAUDE_CODE_DISABLE_1M_CONTEXT` | entorno | Apaga la ventana de un millón | falta |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | entorno | Largo máximo de cada respuesta | está |
| `CLAUDE_CODE_MAX_CONTEXT_TOKENS` | entorno | Tope de contexto | falta |
| `API_TIMEOUT_MS` | entorno | Cuánto espera al servidor. De fábrica 600000 | está |
| `API_FORCE_IDLE_TIMEOUT` | entorno | Cambia el corte de cinco minutos sin datos | falta |
| `ANTHROPIC_SMALL_FAST_MODEL` | entorno | Qué modelo chico atiende las tareas de fondo | falta |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` · `_OPUS_MODEL` · `_FABLE_MODEL` | entorno | Remapean a qué apuntan los alias de modelo | falta |
| `ANTHROPIC_CUSTOM_MODEL_OPTION` (+`_NAME`,`_DESCRIPTION`) | entorno | Agrega una entrada propia al selector | falta |
| `--advisor` · `/advisor` · `advisorModel` · `CLAUDE_CODE_DISABLE_ADVISOR_TOOL` | bandera oculta · comando · settings · entorno | Un segundo modelo que aconseja al principal en los momentos clave | falta |
| `fastMode` · `fastModePerSessionOptIn` · `CLAUDE_CODE_DISABLE_FAST_MODE` · `/fast` | settings · entorno · comando | Opus 2.5× más veloz y más caro. **`fastMode` persiste entre sesiones** | falta |

**Letra chica de precedencia del esfuerzo:** variable de entorno > nivel configurado > fábrica
del modelo. El `effort` de un agente gana sobre la sesión pero **no sobre la variable**. Y
`effortLevel` en settings gestionado **no es obligatorio**: es un valor inicial que el usuario
puede cambiar.

**`--effort` acepta `max`; la clave `effortLevel` no** — su enumeración es `low`, `medium`,
`high`, `xhigh`.

---

## Instrucciones

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `--append-system-prompt` · `--append-system-prompt-file` | bandera *(la de archivo está oculta)* | Suma a las instrucciones de fábrica | está |
| `--system-prompt` · `--system-prompt-file` | bandera *(la de archivo está oculta)* | Reemplaza las instrucciones de fábrica completas | está |
| `outputStyle` + `.claude/output-styles/*.md` | settings · archivo | **La personalidad de la sesión.** Es lo que hace que sea consultor y no programador | está |
| `--append-subagent-system-prompt` · `appendSubagentSystemPrompt` ⚠ sólo -p | bandera oculta · settings | Un texto que se le suma a **cada** subagente. **Exige además `CLAUDE_CODE_ENABLE_APPEND_SUBAGENT_PROMPT=1`** | está |
| `criticalSystemReminder_EXPERIMENTAL` | settings | «Recordatorio crítico añadido al prompt de sistema» | falta |
| **`includeGitInstructions`** | settings | **De fábrica `true`.** Mete las instrucciones de commit y PR en el prompt — **medido: 195 tokens**. Una sesión con un experto de negocio hoy las lleva sin que nadie lo decidiera. Funciona por `--settings`. Sólo entran si hay herramienta de shell | falta |
| `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS` | entorno | Lo mismo por variable, **invertida**: en `0` **fuerza que entren aunque el settings diga `false`** | falta |
| `planModeInstructions` · `--plan-mode-instructions` | settings · bandera oculta | **Reemplaza el cuerpo del flujo de modo plan.** Conserva el preámbulo de sólo-lectura y el protocolo de salida | falta |
| `--plan-mode-required` | bandera oculta | Exige modo plan antes de implementar | falta |
| `.claude/rules/*.md` con `paths:` | archivo | Instrucciones que sólo entran al tocar ciertos archivos | está |
| `claudeMdExcludes` | settings | Salta CLAUDE.md y `.claude/rules/` por ruta. **Ver la advertencia 2: excluir no es prohibir** | está |
| `CLAUDE_CODE_DISABLE_CLAUDE_MDS` | entorno | Apaga la carga de **todos** los CLAUDE.md de golpe | falta |
| `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD` | entorno | Carga también las reglas de las carpetas de `--add-dir`. **De fábrica no se cargan** | falta |
| **`CLAUDE_CODE_SIMPLE_SYSTEM_PROMPT`** | entorno | **De fábrica ya está activo: el prompt que hoy recibe la sesión es el corto.** Ponerla en `0` mete uno **12 235 tokens más grande** — casi la mitad del prompt actual. **Es la perilla de contexto más pesada del inventario** | falta |
| `claudeMd` · `--managed-settings` | settings gestionado · bandera oculta | Reglas dentro del settings. **Sólo se honra desde settings gestionados o de política.** **Y se quedó sin ruta practicable:** `CLAUDE_CODE_MANAGED_SETTINGS_PATH` no cargó nada, ni apuntando a un directorio ni al archivo, medido contra el control positivo del instrumento | no practicable |
| `--exclude-dynamic-system-prompt-sections` | bandera | Saca los datos de máquina del prompt de sistema | falta |
| `instructions` de un servidor MCP | código del canal | **Ese texto se suma al prompt de sistema.** Vía de inyección por la puerta de atrás | falta |

**Corregido el 2026-08-03.** Los dos «no disponible» de la maqueta tenían motivo falso y se
borraron. Probado con ocho corridas: `claudeMdExcludes` **sí funciona sobre el directorio de
trabajo propio**, no sólo sobre carpetas ancestro, y `--add-dir` **no arrastra** el `CLAUDE.md`
de la carpeta que agregas. Nemawashi puede abrir la raíz del repositorio del cliente como
siempre. Lo que hay que sumarle es la segunda perilla de la advertencia 2.

**Nota sobre `claudeMd`:** una versión anterior de este documento lo daba como ruta viable. No
lo es — sólo funciona desde settings gestionados, que es justo lo contrario de lo que promete
el producto.

---

## Agentes

Cada agente es un `.md` en `.claude/agents/`.

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
| `initialPrompt` | Primer mensaje automático si corre como sesión principal | está |
| `mcpServers` · `hooks` · `color` | Fuentes propias, frenos propios, color | falta *(decisión tomada: fuera)* |
| `--agents` | *(bandera)* Define agentes en JSON al arrancar, sin archivo | falta |
| `--agent` · `agent` | *(bandera · settings)* Corre la sesión entera como ese agente | falta |
| `CLAUDE_CODE_SUBAGENT_MODEL` | *(entorno)* Un modelo para todos los subagentes de golpe | falta |
| `--forward-subagent-text` ⚠ sólo -p | *(bandera)* Deja ver lo que el subagente va pensando | falta |
| `disableAgentView` · `CLAUDE_CODE_DISABLE_AGENT_VIEW` | *(settings · entorno)* Apaga los agentes de fondo | falta |
| `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` | *(entorno)* Cuántos a la vez. **De fábrica 20** | falta |
| `CLAUDE_CODE_MAX_SUBAGENTS_PER_SESSION` | *(entorno)* **De fábrica 200** | falta |
| `--agent-type` · `--agent-name` · `--agent-color` · `--agent-id` · `--team-name` | *(banderas ocultas)* Compañeros de equipo | falta |

**Los nombres exactos de las herramientas**, que es lo que hace que `tools` sea una regla y no
una promesa:

`Agent` · `Artifact` · `AskUserQuestion` · `Bash` · `CronCreate` · `CronDelete` · `CronList` ·
`Edit` · `EndConversation` · `EnterPlanMode` · `EnterWorktree` · `ExitPlanMode` ·
`ExitWorktree` · `Glob` · `Grep` · `ListMcpResourcesTool` · `LSP` · `Monitor` · `NotebookEdit`
· `PowerShell` · `PushNotification` · `Read` · `ReadMcpResourceTool` · `RemoteTrigger` ·
`ReportFindings` · `ScheduleWakeup` · `SendMessage` · `SendUserFile` · `ShareOnboardingGuide` ·
`Skill` · `TaskCreate` · `TaskGet` · `TaskList` · `TaskOutput` · `TaskStop` · `TaskUpdate` ·
`TodoWrite` · `ToolSearch` · `WaitForMcpServers` · `WebFetch` · `WebSearch` · `Workflow` ·
`Write`

Los cuatro que deciden si una sesión de Nemawashi funciona: **`AskUserQuestion`** (es *la*
herramienta con la que la IA le pregunta al experto), **`Skill`**, **`Workflow`** y
**`Monitor`**.

**`Agent(NombreDelAgente)`** en `permissions.deny` prohíbe un agente concreto — así se apaga
`Explore` o uno propio.

### Tres trampas

1. **Los agentes `Explore` y `Plan` de fábrica no leen el CLAUDE.md.** Los propios sí. Lo
   crítico para un agente de Nemawashi va en el cuerpo de su archivo, que es su prompt de
   sistema.
2. **Un subagente de fondo pierde herramientas** que sí tendría en primer plano. La misma
   definición no se comporta igual en los dos lados.
3. **`EndConversation` no se puede bloquear** con regla `deny` ni con `disallowedTools`
   mientras quede otra herramienta.

### La segunda consola que nadie contempló

**`claude agents`** acepta `--agent`, `--model`, `--effort`, `--permission-mode`, `--settings`,
`--setting-sources`, `--mcp-config`, `--plugin-dir` y `--add-dir` **como valores por omisión de
toda sesión despachada desde la vista de agentes**. Es una segunda consola de parámetros, con
su propia configuración, que la maqueta no considera.

---

## Cartas e instructivos

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| **`skillOverrides`** | settings | **Prende, apaga u oculta cualquier carta sin tocar su archivo.** Cuatro valores: `on`, `name-only`, `user-invocable-only`, `off` | falta |
| `Skill(nombre)` · `Skill(nombre *)` · `Skill` | permisos | Lista blanca o negra de cartas. `Skill` en `deny` las apaga todas | falta |
| **`skillListingBudgetFraction`** | settings | Fracción de la ventana para el listado de cartas. **De fábrica `0.01` — el 1%.** Al pasarse, **las descripciones se recortan en silencio** | falta |
| **`skillListingMaxDescChars`** | settings | Tope por carta. De fábrica `1536`; lo más largo se trunca | falta |
| `SLASH_COMMAND_TOOL_CHAR_BUDGET` | entorno | Presupuesto en caracteres del listado de cartas y comandos | falta |
| `disable-model-invocation` | frontmatter | La carta sólo arranca si la invoca una persona, y no ocupa contexto | falta |
| `user-invocable` | frontmatter | En `false` la esconde del menú `/` | falta |
| `when_to_use` | frontmatter | Frases gatillo, aparte de `description` | falta |
| `allowed-tools` · `disallowed-tools` | frontmatter | Herramientas preaprobadas o **retiradas** mientras esa carta corre | falta |
| `model` · `effort` | frontmatter | Modelo y esfuerzo propios de la carta, sólo ese turno | falta |
| `context: fork` + `agent` + `background` | frontmatter | La carta corre en un subagente aislado | falta |
| `paths` | frontmatter | La carta sólo se carga sola al tocar archivos que casen | falta |
| `arguments` · `argument-hint` · `shell` · `once` | frontmatter | Argumentos con nombre, intérprete, y correr una sola vez por sesión | falta |
| `disableBundledSkills` · `CLAUDE_CODE_DISABLE_BUNDLED_SKILLS` | settings · entorno | Apaga las cartas de fábrica | falta |
| `--disable-slash-commands` | bandera | Apaga todas las cartas y comandos | falta |
| `disableSkillShellExecution` | settings | Prohíbe que una carta corra comandos | falta |
| Cargar durante la sesión | — | El interruptor que ya tiene la maqueta | está |

### Medido contra este repositorio — hoy no trunca

**Once cartas en disco, once en el arranque.** Ninguna descripción recortada: la más larga son
227 caracteres contra un tope de 1 536. Ese tope no muerde ni de lejos.

**El margen, por bisección**, con dos controles positivos que prueban que el medidor ve el
recorte cuando ocurre (`maxDescChars: 40` → −2 298 tokens; `budgetFraction: 0.0005` → −1 018):

| `skillListingBudgetFraction` | ¿muerde? |
|---|---|
| 0.05 (5×) **sin tope por carta** | **no — delta exacto cero contra la base** |
| 0.01 (fábrica) | no |
| 0.005 (mitad) | no |
| **0.002 (un quinto)** | **sí, aquí empieza** |

Con cinco veces el presupuesto no entra ni un token más: **nada estaba esperando afuera.**
Nemawashi puede aproximadamente **doblar su listado de cartas** antes de que muerda.

### Pero el margen no es del repositorio: es de la ventana

El presupuesto es **ventana × fracción**. Esta medición corrió en un modelo de un millón. **En
un modelo de 200 K el mismo 1 % es cinco veces más chico** — justo el orden donde las corridas
mostraron que empieza a recortar.

**Con estas mismas once cartas, este mismo repositorio puede empezar a truncar si se cambia a
un modelo de ventana chica o si `CLAUDE_CODE_DISABLE_1M_CONTEXT` queda puesta.** Deducido de la
fórmula, no medido en 200 K.

### Tres cosas que agravan el día que muerda

1. **Se come primero las cartas de Nemawashi.** El código excluye explícitamente las de fábrica de la lista de candidatos a recorte. El daño cae entero del lado del proyecto.
2. **El aviso no llega.** El binario emite *«descriptions will be truncated… raise `skillListingBudgetFraction`»*, pero va al registro de depuración. **Se buscó en las salidas crudas de las seis corridas, incluidas las dos donde el recorte sí ocurrió: no aparece.** Sin `--debug` o un freno que lo vigile, Nemawashi no se entera.
3. **Los flujos gastan del mismo presupuesto.** `levanta-el-conocimiento` aparece en el listado de cartas aunque sea un `.js`. El molino no es gratis en esta cuenta.

**Nota de método:** el campo `skills` del arranque trae **sólo nombres, no descripciones**. No
sirve para comparar contra el frontmatter; lo que sí sirve es mover los topes y medir si
aparece texto nuevo.

---

## Flujos

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `disableWorkflows` · `enableWorkflows` · `CLAUDE_CODE_DISABLE_WORKFLOWS` | settings · entorno | Apaga o prende los flujos dinámicos | falta |
| **`CLAUDE_CODE_WORKFLOWS`** | entorno | Tercera vía. **De fábrica los flujos están APAGADOS en plan `pro`** — `defaultOn: Ca()!=="pro"` | falta |
| `workflowKeywordTriggerEnabled` | settings | Si una palabra clave puede disparar un flujo | falta |
| `workflowSizeGuideline` | settings | Cuántos agentes se consideran razonables en un flujo | falta |
| `skipWorkflowUsageWarning` | settings | **Mientras no esté puesta, el modo auto pregunta antes de correr un flujo** | falta |
| `CLAUDE_CODE_WORKFLOW_SIZE_WARNING_TOKENS` · `_AGENTS` | entorno | Umbral del aviso de flujo caro. **De fábrica 1 500 000 tokens y 25 agentes.** Con `ultracode` el aviso no se emite | falta |
| `.claude/workflows/` · `~/.claude/workflows/` | archivo | Dónde viven | falta |

### Lo que cuestan, medido

**Los flujos ocupan 7 900 tokens del prompt de sistema — el 30 %.** Medido: apagarlos baja el
prompt de **26 586 a 18 686**, y con ellos se van la herramienta `Workflow` y la carta
`deep-research`. Las tres vías de apagado dan el mismo número exacto.

**El molino de Nemawashi es un `Workflow`**, así que ese bloque viaja en cada petición de cada
entrevista. Es la partida de contexto más cara del inventario.

Y **hay tres formas de que el molino no exista**: `CLAUDE_CODE_WORKFLOWS=0`,
`CLAUDE_CODE_DISABLE_WORKFLOWS=1`, o el derecho de la cuenta. Más el valor de fábrica en plan
`pro`. **No es una perilla que ofrecer: es una que hay que forzar y probar.**

### Decisión tomada — cómo se muestran los valores forzados

Un valor forzado e invisible parece un accidente seis meses después. Uno visible y bloqueado se
explica solo. Por eso:

**Los valores que Nemawashi fuerza se muestran en la consola, bloqueados y con su motivo al
lado.** No basta el campo en gris: el candado impide el cambio por descuido, y el motivo impide
que alguien lo desbloquee sin entender qué rompe. «Fijado: el molino no corre sin esto» dice
más que un campo apagado.

**Y se comprueban al arrancar, midiendo el comportamiento.** Bloquearlo en la pantalla no
impide que alguien lo cambie fuera de la pantalla — la UI comunica la intención, no la impone.
Lo que sí la impone es verificar al iniciar la sesión que la herramienta `Workflow` existe de
verdad y que la grabación se está escribiendo. Así da igual quién tocó qué: se sabe antes de
tener al experto enfrente.

Aplica a todo lo que este documento marca como «forzar y probar»: los flujos, la grabación, el
título de sesión, y las claves que la [advertencia 1](#dos-advertencias-antes-de-cualquier-campo)
deja pasar en silencio.

---

## Permisos

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `--permission-mode` · **`permissions.defaultMode`** | bandera · settings | `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`, `manual` | está |
| `permissions.allow` · `deny` · `ask` | settings | La matriz de qué se puede y qué no | está |
| `additionalDirectories` · `--add-dir` | settings · bandera | Otras carpetas que puede tocar | está |
| `Agent(nombre)` | permisos | Prohíbe o permite un agente concreto | falta |
| `Cd` · `Cd(patrón)` | permisos | Restringe a dónde puede mudarse la sesión | falta |
| `WebFetch(domain:*)` | permisos | Acota a qué dominios sale | falta |
| `autoMode.allow` · `soft_deny` · `hard_deny` · `environment` | settings | Las reglas del clasificador que decide cuándo preguntar | falta |
| **`"$defaults"`** | valor literal en el arreglo | **Sin esta cadena, tu arreglo reemplaza la lista de fábrica completa.** Con ella, la empalma | falta |
| `autoMode.classifyAllShell` | settings | Manda **todos** los comandos por el clasificador | falta |
| `disableAutoMode` | settings | Prohíbe que se active el modo automático | falta |
| **`useAutoModeDuringPlan`** | settings | **Prendido de fábrica.** En modo plan el clasificador revisa comandos en vez de preguntarle al experto | falta |
| `showClearContextOnPlanAccept` | settings | Aprobar el plan y limpiar el contexto de la planeación | falta |
| `disableBypassPermissionsMode` | settings | Prohíbe el modo sin frenos. Funciona en cualquier ámbito | falta |
| `strictPluginOnlyCustomization` | settings gestionado | Cartas, agentes, frenos y fuentes **sólo desde un plugin** | falta |
| `allowManagedPermissionRulesOnly` · `allowManagedMcpServersOnly` · `allowManagedDomainsOnly` · `allowManagedReadPathsOnly` | settings gestionado | Sólo lo de la organización | falta |
| `--permission-prompt-tool` ⚠ sólo -p | bandera oculta | Quién contesta los permisos cuando no hay nadie mirando | falta |
| `sandbox.enabled` · `.filesystem.allowRead`/`denyRead` · `.network.allowedDomains`/`deniedDomains` | settings | El aislamiento y sus fronteras | falta |
| `sandbox.failIfUnavailable` | settings | **De fábrica `false`: sólo avisa y los comandos corren sin aislamiento** | falta |
| `autoAllowBashIfSandboxed` | settings | De fábrica `true`: dentro del aislamiento no pregunta aunque haya regla `ask` | falta |
| `claude auto-mode config` · `defaults` · `critique` · `reset` | comando | Ver las reglas efectivas, las de fábrica, pedir crítica, o borrarlas | falta |

### Cuatro hechos que pesan

1. **`defaultMode: "auto"` se ignora** en `.claude/settings.json` y `.claude/settings.local.json`. Tiene que ir en el de usuario o pasarse por `--settings`.
2. **`autoMode` tampoco se lee de los settings del proyecto** — sólo usuario, gestionado o `--settings`.
3. **Hay una lista fija de rutas protegidas** (`.git`, `.claude`, `.vscode`, `.envrc`, `.mcp.json`, `.claude.json` y ~30 más) donde escribir nunca se autoaprueba, y **las reglas `allow` no la levantan**.
4. **El clasificador lee el CLAUDE.md.** Una instrucción ahí dirige a la IA y al clasificador a la vez. Y un límite dicho en la plática bloquea de verdad — **pero se pierde si el resumen automático borra ese mensaje**.

**Una carpeta agregada con `--add-dir` no aporta configuración:** de su `.claude/settings.json`
sólo se leen `enabledPlugins` y `extraKnownMarketplaces`.

---

## Herramientas

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `--tools` · `--allowedTools` · `--disallowedTools` | bandera | Qué herramientas existen en la sesión | está |
| `BASH_DEFAULT_TIMEOUT_MS` | entorno | Cuánto puede tardar un comando. De fábrica 120000 | falta |
| `BASH_MAX_TIMEOUT_MS` | entorno | El máximo que la IA puede pedir. De fábrica 600000 | falta |
| `BASH_MAX_OUTPUT_LENGTH` | entorno | Cuánto texto acepta de vuelta antes de mandarlo a archivo | falta |
| `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` | entorno | Vuelve a la carpeta del proyecto tras cada comando | falta |
| `defaultShell` · `CLAUDE_ENV_FILE` | settings · entorno | Intérprete por omisión, y un script cuyas variables persisten | falta |
| **`CLAUDE_CODE_USE_POWERSHELL_TOOL`** | entorno · `settings.env` | En Windows, `0` la apaga — **y si tampoco hay Git Bash, la sesión no arranca** | falta |
| `respectGitignore` · `CLAUDE_CODE_GLOB_NO_IGNORE` | settings · entorno | Si buscar archivos respeta `.gitignore` | falta |
| `CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION` | entorno | Tope de búsquedas web. **De fábrica 200.** Se sube, no se apaga | falta |
| `ENABLE_TOOL_SEARCH` · `CLAUDE_CODE_DISABLE_TOOL_SEARCH` | entorno | Si carga las herramientas externas de golpe o a demanda | falta |
| `MCP_TOOL_TIMEOUT` | entorno | Tope por llamada MCP. Bajo 1000 ms se ignora | falta |
| `CLAUDE_CODE_ENABLE_TASKS=0` | entorno | Revive `TodoWrite`, apagado de fábrica | falta |
| `todoFeatureEnabled` · `CLAUDE_CODE_TODO_REMINDER_MODE` | settings · entorno | La lista de tareas y su recordatorio | falta |
| `CLAUDE_CODE_DISABLE_ATTACHMENTS` | entorno | Apaga el procesamiento de adjuntos | falta |
| `disableArtifact` · `enableArtifact` · `CLAUDE_CODE_ARTIFACT_AUTO_OPEN` | settings · entorno | La herramienta de publicar páginas | falta |
| `--chrome` · `--no-chrome` · `browserExternalPageTools` · `disableBrowserExternalNavigation` | bandera · settings | El navegador y hasta dónde puede salir | está a medias |
| `disableMobileSimulatorTools` | settings | Bloquea el simulador de iOS | falta |
| `CLAUDE_AUTO_BACKGROUND_TASKS` · `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` | entorno | Si las tareas largas se van al fondo solas | está |
| `--brief` | bandera | Prende `SendUserMessage` para que el agente le hable a la persona | falta |
| `--json-schema <esquema>` | bandera | Obliga la salida a un esquema JSON | falta |
| `diagnostics` (LSP) | config de plugin | **De fábrica `true`: empuja errores de tipo al contexto tras cada edición** | falta |

---

## Frenos

Esto no es un campo. **Son 31 eventos y unos 25 campos de salida**, y un freno no es
necesariamente un comando de shell.

### Qué puede ser un freno

| Nombre | Qué hace | Estado |
|---|---|---|
| `type: "prompt"` | **El freno es un prompt**: un modelo juzga la acción y decide | falta |
| `type: "agent"` | El freno es un agente completo que evalúa | falta |
| `type: "http"` · `type: "mcp_tool"` | Llama una dirección o una herramienta externa | falta |
| `model` | Qué modelo evalúa un freno prompt/agent. De fábrica, el rápido | falta |
| `if` | Condiciona el freno con sintaxis de permisos: `"Bash(git *)"` | falta |
| `async` · `asyncRewake` | Corre de fondo; `asyncRewake` despierta a la IA al terminar | falta |
| `statusMessage` | **El texto que ve el experto mientras el freno corre** | falta |
| `timeout` | 600s comando/http, 30s prompt, 60s agente | falta |
| `once` · `shell` | Una vez por sesión; intérprete de ese freno | falta |
| `hooks:` en frontmatter | Frenos dentro de una carta o un agente, no sólo en settings | falta |

### Lo que un freno puede cambiar

**Ninguno de estos estaba en el inventario, y son la maquinaria para gobernar la sesión.**

| Nombre | Qué hace | Estado |
|---|---|---|
| **`additionalContext`** | **Inyecta texto al contexto de la IA** como recordatorio de sistema. Tope 10 000 caracteres. Disponible en 11 eventos | falta |
| **`displayContent`** | **Reemplaza en pantalla lo que la IA escribió.** El registro conserva el original | falta |
| `initialUserMessage` | Se antepone al primer mensaje del experto | falta |
| `updatedInput` | Reescribe los argumentos de la herramienta antes de ejecutar | falta |
| `updatedToolOutput` | Reemplaza el resultado que la IA recibe de vuelta | falta |
| `permissionDecision` | `allow`, `deny`, `ask`, `defer` | falta |
| `decision.permissionRules` | Deja reglas puestas para no volver a preguntar | falta |
| `decision:"block"` + `reason` | Bloquea, con la razón que la IA lee. En 9 eventos | falta |
| `continue:false` + `stopReason` | Corta la sesión en seco | falta |
| `systemMessage` · `suppressOutput` | Aviso visible al experto; esconder la salida del registro | falta |
| `sessionTitle` · `watchPaths` · `reloadSkills` | Titular la sesión, vigilar archivos, recargar cartas | falta |

### Los eventos

UserPromptSubmit · UserPromptExpansion · PreToolUse · PostToolUse · PostToolUseFailure ·
PostToolBatch · Stop · SubagentStop · SubagentStart · MessageDisplay · InstructionsLoaded ·
PreCompact · PostCompact · SessionStart · SessionEnd · Setup · TaskCreated · TaskCompleted ·
Notification · ConfigChange · CwdChanged · DirectoryAdded · FileChanged · StopFailure ·
TeammateIdle · Elicitation · ElicitationResult · WorktreeCreate · WorktreeRemove ·
PermissionRequest · PermissionDenied

**`Stop` y `SubagentStop` pueden devolver a la IA a trabajar.** `InstructionsLoaded` dispara al
cargar un CLAUDE.md o una regla.

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `disableAllHooks` | settings | Apaga todos los frenos y la línea de estado | falta |
| `allowManagedHooksOnly` | settings | Sólo los frenos de la organización | falta |
| `allowedHttpHookUrls` · `httpHookAllowedEnvVars` | settings | A qué direcciones llama un freno y con qué variables | falta |
| `hooks` | settings · archivo | La declaración | está |

---

## Contexto

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `autoCompactEnabled` | settings | Resume la plática al acercarse al límite. **Prendido de fábrica** | está |
| `DISABLE_AUTO_COMPACT` | entorno | Lo mismo, por variable | falta |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | entorno | A qué porcentaje resume, de 1 a 100 | está |
| `autoCompactWindow` · `CLAUDE_CODE_AUTO_COMPACT_WINDOW` | settings · entorno | Con qué capacidad hace la cuenta. Entre 100 000 y 1 000 000 | está |
| `precomputeCompactionEnabled` | settings | Precalcula el resumen antes de necesitarlo | falta |
| `/compact <instrucciones>` | comando | Resumir a mano diciendo qué conservar | falta |
| `/rewind` → «Summarize from/up to here» | comando | Comprimir un tramo de la plática sin tocar archivos | falta |
| `totalTokensReminder` (+`Budget`, `AfterUserTurn`) | settings | Avisos de cuánto contexto se lleva gastado | falta |

### El presupuesto de arranque, medido

Todo lo que se carga antes de la primera pregunta se lo quita al experto. Los números están
repartidos por el documento; aquí juntos, todos del mismo medidor y la misma base:

| Partida | Tokens |
|---|---|
| **Arranque completo, hoy** | **26 586** |
| Los flujos, solos | **7 900** — el 30 % |
| El bloque de reglas de memoria | 718 |
| Las instrucciones de commit y PR | 195 |
| Lo que sumaría apagar `SIMPLE_SYSTEM_PROMPT` | **+12 235** |
| Lo que devuelve el modo coordinador | **−12 103** |

**Los flujos son la partida más cara y no se pueden quitar** — el molino es un flujo. Pero
saber lo que cuestan cambia qué más cabe.

**Y el prompt de fábrica ya es el corto.** Quien prenda `CLAUDE_CODE_SIMPLE_SYSTEM_PROMPT=0`
«para tener más contexto» consigue lo contrario: casi duplica el prompt.

**No rompe el molino.** El molino lee el `.jsonl` de disco, y ahí está todo aunque el contexto
se haya resumido. Lo que sí cambia es **lo que la IA recuerda a media entrevista**: al resumir
se repone el prompt de sistema, las reglas, la memoria y las fuentes externas — pero **del
listado de cartas sólo sobreviven las que ya se usaron**.

---

## Memoria

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `autoMemoryEnabled` | settings | Que aprenda de una sesión a otra. **Prendido de fábrica** | está |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | entorno | Lo mismo, por variable | está |
| `autoMemoryDirectory` | settings | Dónde se guarda lo aprendido | está |
| `autoDreamEnabled` | settings | Consolidación de memoria en segundo plano | falta |
| **`CLAUDE_COWORK_MEMORY_GUIDELINES`** | entorno | **Sustituye el bloque de reglas de memoria** que se le inyecta a la IA. Medido: ese bloque pesa **718 tokens** | falta |
| **`CLAUDE_COWORK_MEMORY_EXTRA_GUIDELINES`** | entorno | **Agrega** reglas al final del bloque, sin reemplazarlo | falta |
| `CLAUDE_COWORK_MEMORY_PATH_OVERRIDE` | entorno | Cambia a dónde apunta la memoria automática. Confirmado por el campo `memory_paths` del arranque | falta |
| `CLAUDE_MEMORY_STORES` | entorno | Almacenes de memoria propios, en JSON. **A diferencia del settings, éste sí valida y truena.** Efecto lateral: **apaga la memoria de organización** | falta |
| `CLAUDE_CODE_DISABLE_ORG_MEMORY` | entorno | Cierra las tres compuertas de la memoria de organización. No toca la automática local | falta |
| `memory` en un agente | archivo | Memoria propia de ese agente, en `.claude/agent-memory/` | está |
| `/memory` | comando | Ver y editar lo guardado | falta |

**Corregido el 2026-08-03.** El «no disponible» tenía motivo falso y se borró: `autoMemoryEnabled:
false` lo apaga por proyecto y no toca nada más. El diálogo de confianza que se temía sólo
muerde por la vía `project`/`local` — **por `--settings` está exento textualmente**, y ésa es la
vía de Nemawashi.

---

## La espera del experto

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| **`CLAUDE_CODE_USER_DIALOG_TIMEOUT_MS`** | entorno | Cuánto espera **cualquier** diálogo antes de resolverse solo. **De fábrica 300000 — cinco minutos** | falta |
| `CLAUDE_AFK_TIMEOUT_MS` | entorno | Cuánto espera una pregunta sin respuesta. **Tiene precedencia sobre la clave de settings y prende el auto-continuar aunque esté en `"never"`.** Con `0` **no se apaga**: cierra el diálogo de inmediato, o sea que la IA contesta por el experto | está |
| `CLAUDE_AFK_COUNTDOWN_MS` | entorno | Cuándo aparece la cuenta regresiva en pantalla | está |
| `askUserQuestionTimeout` | settings | De fábrica `"never"`. Acepta `"60s"`, `"5m"`, `"10m"`, `"never"`. No se lee de proyecto ni local — **pero sí de `--settings`, y con precedencia sobre el settings del usuario.** Orden: gestionado → `--settings` → usuario | está |
| `CLAUDE_CODE_IDLE_THRESHOLD_MINUTES` | entorno | De fábrica 75, junto con `CLAUDE_CODE_IDLE_TOKEN_THRESHOLD` (100000) | falta |
| `awaySummaryEnabled` · `CLAUDE_CODE_ENABLE_AWAY_SUMMARY` | settings · entorno | El recap al volver tras cinco minutos fuera | falta |
| `breakReminder.enabled` + `breakThresholdMinutes` | settings | Empujón tras uso continuo. De fábrica apagado, umbral 10 min | falta |

Un experto pensando tarda, y tarda distinto que un programador. **El diálogo de cinco minutos
es el número más peligroso de este documento**: nadie lo eligió, y es el que decide si la
sesión espera al experto o sigue sin él.

### Advertencia que cuestiona esta sección entera

**`AskUserQuestion` no existe en modo programático.** Medido: no aparece en la lista de 32
herramientas de una sesión `-p`, ni con modo coordinador ni sin él. Tampoco `EnterPlanMode` ni
`ExitPlanMode`.

`AskUserQuestion` es **la** herramienta con la que la IA le hace al experto una pregunta de
opciones. Si Nemawashi corre en `-p` —y ahí viven `--max-budget-usd`, `--max-turns` y la
esquiva del diálogo de confianza— entonces **estas tres perillas gobiernan algo que no se
instancia**, y la IA pregunta en prosa suelta.

**Verificado el 2026-08-03: tampoco existe en el modo de entrada por flujo**, que es por donde
una aplicación de escritorio conversa de verdad. Cuatro vías, todas negativas:

| Corrida (`--input-format stream-json`) | herramientas | `AskUserQuestion` |
|---|---|---|
| mensaje neutro | 32 | **ausente** |
| `--allowedTools AskUserQuestion` | 32 | **ausente** |
| **`--tools Bash Read AskUserQuestion`** | **2** | **ausente** |
| coordinador + `EXTRA_TOOLS="Skill,AskUserQuestion"` | 5 | **ausente** |

**La tercera trae su propio control positivo adentro:** se nombraron tres herramientas y
quedaron dos. La bandera funcionó —recortó de 32 a 2, exactamente los dos nombres reales— y el
tercero no produjo nada. **No es un filtro que no la alcanza: el nombre no corresponde a nada
que exista en ese modo.**

**Y la prueba de comportamiento, con detector validado** (un control positivo confirmó que el
arnés ve un `tool_use` cuando ocurre): pidiéndole explícitamente que preguntara antes de
seguir, **cero llamadas**. Contestó en prosa, con las opciones en viñetas.

### Qué decide esto

**La capacidad de preguntar no se pierde. Lo que se pierde es la pregunta estructurada.** Con la
herramienta, Nemawashi recibiría las opciones como datos y podría pintar botones. Sin ella
recibe **texto libre**, y tendría que adivinar dónde están las opciones parseando prosa. Para
una aplicación que le arma pantallas a un experto, esa es la diferencia entre un contrato y una
heurística.

1. **Los tres campos de esta sección no se sostienen en modo programático.** Gobiernan el ocioso
   de un diálogo que no se instancia. Que `askUserQuestionTimeout` **sí se lea** por
   `--settings` es cierto y a la vez irrelevante aquí: se lee y no tiene sobre qué actuar.
2. **Las pantallas de opciones al experto hay que resolverlas en la capa de Nemawashi**, no
   esperando datos estructurados del ejecutable.
3. **No es defecto del modo coordinador** — es del modo programático entero.

*No se probó una sesión interactiva de terminal. Todo lo anterior vale para modo programático,
que es donde vive Nemawashi. Una corrida interactiva ya no decidiría nada: sólo confirmaría que
la diferencia es el modo y no la versión.*

**Segundo hallazgo independiente que apunta al mismo agujero.** Al rastrear
`askUserQuestionTimeout` se siguió a dónde va su valor:

```js
L3S = mQf(ICe()); … DJ.jsx(isl,{ …, afkTimeoutMs: L3S, … })
```

Termina como propiedad de un componente de interfaz: **el diálogo de `AskUserQuestion`**. En
modo programático no hay diálogo, no hay ocioso y no hay auto-continuar — **no es que falte
instrumento para medirlo: es que el efecto no ocurre ahí.**

Las otras tres claves que comparten ese mismo lector —`feedbackDrafts`, `footerLinksRegexes`,
`vimInsertModeRemaps`— son todas de interfaz interactiva. La familia entera vive del otro lado.

**La decisión no es quitar los campos por no leerse — se leen, y con precedencia alta. Es
decidir si Nemawashi corre en un modo donde la herramienta existe.**

---

## Deshacer

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `fileCheckpointingEnabled` | settings | Guarda puntos de retorno. **Prendido de fábrica** | está |
| `CLAUDE_CODE_DISABLE_FILE_CHECKPOINTING` | entorno | Lo mismo, por variable | falta |
| `/rewind` · `--rewind-files <id>` | comando · bandera oculta | Devuelve los archivos a como estaban | falta |
| `cleanupPeriodDays` | settings | Cuántos días se guardan las sesiones. De fábrica 30 | está |

### Tres límites que no se pueden configurar

- Sólo se guardan los **100 puntos más recientes** de una sesión.
- **Lo que un subagente edita queda fuera de los puntos de retorno.** Tampoco lo que cambió un comando de shell, ni los enlaces simbólicos. **El roadmap que escribe el escribano no se puede deshacer con `/rewind`.**
- Si un archivo de settings no se puede leer, **se pausa la limpieza por antigüedad**.

---

## La grabación — el archivo del que depende el método

El molino lee el `.jsonl` de la sesión. Estas tres perillas lo apagan.

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `CLAUDE_CODE_SKIP_PROMPT_HISTORY` | entorno | Apaga la escritura de la transcripción | falta |
| `--no-session-persistence` ⚠ sólo -p | bandera | Lo mismo, con `-p` | falta |
| `persistSession: false` | SDK | Lo mismo, desde el código | falta |
| `claude project purge` | comando de terminal | **Borra transcripciones, tareas, historial y configuración de un proyecto** | falta |
| `autoUploadSessions` | settings | Si las sesiones se suben | falta |

**No es un campo para el experto.** Es un valor que Nemawashi debe **forzar**, y una prueba que
debe existir. Como el ejecutable corre en modo programático, `persistSession` es una opción que
alguien puede poner mal en el código y **nadie se entera hasta que un paso se muele contra un
archivo vacío**. Misma clase de falla silenciosa que la advertencia 1.

---

## Reanudar

Una entrevista de horas se cae: se duerme la máquina, se cierra la aplicación, se muere el
proceso. Hoy no hay nada escrito sobre esto.

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `--session-id <uuid>` | bandera | Fija el identificador. **Permite que Nemawashi sepa de antemano qué archivo va a leer el molino** | falta |
| `--resume` | bandera | Reanuda una sesión por identificador o nombre | falta |
| `--continue` | bandera | Carga la última conversación de esta carpeta | falta |
| `--fork-session` | bandera | Al reanudar, crea un identificador nuevo en vez de reusar el original | falta |
| `--resume-session-at <id>` | bandera oculta | Reanuda hasta cierto mensaje | falta |
| `-n, --name <nombre>` | bandera | Nombre visible de la sesión | falta |

---

## Fuentes de configuración

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `--setting-sources` | bandera | De qué archivos lee: `user`, `project`, `local` | está |
| `--settings` | bandera | Un settings propio que manda sobre los demás | está |
| `--managed-settings <json>` | bandera oculta | Settings de **nivel política** desde el proceso padre | falta |
| `CLAUDE_CONFIG_DIR` | entorno | Apunta a otro directorio y no lee nada de `~/.claude` | falta |
| `parentSettingsBehavior` | settings | Qué hacer con los settings de carpetas superiores | falta |
| `--mcp-config` · `--strict-mcp-config` | bandera | Fuentes externas propias, y sólo ésas | está |
| `--plugin-dir` · `--plugin-url` · `--plugin-dir-no-mcp` | bandera | Carga un plugin sólo para esta sesión. El tercero, sin leer su `.mcp.json` | falta |
| `claude plugin details <n>` | comando | **Su costo proyectado en tokens.** Única forma de medirlo antes de prenderlo | falta |
| `defaultEnabled` · `userConfig` | `plugin.json` | Arranca apagado; valores que se preguntan al prenderlo y llegan a los frenos | falta |
| `disableSideloadFlags` | settings | Prohíbe que se metan plugins y agentes por bandera | falta |
| `/config clave=valor` | comando | Cambia un ajuste a media sesión. **No existe el subcomando `claude config`** | falta |

---

## Fuentes externas y canales

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `allowedMcpServers` · `deniedMcpServers` | settings | Lista blanca y negra | está a medias |
| `enabledMcpjsonServers` · `disabledMcpjsonServers` | settings | Aprobar o rechazar las del proyecto, una por una | falta |
| `enableAllProjectMcpServers` | settings | Aprueba todas las del proyecto sin preguntar | falta |
| `disableClaudeAiConnectors` · `allowAllClaudeAiMcps` | settings | Las conexiones que vienen de claude.ai | falta |
| `--channels` · `channelsEnabled` · `allowedChannelPlugins` | bandera oculta · settings | Canales que empujan avisos a la sesión | falta |
| `claude/channel/permission` | código del canal | **Reenvía las preguntas de permiso a otro dispositivo** para que el experto conteste desde el teléfono | falta |

---

## Arranque limpio

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| `--bare` | bandera | Arranca sin descubrir nada: ni frenos, ni plugins, ni cartas, ni memoria, ni CLAUDE.md | **⚠ ver abajo** |
| `--safe-mode` | bandera | Todo lo personalizado apagado, para saber si lo que rompe es tuyo | está |

### `--bare` no sirve para Nemawashi. Medido.

| Corrida | Resultado |
|---|---|
| `claude -p --bare --settings '{}' '…'` | **`Not logged in · Please run /login`** |
| Lo mismo **sin** `--bare` | `LISTO` |

Mismo binario, misma sesión, mismos settings vacíos. Lo único distinto es la bandera. Su propia
ayuda lo dice: *«la autenticación es estrictamente `ANTHROPIC_API_KEY` o `apiKeyHelper` —
**OAuth y llavero nunca se leen**»*.

**Se cae por dos motivos independientes:**

1. **No puede autenticarse con la sesión del experto.** Usarlo obligaría a Nemawashi a manejar
   una clave de API en vez del inicio de sesión de Claude: otro modelo de negocio, otro flujo
   de alta, y una credencial que hoy el producto no toca.
2. **Apaga los frenos, el paquete y los instructivos** — que es literalmente lo que la maqueta
   decía. La documentación web dice que sólo quedan Bash, leer y editar; el `--help` instalado
   dice que las cartas siguen resolviéndose. **Esa discrepancia quedó sin zanjar** porque la
   prueba se detuvo antes, en el fallo de autenticación. No cambia el veredicto.

**La maqueta tenía razón desde el principio sobre `--bare`.** Si la sección «Arranque limpio»
se construyó apoyada en él, hay que rehacerla — la ruta buena es la de la advertencia 2:
`claudeMdExcludes` más `permissions.deny`.

---

## El modo coordinador — una reja donde hoy hay una promesa

La carta del consultor dice *«no eres programador; en esta sesión no hay código, ni archivos,
ni comandos»*. Hoy eso es una instrucción que la IA puede desobedecer. Existe un modo que lo
vuelve cierto por construcción.

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| **`CLAUDE_CODE_COORDINATOR_MODE`** | entorno | Cambia la sesión a régimen coordinador/trabajador: prompt propio, lista de agentes propia **que reemplaza la de fábrica**, y filtro cerrado de herramientas | falta |
| **`CLAUDE_CODE_COORDINATOR_EXTRA_TOOLS`** | entorno | Lista por comas que se suma al filtro cerrado | falta |

### Lo medido

| Corrida | tokens | agentes | herramientas | estilo |
|---|---|---|---|---|
| base | 26 586 | 5 | 32 | default |
| `COORDINATOR_MODE=1` | **14 483** | **1** = `worker` | **4** | default |
| + `EXTRA_TOOLS=Skill` | ~14 900 | 1 | **5** | default |
| + `outputStyle` | **14 961** | 1 | 5 | **el estilo, intacto** |

Las cuatro herramientas de base: `SendMessage`, `Task`, `TaskStop` y **`Workflow`**.

**Tres cosas quedaron probadas:**

1. **Sin `Bash`, `Read`, `Write` ni `Edit`.** La IA no puede programar porque no tiene con qué.
2. **Las cartas cargan**, con control negativo: sin `Skill` en `EXTRA_TOOLS`, la IA lee `/mi-carta` como una ruta de disco y se pone a hablar de `C:\Program Files\Git\`. Con `Skill`, se ejecuta.
3. **La personalidad sobrevive intacta.** El estilo suma **+478 tokens exactos**, el mismo entero que en modo normal. El prompt del coordinador y el del estilo **se suman, no se pisan**.

Y de paso devuelve **más de 11 000 tokens** al experto.

### La receta medida

```
CLAUDE_CODE_COORDINATOR_MODE=1
CLAUDE_CODE_COORDINATOR_EXTRA_TOOLS=Skill
--settings '{"outputStyle":"consultor"}'
```

**Dos avisos:**

1. **`Skill` es obligatorio**, y **el fallo no avisa**: las once cartas quedan mudas y la IA se inventa que le pasaron una ruta.
2. **La reja se ensancha con la misma variable con que se cierra** — `EXTRA_TOOLS` admite `Bash`. Protege del modelo, no de una configuración mal puesta.

### El molino sí arranca ahí — pero se detiene en una compuerta

Verificado. El coordinador no sólo tiene `Workflow` listada: **la invoca de verdad.** Compuso un
guion de flujo completo y emitió la llamada.

```
LLAMADA   -> Workflow {"script":"export const meta = { name: 'smoke-test', …
RESULTADO -> Review dynamic workflow before running
```

**Y ahí se quedó.** La llamada llegó a una compuerta de permiso y no pasó, porque en modo
programático no hay quién apruebe.

**Consecuencia:** el molino dentro del modo coordinador **necesita una regla de permiso
explícita para `Workflow`**, o se detiene en seco en cada entrevista sin decir por qué.

*Sin verificar:* que un flujo **complete**. Se probó que se invoca y que llega a la compuerta;
ejecutarlo exigía aprobar la corrida y dejar que lanzara agentes. Y sólo se probó en modo
programático; la terminal interactiva tiene una compuerta (`LN() && !ba()`) que nadie resolvió.

---

## Tope

| Nombre | Dónde | Qué hace | Estado |
|---|---|---|---|
| **`--max-budget-usd <monto>`** ⚠ sólo -p | bandera | **Tope de gasto de la sesión.** El gasto de los subagentes cuenta. Al tocarlo: `Budget limit reached`, y **mata los subagentes de fondo**. Exige 2.1.217+ | falta |
| `maxBudgetUsd` | SDK | Lo mismo desde el código. Devuelve un `ResultMessage` con subtipo `error_max_budget_usd` — **Nemawashi puede avisarle al experto en pantalla** en vez de morir mudo | falta |
| `--max-turns <n>` ⚠ sólo -p | bandera | Tope de vueltas de **la sesión entera** | falta |
| `--task-budget <tokens>` | bandera oculta | Presupuesto de tarea del lado del API | falta |
| `maxTurns` en un agente | archivo | Tope de vueltas de un subagente | está |

**Corrección.** Una versión anterior de este documento dio el tope de gasto por inexistente. Sí
existe: verificado contra el ejecutable instalado, `claude --help` lo muestra. La confusión
vino de buscarlo entre las claves de settings y el límite de gasto de la cuenta
(`spendLimitCents`), donde no está. **Es una bandera, y sólo funciona con `--print`** — que es
como corre Nemawashi, así que sirve.

---

## Lo que hace falta y Claude Code no da

| Qué | Estado |
|---|---|
| **Filtrar dato personal** | **no existe.** No hay ajuste de redacción, ocultamiento ni filtrado. Lo único posible es un freno `PreToolUse` — hay que construirlo |
| **Contestar el diálogo de confianza del workspace** | **no existe** ajuste. Es un modal que un experto de negocio no sabría contestar, y si contesta mal la sesión arranca a medias sin avisar. En modo `-p` no aparece y las reglas quedan ignoradas |
| **Validar las claves que uno escribe** | **no existe.** Ver la advertencia 1 |
| **Apagar la generación del título de sesión** | **no existe perilla, pero sí dos defensas probadas.** Ver abajo |

### El título de la sesión — una llamada saliente que nadie había visto

**Cada sesión toma los últimos 1 000 caracteres de la plática, tal cual, y los manda a una
llamada aparte** para ponerle nombre. Con diez caracteres basta para dispararla. El resultado
**se guarda en disco y es buscable** (`saveAiGeneratedTitle`, `searchSessionsByCustomTitle`).

**Se dispara también en modo programático**, una vez por sesión: medido en 15 corridas `-p`,
todas con `source=generate_session_title`.

**No hay ajuste para apagarlo** — se revisaron todos los identificadores con «title».
`CLAUDE_CODE_DISABLE_TERMINAL_TITLE` es otra cosa: el título de la ventana.

**Dos defensas, las dos medidas contando llamadas:**

| Defensa | Llamadas al generador |
|---|---|
| ninguna, 3 corridas | **1** cada una |
| `--name "…"` | **0** |
| freno `SessionStart` devolviendo `sessionTitle` | **0** |

La razón está en el código: hay cinco sitios de llamada y uno lleva la guarda **«si la sesión
ya tiene título, no se genera»**.

**Lo que hay que hacer: pasar `--name` en cada sesión**, con un título que **no salga de la
plática** —nombre del compromiso, fecha, identificador propio—. El freno `SessionStart` como
cinturón, para que no dependa de que alguien se acuerde.

*Sin verificar:* qué pasa al reanudar con `--resume` sobre una sesión ya titulada, y si el
freno alcanza a fijar el título antes del primer disparo en una sesión de varios turnos.

### La contradicción del dato personal

- CLAUDE.md prohíbe dato personal, cita textual e identificador de cliente **en lo versionado**.
- La carta del consultor lo repite: nombres, teléfonos, identificadores, fuera.
- Pero **el molino lee la grabación cruda**, y la grabación cruda contiene todo lo que el
  experto dijo, con nombres, guardada 30 días en `~/.claude/projects/`.

El `.jsonl` no está versionado, así que técnicamente cumple la regla — y a la vez es **el
archivo con más datos personales de todo el sistema**. No es una perilla que falte: es una que
no existe y hay que construir.

---

## Lo que hay que hacer con esto

Hecho el 2026-08-03 en la maqueta, con los nombres verificados contra el ejecutable instalado:

1. **Los tres «no disponible» se borraron.** Los tres tenían motivo falso.
2. **El estilo de salida entró en Instrucciones** como «Oficio de la sesión».
3. **Se abrieron cinco secciones:** memoria de la plática, lo que aprende, la espera del
   experto, deshacer y arranque limpio.
4. **La ficha del agente creció** con herramientas negadas, su modo de permisos, si corre de
   fondo, si va en su propia copia y su memoria propia.

**Lo que la segunda pasada abrió, en orden de qué tan caro sale descubrirlo con el experto
enfrente:**

1. **Rehacer «Arranque limpio».** Se construyó sobre `--bare`, que no puede autenticarse. La
   ruta buena es `claudeMdExcludes` **más** `permissions.deny` sobre `Read`.
2. **Forzar la grabación y probarlo.** Tres perillas la apagan y el método entero depende de
   ella.
3. **Decidir el diálogo de cinco minutos.** `CLAUDE_CODE_USER_DIALOG_TIMEOUT_MS` está en 300000
   porque nadie lo tocó.
4. **Validar las claves del settings contra la lista real.** El `.passthrough()` convierte cada
   error de dedo en una perilla que no hace nada.
5. **Abrir los frenos de verdad.** Son 31 eventos, no un interruptor. `additionalContext` y
   `displayContent` son la maquinaria para gobernar qué ve el experto.
6. **Los dos números del listado de cartas.** Nemawashi tiene once y de fábrica caben en el 1%
   de la ventana, con las descripciones truncadas **en silencio**.
7. **`includeGitInstructions: false`.** Hoy toda sesión con un experto de negocio lleva
   instrucciones de commit y PR en el prompt de sistema.
8. **Abrir «Reanudar».** Una entrevista de horas se cae, y no hay nada escrito.
9. **El tope de gasto vuelve a la maqueta.** `--max-budget-usd` existe.
10. **El dato personal necesita un freno**, no un campo. Es la única de las tres que no tiene
    perilla y sí tiene solución.

**Lo que salió de armar los oficios el 2026-08-03, y no estaba en la lista de arriba:**

1. **`observeSubagents` puede poner al auditor a medir en paralelo, no después.** Hoy el auditor
   dictamina cuando el escribano ya escribió; ese campo lo pondría a vigilar mientras trabaja. Si
   funciona, cambia el diseño del molino — el freno dejaría de ser un paso y sería una compañía.
2. **`CLAUDE_COWORK_MEMORY_GUIDELINES` es la vía para decirle qué no recordar de una entrevista.**
   Complementa el punto 10, no lo reemplaza: el freno protege lo versionado; esto protege lo que la
   máquina se guarda. La regla de «sin dato personal» ya existe en `.claude/rules/` y hoy nadie se la
   pasa por ahí.
3. **Reconciliar el plugin con la personalidad.** El 2026-08-03 se quitó el plugin del consultor
   porque lo único que compraba era que la personalidad llegara sin elegirla, y eso lo hace el ajuste
   `outputStyle`. Esta auditoría apunta a `--plugin-dir` con `force-for-plugin` como vía viable, y
   deja `CLAUDE_CODE_MANAGED_SETTINGS_PATH` sin ruta practicable. **Las dos lecturas no se han
   confrontado**, y el ejecutable no debería construirse sobre una sin cerrar la otra.
4. **El punto 4 de arriba ya tiene cuerpo:** la consola quedó con unos treinta campos nuevos, y cada
   uno es una clave que puede fallar en silencio. Un interruptor apagado en pantalla con la sesión
   corriendo prendida es justo el error que la consola existe para evitar.

**Lo que se dejó fuera a propósito, con su motivo:**

- **La ventana de un millón** — en la maqueta se elige como parte del modelo; un segundo control diría lo mismo dos veces.
- **Los frenos y las fuentes externas por agente** (`hooks`, `mcpServers`) — ya existen como secciones globales, y meterlos también dentro de cada agente son dos lugares donde cabe la misma regla.
- **El color del agente** y todo lo cosmético.

---

# Tercera pasada — lo medido contra el ejecutable

Los noventa nombres que la segunda pasada dejó como «existe pero nadie lo midió» se repartieron
en tres bloques. Se midieron **con un instrumento validado**: el evento de arranque de
`--output-format stream-json` —que lista agentes, cartas, herramientas y estilo— más el conteo
de tokens del prompt de sistema. Control positivo en todas: `outputStyle:"Proactive"` mueve el
campo **y** suma **+478 tokens exactos**, reproducible entre carpetas y entre auditores.

## Las dos reglas que salieron de medir

**1 · `=0` no apaga una variable booleana.** El ejecutable tipa su entorno. En una `bool()`
sólo cuentan `1`, `true`, `yes`, `on` — minúsculas, sin espacios. **`CLAUDE_CODE_DISABLE_ALGO=0`
lee exactamente igual que no ponerla.** En las numéricas, un valor fuera de rango cae al de
fábrica **en silencio**. Es la misma familia de fallas que el `.passthrough()` de la
advertencia 1.

*Excepciones medidas:* `CLAUDE_CODE_WORKFLOWS`, `CLAUDE_CODE_FORK_SUBAGENT` y
`ENABLE_MCP_LARGE_OUTPUT_FILES` son `triBool` y **sí** aceptan `0`. `USE_BUILTIN_RIPGREP` va al
revés: `1` es el valor inerte.

**2 · «No encuentro dónde se lee» no prueba nada.** Las variables se registran en una tabla de
getters minificados y el sitio de lectura usa el alias, no el nombre. Un auditor dio
`CLAUDE_CODE_DISABLE_CRON` por muerta por eso, y el banco lo desmintió: apaga tres herramientas
y una carta. **Lo único que se puede leer sin correr es el tipo declarado.**

## Confirmadas y ya incorporadas arriba

`DISABLE_EXPLORE_PLAN_AGENTS` · `DISABLE_EXPLORE_INHERIT_CAP` · `CLAUDE_CODE_WORKFLOWS` ·
`WORKFLOW_SIZE_WARNING_TOKENS`/`_AGENTS` · `MAX_SUBAGENT_SPAWN_DEPTH` (3) ·
`MAX_TOOL_USE_CONCURRENCY` (10) · `FORK_SUBAGENT` · `TASK_MAX_OUTPUT_LENGTH` (32 000/160 000) ·
`SUBAGENT_BG_SHELL_MAX_MS` (1 h) · `COORDINATOR_MODE` · `COORDINATOR_EXTRA_TOOLS` ·
`DISABLE_CLAUDE_CODE_SKILL` · `DISABLE_CLAUDE_API_SKILL` · `DISABLE_POLICY_SKILLS` ·
`DISABLE_CRON` · `GLOB_NO_IGNORE` · `GLOB_HIDDEN` · `GLOB_TIMEOUT_SECONDS` · `SHELL` ·
`SHELL_PREFIX` · `GIT_BASH_PATH` · `USE_BUILTIN_RIPGREP` · `EMBEDDED_SEARCH_TOOLS` ·
`ENABLE_MCP_LARGE_OUTPUT_FILES` · `MCP_TRUNCATION_PROMPT_OVERRIDE` ·
`AUTO_BACKGROUND_TIMEOUT_MS` · `MCP_TOOL_IDLE_TIMEOUT` · `MAX_STRUCTURED_OUTPUT_RETRIES` (5) ·
`DISABLE_GIT_INSTRUCTIONS` · `DISABLE_ORG_MEMORY` · `CLAUDE_MEMORY_STORES` ·
`STOP_HOOK_BLOCK_CAP` (8) · `DISABLE_PRECOMPACT_SKIP` · `TOTAL_TOKENS_REMINDER` ·
`COWORK_MEMORY_GUIDELINES`/`_EXTRA` · `EXTRA_BODY` · `SESSIONEND_HOOKS_TIMEOUT_MS` ·
`CLAUDE_ENV_FILE` · `FILE_READ_MAX_OUTPUT_TOKENS` · `DISABLE_INTERLEAVED_THINKING`

### Las cinco que más pesan, que no estaban en ninguna sección

| Nombre | Dónde | Qué hace |
|---|---|---|
| **`CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`** | entorno | **De fábrica 8.** Cuántas veces seguidas un freno `Stop` puede impedir que el turno termine antes de que se le ignore. **En `0` quita el tope: un freno mal escrito deja la sesión colgada sin salida frente al experto** |
| **`CLAUDE_COWORK_MEMORY_GUIDELINES`** · **`_EXTRA_GUIDELINES`** | entorno | **El texto de las reglas de memoria que se le inyecta a la IA.** El primero sustituye, el segundo agrega. **Es la vía limpia para decirle qué no debe recordar de una entrevista** — y la regla de «sin dato personal» ya existe y hoy nadie se la pasa |
| **`CLAUDE_MEMORY_STORES`** | entorno | Un JSON que **sí valida y truena** —lo contrario del settings—. Efecto lateral: tenerla puesta **apaga la memoria de organización** |
| **`CLAUDE_CODE_DISABLE_ORG_MEMORY`** | entorno | Cierra las tres compuertas de la memoria de organización. No toca la memoria automática local |
| **`observer` · `observerMessage` · `observeSubagents`** | frontmatter de agente | **Un agente que vigila a otro mientras trabaja.** Es la figura del auditor de Nemawashi corriendo en paralelo, no después. Se abren con `CLAUDE_CODE_EXPERIMENTAL_OBSERVER_AGENTS` |

**`includeGitInstructions: false` quedó probado por `--settings`** — no exige nivel política. Y
salió de rebote que **el bloque de git sólo entra al prompt si hay herramienta de shell**.

## Descartadas

- **`CLAUDE_CODE_AGENTS` no existe.** Cero apariciones, y con control positivo: el campo `agents` sí se mueve cuando algo lo mueve. **Fue un nombre que este documento inventó** al expandir mal una abreviatura.
- **`CLAUDE_CODE_TOKEN_BUDGET` no existe.** Invención del resumen de un fetch. Nunca entró.
- **`CLAUDE_CODE_MAX_TOKENS` no existe.** Es `CLAUDE_CODE_MAX_OUTPUT_TOKENS`.
- **`CLAUDE_CODE_USE_NATIVE_FILE_SEARCH`** — declarada y tipada, sin sitio de lectura, sin efecto medible con control positivo. La única del bloque en esa cubeta.
- **`CLAUDE_CODE_MANAGED_SETTINGS_PATH`** — su única aparición útil es de **escritura**, apuntando a un directorio. Y medido: **no cargó ningún settings**, ni como directorio ni como archivo, encadenado contra el control positivo del instrumento. **Consecuencia: `claudeMd` se queda sin ruta practicable desde Nemawashi** — era la candidata obvia.
- **`CLAUDE_ENV_FILE`** — no aplicó la variable que traía dentro. *Reserva declarada por el auditor: se probó con formato `CLAVE=valor`; si espera otro formato, el nulo es del formato y no de la variable.*
- **Diecisiete variables de comportamiento** —`PROACTIVE`, `INVESTIGATE_FIRST`, `REPORT_FINDINGS`, `PLAN_MODE_REQUIRED`, `OVERRIDE_DATE`, `AUTOMODE_DECISION_LOG` y las demás— no movieron ningún instrumento. **`CLAUDE_CODE_PROACTIVE` no prende el estilo `Proactive`**: las palancas reales son `outputStyle` y `--permission-mode`.

## Lo que sigue sin medirse, y por qué

- **Las ocho `CLAUDE_CODE_AUTO_MODE_*`.** Ningún instrumento a la mano las distingue de una variable inventada: `auto-mode config` imprime reglas, no perillas, y el registro de depuración **no expone ninguna decisión del clasificador** —comprobado comparando modo auto contra modo normal: 18 líneas de diferencia, todas ruido—.
- ~~`CLAUDE_CODE_SIMPLE_SYSTEM_PROMPT`~~ — **medido después: +12 235 tokens al ponerla en `0`.** Ver arriba. Estuvo a punto de quedarse en «sin efecto» porque `=1` da cero: **de fábrica ya está activo**, así que la dirección que discrimina es apagarlo. Es el mejor ejemplo de por qué probar una sola dirección no basta.
- `CLAUDE_CONTEXT_COLLAPSE` y `_MODEL`, `FORCE_EVALUATE_MEMORY`, `COLD_COMPACT`, `FORCE_MID_CONVERSATION_SYSTEM`, `MEMORY_PUSH_DELETE_MODE`, `COWORK_MEMORY_PATH_OVERRIDE`, `DISABLE_PROMPT_CACHING`, `CLAUDE_CONFIG_DIR`, `ANTHROPIC_CONFIG_DIR` — tipo declarado confirmado, lectura por alias.
- **Diecisiete variables de herramientas** que no aparecen en el arranque ni mueven el prompt. **No se corrieron a propósito:** un nulo ahí diría que el medidor está ciego, no que la variable no sirve. Medirlas pide otro instrumento — un comando que tarde, un servidor MCP de mentiras, una salida gigante.
- Tres nulos que **no** son «sin efecto»: `DISABLE_CLAUDE_CODE_SKILL` (no hay tal carta en la base), `DISABLE_POLICY_SKILLS` (esta máquina no tiene cartas de política) y `EXPERIMENTAL_OBSERVER_AGENTS` (el observador se lanza al correr el agente observado, no al arrancar).

**Lo que quedó sin verificar del resto del documento:**

- **Si `AskUserQuestion` existe fuera de `-p`** — y sobre todo en el modo de entrada por flujo. Tres perillas de este documento dependen de la respuesta.
- **Si el molino corre dentro del modo coordinador.** `Workflow` está registrado; registrado no es funcionando.
- Si las cartas sobreviven a `--bare` — la prueba se detuvo en el fallo de autenticación.
- Que `tui` sea una clave real: el ejecutable no valida nombres.
