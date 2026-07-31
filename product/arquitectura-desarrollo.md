---
tipo: recursos
estado: vigente
---
# Arquitectura — Nemawashi

> **Lo que rige hoy**, comprobable abriendo un archivo del repo. Se re-mide en cada cierre
> y cada vez que un cambio lo toque.
>
> **Día 0: copia literal de `plano-desarrollo.md`** — no había código contra el cual medir.
> **Ya lo hay:** el esqueleto aterrizó el 2026-07-30 y las secciones del CÓMO-técnico están medidas
> contra él, no propuestas. Los §0, §1 y §2 siguen sin volver a medirse.

> ⚠️ **Borrador de propuesta, sin firmar.** Todo lo que sigue lo propuso la IA a partir de
> la conversación de arranque. Los renglones marcados **[propuesto]** esperan corrección
> del dueño del producto. **§0.4 es explícitamente suyo, no del que teclea.**

---

## §0 · Los hechos que mandan

### 0.1 Escala esperada a 3 años

- **Hecho:** Un consultor y un experto de negocio por sesión. **El experto aporta horas contadas
  por semana, y ese es el insumo escaso del método:** todo lo que consuma su atención sin producir
  conocimiento es pérdida directa, y de ahí cuelga cualquier decisión sobre cómo se le habla. Del
  otro lado, quienes leen el resultado son **dos personas que aprenden a desarrollar mientras
  construyen**. Decenas de proyectos a lo largo de 3 años, nunca concurrentes. El artefacto más
  grande es un roadmap de **cientos de ítems**, no miles. No hay tabla, hay archivos.
- **De dónde salió:** Estimado a partir de la conversación de arranque. El presupuesto de horas del
  experto y el tamaño del equipo lector se agregaron el **2026-07-30** al destilar la conversación
  de arranque del primer caso real; la cifra exacta de horas es dato del cliente y no se registra
  aquí (ADR 0002). **Sin medir contra una sesión real.**

### 0.2 Marco regulatorio y residencia de datos

- **Hecho:** Ninguno aplica a la herramienta. **Pero el contenido que captura es
  confidencial del cliente** — reglas de negocio, estructura de sus sistemas, a veces
  datos reales usados para confrontar al experto. Consecuencia dura: **ese contenido no
  sale del repo del cliente.** Ni telemetría, ni copia en la app, ni caché fuera del repo.
- **De dónde salió:** Derivado de la naturaleza del trabajo de consultoría. [propuesto]

### 0.3 Disponibilidad y pérdida tolerable

- **Hecho:** Puede estar caída sin consecuencia — se relanza. **Pérdida tolerable de lo
  ya registrado: cero**, porque está en git. Pérdida tolerable de una sesión en curso no
  registrada: **una sesión**, y esa es justo la que duele.
- **De dónde salió:** [propuesto] — es el renglón que justifica el hook `Stop`.

### 0.4 Las cualidades que mandan — máximo 3

- **Hecho:**
  1. **Procedencia** — ningún ítem existe sin decir de dónde salió y qué tan firme está.
  2. **No invadir** — el repo del cliente sólo recibe resultados, nunca maquinaria.
  3. **Que el experto nunca vea una terminal** — si tiene que entender la herramienta,
     la herramienta falló.

- **De dónde salió:** Propuestas por la IA, **confirmadas por el dueño del producto el
  2026-07-29** sin cambios de orden.
- **Lo que esto NO es:** Explícitamente **no** optimizamos para escala, velocidad de
  respuesta, ni belleza de la interfaz. Tampoco para que la use un dev — el dev es
  lector del resultado, no usuario de la app.

---

## §1 · Lo que no se revierte

### 1.1 Aislamiento de datos entre clientes

- **Decisión:** **Sin multi-cliente.** Cada repo es su propio silo. La app es de un solo
  usuario en su máquina y sólo ve el repo que abrió.
- **Porque:** §0.1 — nunca hay dos clientes vivos al mismo tiempo en una instalación. Y
  §0.2 — el aislamiento más fuerte posible es que los datos de cada cliente vivan en
  repos distintos que la app ni siquiera conoce hasta que los abres.
- **ADR:** pendiente

### 1.2 Cómo se identifica al cliente en cada petición

- **Decisión:** **Por el repo seleccionado al abrir la app.** No hay login, no hay
  inquilino, no hay sesión de usuario.
- **Porque:** Consecuencia directa de 1.1.
- **ADR:** pendiente

### 1.3 Dónde corre

- **Decisión:** **Máquina del usuario.** Ejecutable de escritorio.
- **Porque:** §0.2 — el contenido no debe salir de donde está el repo. Y el requisito de
  arranque: usar el plan mensual de Claude Code ya instalado, que vive en esa máquina.
- **ADR:** pendiente

### 1.4 Cómo se representa el dinero y las cantidades exactas

- **Decisión:** **No aplica.** La app no calcula dinero ni cantidades exactas.
- **Porque:** Es una herramienta de captura de conocimiento. Se declara para cerrar el
  eje, no para dejarlo abierto a que alguien meta un `float` algún día.
- **ADR:** —

### 1.5 Tiempo: qué se guarda y en qué huso

- **Decisión:** **Fecha y hora con huso explícito, en formato ISO 8601.** Cada ítem lleva
  cuándo se registró y cuándo se confirmó.
- **Porque:** Es parte de la procedencia (§0.4.1): «el experto confirmó esto» sin fecha
  no sirve para saber si sigue vigente. El huso explícito porque una consultoría puede
  ser remota entre zonas distintas.
- **ADR:** pendiente

### 1.6 Motor de persistencia

- **Decisión:** **Sin base de datos.** Archivos markdown con frontmatter, versionados en
  el repo del cliente con git.
- **Porque:** §0.2 — el conocimiento tiene que ser legible por un humano y viajar con el
  proyecto. Una BD lo encierra en un formato que sólo la app abre; el markdown lo lee el
  dev directo, y git le da historia gratis.
- **ADR:** pendiente

### 1.7 Colación e idioma de la base de datos

- **Decisión:** No hay BD, pero la **búsqueda dentro de la app es insensible a acentos y
  a mayúsculas**. Codificación de todos los archivos: **UTF-8**.
- **Porque:** El experto va a buscar «credito» y tiene que encontrar «crédito». Se decide
  ahora porque cambiarlo después obliga a reindexar todo. [propuesto]
- **ADR:** pendiente

### 1.8 La historia: ¿se sobrescribe o se acumula?

- **Decisión:** **La historia es git.** Los archivos se sobrescriben; el historial vive en
  los commits, y la app hace commit por sesión.
- **Porque:** Reinventar una bitácora encima de un repo versionado es duplicar trabajo. Y
  atarlo a git significa que la procedencia sobrevive aunque la app desaparezca.
- **ADR:** pendiente

### 1.9 De quién es la verdad sobre la identidad del usuario

- **Decisión:** **La app no autentica a nadie.** Hereda la sesión de Claude Code que ya
  está instalada en la máquina.
- **Porque:** Requisito de arranque — plan mensual, sin API key. Meter identidad propia
  agregaría una superficie que nadie pidió.
- **ADR:** pendiente

### 1.10 Quién puede ver y hacer qué

- **Decisión:** **Sin permisos en la app.** Quien puede abrir el repo puede todo.
- **Porque:** Consecuencia de 1.1 y 1.9. El control de acceso real es el del repositorio
  (git/GitHub), y ahí ya está resuelto.
- **ADR:** —

### 1.11 Folios y numeración de documentos

- **Decisión:** Cada ítem lleva **identificador consecutivo por dominio, con huecos
  permitidos**. Se asigna al crear el ítem. **La identidad vive dentro del archivo, no en su
  nombre**: el nombre es sólo una etiqueta amigable, y se normaliza —minúsculas, sin
  acentos, sin caracteres que Windows prohíbe, con largo máximo—. Renombrar un ítem no lo
  convierte en otro.
- **Porque:** Los ítems se citan entre ellos y desde los ADR; un identificador estable es
  obligatorio. Con huecos porque no hay regulador que exija lo contrario, y sin huecos
  obligaría a coordinar la asignación entre ramas de git. [propuesto]
- **ADR:** pendiente

### 1.12 Operación sin conexión

- **Decisión:** **Partido en dos.** Leer, buscar y editar ítems a mano: **funciona sin
  conexión**. La sesión con la IA: **requiere conexión**.
- **Porque:** Lo primero es leer y escribir archivos locales, no hay razón para
  bloquearlo. Lo segundo llama a un modelo remoto y no hay forma de fingirlo. Declararlo
  ahora evita prometer una app «offline» que a la mitad exige internet.
- **ADR:** pendiente

### 1.13 Cómo sale un cliente

- **Decisión:** **Se lleva su repo.** No hay nada suyo en ningún otro lado: ni en la app,
  ni en una BD, ni en la nube. Borrar la carpeta borra todo.
- **Porque:** Es la prueba de 1.1. Si esto no cupiera en dos renglones, 1.1 estaría mal
  elegida.
- **ADR:** —

---

## §2 · Lo caro

*Se llenan los que el arranque ya decidió. El resto queda `pendiente` y se cierra antes de tocarlo.*

### 2.1 Forma de despliegue
- **Decisión:** **Monolito modular.** Un solo ejecutable; por dentro, núcleo + adaptadores
  + dos caras.
- **Porque:** §0.4.3 — el experto abre un programa, no instala un stack. Y hay dos
  consumidores sobre la misma lógica, que es lo que obliga a modularizar por dentro.

### 2.2 Cómo se hablan las partes entre sí
- **Decisión:** **Llamada directa en proceso.** Única excepción: Claude Code, que se lanza
  como proceso hijo.
- **Porque:** Todo corre en la misma máquina y en el mismo programa (§1.3). Meter red o
  colas entre las partes agrega operación que nadie va a atender.

### 2.3 Paradigma de programación
- **Decisión:** **Mixto, con regla de reparto.** El núcleo es funcional: datos planos y
  funciones que reciben algo y devuelven un dato nuevo, sin tocar el original. Los
  adaptadores usan objetos.
- **Regla de reparto:** Si es una transformación, es función. Si tiene estado que vive en el
  tiempo, **ese estado es un dato plano que vive en el núcleo** y las transiciones son
  funciones puras —*dado este estado y este evento, el nuevo estado es este*—; el objeto del
  adaptador sólo **sostiene** el dato y llama a las funciones, nunca guarda reglas.
- **Porque:** Una función pura se lee sola y se prueba sin montar nada, que es la condición
  para revisar el núcleo sin ejecutarlo. La segunda mitad de la regla existe porque la
  sesión de elicitación **es** estado que vive en el tiempo **y** es el corazón del dominio:
  sin esa precisión se iría a los adaptadores y el núcleo quedaría hueco.

### 2.4 Organización interna del código
- **Decisión:** **Puertos y adaptadores.** Un núcleo con las reglas del método —estados de
  un ítem, procedencia, gates, orden de los módulos— y adaptadores para el repo, para
  Claude Code y para la interfaz.
- **Regla de dependencia:** **El núcleo no importa nada de Electron, del sistema de
  archivos, ni del proceso de Claude Code.** Las flechas van siempre hacia adentro. Sin
  esta línea el patrón es decorativo.
- **Regla entre módulos:** **Ningún módulo importa de otro ni comparte estado en memoria.
  Los datos viajan por los archivos del repo** — uno escribe ítems, otro los lee del disco.
  Se verifica con herramienta, no con buena voluntad.
- **Las dos piezas compartidas, y son las únicas:**
  - **Contratos** — la forma del ítem y su validador. **Sin comportamiento**: si ahí dentro
    aparece un `if` o una cuenta, se rechaza. Es la regla que puede vigilar alguien que no
    programa, leyendo el diff.
  - **Acceso al repo** — la única pieza que toca disco: escribir sin dejar archivos a
    medias, normalizar nombres, parsear, vigilar cambios.

  Ninguna de las dos importa a ningún módulo. Compartir esto **no es acoplamiento entre
  módulos**: es tener un solo idioma en vez de cuatro dialectos.
- **La única señal permitida por código:** un campanazo que dice *«algo cambió, ve al
  disco»*, sin contenido. **Los datos viajan por archivos; el «cuándo mirar» puede viajar
  por código.** Si el aviso carga el ítem o su estado, en ese instante hay dos verdades y
  algún día no van a coincidir.
- **Porque:** Prohibir todo import compartido no elimina el acoplamiento, **lo vuelve
  invisible**: si el que escribe cambia un campo, el que lee se rompe igual, sólo que nadie
  avisa hasta que truena en vivo. Los contratos conservan lo que la regla quería —módulos
  que no se conocen— y agregan al único revisor que nunca se cansa: el compilador. Y una
  sola capa de acceso al disco evita que el arreglo de un error se tenga que repetir en
  cuatro lugares, donde para el sexto mes sólo estará hecho en tres.
- **Cuidado con la dosis:** pocos puertos —repo, proceso de Claude Code, reloj— y prohibido
  crear una interfaz con una sola implementación y ninguna prueba que la use. Veinte
  archivos chiquitos también son deuda para quien lee despacio.

### 2.5 Superficie de usuario
- **Decisión:** **Escritorio con Electron**, una sola superficie — **con dos modalidades**: teclado
  y pantalla para quien consulta, **voz para el experto**. Una superficie, no dos.
- **Códigos base que implica:** Uno.
- **Porque:** §1.3 y §0.4.3 mandan escritorio. El armazón se elige por **lenguaje único**:
  Electron trae Node adentro, así que el núcleo en TypeScript corre tal cual dentro de la
  app. Con Tauri habría núcleo en TypeScript y caparazón en Rust, y la parte en Rust sería
  justo la que abre archivos y lanza procesos — lo más importante de revisar, en el idioma
  más difícil de revisar. Las ventajas de Tauri son tamaño y memoria, y §0.4 declara que no
  optimizamos para eso.

### 2.6 Cómo se llega a los datos desde el código
- **Decisión:** Lectura y escritura de archivos directa. Sin ORM porque no hay BD (§1.6).
- **Porque:** Consecuencia de §1.6.

### 2.7 Cómo cambia el esquema de la base
- **Decisión:** No hay esquema de BD, pero **sí hay forma del ítem, y sí va a cambiar**.
  Cómo se migran ítems viejos a una forma nueva: `pendiente`. **Este eje no se puede
  dejar abierto mucho tiempo** — es el equivalente real de una migración aquí.

### 2.8 Trabajo que corre solo
- **Decisión:** No hay. [propuesto]

### 2.9 Consistencia: qué tiene que cuadrar al instante
- **Decisión:** `pendiente`

### 2.10 Dos escritores, el mismo repo
- **El problema real:** no son dos usuarios. Son **la app y el proceso de Claude Code
  escribiendo la misma carpeta al mismo tiempo**, y un turno de la IA no es una escritura:
  son diez o treinta en pocos segundos, mezclando creaciones, ediciones y renombrados.
- **Decisión — mecanismos, no acuerdos:**
  - **Escritura atómica.** Se escribe a un archivo temporal en la misma carpeta y se
    renombra encima. El renombrado es instantáneo, así que nadie ve un archivo a medias.
  - **Candado de la pantalla.** Mientras hay un turno de la IA abierto, los formularios de
    edición se ponen en sólo lectura, con aviso visible. **Esto es lo que convierte «un solo
    escritor» de buena voluntad a mecanismo.** *Se llama candado y no semáforo porque
    `arquitectura-diseno.md` ya usa «semáforo» para la regla de colores de estado, y un
    término con dos significados no se puede citar en una revisión.*
  - **Guardado con verificación.** Al abrir un ítem se recuerda una huella de su contenido;
    al guardar, si la huella en disco ya no coincide, no se pisa nada y se pregunta.
  - **Lectura defensiva.** Reintentar ante archivo ocupado o desaparecido, y tratar un ítem
    ilegible como *ilegible* —visible, con advertencia— en vez de tumbar la vista entera.
  - **Un ítem = un archivo, siempre.** Nunca partir un ítem en varios que deban cambiar
    juntos. Si ningún estado intermedio es inválido, no hacen falta transacciones.
    **El documento que un ítem cita —informe de análisis, exploración, ADR— no es parte del
    ítem:** es una pieza independiente, con su propia estructura y su propio folio, y el ítem sólo
    guarda la referencia. Por eso citar no parte nada y esta regla sigue en pie. Un ítem cuyo
    documento citado no existe o no se puede leer se muestra **con advertencia**, igual que
    cualquier archivo ilegible: no bloquea la vista ni obliga a una transacción.
- **Porque:** «Un solo escritor» a secas es un acuerdo entre dos procesos que no se hablan.
  Nada impide que el humano guarde mientras la IA escribe, y el resultado es trabajo que se
  evapora **sin mensaje de error** — la peor clase de falla. Git es árbitro *después* del
  hecho: te deja ver que se pisaron, no lo impide.
- **Límite honesto, escrito hoy y no cuando lo pida un cliente:** todo esto asume **repo
  local, disco local, un solo usuario**. Dos personas editando el mismo repo en vivo no
  tiene mitigación posible con este diseño — eso pide un servidor.

### 2.11 Idempotencia y reintentos
- **Decisión:** `pendiente` — importa cuando una sesión con la IA se corta a la mitad.

### 2.12 Reportes y analítica
- **Decisión:** No hay.

### 2.13 Archivos y adjuntos
- **Decisión:** `pendiente` — el experto va a querer pegar capturas y documentos.

### 2.14 Integraciones con sistemas externos
- **Decisión:** **Claude Code**, invocado como proceso local. Si no responde, la sesión
  se detiene y lo ya registrado queda intacto. **Más los dos motores de voz —reconocimiento y
  síntesis— que la sesión con el experto monta encima del chat: también locales.**
- **Porque:** Son las únicas dependencias externas y **todas son locales**. La voz del experto es
  contenido confidencial suyo, así que un motor de nube la sacaría de la máquina y eso es
  exactamente lo que §0.2 prohíbe. Se arranca local; la nube sólo se evalúa si la latencia medida
  rompe la conversación, y esa evaluación exigiría escribir una excepción a §0.2.
- **ADR:** pendiente

### 2.15 Qué expone hacia afuera
- **Decisión:** **Nada.** No hay API, no hay servidor, no hay puerto abierto.
- **Porque:** §0.2.

### 2.16 Patrones de diseño que se dan por decididos
- **Decisión:** Tres, y no más:
  - **Repositorio** — todo acceso a los archivos del repo pasa por una sola pieza; nadie más
    toca disco. *Resuelve:* si cada módulo lee a su manera, cambiar la forma del ítem obliga
    a buscar por todo el código.
  - **Resultado en vez de excepción**, sólo en el núcleo — lo que puede fallar de forma
    esperada devuelve «salió bien» o «salió mal y por esto». *Resuelve:* una excepción se
    olvida; un resultado que hay que abrir para usarlo, no. **Con disciplina obligatoria:**
    un resultado sin consumir se marca automáticamente, porque si no, el patrón cambia un
    error ruidoso por un error callado — que es peor.
  - **Validar en la frontera** — todo lo que entra de fuera se valida al entrar, una sola
    vez; adentro ya se confía. *Resuelve:* los tipos de TypeScript desaparecen cuando el
    programa corre, y la salida de la IA entra justo por ahí.
- **Prohibidos, con motivo:**
  - **Singleton** — esconde de quién depende una pieza y arruina las pruebas.
  - **Herencia de más de un nivel** — con tres niveles, entender una pieza obliga a leer
    tres archivos.
- **Porque:** El equipo son dos personas que revisan despacio código escrito por una IA, y que
  aprenden a desarrollar mientras construyen. Cada patrón de esta lista existe para que un error
  se vea leyendo, no ejecutando — y el argumento pesa **más**, no menos, cuando quien lee todavía
  está formando el criterio para saber qué mirar.

---

## El CÓMO-técnico operable

## El stack

**TypeScript de la pantalla al disco**, un solo lenguaje. La forma del ítem la tocan tres
cosas distintas —el agente que la escribe, el hook que la valida y la interfaz que la
muestra— y sin un tipo compartido se desincronizan sin avisar.

- **Ejecutable de escritorio:** Electron. Trae Node adentro, así que el núcleo corre nativo.
- **Núcleo, adaptadores y línea de comandos:** TypeScript sobre Node.
- **Pantalla:** **React, desde el día 1.** No por la primera pantalla —un formulario no lo
  necesita— sino porque el chat y el tablero sí, y «sin framework» no termina en
  simplicidad: termina en un armazón casero implícito, sin documentación ni comunidad, que
  es exactamente el código imposible de revisar. Se elige React y no algo más ligero porque
  el tamaño ya no es argumento —Electron pesa 150 MB de todos modos— y sí lo es que sea el
  armazón del que más y mejor código existe: la IA escribe lo convencional, y lo
  convencional es lo revisable.
- **Validación en tiempo de ejecución:** una librería de esquemas. **Es la única dependencia
  que el núcleo tiene permitido**, y se declara aquí para que no se cuele sin decisión.

**Aislamiento obligatorio de Electron.** Electron tiene dos mundos: el que puede abrir
archivos y lanzar procesos, y la pantalla. **La pantalla no toca archivos ni procesos,
nunca.** Todo pasa por una lista corta y explícita de mensajes con nombre. Esa lista es,
además, la mejor página de revisión de toda la app: ahí se ve todo lo que la app puede
hacer.

**Versiones y dónde se comprueban.** Medidas al levantar el esqueleto: Electron 34, React 19,
TypeScript 5.7, Vite 6 con `electron-vite`, Vitest 3 para el núcleo y Playwright 1.5 para la
app. La lista viva es `package.json`; este renglón dice de qué mayor se partió, no reemplaza
al archivo.

La lista corta de mensajes con nombre vive en `src/contratos/mensajes.ts`, y es la página de
revisión que esta sección prometió: lo que no está escrito ahí, la pantalla no lo puede pedir.

Dos límites conocidos y verificados:
- Los **workflows de Claude Code son JavaScript plano** — no aceptan TypeScript.
- Los **hooks sí se pueden compilar** desde TypeScript.

Lo que **no** hay: sin base de datos, sin ORM, sin servidor, sin API.

## El entorno de desarrollo

`pendiente` en lo demás. Conocido: se desarrolla en **Windows 11**. Herramienta externa
obligatoria: **Claude Code instalado y con sesión iniciada** — la app no funciona sin él.

**Las trampas del entorno, medidas en la máquina de desarrollo el 2026-07-29:**

- **`core.autocrlf=true` está activo a nivel sistema.** Git cambia fines de línea al vuelo.
  Sin fijarlo, un diff dice «cambió todo el archivo» cuando cambió una palabra — y el
  historial deja de servir como memoria del proyecto, que es justo lo que el producto vende.
- **`Documentos` está redirigido a OneDrive.** Es el escenario más peligroso del producto: un
  repo dentro de una carpeta sincronizada produce archivos de conflicto que el tablero
  muestra como ítems duplicados, ítems borrados que resucitan, y un `.git` que se puede
  corromper. **Consecuencia de producto: al elegir el repo, la app verifica si está dentro de
  OneDrive, Dropbox o Google Drive, si la ruta es peligrosamente larga, o si es unidad de
  red — y avisa en lenguaje claro antes de dejar empezar.**
- **Las rutas largas están habilitadas en esta máquina, pero no lo estarán en la del
  cliente.** El límite de 260 caracteres sigue vivo por defecto.
- **El antivirus bloquea archivos recién creados mientras los escanea**, y produce errores de
  acceso denegado intermitentes. Empeora en máquinas corporativas, que son las de los
  clientes. **Dejó de ser previsión: al instalar las dependencias por primera vez, el
  ejecutable de Electron se descargó completo y se descomprimió a medias, sin error visible
  — la instalación se dio por buena y la app no arrancaba.** Consecuencia de producto: una
  instalación que termina «bien» no prueba que la app corra; lo único que lo prueba es
  abrirla.

## Datos y persistencia

**Sin base de datos.** La persistencia son archivos markdown con frontmatter, versionados
con git dentro del repo del cliente. La app no guarda nada propio fuera de ese repo.

Cuadra con §1.6, §1.7, §1.8 y §2.7.

## Convenciones de código

`pendiente` en lo demás. Fijado desde el día 1, porque son las que no se pueden retrofitear
sin reescribir archivos existentes:

- **`.gitattributes` con `*.md text eol=lf`, y UTF-8 sin BOM.** Fija fin de línea y
  codificación para todos y neutraliza el `core.autocrlf` de cada máquina. Sin esto los
  diffs se vuelven inútiles, y un BOM invisible al inicio del archivo rompe la lectura del
  frontmatter — el ítem aparece sin metadatos y nadie entiende por qué.
- **El fin de línea lo gobierna `.gitattributes`, no el editor.**

## Cómo se corre y se prueba

**Dos comandos, y no hay un tercero que haya que recordar.**

- **`npm run dev`** — abre la ventana. Al guardar un archivo la pantalla se actualiza sola
  sin cerrar la app.
- **`npm test`** — corre todo y dice qué se rompió: primero la lógica, luego compila, luego
  abre la app de verdad.

### Las cinco capas, de la más barata a la más cara

El peso va arriba: mientras más abajo, más lenta la prueba y más frágil. Una capa no
sustituye a la de abajo — cubre lo que la de abajo no puede ver.

| Capa | Qué prueba | Con qué | Cuándo corre |
|---|---|---|---|
| 1 · La lógica sola | Entrada exacta, salida exacta. Sin ventana y sin disco | Vitest | Siempre |
| 2 · El contrato | Que una verdad estructural siga en pie. Lee el código, no lo ejecuta | Vitest | Siempre |
| 3 · Un pedazo de pantalla | Un componente montado suelto, sin abrir la app | Vitest con pantalla en memoria | Siempre |
| 4 · La app entera | Que abra y responda al clic | Playwright sobre Electron | Siempre |
| 5 · A mano | Lo que sólo una persona juzga | Una persona | Antes de mostrar |

**Capa 1 — la lógica sola.** Es donde vive el valor y donde debe estar la mayoría. Poder
probarla sin montar nada es la condición que §2.3 pedía al elegir el núcleo funcional, y
aquí se cobra.

**Capa 2 — el contrato.** No opina: revisa un hecho y siempre contesta lo mismo. No se confunde
con la revisión de código: aquella es juicio y cambia según quién la haga; ésta pasa o falla.
**Se escribe un contrato siempre que dos lugares tengan que decir lo mismo y nada los obligue** —
ésa es la respuesta de este proyecto al acoplamiento invisible que §2.4 rechaza.

Cinco, y qué error atrapa cada uno:

- **Los canales entre los dos mundos.** Lo que de verdad viaja es la cadena del canal, no el
  nombre de la propiedad —eso ya lo garantiza el tipo—. Por eso los dos lados la toman de la
  lista, y el contrato comprueba que ninguno la escriba a mano.
- **La pared.** Que toda ventana que la app abre declare `contextIsolation` y niegue el acceso
  directo al sistema. Es un hecho escrito en la configuración, así que se lee; **buscarlo desde la
  app abierta no funciona**, porque lo único observable ahí es la ausencia de un símbolo que no
  existe bajo ninguna configuración.
- **Que el núcleo no escriba.** No por lo que sus textos prometan, sino porque **no importa nada
  con qué hacerlo**: toda flecha que sale del núcleo cae en el núcleo o en los contratos. Es la
  forma barata de sostener la cualidad «no invadir»; una prueba que busque palabras prohibidas en
  los avisos se esquiva cambiando una palabra.
- **Los valores con nombre.** Cada bloque de cada página de `design/` contra su fuente, en los dos
  sentidos: un valor que falta pesa igual que uno cambiado.
- **Que la pantalla no escriba a mano.** Ni texto visible dentro del JSX, ni un color, ni una
  medida en píxeles. Es lo que convierte los puntos 1 y 2 de la lista de comprobación de
  `arquitectura-diseno.md` §3 en herramienta en vez de buena voluntad. **Sus límites están
  escritos dentro del propio archivo** para que nadie los suponga cubiertos: mira los `.tsx`, y
  «valor a mano» es color y píxeles —lo que los documentos nombran—, no una familia tipográfica.

**Capa 3 — un pedazo de pantalla.** El componente se monta suelto y el otro mundo se
sustituye por respuestas falsas: lo que se prueba es la pantalla, no el disco. La pantalla en
memoria se pide archivo por archivo, con un comentario al inicio, para que la capa 1 no pague
ese costo.

**Capa 4 — la app entera.** Lenta, así que sólo para los caminos que importan. **Cuáles son
esos caminos sale de los casos de uso, y los casos de uso todavía no existen** — por eso hoy es
una sola prueba: que la ventana abra y que la pantalla alcance el otro mundo.

**Lo que la capa 4 no sirve para probar: que algo *no* pase.** Que la ventana abra sólo se ve
abriéndola, y ahí esta capa es insustituible. Pero que la pared esté en pie no se puede observar
desde dentro de la app —lo único a la mano es la ausencia de un símbolo, que sigue ausente aunque
la pared se caiga entera—, y una prueba así pasa siempre. **Una afirmación en negativo casi siempre
pertenece a la capa 2**, donde el hecho está escrito y se lee.

**Capa 5 — a mano.** Si la conversación por voz fluye, si la pantalla se lee. No desaparece:
se aligera, porque deja de gastarse en comprobar cuentas.

### Cómo se decide un caso nuevo

Tres preguntas, en orden:

1. **¿La respuesta correcta es un valor exacto?** → automática.
2. **¿Hace falta verla u oírla para saber si está bien?** → a mano.
3. **¿Depende del entorno —micrófono, red, la máquina del cliente—?** → a mano, o se
   automatiza sólo el pedazo que sí es exacto.

**Dos reglas de operación:**

- **Un cambio de comportamiento incluye su prueba.** No es un paso para después: es lo que
  permite revisar por verificación en vez de leyendo, que es la condición del equipo (§2.16).
- **Un error que se coló se blinda con una prueba antes de darlo por cerrado.** Un error que
  no se detecta vuelve.

### Dos reglas más, y el porqué

**Las pruebas de pantalla buscan por lo que un lector de pantalla anunciaría** —el nombre
del control, no su posición en el código—, para quedar atadas a lo que sí existe para una
persona. Sin esa regla la prueba pasa por elementos que nadie puede ver, y deja de ser
evidencia de que la app funciona.

**Lo que se evalúa para aceptar sale de la app real, clic por clic.** Nunca de un guion que
reproduzca el resultado por otro camino: ese guion prueba que el cálculo funciona, no que la
app lo haga igual.

**Lo que no se usa, y por qué:** manejar la app desde el navegador con una extensión. Nemawashi
es escritorio; no hay pestaña que abrir.

---

## Lo que se decidió no decidir

- **Cómo se migra un ítem a una forma nueva** — se cierra la primera vez que cambie un campo
  del ítem. Es el equivalente real de una migración aquí.
- **§2.7 (migración de la forma del ítem)** — se cierra cuando exista la primera versión
  de la forma. **Disparador: el primer cambio a un campo del ítem.**
- **§2.13 (adjuntos)** — se cierra la primera vez que un experto quiera pegar una captura.

---

> **Procedencia.**
>
> **Medido el 2026-07-29 contra el repo**, cuando no existía ningún archivo de código: por eso esta
> instancia nació como copia literal de `plano-desarrollo.md`, tal como manda la regla del día 0.
>
> **Vuelto a medir el 2026-07-30, ya con código.** El esqueleto existe —Electron, React,
> TypeScript, la pared entre los dos mundos y su lista corta de mensajes— y las secciones «El
> stack» y «Cómo se corre y se prueba» se escribieron contra él: las versiones salieron de
> `package.json` y los comandos se corrieron. Lo que **no** se volvió a medir son §0, §1 y §2:
> siguen siendo del día 0.
>
> Todo renglón marcado **[propuesto]** y todo §0.4 siguen sin comprobar contra realidad:
> son intención, no medición.
>
> **Bitácora del diff:**
>
> - **2026-07-29** — `diff product/plano-desarrollo.md product/arquitectura-desarrollo.md` → sin divergencia
>   fuera del encabezado y esta sección. Esperado en el día 0.
> - **2026-07-29 (segunda corrida)** — divergen la forma de despliegue, cómo se hablan las
>   partes, la organización interna, la superficie de usuario, el paradigma, los patrones,
>   el escritor concurrente y el stack. Veredicto en todos: **decisión que cambió** — el
>   plano los dejó en `pendiente` y aquí quedaron cerrados. Ninguno es defecto: no hay
>   código que pueda contradecirlos todavía. **Son decisiones, no mediciones**, y se vuelven
>   a visitar cuando exista el primer archivo. Las decisiones sobre paradigma, patrones,
>   escritor concurrente, aislamiento de Electron y armazón de pantalla salieron de una
>   revisión técnica independiente encargada el 2026-07-29.
> - **2026-07-29 (tercera corrida)** — divergen además la regla entre módulos, la identidad
>   del ítem, las convenciones de código y el entorno de desarrollo. Veredicto: **decisión
>   que cambió** en los tres primeros; **detalle medido** en el entorno, porque las trampas
>   ahí descritas se comprobaron contra esta máquina y no son intención. Salieron de cuatro
>   revisiones independientes con lentes distintos —adversarial, modos de falla, uso en
>   vivo y revisabilidad— encargadas el 2026-07-29, que corrigieron la regla original: los
>   módulos siguen sin conocerse, pero comparten contratos y una sola capa de acceso al
>   disco.
