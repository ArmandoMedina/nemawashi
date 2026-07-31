# ADR 0001 — Todo documento se redacta desde el proyecto y en voz del método, con la razón real y no con la anécdota que la originó

- **Estado:** aceptado
- **Fecha:** 2026-07-29

## Contexto

Los documentos de este repo se producen dentro de conversaciones entre humano y agente. La deriva
natural de ese origen es narrar el proceso que los produjo —*«se propuso que…»*, *«el dueño del
producto declaró…»*— y un documento así solo lo entiende quien estuvo presente.

No es un riesgo futuro: la deriva ya está en el corpus, con los primeros archivos del repo.

## Decisión

**Todo documento de este repo se redacta desde el proyecto, en voz del método, con la razón real
y autocontenido. Las conversaciones que lo produjeron NO se narran en su cuerpo.**

1. **En voz del método.** El sujeto es el método, el módulo o la pieza — nunca la sesión ni quien
   la escribió. *«Un módulo sirve solo o no es módulo»*, no *«se decidió que los módulos sirvan
   solos»*.
2. **La razón real, no la anécdota.** Se registra la fuerza que obliga a decidir, no el incidente
   que la reveló. La anécdota se **destila** a un campo designado —`De dónde salió`, `Procedencia`,
   `Porque`— o a una cita hacia un informe fechado. El mismo dato es legítimo en un campo
   designado y es deriva suelto en la prosa: lo que cambia no es el dato, es si el documento lo
   **cita** o lo **absorbe**.
3. **Autocontenido.** Entenderlo no exige haber estado en ninguna conversación ni conocer ningún
   otro repo.

**Alcance.** Entra todo documento que se lee **para ejecutarlo**: ADRs, `product/*.md`, `README.md`
y la documentación de referencia. Queda fuera el documento cuyo género **es** el proceso —un
informe de medición fechado, que sin su método no es evidencia sino afirmación. Este repo no tiene
ninguno todavía; la excepción se declara para que el primero nazca sabiendo que está fuera.

## Por qué

- **Un documento que exige contexto de conversación caduca con la conversación.** Uno autocontenido
  sirve a cualquier lector futuro, incluida una IA sin memoria — que es el lector más frecuente de
  este repo.
- **La razón real sobrevive a la anécdota.** *«Un módulo que no sirve solo encadena el proyecto»*
  sigue siendo cierto cuando ya nadie recuerda qué proyecto lo demostró.
- **Los agentes consumen estos documentos como instrucciones.** Una narración de proceso los invita
  a **imitar el proceso**; una regla en voz del método los invita a **cumplirla**.
- **La deriva no llega con el tiempo, llega con el primer documento.** Por eso la regla se adopta
  ahora y no cuando haya corpus que auditar.

## El camino que NO se toma (y por qué tienta)

- **Un gate que cace la voz** (`grep` de «esta sesión», «se propuso», «el dueño»). Tienta porque es
  mecánico y este tipo de frase se busca fácil. Se rechaza porque no distingue **mención de uso**
  —este ADR usa esas frases como ejemplo y son correctas—, marcaría en rojo los campos que los
  moldes **exigen**, y dejaría pasar una bitácora entera escrita sin usar ninguna palabra de la
  lista. Fatiga de alerta a cambio de cero garantía.
- **Purgar la anécdota en vez de destilarla.** Tienta porque es la lectura simple de la regla: «no
  narres el proceso» → «bórralo». Se rechaza porque la anécdota no sobra; lo que sobra es que ocupe
  el cuerpo del documento en vez de su campo designado.
- **Aplicar la regla también a los informes.** Tienta por uniformidad. Se rechaza porque mutilaría
  la única clase de documento cuyo valor es el método reproducible.

## Consecuencias

- **Cualquier documento se puede leer en frío.** Es la ganancia, y es la única que este ADR compra.
- **La historia fina vive en tres sitios:** los campos designados de cada molde, los informes
  fechados cuando existan, y el git log. Fuera del cuerpo del documento, deliberadamente.
- **No enciende ningún gate.** El cumplimiento vive en la revisión humana antes de aceptar
  cualquier documento. La prosa no obliga.
- **`product/plano-desarrollo.md` no se puede corregir.** Su encabezado narra el proceso, y la regla del plano
  es que no se mueve. Esa deriva se queda ahí y el diff contra `arquitectura-desarrollo.md` la va a exponer.

## Qué NO resuelve

- **No es verificable mecánicamente, y no se intentará.** Ningún gate distingue razón real de
  anécdota. Este ADR es prosa que gobierna prosa.
- **No define quién arbitra un caso limítrofe.** Una frase puede ser medición legítima o crónica
  prohibida según cómo esté redactada, y la frontera la pone el revisor humano.
- **No audita el corpus existente.** La regla rige hacia adelante; alinear lo ya escrito es trabajo
  aparte.
- **No toca ningún molde.** Ni el del plano ni `0000-plantilla.md` ganan una nota que recuerde la
  regla a quien escriba el siguiente documento, así que la regla no llega sola al momento de
  redactar.

---

> Reglas del registro: una decisión = un archivo · al agregarlo, **lístalo en el [índice](README.md) en el mismo commit** · nunca borres una decisión: márcala *reemplazada* y enlaza la nueva.
