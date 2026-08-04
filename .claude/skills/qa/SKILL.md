---
name: qa
description: Carta del oficio QA en Nemawashi — las cinco capas, las tres preguntas, el contrato como prueba, y cómo se corre todo. Úsala al escribir, clasificar o juzgar cualquier prueba de este repositorio.
---

<carta nombre="qa" agente="qa" momento="al cerrar por medicion">

<objetivo>
Cerrar por medición: el veredicto lo da el artefacto, no la palabra de nadie.
</objetivo>

<metodo>

<los-dos-comandos>
```
npm run dev     # abre la app; al guardar, la ventana se actualiza sola
npm test        # lógica → tipos → compila → abre la app de verdad
```

`npm test` encadena tres cosas: `vitest run`, luego `npm run build` (que incluye `tsc --noEmit`),
luego `playwright test`. Un rojo en cualquiera detiene la cadena.

Para correr una sola capa mientras trabajas: `npx vitest run <ruta>`.
</los-dos-comandos>

<las-cinco-capas manda="product/arquitectura-desarrollo.md, «Cómo se corre y se prueba»">
Ésta es la carta operativa de esa decisión, no una segunda versión: **si las dos difieren, manda el
documento.**

| Capa | Qué prueba | Con qué | Dónde vive |
|---|---|---|---|
| 1 · La lógica sola | Entrada exacta, salida exacta. Sin ventana y sin disco | Vitest | `src/nucleo/*.test.ts` |
| 2 · El contrato | Que una verdad estructural siga en pie. Lee el código, no lo ejecuta | Vitest | `src/contratos/*.test.ts` |
| 3 · Un pedazo de pantalla | Un componente montado suelto, sin abrir la app | Vitest + pantalla en memoria | `src/renderer/**/*.test.tsx` |
| 4 · La app entera | Que abra y responda al clic | Playwright sobre Electron | `tests/*.spec.ts` |
| 5 · A mano | Lo que sólo una persona juzga | Una persona | — |

El peso va arriba. Una capa no sustituye a la de abajo: cubre lo que la de abajo **no puede ver**.
Si la proporción se invierte —muchas pruebas de app y pocas de lógica— se reporta, porque significa
que la lógica está viviendo en la pantalla.
</las-cinco-capas>

<como-se-decide-un-caso-nuevo>
Tres preguntas, en orden:

1. **¿La respuesta correcta es un valor exacto?** → automática.
2. **¿Hace falta verla u oírla para saber si está bien?** → a mano.
3. **¿Depende del entorno —micrófono, red, la máquina del cliente—?** → a mano, o se automatiza
   sólo el pedazo que sí es exacto.

Clasifica **antes** de escribir. Una prueba escrita primero y clasificada después casi siempre
quedó en la capa equivocada.

Prefiere la capa más baja que pueda ver el error; abrir la app entera es el último recurso, no el
primero.
</como-se-decide-un-caso-nuevo>

<diseno-de-casos>
**Con técnica, no por ocurrencia.** Por cada entrada: identifica particiones → deriva valores límite
(el borde y ±1) → si hay reglas combinatorias, tabla de decisión → si hay estados, cubre
transiciones válidas e inválidas. Un caso por partición o borde relevante, nunca explosión
combinatoria.
</diseno-de-casos>

<la-capa-2 nota="la propia de este proyecto">
Un contrato **no opina**: lee un hecho estructural y siempre contesta lo mismo. No se confunde con
una revisión de código —aquélla es juicio y cambia según quién la haga; ésta pasa o falla.

Los dos que existen, y qué error atrapa cada uno:

- **`src/contratos/mensajes.test.ts`** — que la lista corta de mensajes con nombre, lo que el
  preload cuelga y lo que el proceso principal atiende **coincidan exactamente**. Un mensaje
  agregado a la lista y olvidado en la pared es un error que no da error hasta que alguien lo usa
  en vivo.
- **`src/contratos/valores-de-diseno.test.ts`** — que cada bloque de cada página de `design/`
  coincida con `design/fundamentos/valores.css`. Las copias existen a propósito (cada página abre
  sola); lo que impide que diverjan es esta prueba, no la disciplina.

**Cuándo escribir uno nuevo:** siempre que dos lugares tengan que decir lo mismo y nada los obligue.
Es la respuesta de este repositorio al acoplamiento invisible que `arquitectura-desarrollo.md` §2.4
rechaza.
</la-capa-2>

<la-capa-4 nota="y sus dos limites">
- **Se localiza por rol y nombre accesible** (`getByRole`, `getByText`), nunca por posición en el
  código ni por clase de CSS. Ata la prueba a lo que sí existe para una persona, y de paso revisa
  la accesibilidad. Aserciones que reintentan solas (`await expect(...)`); **jamás** una espera
  fija.
- **Nemawashi es escritorio: no hay pestaña que abrir.** Manejar la app desde el navegador con una
  extensión no aplica aquí. Playwright arranca el ejecutable con `_electron.launch`.
- **Cuáles caminos se cubren sale de los casos de uso.** Mientras no existan, la capa 4 se queda en
  el mínimo —que la ventana abra y que la pared entre los dos mundos siga en pie— y **no se
  inventan** caminos para engordarla.
</la-capa-4>

<datos>
**Sintéticos, siempre.** Se construyen en memoria, con un constructor que los arma a la medida del
caso. Nunca material real recortado.
</datos>

<el-fin-de-linea>
`core.autocrlf` está activo a nivel sistema y lo neutraliza `.gitattributes`. Una prueba que compara
texto **no debe depender del fin de línea**: pasa en una máquina y falla en la de al lado, y el rojo
no dice por qué.
</el-fin-de-linea>

<como-se-nombra-una-prueba>
Por la verdad que sostiene, no por la función que llama: *«la pared cuelga exactamente los mensajes
de la lista»*, no *«test exposeInMainWorld»*.
</como-se-nombra-una-prueba>

</metodo>

<reglas-duras>
<regla>**No apruebas lo que no corriste.** Un veredicto sin comando, salida y código de salida detrás no sale de este oficio.</regla>
<regla>**Un cambio de comportamiento incluye su prueba.** No es un paso para después: es lo que permite revisar por verificación en vez de leyendo, que es la condición del equipo (`arquitectura-desarrollo.md` §2.16).</regla>
<regla>**Todo arreglo de un defecto exige el par rojo→verde.** El rojo demuestra que la prueba mide algo; el verde solo no prueba nada. Un error que se coló se blinda antes de darlo por cerrado.</regla>
<regla>**Cazas y nombras las pruebas que pasan sin medir nada:** aserciones vacías, dobles que se contestan solos, y —el caso que ya ocurrió en este repositorio— **una comparación que funde datos y deja que el valor correcto tape al roto.** Si dudas de una prueba, rómpela a propósito y comprueba que se pone roja.</regla>
<regla>**No juzgas lo visual.** Colores, alineación y ritmo son de diseño, y su regla vive en `product/arquitectura-diseno.md`.</regla>
<regla>**No re-validas lo que otra capa ya cubre.**</regla>
</reglas-duras>

<entregable>
Veredicto por afirmación juzgada, cada uno con su corrida: comando, salida y código de salida.
Más lo que no pudiste verificar y por qué. Completo cuando ninguna afirmación descansa en tu
palabra.
</entregable>

</carta>
