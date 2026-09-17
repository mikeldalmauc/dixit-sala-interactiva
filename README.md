# Dixit · Sala interactiva

Dixit para una sala interactiva con una pantalla central y cuatro paredes táctiles, una por mesa-equipo. Sin backend ni cuentas: el manager reparte desde su panel y **la unidad que viaja por la sala es la carta individual** (`/carta/:id`), una URL que puede enviarse a cualquier pantalla con el sistema de la sala.

## Cartas

El mazo (`src/lib/cartas.ts`, imágenes en `public/cartas/`) son 48 ilustraciones ambiguas y evocadoras de dominio público, al estilo Dixit. Cada carta tiene un `titulo` orientativo que solo ve el manager; en las paredes nunca aparece texto que identifique la carta. Atribuciones en `public/CREDITS.md`.

## Qué hace la app

- **Reparto inicial**: 6 cartas por mesa (con 3 mesas, 7: variante oficial en la que cada mesa no pistera juega 2 cartas). «Ver mano» abre las cartas de una mesa y cada una se abre en su propia página para enviarla a la pared de esa mesa.
- **Sacar carta**: saca la siguiente carta del mazo para una mesa y la abre en su propia página.
- **Siguiente ronda**: el manager saca del mazo tantas cartas como usó cada mesa (1 por mesa; con 3 mesas, 1 el pistero y 2 el resto) y el panel las lista en «Cartas sacadas del mazo» con **Abrir carta** para enviarlas una a una. El turno de pistero pasa a la siguiente mesa. Cuando el mazo se agota, esa es la última ronda.
- Las miniaturas de cada mesa en el panel abren la carta en su propia página (útil para reenviar una carta a una pared).
- **Cartas que se giran**: toda carta suelta se abre sin indicar de qué mesa es. El botón del ojo le da la vuelta en cualquier momento: sigue viéndose la imagen, ahora con la mesa; otro toque la vuelve a ocultar.
- **Mano**: la mano inicial se envía a la pared de la mesa. Como todas sus cartas comparten ventana, la mesa elimina con la ✕ la carta que ya ha usado (con confirmación y «Deshacer»); se recuerda en esa pantalla.
- **Votación anónima**: «Cartas de voto» abre para cada mesa una mano con una carta por cada carta en juego (4 con 4 mesas; 5 con 3 mesas). En la mano cada carta muestra su número y la mesa; al tocarla se abre suelta en una pestaña nueva, **siempre oculta**, lista para enviarla. La carta de voto suelta tiene un botón grande con un ojo que revela u oculta el voto junto a la mesa en cualquier momento.

Lo que ocurre sobre las paredes (jugar la carta, mezclar en la pared de votación, recoger los votos, puntuar) lo lleva el manager con el sistema de la sala; la app no lo registra. La mesa y el voto viajan codificados en la URL de cada carta para que no se lean a simple vista.

## Pantallas

| Ruta | Dónde se abre | Qué hace |
|---|---|---|
| `/` | Dispositivo del manager | Panel: reparto, cartas de voto, sacar cartas, siguiente ronda, turno de pistero |
| `/carta/:id?m=…` | Cualquier pared | Una carta a pantalla completa; el ojo muestra/oculta la mesa |
| `/mano?mesa=…&cartas=…` | Pared de la mesa | Mano inicial: cada carta se abre en una página independiente y puede eliminarse tras usarla |
| `/votos?mesa=…&n=…` | Pared de la mesa | Mano de cartas de voto con su número a la vista |
| `/voto/:token` | Donde se envíe el voto | Carta de voto suelta: mesa siempre visible, voto oculto hasta pulsar el ojo |

El estado (mazo, cartas repartidas, ronda, pistero) vive en `localStorage` del dispositivo del manager (`src/lib/gameEngine.ts`).

## Desarrollo

```bash
docker compose up -d --build     # http://localhost:3002
npm install && npm run dev       # sin Docker, http://localhost:3000
npm run lint                     # tsc --noEmit
```

Smoke test con Playwright: ver cabecera de `.verify/test.mjs`.

Stack: React 19 + TypeScript + Vite 6 + Tailwind 4 + `HashRouter`; desplegable en GitHub Pages (`.github/workflows/deploy.yml`, `base` en `vite.config.ts`).

## Licencia

MIT (código). Las imágenes de las cartas tienen su propia atribución en `public/CREDITS.md`.
