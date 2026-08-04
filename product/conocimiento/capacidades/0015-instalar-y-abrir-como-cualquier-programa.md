---
id: CAP-0015
capacidad: Instalar y abrir Nemawashi como cualquier otro programa de escritorio.
modulo:
reglas: [REG-0001]
firmeza: abierto
origen: escuchado
estado: con-huecos
paso: que es Nemawashi y por que se pierde lo que el experto dice
alta: 2026-08-04T15:19:13-06:00
confirmado:
marcado: 2026-08-04T15:19:13-06:00
---

<capacidad>

<en-sus-palabras>
El experto abrió el paso presentando qué es Nemawashi antes de nombrar el dolor: un programa de escritorio que se instala y se abre como cualquier otro, para que alguien que sabe de su negocio pueda sentarse a construir el mapa de lo que necesita que haga un sistema, hablando con una IA, sin ver nunca una terminal ni escribir una línea de código. Instalarlo y abrirlo igual que cualquier otro programa de escritorio es lo que ahí quedó dicho, y es lo que alguien tiene que poder hacer para que se cumpla la regla escrita como REG-0001, «Nemawashi se instala y se abre como cualquier programa: ni terminal ni una línea de código para usarlo»; esta capacidad no es una verdad nueva, es el lado de lo que hay que poder hacer. Lo que nunca se dijo es cómo se instala: no se habló de descarga, ni de instalador, ni de quién lo instala, ni de qué pasa cuando hay que actualizarlo, ni en qué sistemas tiene que correr. Nadie le devolvió esto con otras palabras en toda la sesión, y ese lado quedó sin tocarse, por eso queda abierta.
</en-sus-palabras>

<de-donde-salio>
Del primer turno del experto en el paso «que es Nemawashi y por que se pierde lo que el experto dice», cuando nombró qué es el programa antes de nombrar el dolor: lo presentó como un programa de escritorio que se instala y se abre como cualquier otro. La regla REG-0001 ya recoge esa verdad, y lo que este paso agrega es el lado de lo que alguien tiene que poder hacer para que se cumpla, que es instalarlo y abrirlo igual que cualquier otro programa de escritorio. Ni en ese turno ni en ninguno posterior se dijo cómo se instala, y a la pregunta que se le devolvió después de la sesión —sobre si al abrir una cosa registrada quiere que diga quién puso cada cosa o le basta saber de dónde salió— tampoco le tocaba contestarlo.
</de-donde-salio>

<que-queda-abierto>
Cómo se instala el programa: no se dijo si se descarga, si viene en un instalador, quién lo instala, ni cómo se actualiza. Tampoco se dijo en qué sistemas tiene que correr.

Lo que señalaron las mediciones al leer este registro:

- Quedo sin cerrar al construir el registro.
- El examen quedo a-medias en: «¿Qué tiene que poder hacer el sistema que se está mapeando?»
- El examen quedo a-medias en: «¿Qué reglas gobiernan cada una de esas cosas que el sistema tiene que poder hacer?»
- El examen quedo sin-contestar en: «¿Cómo llega el programa a la máquina de quien lo va a usar?»

Auditoría del 2026-08-04:

- Mal marcado. Enlace de un solo lado, MOD-0004 → CAP-0015. `product/conocimiento/modulos/0004-el-programa-en-manos-de-quien-no-sabe.md` línea 5 declara `capacidades: [CAP-0015, CAP-0016]`, y este archivo, línea 4, tiene `modulo:` vacío. La plantilla de capacidades: «modulo — El id del modulo que la contiene. Ese modulo tiene que nombrarla de vuelta». CAP-0016 sí nombra de vuelta a MOD-0004; CAP-0015 no.
- Mal marcado. Enlace de un solo lado, CAP-0015 → REG-0001. Línea 5 de este archivo declara `reglas: [REG-0001]`, y `product/conocimiento/reglas/0001-se-instala-como-cualquier-programa.md` línea 4 tiene `capacidades: [CAP-0001]` — no la nombra de vuelta. La plantilla de capacidades: «reglas — ... Cada una tiene que nombrarla de vuelta».
- No le alcanza a quien no estuvo. Línea 22 — remite a «la pregunta que se le devolvió después de la sesión» y describe de qué era, pero la respuesta no está en ningún archivo del registro: el lector queda sabiendo que se preguntó y sin poder saber qué se contestó. Además, desde CAP-0015 no se llega a MOD-0004 (`modulo:` vacío), así que quien caiga aquí no encuentra el pedazo al que pertenece.
</que-queda-abierto>

</capacidad>
