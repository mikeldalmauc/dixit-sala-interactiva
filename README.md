# Dixit · Sala interactiva

Dixit para una sala interactiva con una pantalla central y cuatro paredes táctiles, una por mesa-equipo. Sin backend ni cuentas: el profesor lleva la partida desde su panel y **cada pantalla de la sala es una función pura de la URL que se abre en ella**, de modo que cualquier vista puede enviarse de una pantalla a otra con el sistema de la sala.

## Cartas

El mazo (`src/lib/cartas.ts`, imágenes en `public/cartas/`) son ilustraciones ambiguas y evocadoras de dominio público, al estilo Dixit. Cada carta tiene un `titulo` orientativo que solo ve el profesor; en las paredes y en la pantalla central nunca aparece texto que identifique la carta. Atribuciones en `public/CREDITS.md`.

## Reglas (Dixit clásico)

- 6 cartas por mesa. Con **3 mesas** se aplica la variante oficial: 7 cartas en mano y cada mesa no pistera juega 2 cartas, para que haya 5 sobre la mesa.
- El **pistero** elige una carta y da una pista en voz alta (palabra, frase, sonido...). El resto elige en secreto la carta de su mano que mejor encaje.
- Las cartas se mezclan y se numeran. Todas las mesas menos el pistero votan cuál es la del pistero; **nadie puede votar su propia carta**.
- Puntuación: si todas o ninguna aciertan, el pistero suma 0 y el resto 2. Si no, el pistero y cada acertante suman 3. Además cada mesa no pistera suma 1 por cada voto que reciba su carta señuelo.
- Se repone la mano, el turno de pistero rota. La partida termina cuando el mazo no da para reponer (esa es la última ronda) o cuando una mesa llega a 30 puntos.

## Pantallas

| Ruta | Dónde se abre | Qué hace |
|---|---|---|
| `/` | Dispositivo del profesor | Panel de control: reparto, jugadas, pista, montar la mesa, votos, revelado, marcador |
| `/mano?mesa=…&cartas=…&ronda=…&jugar=…&n=…[&rol=pistero]` | Pared táctil de cada mesa | Mano privada. Tocar una carta la amplía **sin salir de la mano**; desde ahí se marca como elegida (la pared muestra su letra). Las mesas votantes votan en secreto en la propia pared y muestran el voto cuando lo pide el profesor |
| `/tablero?c=…&p=…` | Pantalla central | Las cartas jugadas mezcladas y numeradas, con la pista. Tocar una carta la amplía |
| `/tablero?…&s=…&v=…&pts=…&total=…` | Pantalla central | Revelado: carta del pistero, quién votó a cada carta y puntos |
| `/carta/:id` | Cualquiera | Una carta a pantalla completa, sin texto |

El estado de la partida vive en `localStorage` del dispositivo del profesor (`src/lib/gameEngine.ts`). Lo que decide cada mesa (carta elegida, voto) solo vive en su pared y se reinicia con cada URL nueva de mano, es decir, cada ronda.

## Flujo de una ronda

1. Panel, paso 1: **Abrir mano** / **Copiar enlace** por mesa y enviar cada mano a su pared.
2. El pistero dice la pista; el profesor puede escribirla (aparece en la pantalla central). Cada mesa elige en su pared y dice su letra al profesor, que pulsa esa miniatura en el panel.
3. **Mezclar y montar la mesa** → **Abrir tablero** / **Copiar enlace** y enviarlo a la pantalla central.
4. Cada mesa vota en su pared (secreto). El profesor pide mostrar los votos y los anota en el panel (los números tachados son la carta propia de cada mesa).
5. **Revelar y puntuar** → **Abrir revelado** para la pantalla central.
6. **Siguiente ronda**: repone cartas, rota el pistero y genera los enlaces de mano nuevos (vuelta al paso 1).

## Desarrollo

```bash
docker compose up -d --build     # http://localhost:3002
npm install && npm run dev       # sin Docker, http://localhost:3000
npm run lint                     # tsc --noEmit
```

Smoke test de una ronda completa con Playwright: ver cabecera de `.verify/test.mjs`.

Stack: React 19 + TypeScript + Vite 6 + Tailwind 4 + `HashRouter`; desplegable en GitHub Pages (`.github/workflows/deploy.yml`, `base` en `vite.config.ts`).

## Licencia

MIT (código). Las imágenes de las cartas tienen su propia atribución en `public/CREDITS.md`.
