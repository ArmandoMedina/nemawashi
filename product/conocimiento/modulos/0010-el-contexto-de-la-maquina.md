---
id: MOD-0010
modulo: El contexto de la máquina: que no se pierda entre sesiones ni se recorte al juntarse en uno solo.
dominio: DOM-0004
capacidades: [CAP-0024, CAP-0028, CAP-0029]
firmeza: abierto
origen: propuesto
estado: con-huecos
paso: Consultoría
alta: 2026-08-06T09:04:12-06:00
confirmado:
marcado: 2026-08-06T09:04:12-06:00
---

<modulo>

<en-sus-palabras>
El experto nunca nombró este pedazo: el agrupamiento lo propone quien escribe. Lo que él contó son los dos daños. Primero, la pérdida: la primera carencia que encontró trabajando con inteligencia artificial fue tener que darle contexto en cada sesión, empezando siempre de cero, que con el tiempo se vuelve muy pesado; lo compensó con un documento de traspaso que la inteligencia artificial actualiza todo el tiempo, por si la sesión se corta de forma inesperada o por si termina, con un formato fijo que no puede romper y secciones enfocadas a distintos objetivos. Señaló que eso mismo iba a pasar con esta sesión y que le encantaría resolverlo, y prefiere hacerlo por investigación, viendo cómo lo hacen otros, en vez de copiar su arreglo. Segundo, el recorte: en un montaje donde varios especialistas trabajaban y unos auditores revisaban desde distintos ángulos, todos entregando sus informes a un agente que orquestaba, el que juntaba los informes empezaba a omitir muchas cosas; lo atribuye a la saturación de contexto —nombró el fenómeno por el que, entre más grande se hace el contexto, más impreciso se vuelve— y a que por ahí empieza la alucinación, mientras los subagentes acotados trabajan muy bien. Se dio cuenta mucho después, y sólo porque notó cosas raras y fue a leer los informes de cada agente por separado: comparando el informe crudo contra lo que le llegaba, apareció la saturación; desde el resumen no se nota nada. Y el choque que dejó abierto: quiere que quien conduce la consultoría se apoye en otras inteligencias que le den consejos, pero eso lo convierte justamente en el que junta informes; puesto enfrente, contestó que hoy no lo puede definir y que se deja para otra fase, dejando dicho sólo que hay que ser muy estratégicos en cómo se comunican esas inteligencias entre sí.
</en-sus-palabras>

<que-agrupa>
Cae dentro lo que se hace para que el contexto que maneja la máquina no se pierda al terminar una sesión y no se recorte cuando muchos informes llegan a uno solo: guardar y poder leer el informe crudo de cada agente aparte del resumen, retomar la sesión siguiente donde se quedó la anterior sin volver a dar contexto, y apoyar con otras inteligencias a quien conduce la plática sin volverlo el que junta. NO cae dentro cómo queda armado cada puesto —el agente, su carta, las reglas y los enganches—, que es del módulo de los puestos; ni lo que queda escrito del negocio del experto y con qué marcas queda, que es de MOD-0002: aquí se trata del contexto de la máquina, no del conocimiento del experto. Tampoco cae la lectura en frío de lo escrito antes de guardarlo, que es de MOD-0003 y la hace quien no estuvo, no quien olvidó. La prueba para meter aquí una capacidad nueva: que exista porque la máquina olvida lo que ya trabajó o recorta lo que le llega.
</que-agrupa>

<de-donde-salio>
Se propone aquí, no lo dijo como pedazo del negocio. El conjunto no cerraba sin él: quedaban tres capacidades sueltas —leer por separado el informe crudo de cada agente sin fiarse del resumen de quien los junta, retomar la sesión siguiente donde se quedó la anterior, y apoyar con otras inteligencias a quien conduce la plática sin volverlo el que junta— y ninguna es un paso de la línea ni una manera de armar un puesto. Las tres tratan del mismo material, el contexto que la máquina maneja, y del mismo daño: se pierde al terminar la sesión o se recorta al concentrarse en uno solo. Repartirlas entre los pasos dejaría el daño sin dónde vivir, y ninguna capacidad nueva sobre memoria o sobre saturación tendría casa. Las preguntas que lo destaparon: en qué se nota que un agente que orquesta ya se saturó, qué carencias de la inteligencia artificial ya vio y con qué las compensó, y la contradicción que se le puso enfrente sobre apoyar al que conduce.
</de-donde-salio>

<que-queda-abierto>
Las dos mitades que este módulo promete siguen sin resolver, y las dos las dejó sin cerrar el propio experto cuando se le preguntaron en sesión, no por olvido de quien escribe. Una: con qué se conserva lo trabajado de una sesión a la siguiente en esta línea. Lo que hay es su arreglo en sus propios desarrollos —el documento de traspaso de formato fijo—, que es un arreglo suyo y no una decisión para esta línea; para ésta prefiere resolverlo por investigación y mencionó proyectos de código abierto dedicados a eso, uno basado en grafos, sin decidir nada. Dos: cómo se apoya con otras inteligencias a quien conduce la plática sin convertirlo en el que junta los informes, que es justo el que se satura y omite. Contestó que hoy no lo puede definir y lo dejó para otra fase; lo único fijado es que la comunicación entre esas inteligencias tiene que ser estratégica, sin decir cómo. Mientras las dos sigan así, tampoco se puede decidir todavía si este pedazo es uno solo o son dos.

Quedo sin cerrar al construir el registro.
El examen quedo sin-contestar en: «¿Cómo se puede apoyar con otras IAs a quien hace las preguntas sin convertirlo en el que junta?»
El examen quedo a-medias en: «¿Cómo se conserva lo trabajado de una sesión a la siguiente?»

Auditoría del 2026-08-06: no le alcanza a quien no estuvo. Los renglones «El examen quedo sin-contestar en: …» y «El examen quedo a-medias en: …» usan «El examen», que no está definido: la tabla «Las palabras de la casa» de product/conocimiento/README.md define paso, corrida, devolver algo, pieza y reporte, y no examen; ese README lo menciona una sola vez sin explicarlo, y el examen no se guarda en disco.
</que-queda-abierto>

</modulo>
