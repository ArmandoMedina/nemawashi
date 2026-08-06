---
id: REG-0027
regla: El experto platica directo con la IA porque ella sí le sigue el ritmo y la información sale más rápido.
capacidades: []
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
La IA tiene mucho contexto en áreas muy amplias, y eso hace que le siga el ritmo al experto con facilidad. Por eso se sienta al experto directamente con la IA en vez de con una persona: platicando al mismo ritmo, la información se extrae más rápido. La IA que conduce la plática es experta en consultoría y su trabajo es sacarle al experto todo lo que sabe del producto, haciéndole preguntas.
</en-sus-palabras>

<de-donde-salio>
Salió al contar por qué quiere construir la herramienta, en la misma explicación donde hizo la cuenta de las horas: el experto tuvo veinte años en su industria y el consultor tiene una sesión de una hora por semana durante dos años, 104 horas en total. La razón que dio ahí para sentar al experto frente a la IA fue el ritmo. Al abrir la sesión ya había dibujado la línea con el experto platicando directo con una IA experta en consultoría, pero ahí todavía sin decir por qué.
</de-donde-salio>

<que-queda-abierto>
Auditoría del 2026-08-06: mal marcado. Enlace roto sin declarar: este archivo trae `capacidades: []` y sale como `sin-quien-lo-contenga`. No está en la lista de deuda declarada (`DEUDA_DE_ENLACE`), que hoy sólo tiene cinco entradas y todas de corridas anteriores. Prueba: `npx vitest run src/contratos/el-conocimiento-no-se-escapa.test.ts` falla con «11 enlace(s) roto(s) sin declarar».

Auditoría del 2026-08-06: mal marcado. Este archivo trae `capacidades: []` y aun así está marcado `estado: completa` con `<que-queda-abierto>nada</que-queda-abierto>`. Su propia plantilla, product/conocimiento/reglas/0000-plantilla.md, dice del campo vacío: «y eso es un hueco: una regla que no sostiene nada es una regla que nadie va a aplicar». La marca dice que ninguna medición la señaló, y el hueco está a la vista en el frontmatter.
</que-queda-abierto>

</regla>
