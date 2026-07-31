# Sistema de diseño — Nemawashi

Casa del sistema de diseño, según `product/arquitectura-diseno.md` §4. Espejo local del
proyecto de Claude Design **«Nemawashi — Sistema de diseño»**
(`projectId` `38e2ac60-664e-4a20-8e8d-e8a1e75c89b5`).

Las rutas de esta carpeta corresponden 1:1 con las del proyecto remoto, así que `design/`
sirve como directorio de origen al volver a subir.

## Las diez páginas

| Página | Qué contiene |
|---|---|
| `fundamentos/color.html` | Papel, tinta, el azul de plano, y los tres colores de estado |
| `fundamentos/tipografia.html` | Las tres voces, la escala y las reglas de uso |
| `componentes/controles.html` | Campos, selectores, segmentado, fichas, interruptores, botones, campo con unidad, aviso de campo, tarjeta de aviso, control no disponible |
| `componentes/listas-y-editor.html` | La lista de piezas, el editor en su lugar —con el bloque «qué sabe, acotado»—, las etiquetas de estado y la matriz de permisos |
| `componentes/hoja.html` | El marco constante y el cajetín, con el desglose de sus cuatro casillas — y la hoja sin marco, para antes de que exista un repositorio |
| `componentes/conocimiento.html` | La afirmación en sus cuatro estados, la firma al pie, el hecho de disco, el turno, el dictado, el ítem flaco, la contradicción con folio, la cosecha y la franja de proporción |
| `pantallas/elegir-repositorio.html` | La primera pantalla, sin marco, con la revisión de salud — y la única que hoy pasa el punto 7 |
| `pantallas/consola-de-parametros.html` | La consola completa — Módulo 1 |
| `pantallas/sesion.html` | La conversación por voz y la cosecha — Módulo 3 |
| `pantallas/tablero.html` | Las dos colas y las contradicciones — Módulos 4 y 6 |

> `arquitectura-diseno.md` §4 todavía dice «seis páginas» y enumera las seis primeras. La
> cuenta de arriba es la real; §4 se corrige cuando se revise ese documento.

Cada HTML es autónomo: lleva sus propios valores con nombre en `:root`, soporta claro y
oscuro (`prefers-color-scheme` más `data-theme`) y abre con el marcador
`<!-- @dsCard group="…" -->` que la app usa para armar la tarjeta en el panel.

## Lo que rige al agregar algo

`arquitectura-diseno.md` §5: **ningún componente nace dentro de una pantalla.** Primero
entra aquí con su muestra en los dos temas, y desde aquí se usa. Cuando una pantalla
necesita algo que no existe hay tres salidas y sólo tres: resolverlo con lo que hay,
agregarlo como componente nuevo, o abrir un ADR declarando que el sistema no alcanza.

El punto 5 de la lista de comprobación (§3) prohíbe seis palabras en todo texto visible.
Por eso lo que en Claude Code son *skills* aquí se llaman **instructivos**, los *hooks* son
**frenos**, y las fuentes externas se nombran por lo que aportan, nunca por su mecánica.

## Las cinco secciones de la consola

Sustantivos, no preguntas — el índice de un plano enumera, no interroga.

| Sección | Qué gobierna |
|---|---|
| 1 · Criterio | El motor, la profundidad del razonamiento y las instrucciones de arranque |
| 2 · Capacidades | Agentes, instructivos, comandos y flujos |
| 3 · Reglas permanentes | El contexto que lee siempre, y de qué archivos lo saca |
| 4 · Límites | Permisos, frenos y topes |
| 5 · Conexiones | Fuentes, carpetas, navegador y variables de entorno |

## Omitido a propósito

Dos parámetros que Claude Code sí expone y que la consola **no ofrece**, cada uno por una
regla del sistema. Se declaran aquí para que nadie los agregue creyendo que fue un olvido:

- **El color con que se pinta cada agente en pantalla.** El sistema tiene un solo acento, y
  ámbar, verde y rojo son estado y nunca decoración (§2.A). Un selector que ofrece pintar un
  agente de ámbar produce exactamente lo que esa regla prohíbe, aunque la pantalla que lo
  configura esté limpia.
- **El modo de permisos que se salta todos los permisos.** Anularía el motivo de existir de
  la sección Límites. Éste sí se declara además en pantalla, porque quien busque los seis
  modos y encuentre cinco merece saber por qué.

## Archivos de máquina

- `_ds_manifest.json` — índice de tarjetas del panel de Design System. Lo compila la app a
  partir del marcador `@dsCard` de cada página; no se edita a mano.
- `_adherence.oxlintrc.json` — reglas de adherencia, **ya pobladas**: los veintidós valores con
  nombre y sus tres familias, la prohibición de que la pantalla importe archivos o procesos, y
  las dos que persiguen lo que §3 puntos 1 y 2 prohíben — un color escrito a mano y una medida
  suelta. **Lo que comprueba de verdad hoy es el contrato**
  `src/contratos/valores-de-diseno.test.ts`, que corre con `npm test`; este archivo es la misma
  regla para la herramienta de análisis, y **no se ejecuta hasta que esa herramienta se
  instale**. No confundir con la lista de comprobación de §3, que es la que gobierna.

## No incluido

- `_ds_bundle.js` — artefacto compilado que genera la propia app; no se edita a mano y no
  hace falta para iterar en local.

## Deuda declarada

- La sección **Reglas permanentes** dibuja tres controles como *no disponibles* con su
  motivo escrito. No es un hueco de diseño: son parámetros que Claude Code no expone hoy.
  Si eso cambia, los tres se vuelven controles reales.
- `componentes/hoja.html` dibuja el letrero «se guarda dentro de Nemawashi» tal como lo
  escriben los patrones. `arquitectura-diseno.md` §7.1 registra que
  `arquitectura-desarrollo.md` prohíbe ese lugar. Mientras la contradicción siga abierta,
  la casilla «Vive en» del cajetín y ese letrero pueden cambiar juntos.
- **La forma de los permisos sigue sin medir.** Es lo único abierto del JSON de
  configuración. `claude doctor` acepta cualquier llave desconocida sin quejarse, así que
  aceptar una estructura inventada no prueba nada. La matriz de la sección 4 está dibujada
  por su significado —puede / pregunta / nunca sobre una acción—, no por su forma de
  almacenamiento. *Disparador: la primera sesión lanzada con permisos puestos por Nemawashi.*
- La copia local y el proyecto publicado en Claude Design pueden divergir. Manda la del
  repositorio; ver `arquitectura-diseno.md` §4.
- **Tres de las cuatro pantallas no pasan el punto 7.** La consola, la sesión y el tablero
  siguen sin sus tres variantes —vacía, con error y cargando—. `elegir-repositorio` sí las
  tiene, y de paso enseñó cuál era el obstáculo: el vacío no se podía dibujar porque no se
  sabía qué se hace desde él, y en esa pantalla sí se sabe. *Disparador para las otras tres:
  el vacío de Agentes sin ningún agente, que sigue siendo el primero de los que faltan.*
- **La barra de pantallas ya navega, pero el juego de pantallas sigue abierto.** Las tres
  dibujan la misma tira —Sesión · Tablero · Parámetros— y **los enlaces son reales**: se
  pasa de una a otra, igual que con «Abrir sesión» y «Volver a la sesión». Lo que sigue sin
  decidir es **cómo se entra y cómo se sale**: `elegir-repositorio` ya existe y es la primera,
  pero ninguna de las tres con marco enlaza de vuelta a ella, y el botón «Cambiar» de la ficha
  del repositorio no tiene destino. Es lo que `arquitectura-diseno.md` §8 dejó abierto como
  «cuáles pantallas existen y cómo se cambia entre ellas». *Disparador: la quinta pantalla.*
- `page` e `intro` son el envoltorio de la propia página de muestra —el texto que explica
  la maqueta por encima del marco—, no interfaz del producto. Por eso no tienen componente
  y no cuentan como componente nacido dentro de la pantalla.

## Lo medido, para no volver a derivarlo

Contra **Claude Code 2.1.220**, con `claude doctor` y con una configuración que ya corre en
la máquina. Sostiene los campos del editor de frenos:

**Un freno tiene exactamente estos parámetros** — momento, sobre qué acción, qué se
ejecuta, con qué intérprete y con cuánto tope de tiempo:

```json
"PreToolUse": [{ "matcher": "Write",
  "hooks": [{ "type": "command", "command": "…", "shell": "powershell", "timeout": 10 }] }]
```

Lo que un freno **hace** al fallar no es un parámetro: si el guion termina con error, la
acción se detiene y lo que imprima es lo que la IA lee. Por eso el editor no ofrece un
selector de «qué hace si no se cumple» — ofrecerlo sería inventar configuración.

**Los 31 momentos válidos**, tal como `doctor` los enumera al rechazar uno falso:

```
PreToolUse · PostToolUse · PostToolUseFailure · PostToolBatch · Notification
UserPromptSubmit · UserPromptExpansion · SessionStart · SessionEnd · Stop · StopFailure
SubagentStart · SubagentStop · PreCompact · PostCompact · PermissionRequest
PermissionDenied · Setup · TeammateIdle · TaskCreated · TaskCompleted · Elicitation
ElicitationResult · ConfigChange · WorktreeCreate · WorktreeRemove · InstructionsLoaded
CwdChanged · FileChanged · DirectoryAdded · MessageDisplay
```

Los tres que sostienen el método: **PreToolUse** para exigir procedencia antes de escribir,
**Stop** para no dejar cerrar con hallazgos sin cosechar, y **SessionStart** para que la
sesión arranque sabiendo dónde está.
