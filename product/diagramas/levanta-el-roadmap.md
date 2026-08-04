---
tipo: recursos
estado: propuesta
---
# El molino, dibujado — `levanta-el-roadmap`

> **Esto es una propuesta, no lo que corre.** El molino de hoy vive en
> `.claude/workflows/levanta-el-roadmap.js` y produce hallazgos planos. Este diagrama fija la forma
> que tendría al producir capacidades y módulos enlazados. Mientras no se implemente, **manda el
> `.js`**.

## Cómo se abre

El archivo es `levanta-el-roadmap.bpmn`: XML del estándar BPMN 2.0, unas mil líneas. **No se lee
en frío como texto** — se arrastra a un editor de BPMN en el navegador y se mira.

Trae **cinco planos**: el de arriba y cuatro subprocesos con contenido. Las cajas con el signo `+`
se abren con doble clic o con el botón azul de su esquina.

## Con qué reglas está escrito

Con las de **BPMN Method and Style**, de Bruce Silver. Las que gobiernan aquí:

- Cada actividad se nombra **verbo + objeto** — *Sacar la plática*, no *Extracción*.
- Cada evento de fin lleva **el estado en que quedó el proceso**, no la palabra «fin».
- Cuando un subproceso termina en varios estados, **el rombo que le sigue no vuelve a preguntar**:
  sus salidas llevan los nombres de esos estados y sólo enrutan.
- Los rombos paralelos no se etiquetan, ni ellos ni sus salidas.
- Ningún nivel pasa de diez actividades, para que quepa en una hoja.

**Dos desviaciones a sabiendas**, para que nadie las «arregle»:

1. Los rombos que siguen a una **tarea** llevan la pregunta y las salidas dicen `sí`/`no`. El método
   permite las dos formas; se escogió una sola para todo el dibujo.
2. Un evento de fin único conserva su nombre, aunque la regla pida quitárselo. Un fin sin nombre se
   lee peor, y el diagrama se hizo para leerse.

## Lo que el diagrama fija

| Qué | Por qué |
|---|---|
| **Las preguntas se levantan antes de construir** | Un examen escrito después de ver el resultado siempre lo aprueba |
| **A las preguntas se les quitan los nombres propios** | La pregunta sirve para cualquier caso, y ningún nombre real entra a un archivo |
| **Sólo lo que el experto dijo se coteja contra la plática** | Una capacidad que propone el agente nadie la dijo: se mide contestando el examen, no buscando la frase |
| **Las tres mediciones corren en paralelo** | Son independientes; en fila tardan la suma en vez de la más lenta |
| **Se escribe siempre, aunque la medición falle** | Una corrida larga que se traba nunca cierra. Lo que no se vale es escribir sin marca: el defecto silencioso es lo único que jidoka prohíbe |
| **La marca vive en el archivo, en un campo que se busca** | Un reporte muere al cerrar la terminal; el archivo viaja a la sesión siguiente y la abre |
| **El experto contesta una sola vuelta** | Sin tope, cada revisión encuentra algo más y no se escribe nunca. Un freno que no se levanta no es freno, es candado |
| **El paso puede cerrar «con huecos»** | Escrito no es lo mismo que listo |

## Lo que el diagrama NO decide

- **En qué carpeta escribe el molino.** Sin eso no hay qué implementar.
- **Qué tipo lleva cada enlace** — contiene, usa, requiere, contradice. Sin tipo se recorre el grafo
  pero no se razona sobre él.
- **Si existe un nivel entre Capacidad y Regla.**
- **Quién produce la cuenta de vueltas.** El rombo que la consulta cuelga de otro rombo, no de una
  actividad que la calcule.

## Qué se rompe al implementarlo

Medido contra el repositorio el **2026-08-04**:

- **Dos cajas no tienen carta**: *Gestionar las preguntas* y *Armar lo que falta preguntar*. Son del
  auditor, pero su carta no existe. **Ahí está el trabajo, y es escribir cartas, no código.**
- **Cuatro pruebas de contrato dejan de pasar**: `la-hora-no-se-inventa`,
  `el-no-sirve-cuenta-como-falla`, `la-platica-la-saca-el-sacador` y `el-item-va-flaco`.
- **`el-item-va-flaco.ts` exige `firmeza` con tres valores** — `dicho`, `confirmado`, `abierto`. El
  diagrama marca además el origen, que es otro eje y no la sustituye.
- **El subproceso *Extraer conversación* no se implementa.** Dibuja lo que ya hace
  `src/nucleo/sacar-turnos.ts`, y el molino lo llama en vez de reescribirlo.

---

> **Procedencia.** Dibujado el **2026-08-04** al rehacer el molino desde cero. Las preguntas de
> competencia como criterio de aceptación se toman de la ingeniería de ontologías conversacional
> —marco OntoChat, ESWC 2024—, que las levanta antes de construir y valida contestándolas una por
> una. El freno que para antes de escribir y la auditoría contra el registro crudo ya vivían en el
> molino sin nombrarse: son jidoka y genchi genbutsu.
>
> **Sin fuente declarada:** el corte de dos vueltas, el reparto de las cajas entre auditor y
> escribano, y las dos desviaciones de estilo de arriba. Salieron de este proyecto y nadie los ha
> medido contra un método establecido.
>
> **Ninguna sesión real se ha corrido todavía.** Todo lo que fija este diagrama se decidió sobre
> papel, y la primera sesión es la medición que lo puede desmentir.
