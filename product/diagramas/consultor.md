---
tipo: recursos
estado: propuesta
---
# La sesión, dibujada — `consultor`

> **Esto dibuja una personalidad de sesión, no un agente.** El consultor vive en
> `.claude/output-styles/consultor.md`: no se le llama, se enciende y conduce la sesión entera.
>
> **Si el dibujo y la carta difieren, manda la carta.** El dibujo se hizo leyéndola, y lo que agrega
> de su cosecha está declarado abajo, renglón por renglón.

## Cómo se abre

El archivo es `consultor.bpmn`: XML del estándar BPMN 2.0. **No se lee en frío como texto** — se
arrastra a un editor de BPMN en el navegador y se mira.

Trae **cuatro planos**: el de arriba y tres subprocesos con contenido. Las cajas con el signo `+` se
abren con doble clic o con el botón azul de su esquina.

## Con qué reglas está escrito

Con las mismas del molino — **BPMN Method and Style**, de Bruce Silver — y las mismas dos
desviaciones a sabiendas: los rombos que siguen a una tarea llevan la pregunta y sus salidas dicen
`sí`/`no`, y los eventos de fin conservan su nombre.

**Tres desviaciones más, propias de este dibujo:**

1. **Un solo participante.** Toda la sesión es conversación con el experto, así que dibujarlo como
   pool aparte pondría una flecha de mensaje en casi cada caja y taparía el flujo. El experto vive
   en los nombres: *Llega el experto*, *El experto pide guardar*.
2. **Cuatro flechas entran a `Moler el paso` sin rombo de unión.** Son cuatro caminos que llegan al
   mismo trabajo y ninguno necesita esperar al otro.
3. **`¿Quedan pasos y tiempo?` pregunta dos cosas en un rombo.** La salida es binaria y separarlas
   producía dos rombos en fila con el mismo destino.

## Lo que el diagrama fija

| Qué | Por qué |
|---|---|
| **La vara se pregunta con el mapa ya enfrente** | Sin nada a la vista contesta una generalidad; con sus propios pasos delante contesta lo que sólo él sabe |
| **Se excava sólo donde hay criterio** | Donde dos personas con la misma información decidirían igual, no hay nada que sacar |
| **El molido está en el tronco, no al final** | Un paso no se cierra hasta que se molió. Lo que se queda en la plática se pierde |
| **Las tres salidas del molino se enrutan, no se vuelven a juzgar** | `listo`, `sin-hallazgos` y `faltan-preguntas` ya son el dictamen |
| **`faltan-preguntas` regresa al experto, no al consultor** | Para eso está enfrente, y en dos semanas ya no va a estar |
| **Lo que nadie pudo contestar no frena la rama** | Se marca abierto y se sigue: ni se resuelve ahí, ni se deja en el aire |
| **El experto puede pedir guardar a media rama** | Y al volver, el paso se excava desde el principio: los dos eventos de frontera interrumpen |
| **La sesión tiene dos finales, no uno** | «Cerrada y todo molido» y «cerrada con pasos sin tocar» no son lo mismo, y el nombre lo dice |

## Lo que el dibujo agrega y la carta no dice

Cinco cosas que salieron de leer la carta, no de leerla al pie de la letra. **Si alguna está mal, se
corrige aquí y en la carta, no sólo aquí:**

- **La rama se agota a las tres preguntas sin hallazgo.** La carta dice «dos o tres». El dibujo
  necesitaba un número y escogió el de arriba.
- **Cuando se acaba el tiempo, se muele lo que haya antes de cerrar.** La carta manda anotar los
  pasos sin tocar, pero no dice qué pasa con lo ya excavado. Se enruta por el molino porque no se
  cierra con hallazgos sin registrar.
- **Reflejar viene después de cada pregunta.** La carta lo pone como paso propio, sin decir con qué
  frecuencia.
- **El estado de cierre «con pasos sin tocar»** no está nombrado en ningún renglón de la carta.
- **Las preguntas del molino se traducen todas y luego se hacen una a una.** La carta manda hacerlas
  «una a la vez, en tus palabras»; el orden entre traducir y preguntar lo puso el dibujo.

## Lo que los datos dibujados contestan

Dos objetos, y cada uno responde algo que el flujo no responde:

| Qué | Qué contesta |
|---|---|
| `El mapa y la vara` | Que *Acotar* produce lo que *Excavar* consume — sin el mapa no hay lista de pasos que recorrer |
| `La lista de hallazgos` | Que se alimenta dentro de cada rama y se muestra completa al cerrar: es la misma lista, no un resumen que se arma al final |

## Lo que el diagrama NO decide

- **Cuánto dura el tiempo de la sesión.** El evento existe; el reloj no está en ningún lado.
- **Qué cuenta como un intercambio** para la cuenta de cuatro o cinco.
- **Qué pasa si el molino vuelve a parar la línea en el mismo paso.** El dibujo permite el ciclo
  otra vez; la carta dice que el experto contesta una sola corrida. No hay tope dibujado.
- **En qué orden se recorren los pasos del mapa.**
- **Dónde vive la lista de hallazgos entre una sesión y la siguiente.** Dentro de la sesión es un
  objeto de datos; fuera, nadie dice si es un almacén.
- **Quién lleva la cuenta de las preguntas sin hallazgo.** El rombo la consulta y ninguna caja la
  calcula — el mismo hueco que arrastra el diagrama del molino.

## Cómo se comprobó

`consultor.bpmn` pasa un chequeo estructural: XML bien formado, identificadores únicos, toda
referencia apuntando a algo que existe, cada `incoming`/`outgoing` casado con su flujo, y toda caja
y toda línea con figura en el diagrama. El mismo chequeo corre limpio sobre
`levanta-el-conocimiento.bpmn`, que ya se abría bien — así que mide consistencia, no que se vea
bien.

**Y por eso no bastó.** El archivo pasó ese chequeo entero y aun así el editor abría el subproceso
de las preguntas en vez del diagrama de arriba: los cuatro planos estaban dentro de un solo
`BPMNDiagram`, y el editor se queda con el último. **Cada plano necesita su propio `BPMNDiagram`.**
La falla no se vio midiendo el archivo; se vio abriéndolo. El chequeo ya la busca, pero el orden
sigue siendo ése: se comprueba, y luego se mira.

---

> **Procedencia.** Dibujado el **2026-08-04**, leyendo `.claude/output-styles/consultor.md`. Las
> reglas de estilo, el reparto en planos y las dos primeras desviaciones se toman de
> [`levanta-el-conocimiento.md`](levanta-el-conocimiento.md), para que los dos dibujos se lean
> igual. Los métodos que sostienen el contenido —preguntas de competencia, *Critical Decision
> Method*, entrevista estructurada— están declarados en la carta y no se repiten aquí.
>
> **Sin fuente declarada:** las tres desviaciones propias de este dibujo y las cinco cosas que el
> dibujo agrega. Salieron de aquí y nadie las ha medido.
>
> **El corte de qué merece dibujo propio:** un proceso, un dibujo — y proceso es lo que tiene
> disparador propio y fin. La sesión del consultor lo tiene; un agente al que otro llama, no: su
> camino es un pedazo del camino de quien lo llamó, y ahí se dibuja.
