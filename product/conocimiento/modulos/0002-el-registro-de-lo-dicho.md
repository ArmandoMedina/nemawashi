---
id: MOD-0002
modulo: El registro de lo que se dijo: lo que queda escrito, con su firmeza y su procedencia.
capacidades: [CAP-0006, CAP-0007, CAP-0008, CAP-0012]
firmeza: dicho
origen: propuesto
estado: con-huecos
paso: que es Nemawashi y por que se pierde lo que el experto dice
alta: 2026-08-04T09:42:15-06:00
confirmado:
marcado: 2026-08-06T09:04:12-06:00
---

<modulo>

<en-sus-palabras>
El experto dijo que lo que le duele hoy es que cuando alguien cuenta cómo funciona su negocio eso se
pierde: se toma nota, pero tres meses después nadie sabe si una regla la dijo el cliente o se la
inventó el que tomó la nota, y cuando la persona que sabía ya no está no queda nada que se pueda
usar. Por eso Nemawashi tiene que registrar lo que se dice con de dónde salió y poder decir qué tan
firme es cada cosa. De ahí se sacó este pedazo: todo lo que queda escrito y las marcas que lo
acompañan.
</en-sus-palabras>

<que-agrupa>
Cae dentro lo que queda escrito al cerrar un tramo y las marcas que lo acompañan: qué tiene que
poder hacer el sistema, con qué reglas, de dónde salió cada cosa contada entera, qué tan firme
quedó, y qué se hace cuando un dato no llegó. No cae dentro la plática que lo produjo, ni el rumbo
de la sesión, ni la revisión en frío que se le hace a lo escrito antes de guardarlo. Regla de
reparto: si la capacidad decide qué dice el archivo, es de aquí; si decide si el archivo se guarda
o no, no.
</que-agrupa>

<de-donde-salio>
El conjunto no cerraba sin este corte: lo que el experto describió como el dolor central —que se
pierde de dónde salió una regla y qué tan firme está— no tenía dónde vivir separado de la
conversación que lo produjo. Nadie nombró este pedazo; se propuso porque sin él no se puede decidir
dónde va una capacidad nueva que sólo toca lo escrito.
</de-donde-salio>

<que-queda-abierto>
Auditoría del 2026-08-04:

- Mal marcado. Enlace de un solo lado, DOM-0001 → MOD-0002. Este archivo no tiene siquiera campo `dominio` en su frontmatter, así que no nombra de vuelta a `product/conocimiento/dominios/0001-el-levantamiento-hablado-del-negocio.md`, que en su línea 4 lo lista dentro de `modulos: [MOD-0004, MOD-0002]`. Y contradice lo que el mismo DOM-0001 argumenta en sus líneas 37 y 45: ahí deja fuera a MOD-0001 y MOD-0003 precisamente por no dejar «un enlace escrito de un solo lado», y a MOD-0002 lo lista aunque está exactamente en la misma condición («Los dos están en disco sin campo de dominio en su frontmatter, medido» — cierto también de MOD-0002).

Auditoría del 2026-08-06: mal marcado. Enlace roto sin declarar: product/conocimiento/capacidades/0031-entregar-lo-levantado-en-fragmentos.md dice `modulo: MOD-0002` y este archivo no la nombra de vuelta. No está en la lista de deuda declarada (`DEUDA_DE_ENLACE`), que hoy sólo tiene cinco entradas y todas de corridas anteriores. Prueba: `npx vitest run src/contratos/el-conocimiento-no-se-escapa.test.ts` falla con «11 enlace(s) roto(s) sin declarar».
</que-queda-abierto>

</modulo>
