---
id: REG-0033
regla: Al experto se le pregunta una sola vez: en la segunda pasada lo que salga se anota y la línea sigue.
capacidades: [CAP-0023, CAP-0013]
firmeza: dicho
origen: escuchado
estado: con-huecos
paso: Consultoría
alta: 2026-08-06T09:04:12-06:00
confirmado:
marcado: 2026-08-06T09:04:12-06:00
---

<regla>

<en-sus-palabras>
La estrategia, declarada por el experto como provisional: la revisión corre una vez y saca preguntas; la línea se detiene ahí hasta que el experto las conteste; y en la segunda pasada, si salen más comentarios, se anotan y la línea continúa, sin volver a preguntarle. Eso es lo que corta el bucle de revisiones hoy. El experto lo llamó explícitamente un arreglo temporal: más adelante quiere algo más especializado, bajar el razonamiento a un nivel determinista, y recuerda haber investigado alguna vez que sí hay maneras de hacerlo.
</en-sus-palabras>

<de-donde-salio>
Salió al preguntarle si una revisión se daría por terminada cuando ningún hallazgo señale desviación de algo escrito de antemano, en vez de esperar a que las rondas dejen de encontrar cosas. No adoptó ese criterio: dijo que eso hay que bajarlo a un nivel determinista y que por lo pronto quiere el tope de una sola vuelta de preguntas, para evitar el bucle.
</de-donde-salio>

<que-queda-abierto>
Falta contra qué se compara un hallazgo para saber si obliga a corregir. Hoy el bucle se corta por número de vueltas, no por desviación de un estándar escrito, y el experto lo sabe: quiere sustituirlo por algo determinista y más especializado, que no nombró.

Quedo sin cerrar al construir el registro.
No se entiende solo (puntero-a-la-nada): «Eso es lo que corta el bucle de revisiones hoy.»
El examen quedo sin-contestar en: «¿Contra qué se compara un hallazgo para saber si obliga a corregir?»

Auditoría del 2026-08-06: mal marcado. Enlace roto sin declarar: este archivo cita CAP-0013, que no lo devuelve. No está en la lista de deuda declarada (`DEUDA_DE_ENLACE`), que hoy sólo tiene cinco entradas y todas de corridas anteriores. Prueba: `npx vitest run src/contratos/el-conocimiento-no-se-escapa.test.ts` falla con «11 enlace(s) roto(s) sin declarar».

Auditoría del 2026-08-06: no le alcanza a quien no estuvo (1/2). El renglón «El examen quedo sin-contestar en: …» usa «El examen», que no está definido: la tabla «Las palabras de la casa» de product/conocimiento/README.md define paso, corrida, devolver algo, pieza y reporte, y no examen; ese README lo menciona una sola vez sin explicarlo, y el examen no se guarda en disco.

Auditoría del 2026-08-06: no le alcanza a quien no estuvo (2/2). «Eso es lo que corta el bucle de revisiones hoy», declarado puntero-a-la-nada en su línea 28.
</que-queda-abierto>

</regla>
