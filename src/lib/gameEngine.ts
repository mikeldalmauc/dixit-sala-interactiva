import { LUGARES } from "./lugares";

const GAME_KEY = "dixit_euskadi_game";
const MANO_SIZE = 6;

export interface RondaEnCurso {
  cartasJugadas: Record<string, string>; // mesa -> id de la carta jugada
  orden: string[] | null; // ids mezclados, se rellena al "montar la pared"
  votos: Record<string, number>; // mesa (no pistero) -> índice de la pared votado
  resultado: ResultadoRonda | null; // se rellena al revelar, para que la pared sepa mostrar el resultado
}

export interface GameState {
  mesas: string[];
  mazoRestante: string[];
  manos: Record<string, string[]>;
  pisteroIndex: number;
  ronda: RondaEnCurso | null;
  puntuacion: Record<string, number>;
}

export interface ResultadoRonda {
  pistero: string;
  cartaPistero: string;
  slotPistero: number;
  acertaron: string[];
  fallaron: string[];
  puntosGanados: Record<string, number>;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function save(state: GameState) {
  localStorage.setItem(GAME_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("dixit_state_changed"));
}

export function getState(): GameState | null {
  const stored = localStorage.getItem(GAME_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as GameState;
  } catch {
    return null;
  }
}

export function iniciarPartida(mesas: string[]): GameState {
  const mazo = shuffle(LUGARES.map((l) => l.id));
  const manos: Record<string, string[]> = {};
  for (const mesa of mesas) {
    manos[mesa] = mazo.splice(0, MANO_SIZE);
  }
  const puntuacion: Record<string, number> = {};
  for (const mesa of mesas) puntuacion[mesa] = 0;

  const state: GameState = {
    mesas,
    mazoRestante: mazo,
    manos,
    pisteroIndex: 0,
    ronda: null,
    puntuacion,
  };
  save(state);
  return state;
}

export function getPistero(state: GameState): string {
  return state.mesas[state.pisteroIndex % state.mesas.length];
}

export function marcarCartaJugada(mesa: string, cardId: string) {
  const state = getState();
  if (!state) return;
  const ronda: RondaEnCurso = state.ronda ?? { cartasJugadas: {}, orden: null, votos: {}, resultado: null };
  ronda.cartasJugadas[mesa] = cardId;
  state.ronda = ronda;
  save(state);
}

export function todasLasMesasJugaron(state: GameState): boolean {
  if (!state.ronda) return false;
  return state.mesas.every((m) => state.ronda!.cartasJugadas[m] !== undefined);
}

export function montarPared(): GameState | null {
  const state = getState();
  if (!state || !state.ronda) return null;
  const ids = Object.values(state.ronda.cartasJugadas);
  state.ronda.orden = shuffle(ids);
  save(state);
  return state;
}

export function registrarVoto(mesa: string, slotIndex: number) {
  const state = getState();
  if (!state || !state.ronda) return;
  state.ronda.votos[mesa] = slotIndex;
  save(state);
}

export function calcularPuntuacion(): ResultadoRonda | null {
  const state = getState();
  if (!state || !state.ronda || !state.ronda.orden) return null;
  const { ronda, mesas } = state;
  const pistero = getPistero(state);
  const cartaPistero = ronda.cartasJugadas[pistero];
  const slotPistero = ronda.orden.indexOf(cartaPistero);
  const votantes = mesas.filter((m) => m !== pistero);

  const acertaron = votantes.filter((m) => ronda.votos[m] === slotPistero);
  const fallaron = votantes.filter((m) => ronda.votos[m] !== slotPistero);

  const puntosGanados: Record<string, number> = {};
  for (const m of mesas) puntosGanados[m] = 0;

  const todosAcertaron = acertaron.length === votantes.length;
  const nadieAcerto = acertaron.length === 0;

  if (todosAcertaron || nadieAcerto) {
    for (const m of votantes) puntosGanados[m] += 2;
  } else {
    puntosGanados[pistero] += 3;
    for (const m of acertaron) puntosGanados[m] += 3;
  }

  // Bono por señuelo: por cada voto que caiga en tu propia carta jugada.
  for (const m of votantes) {
    const miCarta = ronda.cartasJugadas[m];
    const miSlot = ronda.orden.indexOf(miCarta);
    const votosRecibidos = votantes.filter((v) => v !== m && ronda.votos[v] === miSlot).length;
    puntosGanados[m] += votosRecibidos;
  }

  for (const m of mesas) {
    state.puntuacion[m] = (state.puntuacion[m] ?? 0) + puntosGanados[m];
  }
  const resultado: ResultadoRonda = { pistero, cartaPistero, slotPistero, acertaron, fallaron, puntosGanados };
  ronda.resultado = resultado;
  save(state);

  return resultado;
}

export function siguienteRonda() {
  const state = getState();
  if (!state || !state.ronda) return;
  for (const mesa of state.mesas) {
    const jugada = state.ronda.cartasJugadas[mesa];
    state.manos[mesa] = state.manos[mesa].filter((id) => id !== jugada);
    const nueva = state.mazoRestante.pop();
    if (nueva) state.manos[mesa].push(nueva);
  }
  state.pisteroIndex = (state.pisteroIndex + 1) % state.mesas.length;
  state.ronda = null;
  save(state);
}

export function resetGame() {
  localStorage.removeItem(GAME_KEY);
  window.dispatchEvent(new Event("dixit_state_changed"));
}

export function buildManoUrl(mesa: string, cartas: string[]): string {
  const base = import.meta.env.BASE_URL;
  const params = new URLSearchParams({ mesa, cartas: cartas.join(",") });
  return `${base}#/mano?${params.toString()}`;
}

export function buildCartaUrl(id: string): string {
  const base = import.meta.env.BASE_URL;
  return `${base}#/carta/${id}`;
}
