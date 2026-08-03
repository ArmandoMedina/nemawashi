# Nemawashi

Un ejecutable de escritorio que envuelve a Claude Code para que un experto de negocio y una IA
construyan juntos el roadmap de un sistema, sin que el experto vea nunca una terminal.

**Qué es esto todavía no está definido.** Lo que sigue es lo único que se puede afirmar hoy.

## Estado

Arrancando. **Ninguna pantalla del producto existe todavía.** Lo que hay es documento y maqueta
—buena parte marcada como propuesta sin firmar— más el esqueleto que deja construir: la app abre
una ventana vacía, y las pruebas corren.

Dos comandos, y no hay un tercero: **`npm run dev`** abre la app, **`npm test`** dice qué se rompió.

- [`product/modulos.md`](product/modulos.md) — siete módulos y un orden para construirlos.
- [`product/arquitectura-desarrollo.md`](product/arquitectura-desarrollo.md) — lo que rige hoy del lado técnico.
- [`product/arquitectura-diseno.md`](product/arquitectura-diseno.md) — lo que rige hoy del lado de interfaz.
- [`docs/decisions/`](docs/decisions/) — las decisiones tomadas, una por archivo.
- [`design/`](design/) — el sistema de diseño y la maqueta de la primera ventana.
- [`src/contratos/mensajes.ts`](src/contratos/mensajes.ts) — todo lo que la app puede hacer, en una
  lista corta. Es la página de revisión más barata que tiene el proyecto.

## Requisito

Claude Code instalado y con sesión iniciada en la máquina. Usa el plan mensual: sin API key, sin
cobro por token.

## El gate anti dato personal

Este repositorio es público. [`.claude/rules/valen-en-toda-sesion.md`](.claude/rules/valen-en-toda-sesion.md) prohíbe dato personal, cita textual o identificador de
cliente en cualquier archivo versionado, sin excepción para pruebas ni ejemplos — y
[`src/contratos/sin-dato-personal.test.ts`](src/contratos/sin-dato-personal.test.ts) es el muro que
lo hace cumplir, no la prosa que lo pide. Corre en CI en cada *pull request* y en cada push a
`main` ([`.github/workflows/andon.yml`](.github/workflows/andon.yml)).

**Para que también corra antes de empujar, en tu máquina:**

```
git config core.hooksPath .githooks
```

Enciende [`.githooks/pre-push`](.githooks/pre-push), que corre el mismo contrato y aborta el push
si encuentra un hallazgo.

**Denylist local, opcional.** El gate detecta *formas* — correo con dominio, ruta de perfil de
usuario — sin contener ningún dato personal real. Si además quieres bloquear cadenas literales de
tu propio entorno, copia [`anti-pii.denylist.example.txt`](anti-pii.denylist.example.txt) como
`anti-pii.denylist.txt` en la raíz. Ese archivo nunca se versiona (está en `.gitignore`); si no
existe, el gate corre igual, sólo con los detectores estructurales.
