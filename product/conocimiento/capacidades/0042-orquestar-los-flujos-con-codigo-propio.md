---
id: CAP-0042
capacidad: Orquestar los flujos con código propio, en vez del armazón que los corre aplanados en un solo archivo.
modulo: MOD-0011
reglas: [REG-0065, REG-0066, REG-0067]
firmeza: abierto
origen: escuchado
estado: con-huecos
paso: Sesión 3 con el experto
alta: 2026-08-06T19:46:14-06:00
confirmado:
marcado:
---

<capacidad>

<en-sus-palabras>
El trueque no es tener flujo o no tenerlo, es dónde se pone la frontera. Con el armazón que hoy corre los flujos se regalan la reanudación de una corrida a medias, la bitácora por fases y la caché, pero el código queda aplanado en un solo archivo y sin poder traer piezas de otros: lo que vive afuera hay que copiarlo a mano adentro. Orquestando con código propio, la orquestación vive en código normal, se llama a los agentes como cualquier otra dependencia y por un puerto, y se recupera todo lo que se había perdido de la arquitectura; a cambio, esa plomería de orquestación se vuelve de uno y hay que construirla. La razón para mirarlo es que un flujo chico cabe pegado en un solo archivo, pero levantar, prototipar, ajustar la documentación, desarrollar y revisar la calidad, cada uno con sus fases, todo aplanado y con copias a mano, no se sostiene. De las herramientas que ya orquestan agentes como un grafo, con el estado guardado entre paso y paso, no se adopta la librería: siendo código abierto se leen y se toman los principios, preguntándole a cada pieza qué dolor obligó a hacerla, porque si ese dolor no se tiene, no se carga.
</en-sus-palabras>

<de-donde-salio>
Él lo levantó como abogado del diablo, mirando el techo del patrón antes de estrellarse con él: dijo que no sabe qué tan sostenible sea a futuro tener flujos gigantescos acoplados en un mismo archivo y con partes duplicadas, y preguntó si valdría la pena crear esa lógica de forma artesanal.
</de-donde-salio>

<que-queda-abierto>
No se decidió. No hay tamaño —nadie dijo a partir de cuántos pasos, cuántas fases o cuántas copias deja de convenir el archivo plano— y él avisó que todavía es muy pronto para decidirlo.

- Quedo sin cerrar al construir el registro.
- El examen quedo a-medias en: «¿Hasta qué tamaño le sale barato a un flujo vivir aplanado en un solo archivo?»
</que-queda-abierto>

</capacidad>
