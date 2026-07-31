# Registro de decisiones

Una decisión = un archivo. Se agrega aquí en el mismo commit. Ninguna se borra: se marca
*reemplazada* y se enlaza la que la sustituye.

El molde para escribir una nueva es [`0000-plantilla.md`](0000-plantilla.md).

Aquí vive **qué se decidió y qué hecho lo decidió**. El *qué rige hoy* está en
[`product/arquitectura-desarrollo.md`](../../product/arquitectura-desarrollo.md); el *qué se propuso al arrancar*, en
[`product/plano-desarrollo.md`](../../product/plano-desarrollo.md).

| # | Decisión | Estado | El porqué, en una línea |
|---|---|---|---|
| [0001](0001-todo-documento-se-redacta-desde-el-proyecto-y-en-voz-del-metodo.md) | Todo documento se redacta desde el proyecto y en voz del método | aceptado | Un documento que exige haber estado en la conversación caduca con ella; el lector más frecuente de este repo es una IA sin memoria |
| [0002](0002-ningun-dato-personal-ni-cita-textual-entra-al-repositorio-de-la-herramienta.md) | Ningún dato personal, cita textual ni identificador de cliente entra al repositorio de la herramienta | aceptado | El historial de git es permanente: es la única regla cuyo incumplimiento no se arregla corrigiendo el archivo |