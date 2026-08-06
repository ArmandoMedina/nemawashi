---
id: DOM-0002
dominio: De lo escrito al software probado: el prototipo, las historias y la construccion.
modulos: [MOD-0005, MOD-0006, MOD-0007]
firmeza: abierto
origen: propuesto
estado: con-huecos
paso: Consultoría
alta: 2026-08-06T09:04:12-06:00
confirmado:
marcado:
---

<dominio>

<en-sus-palabras>
El experto nunca nombro un area de su negocio ni dijo como esta repartido lo que conto: el corte lo propone quien escribe. Lo que el conto fue el recorrido por el que pasa un producto de software, enumerado de corrido, y tres de esos tramos caen del mismo lado. Primero el prototipo: una vez destilada la platica, las capacidades quedan enlistadas para que los desarrolladores las tomen y las seleccionen, cada quien dice en cual va a trabajar y con eso arma el prototipo que se le va a ensenar al cliente; ese tramo existe porque el experto de un negocio con veinte anos de oficio domina su area y muchas veces la explica muy bien, pero de tanta informacion la tiene mecanizada y no organizada, y por eso las documentaciones muy extensas no cumplen cuando por fin se muestran desarrolladas: ya viendolo se acuerda de cosas que no habia dicho, corrige lo que no era ni de un lado ni del otro, y salen detalles que a veces no son pequenos. Y la firma de ese tramo: ninguna vale si no es contra un prototipo funcional o algo ya operando que el experto pueda tocar y verificar; no hace falta que quede nada escrito con fecha, pero la palabra sola, sin nada corriendo enfrente, no firma. Segundo, las historias de usuario, que se escriben despues de haber realizado el prototipo, ya con lo que el cliente corrigio al verlo, y que despues se seleccionan y se revisa que esten completas. Tercero, la construccion: otro flujo se encarga del diseno de lo que va por detras y va revisando que se cumplan los criterios de arquitectura decididos, que el codigo sea escalable, que traiga buenas practicas y buenos paradigmas, y que se hagan todas las pruebas; ahi adentro va tambien la revision con varios auditores que miran desde angulos distintos antes de dar algo por bueno, de donde salio lo que mas le preocupa: llego a encadenar hasta diez rondas seguidas y todas encontraban hallazgos validos, se corregian, y la siguiente volvia a encontrar, sin que nunca supiera como dar por satisfecha la revision. Lo que se saca de ahi para el area: los tres tramos ocurren entre que el registro ya esta escrito y que lo construido se da por bueno, y a los tres los contesta el mismo papel, el que construye el software. El experto declaro los tramos de construccion y de entrega como propuesta suya, dijo que todavia no esta seguro del flujo y pidio ayuda para hacerlo mas claro.
</en-sus-palabras>

<quien-lo-sabe>
Quien construye el software: el papel que toma del registro las capacidades, arma con ellas algo que funcione, se lo ensena al experto, escribe y revisa las historias, y responde por el codigo antes de darlo por bueno. El experto del negocio entra a este tramo a tocar y a firmar, pero no es quien responde por el; y quien conduce el levantamiento, que es el papel de DOM-0001, no puede contestar nada de aqui adentro sin traer a este a la sala.
</quien-lo-sabe>

<que-agrupa>
Cae dentro todo lo que pasa entre que el registro ya esta escrito y que lo construido se da por bueno: escoger del registro las capacidades y armar el prototipo, ensenarselo al experto para que corrija lo que no salio en la platica y darlo por firmado sobre algo que ya corre, escribir despues las historias y revisar que esten completas, y el diseno de lo que va por detras con la verificacion de arquitectura, escalabilidad, practicas y pruebas y la revision de varios auditores. NO cae dentro la platica que produjo el registro ni lo que queda escrito con sus marcas, que son del levantamiento; ni el despliegue, las maquinas, lo de operaciones y la validacion final, que son de la entrega; ni como queda armado cada puesto de la linea ni lo que la maquina olvida o recorta, que son del area de los agentes. La prueba para meter aqui un modulo nuevo: que lo de adentro lo pueda contestar quien construye el software, y que ocurra entre que el registro esta escrito y que lo construido se da por bueno. Si ocurre con el experto hablando y sin nada corriendo enfrente, es del levantamiento; si ocurre despues de darlo por bueno y trata de donde queda operando, es de la entrega; si vale igual en todos los pasos, es del area de los agentes.
</que-agrupa>

<que-queda-abierto>
Tres cosas, y las dos primeras tocan el borde de esta area. Una: si la entrega es un area aparte o cae aqui dentro. El experto cerro su enumeracion diciendo que no sabe en que parte entran las maquinas virtuales y lo de operaciones, y nombro a otros, los que lo revisan ahi, sin que ese papel estuviera en la sala; mientras eso no se conteste, el limite de abajo de esta area no esta fijado. Dos: si la revision con varios auditores corre solo sobre lo construido o tambien sobre lo que producen los demas pasos de la linea. Si corriera sobre todos, esa capacidad saldria del modulo de la construccion y con ella el corte de esta area tendria que rehacerse. Tres: contra que criterios escritos verifica el flujo de construccion. El experto los enuncio con ejemplos que el mismo descarto despues por ser de otro sistema, y declaro el tramo entero como propuesta suya sin seguridad del flujo; hoy no hay contra que comparar un hallazgo para saber si obliga a corregir, y por eso la revision se corta contando vueltas y no midiendo desviacion.

Quedo sin cerrar al construir el registro.
</que-queda-abierto>

</dominio>
