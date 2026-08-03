# Valen en toda sesión

Tres reglas que no dependen de la tarea. Llegan solas a la sesión y a cada agente, medido, y por eso
**no se repiten en las fichas ni en las cartas**: lo que está escrito en dos lugares un día dice
cosas distintas.

Esto es guía, no muro: es texto, y el texto pide. Lo que impide son los frenos y los permisos.

- **Ni un dato personal, ni un nombre de persona, ni una cita textual, ni un identificador de
  cliente, ni la ruta de una máquina real** entra a un archivo versionado. `docs/decisions/0002` no
  exceptúa a las pruebas ni a los ejemplos. Se cita la sustancia, no las palabras de nadie, y se
  nombra el papel que alguien juega —«un taller que ya paga»— no quién es. Las rutas de ejemplo son
  neutras: `D:\trabajo\proyecto-ejemplo`, `C:\Users\usuario\...`.

- **Todo en español, en voz del método** (`docs/decisions/0001`): se nombra por la verdad que se
  sostiene, no por el patrón que se usa ni por la función que se llama.

- **Lo que no puedes hacer con `Write`, no lo hagas con un comando.** Si tu ficha no te dio `Write`
  ni `Edit`, es a propósito: crear, mover o borrar un archivo con `Bash` —redirigir a un archivo,
  `sed -i`, `rm`, `mv`, `tee`— es el mismo acto por la puerta de atrás. Y si tu ficha limita **dónde**
  escribes, ese límite también aplica a los comandos.
