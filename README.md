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

La unidad que viaja por la sala es **la carta individual** (`/carta/:id`): el manager envía cartas sueltas a las paredes, y cada mesa devuelve al manager la carta que juega.

| Ruta | Dónde se abre | Qué hace |
|---|---|---|
| `/` | Dispositivo del manager | Panel de control: reparto, sacar cartas del mazo, jugadas, pista, mezcla, votos, revelado, marcador |
| `/carta/:id` | Paredes de las mesas y pared de votación | Una carta a pantalla completa, sin texto |
| `/mano?mesa=…&cartas=…` | Solo en el dispositivo del manager | Ayuda de reparto: las cartas de una mesa, cada una se abre en una pestaña nueva para enviarla a su pared. No se envía a las paredes |
| `/tablero?c=…&p=…` (opcional) | Pared de votación | Las cartas jugadas mezcladas y numeradas en una sola vista, con la pista |
| `/tablero?…&s=…&v=…&pts=…&total=…` (opcional) | Pared de votación | Revelado: carta del pistero, quién votó a cada carta y puntos |

El estado de la partida (mazo, manos, ronda, marcador) vive en `localStorage` del dispositivo del manager (`src/lib/gameEngine.ts`).

## Flujo de una ronda

1. **Reparto inicial**: en el panel, **Ver mano** de cada mesa abre sus cartas; cada carta se abre en una pestaña nueva y se envía a la pared de esa mesa.
2. El pistero elige una carta y dice la pista (el manager puede escribirla). Cada mesa envía al manager la carta que juega; el manager la marca en el panel pulsando su miniatura.
3. **Mezclar las cartas jugadas**: el panel muestra el orden aleatorio numerado con **Abrir carta N** para enviar cada una a la pared de votación en ese orden (o **Abrir tablero** para enviarlas todas juntas y numeradas).
4. Las mesas votan (nadie puede votar su propia carta) y el manager anota los votos en el panel.
5. **Revelar y puntuar** aplica las reglas (opcionalmente **Abrir revelado** para la pared).
6. **Siguiente ronda**: el manager saca del mazo tantas cartas como usó cada mesa; el panel las lista en «Cartas sacadas del mazo» con **Abrir carta** para enviarlas una a una a su pared. **Sacar carta** en cada mesa permite sacar cartas sueltas en cualquier momento.

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
