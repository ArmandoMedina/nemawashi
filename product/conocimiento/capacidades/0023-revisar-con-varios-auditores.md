---
id: CAP-0023
capacidad: Revisar lo construido con varios auditores que miran desde ángulos distintos antes de darlo por bueno.
modulo: MOD-0007
reglas: [REG-0044, REG-0034, REG-0043, REG-0033]
firmeza: abierto
origen: escuchado
estado: con-huecos
paso: Consultoría
alta: 2026-08-06T09:04:12-06:00
confirmado:
marcado: 2026-08-06T09:04:12-06:00
---

<capacidad>

<en-sus-palabras>
En el montaje de agentes del experto, una vez que todos los oficios habían hecho lo suyo, él corría al final agentes auditores para que revisaran todo el flujo; esos auditores corrían en distintos ángulos, revisando cada parte, y entregaban sus informes a quien orquestaba. De ahí salió lo que más le preocupa: llegó a encadenar hasta diez rondas seguidas y todas encontraban hallazgos, se corregían, y la siguiente volvía a encontrar. Dice que eso da miedo, porque los hallazgos de todas las rondas le parecieron muy válidos, no cosméticos de cierto punto en adelante, y no entiende por qué la primera ronda no saca los hallazgos que van a sacar las siguientes. Nunca supo cómo dar por satisfecha la revisión, y sospecha que a las personas les pasa igual: si se mete a un experto a revisar código saca hallazgos, se corrigen, se mete a otro del mismo nivel o mayor y saca otros de otro tipo, y aun así se construyen edificios. Su otra sospecha, que él mismo marcó como sospecha y no como hecho: quien repara los hallazgos rompe otras cosas o abre hallazgos nuevos al repararlos, de modo que la reparación sería la fuente. El marco con que quiere gobernar esto es de manufactura: se apoya en lo que aprendió Toyota en la producción y en lo que aprendió la aviación, que pagó con sangre el automatizar de forma incorrecta; la inteligencia artificial no es perfecta, pero lo humano tampoco y aun así se construyen edificios, así que se le puede encargar lo suficiente para hacer buenos desarrollos con supervisión más específica.
</en-sus-palabras>

<de-donde-salio>
Salió al preguntarle en qué se nota que un agente que orquesta ya se saturó: para explicarlo tuvo que contar cómo estaba armado su flujo, con los oficios trabajando y los auditores revisando al final. Se profundizó preguntándole si algún hallazgo de la ronda ocho o nueve le importó de verdad, o si de cierto punto en adelante ya eran cosméticos, y contestó que todas sacaban cosas muy válidas y que no está seguro de qué hacer en ese caso.
</de-donde-salio>

<que-queda-abierto>
Cuándo se da por satisfecha la revisión, y por qué rondas sucesivas siguen encontrando fallas válidas: puesto enfrente, el experto contestó que no lo entiende, así que no se cierra preguntándole otra vez. Falta comprobar la sospecha del propio experto —que quien repara es la fuente de los hallazgos siguientes—, midiendo si los hallazgos tardíos tocan justo lo que se acaba de reparar. Y falta cómo se aterriza a esta línea cada principio de manufactura que dice traer.

Quedo sin cerrar al construir el registro.
No se entiende solo (apodo-de-caso): «El marco con que quiere gobernar esto es de manufactura: se apoya en lo que aprendió Toyota en la producción y en lo que aprendió la aviación, que pagó con sangre el automatizar de forma incorrecta.»
No se entiende solo (puntero-a-la-nada): «Y falta cómo se aterriza a esta línea cada principio de manufactura que dice traer.»
El examen quedo a-medias en: «¿Por qué rondas sucesivas de revisión siguen encontrando fallas válidas?»
El examen quedo sin-contestar en: «¿Contra qué se compara un hallazgo para saber si obliga a corregir?»

Auditoría del 2026-08-06: no le alcanza a quien no estuvo (1/3). «Y falta cómo se aterriza a esta línea cada principio de manufactura que dice traer». Apunta a principios que no están escritos; el archivo lo declara en su línea 30.

Auditoría del 2026-08-06: no le alcanza a quien no estuvo (2/3). «una vez que todos los oficios habían hecho lo suyo». Cuáles oficios no está escrito en ningún archivo, y el experto sí los enumeró uno por uno. Quien no estuvo no puede saber de qué línea se le habla.

Auditoría del 2026-08-06: no le alcanza a quien no estuvo (3/3). Los renglones «El examen quedo a-medias en: …» y «El examen quedo sin-contestar en: …» usan «El examen», que no está definido: la tabla «Las palabras de la casa» de product/conocimiento/README.md define paso, corrida, devolver algo, pieza y reporte, y no examen; ese README lo menciona una sola vez sin explicarlo, y el examen no se guarda en disco.
</que-queda-abierto>

</capacidad>
