# Las piezas — en qué se diferencia cada una

Siete piezas gobiernan cómo se comporta la IA aquí. Se confunden entre ellas porque casi todas son
texto, y desde afuera se parecen. Lo que las separa no es lo que dicen: es **quién las lee y cuándo
entran.**

## La cadena

```
plugin        →  mete la personalidad al arrancar
personalidad  →  de qué trabaja la sesión
regla         →  cómo se trabaja aquí, siempre
   ↓
sesión        →  llama un flujo
flujo         →  llama un agente y le nombra la carta
agente        →  el puesto: quién trabaja y qué no le toca
carta         →  el método: los pasos de ese trabajo
   ↓
freno         →  lo único que de verdad obliga
```

| Pieza | Quién la lee | Cuándo entra | Qué hace | Dónde vive |
|---|---|---|---|---|
| **Plugin** | El programa | Al arrancar el proceso | Empaqueta lo de un oficio y lo mete de golpe | Una carpeta con su `plugin.json` |
| **Personalidad** | La sesión | Se elige, o el plugin la fuerza | **Reemplaza** quién es la sesión | `output-styles/*.md` |
| **Regla** | La sesión | Sola, sin que nadie la pida | **Agrega** cómo se trabaja | `rules/*.md` |
| **Agente** | Él mismo | Cuando alguien lo llama | El puesto y el carácter | `agents/*.md` |
| **Carta** | El agente | Cuando alguien la nombra | El método de un trabajo | `skills/<nombre>/SKILL.md` |
| **Flujo** | El programa | Cuando alguien lo corre | Quién se llama, en qué orden, con qué carta | `workflows/*.js` |
| **Freno** | El programa | En cada momento del ciclo | Bloquea, de verdad | Los ajustes |

## Las dos preguntas que deciden qué es algo

1. **¿Esto aplica aunque la sesión nunca toque ese tema?**
   Sí → regla. Sólo cuando alguien hace ese trabajo → carta.
2. **¿Esto tiene que quitar algo que ya viene puesto?**
   Sí → personalidad. Sólo agregar → regla.

La segunda es la que más se falla. Una regla puede repetir mil veces que la sesión no es de
programación y el método de programador sigue cargado, peleando por debajo. **La personalidad es lo
único que lo quita.**

## Personalidad y regla — el par que se parece

Las dos son texto que llega a la sesión principal. Se diferencian en cuatro cosas:

| | Personalidad | Regla |
|---|---|---|
| **Puede quitar** | Sí | No: sólo suma |
| **Cuántas activas** | Una | Todas las que haya |
| **Cómo llega** | Hay que elegirla, o un plugin la fuerza | Sola |
| **Puede ser condicional** | No: está o no está | Sí: sólo al tocar ciertos archivos |

Una regla conviene corta, porque lo que está siempre ocupa lugar siempre.

## Regla y carta — el otro par que se parece

Las dos son método escrito. La diferencia es quién decide que entren:

| | Regla | Carta |
|---|---|---|
| **Quién la mete** | Nadie: llega sola | Alguien la nombra: el flujo, el agente, o el modelo por su descripción |
| **Quién la lee** | La sesión principal | Quien hace el trabajo, casi siempre un agente |
| **De qué habla** | Cómo se trabaja aquí, sea cual sea la tarea | Los pasos de un trabajo concreto |
| **Cuánto puede medir** | Corta | Larga: sólo pesa cuando entra |

## Agente y carta — el par que más se confunde

| | El agente | La carta |
|---|---|---|
| **Qué es** | Quién trabaja | Cómo se hace el trabajo |
| **Responde** | ¿Quién soy, qué me llega, qué no me toca, qué entrego? | ¿Cuáles son los pasos, qué fallas se buscan, con qué se mide? |
| **Cambia cuando** | Cambia el puesto | Cambia el método |

Un agente es el **puesto y el carácter**. Una carta es la **capacidad en el momento de actuar**.

**Un agente no lleva método adentro.** Si un párrafo explica *cómo* se hace algo, no es del agente:
es de su carta. Un agente que trae su método adentro tiene el mismo texto en dos lugares, y el día
que se corrige uno, el otro sigue mintiendo.

### Cómo se sabe dónde va una frase

> **Sin decidir.** Estas tres preguntas no salieron del dueño del producto: son una forma de aplicar
> la regla de arriba. Si se rechazan, se borran y no arrastran nada más.

1. ¿Serviría igual si el puesto lo ocupara otro? → carta.
2. ¿Cambiaría si el método cambiara? → carta.
3. ¿Es una prohibición o un límite del puesto? → agente.

| Frase | Dónde va |
|---|---|
| «Rojo antes que verde: la prueba que falla se escribe antes del código» | Carta |
| «Clasificas la prueba en las cinco capas usando las tres preguntas» | Carta |
| «Quien juzga no arregla lo que juzga» | Agente |
| «Lo único que escribes son archivos de prueba» | Agente |

### Los campos de cada uno

Arriba, entre las líneas de `---`, va la fichita que el programa valida. Abajo va el cuerpo, en
campos con nombre.

| Agente | Carta |
|---|---|
| `identidad` — quién es y qué no le toca | `objetivo` — qué logra y para qué momento |
| `que-recibes` — qué le llega y de quién | `metodo` — los pasos, las listas, las fallas |
| `como-trabajas` — cuál carta usa, o quién le dice cuál | `reglas-duras` — lo que nunca hace |
| `reglas-duras` — lo que nunca hace | `entregable` — qué entrega y con qué forma |
| `entregable` — qué devuelve y con qué forma | `ejemplos` — sólo si el archivo ya los trae |

## El plugin no es una pieza más: es un empaque

Un plugin no cambia el comportamiento por sí mismo. Lleva adentro piezas de las de arriba —
personalidad, agentes, cartas, flujos — y las mete todas al arrancar. Lo que decide dónde poner algo
es quién tiene que verlo: lo que sólo sirve a un oficio puede ir dentro de su plugin; **lo que dos
sesiones distintas tienen que ver igual va al proyecto**, porque al plugin de una no lo alcanza la
otra.

## Ninguna de éstas obliga

Personalidad, regla, agente y carta son texto en el prompt: moldean lo que la IA decide, no bloquean
nada. **Lo único que bloquea de verdad son los frenos y los permisos**, porque el punto de control
vive fuera del modelo y no depende de que coopere.

Es la diferencia entre pedir e impedir. Si algo *no puede* pasar, no va en un texto.
