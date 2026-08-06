---
id: MOD-0007
modulo: La construcción: diseñar lo que va por detrás, revisar arquitectura y pruebas, y auditarlo antes de darlo por bueno.
dominio: DOM-0002
capacidades: [CAP-0021, CAP-0023]
firmeza: abierto
origen: escuchado
estado: con-huecos
paso: Consultoría
alta: 2026-08-06T09:04:12-06:00
confirmado:
marcado: 2026-08-06T09:04:12-06:00
---

<modulo>

<en-sus-palabras>
El experto puso este tramo como el quinto de su línea. Después de las historias de usuario, otro flujo se encarga del diseño de lo que va por detrás y va revisando que se cumplan los criterios de arquitectura decididos, que el código sea escalable, que tenga buenas prácticas y buenos paradigmas de programación, y que se hagan todas las pruebas. Al enumerar esos criterios nombró de pasada dos cosas concretas: un monolito modular, y un arreglo de bases de datos —postgres, una base por cliente y una compartida para lo administrativo—. Sólo la segunda se le devolvió, y él mismo la descartó: dijo que era nada más un ejemplo suyo y que no tiene nada que ver con lo que se está construyendo. El monolito modular ni se le devolvió ni lo descartó: quedó nombrado de pasada y nada más. Aquí adentro va también la revisión que contó de su propio montaje de agentes: una vez que todos los oficios habían hecho lo suyo, corría al final agentes auditores que revisaban desde distintos ángulos, cada parte, y entregaban sus informes a quien orquestaba. De ahí salió lo que más le preocupa: llegó a encadenar hasta diez rondas seguidas y todas encontraban hallazgos válidos, se corregían, y la siguiente volvía a encontrar; nunca supo cómo dar por satisfecha la revisión, y sospecha —lo marcó como sospecha y no como hecho— que quien repara rompe otras cosas o abre hallazgos nuevos al repararlos. Puesto enfrente el criterio de parar por desviación de algo escrito de antemano, contestó que eso hay que bajarlo a un nivel determinista más adelante y que por lo pronto sigue otra estrategia, que él mismo llamó provisional: se corre una vez, salen preguntas, el experto las contesta, y en la segunda pasada lo que salga se anota y la línea continúa sin volver a preguntarle. El experto presentó este tramo entero como propuesta suya, dijo que todavía no está seguro del flujo y pidió ayuda para hacerlo más claro.
</en-sus-palabras>

<que-agrupa>
Cae dentro lo que pasa entre que las historias están completas y que hay algo listo para entregar: el diseño de lo que va por detrás, la verificación de que se cumplen los criterios de arquitectura decididos, que el código sea escalable y traiga buenas prácticas y buenos paradigmas, que se hagan todas las pruebas, y la revisión por varios auditores que miran desde ángulos distintos antes de darlo por bueno. NO cae dentro la entrega —máquinas virtuales, operaciones y el flujo de validación final—, ni el prototipo, que se arma sin historias y sólo para preguntar, ni la firma del experto contra algo que corre; tampoco las piezas con que se arma cada agente de la línea, que son de los puestos. La prueba para meter aquí una capacidad nueva: que trabaje sobre código que ya se comprometió en una historia. Si ocurre después de que el código se dio por bueno, es de la entrega.
</que-agrupa>

<de-donde-salio>
El tramo salió en la descripción inicial del recorrido completo, cuando contó qué pasa con las historias una vez que están completas y seleccionadas; se le devolvió condensado como el quinto de seis y no lo corrigió. La revisión con auditores salió después, al preguntarle en qué se nota que un agente que orquesta ya se saturó: para explicarlo tuvo que contar cómo estaba armado su flujo, con los oficios trabajando y los auditores revisando al final. Se profundizó preguntándole si algún hallazgo de la ronda ocho o nueve le importó de verdad o si ya eran cosméticos, y contestó que todas sacaban cosas muy válidas. El corte de este pedazo sigue la línea que él marcó al enumerar los pasos; lo que agrega quien escribe es qué queda fuera.
</de-donde-salio>

<que-queda-abierto>
Contra qué criterios escritos verifica ese flujo. Lo que el experto nombró son cualidades sin número ni documento —escalable, buenas prácticas, buenos paradigmas, todas las pruebas—, más un monolito modular dicho de pasada que nadie le devolvió; y el único ejemplo concreto que sí se le devolvió, el de las bases de datos, él mismo lo descartó por ser de otro sistema. No hay entonces un estándar escrito contra el cual medir si un hallazgo obliga a corregir, y él declaró el tramo entero como propuesta suya sin seguridad del flujo. Cuándo se da por satisfecha la revisión sigue sin resolverse por desviación de un estándar: lo único que hoy corta el bucle es el paro por número de vueltas que el experto fijó para la línea —se le pregunta una sola vez, y en la segunda pasada lo que salga se anota y se sigue—, y él mismo lo llamó solución provisional, con algo determinista y más especializado para después. Ese paro dice cuándo dejar de preguntar; no dice contra qué comparar un hallazgo. Y por qué rondas sucesivas siguen encontrando fallas válidas nadie lo supo contestar, ni el experto: falta comprobar su propia sospecha —que quien repara es la fuente de los hallazgos siguientes— midiendo si los hallazgos tardíos tocan justo lo que se acaba de reparar. Queda además sin decir si esa revisión con auditores corre sólo sobre lo construido o también sobre lo que producen los demás pasos de la línea; si corriera sobre todos, esta capacidad no sería de este módulo y el corte tendría que rehacerse.

Quedo sin cerrar al construir el registro.
El examen quedo a-medias en: «¿Por qué rondas sucesivas de revisión siguen encontrando fallas válidas?»
El examen quedo sin-contestar en: «¿Contra qué se compara un hallazgo para saber si obliga a corregir?»

Auditoría del 2026-08-06: no le alcanza a quien no estuvo (1/2). «una vez que todos los oficios habían hecho lo suyo». Cuáles oficios no está escrito en ningún archivo, y el experto sí los enumeró uno por uno. Quien no estuvo no puede saber de qué línea se le habla.

Auditoría del 2026-08-06: no le alcanza a quien no estuvo (2/2). Los renglones «El examen quedo a-medias en: …» y «El examen quedo sin-contestar en: …» usan «El examen», que no está definido: la tabla «Las palabras de la casa» de product/conocimiento/README.md define paso, corrida, devolver algo, pieza y reporte, y no examen; ese README lo menciona una sola vez sin explicarlo, y el examen no se guarda en disco.
</que-queda-abierto>

</modulo>
