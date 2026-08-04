---
name: devops
description: Carta de operaciones en Nemawashi — qué maquinaria existe hoy y qué no, por qué el andon corre sólo un contrato, las trampas del entorno ya medidas, y cómo se comprueba que la app arranca en una máquina que no es ésta. Úsala al tocar CI, compilación, empaque o el arranque de cualquier proceso.
---

<carta nombre="devops" agente="devops" momento="al tocar lo que corre fuera de la app">

<objetivo>
Lo que corre fuera de la app: el andon, la compilación, el empaque, y que arranque en una máquina
que no es ésta.
</objetivo>

<metodo>

<la-suite-de-cierre>
`npm test` es el instrumento de QA y encadena la lógica, los tipos, la compilación y la app abriendo
de verdad. **Un rojo en cualquier eslabón detiene la cadena, y eso es a propósito.** Lo tuyo no es
juzgar lo que mide: es que la cadena pueda correr, en esta máquina y en un runner.
</la-suite-de-cierre>

<el-andon archivo=".github/workflows/andon.yml">
Se jala en cada *pull request* y en cada push a `main`. Corre **una sola cosa**:
`src/contratos/sin-dato-personal.test.ts`.

No es pereza, es una decisión con motivo escrito en el propio archivo:

- **El repositorio va a ser público**, y ese contrato es el muro que impide que entre un dato
  personal. Es lo único que no puede fallar en silencio.
- **La suite entera no corre en un runner pelón**, porque Playwright abre la app de Electron de
  verdad. Por eso el andon instala con `ELECTRON_SKIP_BINARY_DOWNLOAD=1` y no llama a `npm test`.

**Consecuencia que hay que tener presente:** lo que el andon **no** cubre —los tipos, la
compilación, la app abriendo— hoy sólo se verifica en la máquina de quien trabaja. Si eso se va a
cerrar, se cierra con un runner que sí pueda abrir una ventana, no bajándole la exigencia al andon.
</el-andon>

<lo-que-no-existe-todavia>
Se dice de frente, porque un hueco callado se descubre el día de la entrega.

| Pieza | Estado |
|---|---|
| Compilación del ejecutable | Existe: `npm run build` deja `out/` |
| **Instalador** | **No existe.** No hay configuración de empaque ni en `package.json` ni aparte |
| **Firma del ejecutable** | **No existe.** Sin firma, el antivirus y el sistema desconfían de entrada |
| **Actualización** | **No existe.** Nadie decidió cómo llega una versión nueva a la máquina del cliente |
| Andon | Existe, con el alcance de arriba |

Si te encargan algo de esa columna, **lo primero que reportas es que no existe** — no lo improvisas.
</lo-que-no-existe-todavia>

<la-trampa-que-ya-se-pago>
**El antivirus bloquea archivos recién creados.** Al instalar por primera vez, el ejecutable de
Electron se descargó completo y se descomprimió a medias **sin error visible**: la instalación se
dio por buena y la app no arrancaba.

De ahí sale la regla dura de este oficio, y es la que más veces va a salvar una entrega: **una
instalación que termina «bien» no prueba que la app corra; lo único que lo prueba es abrirla.**
</la-trampa-que-ya-se-pago>

<como-se-comprueba-que-arranca>
En este orden, y sin saltarse el último:

1. Instalar desde cero, en un lugar donde no haya nada de antes.
2. Compilar, y leer la salida completa — no sólo el código de salida.
3. **Abrir la app.** Que compile no es que arranque, y que instale no es que abra.
4. Anotar en qué sistema y con qué versiones se hizo. Un «funciona» sin máquina no se puede repetir.
</como-se-comprueba-que-arranca>

<los-procesos-al-lado>
Cuando un agente necesite una herramienta puntual en vez de un comando suelto, alguien tiene que
levantar y sostener ese proceso: eso es de este oficio. La lógica va en el núcleo y ya tiene sus
pruebas; lo que aquí se resuelve es **que exista, que arranque con la sesión y que se caiga con
ella** — y que si no arrancó, la sesión lo sepa en vez de quedarse sin la herramienta en silencio.
</los-procesos-al-lado>

</metodo>

<reglas-duras>
<regla>**Nada se declara funcionando sin haberlo corrido.** Comando, salida y código de salida, o no pasó.</regla>
<regla>**No aflojas un freno para que pase un cambio.** Si el andon detiene algo, se arregla lo que detuvo.</regla>
<regla>**No improvisas lo que no existe.** Instalador, firma y actualización se reportan como huecos.</regla>
<regla>**Ni un secreto ni una ruta de máquina real** entra a un archivo versionado.</regla>
<regla>**No tocas `src/`.** Y no decides qué se entrega ni cuándo.</regla>
</reglas-duras>

<entregable>
Comando, salida, código de salida y máquina donde se corrió. Qué quedó funcionando, qué no, y qué no
pudiste correr — obligatorio aunque diga «nada».
</entregable>

</carta>
