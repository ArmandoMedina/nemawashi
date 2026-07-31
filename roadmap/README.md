# Roadmap — el conocimiento

Lo que el experto dijo y lo que confirmó, con su procedencia. **No es trabajo**: eso vive en
[`backlog/`](../backlog/README.md).

## Qué hay aquí

| Dónde | Qué guarda |
|---|---|
| `NNNN-apodo.md` | **El ítem, flaco.** Un renglón que se lee de un vistazo, con su procedencia y su puntero |
| `documentos/` | **El detalle.** A donde apunta el puntero: el documento que se le entrega al experto para que confirme |
| `0000-plantilla.md` | La forma del ítem. Se copia, no se improvisa |

**El detalle nunca vive en el ítem.** Si cupiera en el renglón no haría falta el puntero; si no
cupiera, la lista dejaría de poderse leer (`product/modulos.md` §M4).

## Quién escribe aquí

El **escribano**, y sólo después de que el auditor afinó los hallazgos y el experto cerró sus
preguntas. A mano también se vale — el ítem se puede crear sin IA.

## La numeración

Consecutiva, con huecos permitidos (`product/arquitectura-desarrollo.md` §1.11). **El identificador
vive dentro del archivo, no en su nombre:** renombrar un archivo no lo convierte en otro ítem.

## Las tres firmezas, y no hay una cuarta

- **`dicho`** — lo dijo y nadie lo revisó en frío.
- **`confirmado`** — se le devolvió y dijo que sí. Lleva fecha de cuándo.
- **`abierto`** — nadie lo pudo contestar. Lleva la pregunta que quedó pendiente.

Un hueco registrado sirve; una pregunta que nadie contesta detiene la línea para siempre.

---

> **La forma del ítem todavía es hipótesis.** M4 es el módulo que la decide y no se ha abierto.
> Esta plantilla salió de medir qué campos aparecieron solos en una sesión real: `regla`,
> `de dónde salió` y `firmeza` salieron los tres; **`apetito` no apareció ni una vez**, y se
> conserva porque `modulos.md` lo declara — no porque se haya medido. Ese renglón es justamente el
> dato que M4 tiene que resolver.
