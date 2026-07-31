---
tipo: recursos
estado: vigente
---
# Plano — Nemawashi

> **Lo que se propuso al arrancar.** Foto del día 0. **No se vuelve a tocar.** Cuando una
> decisión cambie, el registro es su ADR y la prueba es el diff contra `arquitectura-desarrollo.md`.

> ⚠️ **Borrador de propuesta, sin firmar.** Todo lo que sigue lo propuso la IA a partir de
> la conversación de arranque. Los renglones marcados **[propuesto]** esperan corrección
> del dueño del producto. **§0.4 es explícitamente suyo, no del que teclea.**

---

## §0 · Los hechos que mandan

### 0.1 Escala esperada a 3 años

- **Hecho:** Un consultor y un experto de negocio por sesión. Decenas de proyectos a lo
  largo de 3 años, nunca concurrentes. El artefacto más grande es un roadmap de
  **cientos de ítems**, no miles. No hay tabla, hay archivos.
- **De dónde salió:** Estimado a partir de la conversación de arranque. **Sin medir.**

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
  permitidos**. Se asigna al crear el ítem.
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
- **Decisión:** Un solo ejecutable de escritorio. [propuesto]
- **Porque:** §0.4.3 — el experto abre un programa, no instala un stack.
- **ADR:** pendiente

### 2.2 Cómo se hablan las partes entre sí
- **Decisión:** `pendiente` — depende de qué armazón de escritorio se elija.

### 2.3 Paradigma de programación
- **Decisión:** `pendiente`

### 2.4 Organización interna del código
- **Decisión:** `pendiente`
- **Regla de dependencia:** `pendiente`

### 2.5 Superficie de usuario
- **Decisión:** **Escritorio, una sola superficie.** Armazón concreto `pendiente`.
- **Códigos base que implica:** Uno.
- **Porque:** §1.3 y §0.4.3.
- **ADR:** pendiente

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

### 2.10 Dos usuarios, el mismo registro
- **Decisión:** No aplica hoy — un usuario por máquina (§1.10). Dos consultores en el
  mismo repo se resuelve con git, no con la app.

### 2.11 Idempotencia y reintentos
- **Decisión:** `pendiente` — importa cuando una sesión con la IA se corta a la mitad.

### 2.12 Reportes y analítica
- **Decisión:** No hay.

### 2.13 Archivos y adjuntos
- **Decisión:** `pendiente` — el experto va a querer pegar capturas y documentos.

### 2.14 Integraciones con sistemas externos
- **Decisión:** **Claude Code**, invocado como proceso local. Si no responde, la sesión
  se detiene y lo ya registrado queda intacto.
- **Porque:** Es la única dependencia externa y es local.
- **ADR:** pendiente

### 2.15 Qué expone hacia afuera
- **Decisión:** **Nada.** No hay API, no hay servidor, no hay puerto abierto.
- **Porque:** §0.2.

### 2.16 Patrones de diseño que se dan por decididos
- **Decisión:** `pendiente`
- **Prohibidos, con motivo:** `pendiente`
- **Quién decide y cuándo:** El dueño del producto, antes del primer archivo de código.

---

## El CÓMO-técnico operable

## El stack

`pendiente`. Lo único decidido al arranque: **TypeScript** para las herramientas, los
gates y la forma del ítem, porque esa forma la tocan tres cosas distintas —el agente que
la escribe, el hook que la valida y la interfaz que la muestra— y sin un tipo compartido
se desincronizan sin avisar.

Dos límites conocidos y verificados:
- Los **workflows de Claude Code son JavaScript plano** — no aceptan TypeScript.
- Los **hooks sí se pueden compilar** desde TypeScript.

Lo que **no** hay: sin base de datos, sin ORM, sin servidor, sin API.

## El entorno de desarrollo

`pendiente`. Conocido: se desarrolla en **Windows 11**. Herramienta externa obligatoria:
**Claude Code instalado y con sesión iniciada** — la app no funciona sin él.

## Datos y persistencia

**Sin base de datos.** La persistencia son archivos markdown con frontmatter, versionados
con git dentro del repo del cliente. La app no guarda nada propio fuera de ese repo.

Cuadra con §1.6, §1.7, §1.8 y §2.7.

## Convenciones de código

`pendiente`.

## Cómo se corre y se prueba

`pendiente`.

---

## Lo que se decidió no decidir

- **§2.2, §2.3, §2.4 y §2.16** — se cierran cuando se elija el armazón de
  escritorio, porque ese elige por ellos. **Disparador: la decisión de §2.5.**
- **§2.7 (migración de la forma del ítem)** — se cierra cuando exista la primera versión
  de la forma. **Disparador: el primer cambio a un campo del ítem.**
- **§2.13 (adjuntos)** — se cierra la primera vez que un experto quiera pegar una captura.

---

> **Procedencia.**
>
> Llenado por la IA el **2026-07-29**, a partir de la conversación de arranque con el
> dueño del producto. **Sin firmar.** Los renglones marcados **[propuesto]** y todo §0.4
> esperan su corrección.
>
> Se escribe una vez y no se vuelve a tocar.
