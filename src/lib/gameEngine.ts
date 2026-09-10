import { CARTAS } from "./cartas";

const GAME_KEY = "dixit_sala_game";
const PUNTOS_PARA_GANAR = 30;

export interface RondaEnCurso {
  pista: string;
  cartasJugadas: Record<string, string[]>; // mesa -> ids jugados (1, o 2 por mesa no pistera con 3 mesas)
  orden: string[] | null; // ids mezclados, se rellena al montar la mesa
  votos: Record<string, number>; // mesa votante -> índice de la mesa votado
  resultado: ResultadoRonda | null;
}

export interface ResultadoRonda {
  pistero: string;
  cartaPistero: string;
  slotPistero: number;
  acertaron: string[];
  fallaron: string[];
  puntosGanados: Record<string, number>;
}

export interface GameState {
  mesas: string[];
  mazoRestante: string[];
  manos: Record<string, string[]>;
  pisteroIndex: number;
  numRonda: number;
  ronda: RondaEnCurso | null;
  puntuacion: Record<string, number>;
  ultimaRonda: boolean;
  finalizada: boolean;
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

export function cartasEnMesa(state: GameState): number {
  return state.mesas.reduce((acc, m) => acc + cartasAJugar(state, m), 0);
}

export function getPistero(state: GameState): string {
  return state.mesas[state.pisteroIndex % state.mesas.length];
}

export function iniciarPartida(mesas: string[]): GameState {
  const mazo = shuffle(CARTAS.map((c) => c.id));
  const manos: Record<string, string[]> = {};
  const puntuacion: Record<string, number> = {};
  for (const mesa of mesas) {
    manos[mesa] = mazo.splice(0, tamanoMano(mesas.length));
    puntuacion[mesa] = 0;
  }
  const state: GameState = {
    mesas,
    mazoRestante: mazo,
    manos,
    pisteroIndex: 0,
    numRonda: 1,
    ronda: null,
    puntuacion,
    ultimaRonda: false,
    finalizada: false,
    porRepartir: {},
  };
  save(state);
  return state;
}

// Saca la siguiente carta del mazo para una mesa: entra en su mano y queda
// pendiente de enviar a su pared. Devuelve el id o null si el mazo está vacío.
export function sacarCarta(mesa: string): string | null {
  const state = getState();
  if (!state || state.mazoRestante.length === 0) return null;
  const id = state.mazoRestante.pop()!;
  state.manos[mesa] = [...(state.manos[mesa] ?? []), id];
  state.porRepartir[mesa] = [...(state.porRepartir[mesa] ?? []), id];
  save(state);
  return id;
}

export function marcarRepartida(mesa: string, id: string) {
  const state = getState();
  if (!state) return;
  state.porRepartir[mesa] = (state.porRepartir[mesa] ?? []).filter((c) => c !== id);
  save(state);
}

function rondaActual(state: GameState): RondaEnCurso {
  return state.ronda ?? { pista: "", cartasJugadas: {}, orden: null, votos: {}, resultado: null };
}

export function setPista(pista: string) {
  const state = getState();
  if (!state) return;
  const ronda = rondaActual(state);
  ronda.pista = pista;
  state.ronda = ronda;
  save(state);
}

export function toggleCartaJugada(mesa: string, cardId: string) {
  const state = getState();
  if (!state || state.ronda?.orden) return;
  const ronda = rondaActual(state);
  const actuales = ronda.cartasJugadas[mesa] ?? [];
  const max = cartasAJugar(state, mesa);
  let nuevas: string[];
  if (actuales.includes(cardId)) {
    nuevas = actuales.filter((id) => id !== cardId);
  } else if (max === 1) {
    nuevas = [cardId];
  } else {
    nuevas = actuales.length >= max ? [...actuales.slice(1), cardId] : [...actuales, cardId];
  }
  ronda.cartasJugadas[mesa] = nuevas;
  state.ronda = ronda;
  save(state);
}

export function todasLasMesasJugaron(state: GameState): boolean {
  if (!state.ronda) return false;
  return state.mesas.every((m) => (state.ronda!.cartasJugadas[m]?.length ?? 0) === cartasAJugar(state, m));
}

export function montarMesa() {
  const state = getState();
  if (!state || !state.ronda || !todasLasMesasJugaron(state)) return;
  state.ronda.orden = shuffle(Object.values(state.ronda.cartasJugadas).flat());
  state.ronda.votos = {};
  save(state);
}

export function slotsPropios(state: GameState, mesa: string): number[] {
  const orden = state.ronda?.orden;
  if (!orden) return [];
  const propias = state.ronda?.cartasJugadas[mesa] ?? [];
  return orden.map((id, i) => (propias.includes(id) ? i : -1)).filter((i) => i >= 0);
}

export function registrarVoto(mesa: string, slotIndex: number) {
  const state = getState();
  if (!state || !state.ronda?.orden || mesa === getPistero(state)) return;
  if (slotsPropios(state, mesa).includes(slotIndex)) return;
  state.ronda.votos[mesa] = slotIndex;
  save(state);
}

export function votantes(state: GameState): string[] {
  const pistero = getPistero(state);
  return state.mesas.filter((m) => m !== pistero);
}

export function todosVotaron(state: GameState): boolean {
  return Boolean(state.ronda?.orden) && votantes(state).every((m) => state.ronda!.votos[m] !== undefined);
}

// Puntuación clásica de Dixit:
// - Todos o nadie aciertan: pistero 0, resto 2.
// - Si no: pistero 3 y cada acertante 3.
// - Cada no-pistero suma 1 por cada voto recibido en sus cartas señuelo.
export function calcularPuntuacion(): ResultadoRonda | null {
  const state = getState();
  if (!state || !state.ronda?.orden || !todosVotaron(state)) return null;
  const { ronda } = state;
  const orden = ronda.orden!;
  const pistero = getPistero(state);
  const cartaPistero = ronda.cartasJugadas[pistero][0];
  const slotPistero = orden.indexOf(cartaPistero);
  const vot = votantes(state);

  const acertaron = vot.filter((m) => ronda.votos[m] === slotPistero);
  const fallaron = vot.filter((m) => ronda.votos[m] !== slotPistero);

  const puntosGanados: Record<string, number> = {};
  for (const m of state.mesas) puntosGanados[m] = 0;

  if (acertaron.length === vot.length || acertaron.length === 0) {
    for (const m of vot) puntosGanados[m] += 2;
  } else {
    puntosGanados[pistero] += 3;
    for (const m of acertaron) puntosGanados[m] += 3;
  }

  for (const m of vot) {
    const misSlots = slotsPropios(state, m);
    const votosRecibidos = vot.filter((v) => v !== m && misSlots.includes(ronda.votos[v])).length;
    puntosGanados[m] += votosRecibidos;
  }

  for (const m of state.mesas) {
    state.puntuacion[m] = (state.puntuacion[m] ?? 0) + puntosGanados[m];
  }
  const resultado: ResultadoRonda = { pistero, cartaPistero, slotPistero, acertaron, fallaron, puntosGanados };
  ronda.resultado = resultado;

  const alguienGano = Object.values(state.puntuacion).some((p) => p >= PUNTOS_PARA_GANAR);
  if (state.ultimaRonda || alguienGano) state.finalizada = true;

  save(state);
  return resultado;
}

export function siguienteRonda() {
  const state = getState();
  if (!state || !state.ronda?.resultado || state.finalizada) return;
  // El manager saca del mazo tantas cartas como usó cada mesa y las reparte de nuevo.
  for (const mesa of state.mesas) {
    const jugadas = state.ronda.cartasJugadas[mesa] ?? [];
    state.manos[mesa] = state.manos[mesa].filter((id) => !jugadas.includes(id));
    const nuevas: string[] = [];
    while (state.manos[mesa].length < tamanoMano(state.mesas.length) && state.mazoRestante.length > 0) {
      const id = state.mazoRestante.pop()!;
      state.manos[mesa].push(id);
      nuevas.push(id);
    }
    state.porRepartir[mesa] = [...(state.porRepartir[mesa] ?? []), ...nuevas];
  }
  state.pisteroIndex = (state.pisteroIndex + 1) % state.mesas.length;
  state.numRonda += 1;
  state.ronda = null;
  // Dixit termina cuando se agota el mazo: la ronda que no pueda reponerse es la última.
  state.ultimaRonda = state.mazoRestante.length < cartasEnMesa(state);
  save(state);
}

export function ranking(state: GameState): string[] {
  return [...state.mesas].sort((a, b) => (state.puntuacion[b] ?? 0) - (state.puntuacion[a] ?? 0));
}

export function resetGame() {
  localStorage.removeItem(GAME_KEY);
  window.dispatchEvent(new Event("dixit_state_changed"));
}

// --- URLs autosuficientes para enviar a otras pantallas de la sala ---

function url(path: string, params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  }
  const q = qs.toString();
  return `${window.location.origin}${import.meta.env.BASE_URL}#${path}${q ? `?${q}` : ""}`;
}

export function buildManoUrl(state: GameState, mesa: string): string {
  return url("/mano", { mesa, cartas: state.manos[mesa].join(",") });
}

export function buildCartaUrl(id: string): string {
  return url(`/carta/${id}`, {});
}

export function buildTableroUrl(state: GameState): string | null {
  const ronda = state.ronda;
  if (!ronda?.orden) return null;
  const base = { c: ronda.orden.join(","), p: ronda.pista, r: state.numRonda, pistero: getPistero(state) };
  if (!ronda.resultado) return url("/tablero", base);
  const votos = Object.entries(ronda.votos)
    .map(([m, s]) => `${m}:${s}`)
    .join(",");
  const puntos = state.mesas.map((m) => `${m}:${ronda.resultado!.puntosGanados[m]}`).join(",");
  const total = state.mesas.map((m) => `${m}:${state.puntuacion[m]}`).join(",");
  return url("/tablero", { ...base, s: ronda.resultado.slotPistero, v: votos, pts: puntos, total });
}
