# Non Dago? — Dixit de lugares de Euskadi

Juego de sala interactiva inspirado en Dixit: un equipo da una pista ambigua sobre un lugar de Euskadi, el resto elige de su propia mano una carta que también podría encajar, y toda la sala vota cuál era la carta original. Sin backend, sin cuentas: el mazo vive en el dispositivo del profesor y las manos privadas se reparten como URLs a las mesas-pantalla táctiles de la sala.

Ver el diseño completo en [docs del proyecto hermano](../timeline-card-game/docs/PROPUESTA_DIXIT_EUSKADI.md) (`timeline-card-game/docs/PROPUESTA_DIXIT_EUSKADI.md`).

## Estado actual

Prototipo funcional con un mazo de **30 lugares de prueba** (ilustraciones placeholder abstractas en `public/lugar-*.svg`) para validar el ciclo completo de una ronda antes de generar las 40 ilustraciones definitivas con IA.

## Cómo se juega

1. El profesor abre `/` (panel del profesor) e inicia partida eligiendo 3 o 4 mesas.
2. Por cada mesa, pulsa **Abrir mano** — se abre `/mano?mesa=...&cartas=...` en una pestaña nueva; esa pestaña se envía/abre físicamente en la pantalla táctil de esa mesa.
3. El equipo pistero mira su mano (privada) y da una pista en voz alta sin decir cuál es su carta.
4. Cada mesa (incluida la del pistero) elige en su mano una carta que encaje con la pista. En el panel del profesor, se marca qué carta jugó cada mesa (clicando su miniatura).
5. Cuando todas han jugado, el profesor pulsa **Montar la pared** y abre `/pared` en la pantalla grande — las cartas salen mezcladas y numeradas.
6. La sala vota en voz alta/a mano alzada. El profesor teclea en su panel qué número votó cada mesa (no pistero).
7. **Revelar y puntuar** aplica las reglas clásicas de Dixit (ver `docs/PROPUESTA_DIXIT_EUSKADI.md` del repo de Timeline).
8. **Siguiente ronda** reparte una carta nueva a cada mesa y pasa el turno de pistero.

## Arquitectura

Mismo patrón sin servidor que [timeline-card-game](../timeline-card-game): React 19 + TypeScript + Vite 6 + Tailwind 4 + `HashRouter`, desplegable en GitHub Pages.

- **Panel del profesor / pared / marcador**: comparten el estado del juego vía `localStorage` del mismo navegador (pensado para ejecutarse en el portátil del profesor, con la pared/marcador en ventanas extendidas al proyector).
- **Mano de mesa**: al ser un dispositivo físico distinto, su contenido viaja codificado en la propia URL (`?mesa=X&cartas=id1,id2,...`) — no depende de `localStorage` compartido.
- **Carta individual** (`/carta/:id`): vista de una sola carta a pantalla completa, sin texto que revele nada — reutilizada tanto dentro de la mano como al jugar una carta a la pared.

```
src/
├── App.tsx                 # HashRouter con las 5 rutas del juego
├── lib/
│   ├── lugares.ts           # Mazo de datos (id, nombre, comarca, imagen) — placeholder de 12
│   ├── gameEngine.ts         # Motor: reparto, rondas, votos, puntuación — vive en localStorage del profesor
│   └── utils.ts              # Helper de clases CSS
└── pages/
    ├── PanelProfesor.tsx     # / — control de la partida
    ├── ManoView.tsx           # /mano — mano privada de una mesa
    ├── CartaView.tsx          # /carta/:id — una carta a pantalla completa
    ├── ParedView.tsx           # /pared — cartas jugadas, votación y revelado
    └── MarcadorView.tsx        # /marcador — puntuación acumulada
```

## Desarrollo

### Con Docker

```bash
docker compose up -d --build
```

App disponible en [http://localhost:3000](http://localhost:3000).

### Sin Docker

```bash
npm install
npm run dev
```

## Pendiente antes de jugar en serio

- Sustituir las 12 ilustraciones placeholder por arte ambiguo generado con IA, y ampliar el mazo a 40 lugares (`src/lib/lugares.ts`).
- Probar el flujo completo en una sala real con las mesas-pantalla táctiles y ajustar la UX de reparto (QR opcional para no tener que copiar URLs largas a mano).

## Licencia

MIT
