import { CARTAS } from "./cartas";
import { codificar } from "./utils";

const GAME_KEY = "dixit_sala_game";

export interface GameState {
  mesas: string[];
  mazoRestante: string[];
  manos: Record<string, string[]>; // mesa -> cartas que se le han repartido
  pisteroIndex: number;
  numRonda: number;
  porRepartir: Record<string, string[]>; // mesa -> cartas sacadas del mazo pendientes de enviar a su pared
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
    const state = JSON.parse(stored) as GameState;
    if (!Array.isArray(state.mesas) || !state.manos) return null;
    state.porRepartir ??= {};
    return state;
  } catch {
    return null;
  }
}

// Reglas de Dixit: 6 cartas por jugador; con 3 jugadores, 7 cartas y cada
// no-pistero juega 2 para que haya 5 cartas sobre la mesa.
export function tamanoMano(numMesas: number): number {
  return numMesas === 3 ? 7 : 6;
}

export function cartasAJugar(state: GameState, mesa: string): number {
  if (mesa === getPistero(state)) return 1;
  return state.mesas.length === 3 ? 2 : 1;
}

export function getPistero(state: GameState): string {
  return state.mesas[state.pisteroIndex % state.mesas.length];
}

export function iniciarPartida(mesas: string[]): GameState {
  const mazo = shuffle(CARTAS.map((c) => c.id));
  const manos: Record<string, string[]> = {};
  for (const mesa of mesas) {
    manos[mesa] = mazo.splice(0, tamanoMano(mesas.length));
  }
  const state: GameState = { mesas, mazoRestante: mazo, manos, pisteroIndex: 0, numRonda: 1, porRepartir: {} };
  save(state);
  return state;
}

function robar(state: GameState, mesa: string): string | null {
  const id = state.mazoRestante.pop();
  if (!id) return null;
  state.manos[mesa] = [...(state.manos[mesa] ?? []), id];
  state.porRepartir[mesa] = [...(state.porRepartir[mesa] ?? []), id];
  return id;
}

// Saca la siguiente carta del mazo para una mesa; queda pendiente de enviar
// a su pared. Devuelve el id o null si el mazo está vacío.
export function sacarCarta(mesa: string): string | null {
  const state = getState();
  if (!state) return null;
  const id = robar(state, mesa);
  if (id) save(state);
  return id;
}

export function marcarRepartida(mesa: string, id: string) {
  const state = getState();
  if (!state) return;
  state.porRepartir[mesa] = (state.porRepartir[mesa] ?? []).filter((c) => c !== id);
  save(state);
}

// Fin de ronda: el manager saca del mazo tantas cartas como usó cada mesa
// y las reparte de nuevo; el turno de pistero pasa a la siguiente mesa.
export function siguienteRonda() {
  const state = getState();
  if (!state) return;
  for (const mesa of state.mesas) {
    for (let i = 0; i < cartasAJugar(state, mesa); i++) robar(state, mesa);
  }
  state.pisteroIndex = (state.pisteroIndex + 1) % state.mesas.length;
  state.numRonda += 1;
  save(state);
}

export function resetGame() {
  localStorage.removeItem(GAME_KEY);
  window.dispatchEvent(new Event("dixit_state_changed"));
}

// --- URLs autosuficientes para abrir en cualquier pantalla de la sala ---

function url(path: string, params: Record<string, string>): string {
  const q = new URLSearchParams(params).toString();
  return `${window.location.origin}${import.meta.env.BASE_URL}#${path}${q ? `?${q}` : ""}`;
}

export function buildManoUrl(state: GameState, mesa: string): string {
  return url("/mano", { mesa, cartas: state.manos[mesa].join(",") });
}

// Con mesa, la carta puede darse la vuelta para mostrar de qué mesa es.
export function buildCartaUrl(id: string, mesa?: string): string {
  return url(`/carta/${id}`, mesa ? { m: codificar(mesa) } : {});
}

export function cartasEnMesa(state: GameState): number {
  return state.mesas.reduce((acc, m) => acc + cartasAJugar(state, m), 0);
}

// Mano de cartas de voto de una mesa: una por cada carta que habrá en la mesa.
export function buildVotosUrl(state: GameState, mesa: string): string {
  return url("/votos", { mesa, n: String(cartasEnMesa(state)) });
}

export function buildVotoUrl(mesa: string, voto: number): string {
  return url(`/voto/${codificar(`${voto}|${mesa}`)}`, {});
}
