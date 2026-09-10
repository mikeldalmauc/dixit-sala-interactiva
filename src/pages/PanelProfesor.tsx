import { useEffect, useState } from "react";
import { LUGARES } from "../lib/lugares";
import {
  GameState,
  getState,
  iniciarPartida,
  getPistero,
  marcarCartaJugada,
  todasLasMesasJugaron,
  montarPared,
  registrarVoto,
  calcularPuntuacion,
  siguienteRonda,
  resetGame,
  buildManoUrl,
} from "../lib/gameEngine";

const NOMBRES_POR_DEFECTO = ["Mesa 1", "Mesa 2", "Mesa 3", "Mesa 4"];

function lugarImg(id: string) {
  const carta = LUGARES.find((l) => l.id === id);
  return carta ? `${import.meta.env.BASE_URL}${carta.imgUrl.replace(/^\//, "")}` : "";
}

export default function PanelProfesor() {
  const [state, setState] = useState<GameState | null>(null);
  const [numMesas, setNumMesas] = useState(4);

  useEffect(() => {
    const load = () => setState(getState());
    load();
    window.addEventListener("dixit_state_changed", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("dixit_state_changed", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const handleIniciar = () => {
    iniciarPartida(NOMBRES_POR_DEFECTO.slice(0, numMesas));
  };

  const handleAbrirMano = (mesa: string) => {
    if (!state) return;
    window.open(buildManoUrl(mesa, state.manos[mesa]), "_blank");
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-[#F7F3EF] flex items-center justify-center p-6" style={{ minHeight: "100dvh" }}>
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full border border-[#E5E0D5]">
          <h1 className="text-2xl font-serif font-bold text-[#283618] mb-2">Non Dago?</h1>
          <p className="text-sm text-[#5A5A40] mb-6">Dixit de lugares de Euskadi — panel del profesor</p>

          <label className="block text-xs uppercase tracking-widest text-[#5A5A40] font-bold mb-2">
            Número de mesas
          </label>
          <div className="flex gap-2 mb-6">
            {[3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setNumMesas(n)}
                className={`px-5 py-2 rounded-full font-bold ${
                  numMesas === n ? "bg-[#4A5D4E] text-white" : "bg-[#F7F3EF] text-[#5A5A40] border border-[#D1CABF]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            onClick={handleIniciar}
            className="w-full py-3 bg-[#BC6C25] hover:bg-[#A3591F] text-white rounded-full font-bold uppercase tracking-widest transition-colors"
          >
            Iniciar partida
          </button>
        </div>
      </div>
    );
  }

  const pistero = getPistero(state);
  const ronda = state.ronda;
  const todasJugaron = todasLasMesasJugaron(state);
  const paredMontada = Boolean(ronda?.orden);
  const votantes = state.mesas.filter((m) => m !== pistero);
  const todosVotaron = paredMontada && votantes.every((m) => ronda?.votos[m] !== undefined);

  return (
    <div className="min-h-screen bg-[#F7F3EF] p-6 sm:p-10" style={{ minHeight: "100dvh" }}>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#283618]">Non Dago?</h1>
          <p className="text-sm text-[#5A5A40]">
            Mazo restante: {state.mazoRestante.length} · Pistero de esta ronda: <b>{pistero}</b>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => confirm("¿Reiniciar la partida entera?") && resetGame()}
            className="px-4 py-2 bg-white border border-[#D1CABF] text-[#5A5A40] rounded-full text-sm font-bold"
          >
            Reiniciar partida
          </button>
        </div>
      </div>

      {/* Paso 1: cada mesa elige su carta para esta ronda */}
      {!paredMontada && (
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-[#5A5A40] font-bold mb-4">
            1. Cada mesa elige su carta (el pistero ya ha dado la pista en voz alta)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {state.mesas.map((mesa) => {
              const jugada = ronda?.cartasJugadas[mesa];
              return (
                <div key={mesa} className="bg-white rounded-2xl border border-[#D1CABF] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-[#283618]">
                      {mesa} {mesa === pistero && <span className="text-[#BC6C25]">(pistero)</span>}
                    </span>
                    <button
                      onClick={() => handleAbrirMano(mesa)}
                      className="text-xs px-3 py-1 bg-[#F7F3EF] border border-[#D1CABF] rounded-full hover:bg-[#EBE7E0]"
                    >
                      Abrir mano
                    </button>
                  </div>
                  {jugada ? (
                    <div className="flex items-center gap-2 text-sm text-[#4A5D4E] font-bold">
                      <img src={lugarImg(jugada)} className="w-10 h-14 object-cover rounded" alt="" />
                      Carta jugada ✓
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {state.manos[mesa]?.map((id) => (
                        <button
                          key={id}
                          onClick={() => marcarCartaJugada(mesa, id)}
                          className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-transparent hover:border-[#BC6C25]"
                        >
                          <img src={lugarImg(id)} className="w-full h-full object-cover" alt="" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {todasJugaron && (
            <button
              onClick={() => montarPared()}
              className="mt-6 px-6 py-3 bg-[#BC6C25] hover:bg-[#A3591F] text-white rounded-full font-bold uppercase tracking-widest"
            >
              Montar la pared
            </button>
          )}
        </section>
      )}

      {/* Paso 2: votación verbal, el profesor teclea los votos */}
      {paredMontada && !ronda?.resultado && (
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-[#5A5A40] font-bold mb-4">
            2. Votación (a viva voz en la sala) — anota qué número votó cada mesa
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {votantes.map((mesa) => (
              <div key={mesa} className="bg-white rounded-2xl border border-[#D1CABF] p-4">
                <p className="font-bold text-[#283618] mb-2">{mesa}</p>
                <select
                  value={ronda?.votos[mesa] ?? ""}
                  onChange={(e) => registrarVoto(mesa, Number(e.target.value))}
                  className="w-full border border-[#D1CABF] rounded-lg px-3 py-2"
                >
                  <option value="" disabled>
                    Votó por...
                  </option>
                  {ronda?.orden?.map((_, i) => (
                    <option key={i} value={i}>
                      Carta {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <button
            disabled={!todosVotaron}
            onClick={() => calcularPuntuacion()}
            className="px-6 py-3 bg-[#BC6C25] hover:bg-[#A3591F] disabled:bg-[#D1CABF] disabled:cursor-not-allowed text-white rounded-full font-bold uppercase tracking-widest"
          >
            Revelar y puntuar
          </button>
        </section>
      )}

      {/* Paso 3: resultado de la ronda */}
      {ronda?.resultado && (
        <section className="mb-10 bg-white rounded-2xl border border-[#D1CABF] p-6">
          <h2 className="text-xs uppercase tracking-widest text-[#5A5A40] font-bold mb-4">3. Resultado</h2>
          <p className="mb-2">
            Carta del pistero: <b>Carta {ronda.resultado.slotPistero + 1}</b>
          </p>
          <p className="mb-2 text-[#4A5D4E]">Acertaron: {ronda.resultado.acertaron.join(", ") || "nadie"}</p>
          <p className="mb-4 text-[#5A5A40]">Fallaron: {ronda.resultado.fallaron.join(", ") || "nadie"}</p>
          <ul className="mb-4 text-sm">
            {Object.entries(ronda.resultado.puntosGanados).map(([mesa, pts]) => (
              <li key={mesa}>
                {mesa}: +{pts} puntos
              </li>
            ))}
          </ul>
          <button
            onClick={() => siguienteRonda()}
            className="px-6 py-3 bg-[#4A5D4E] hover:bg-[#3a4a3e] text-white rounded-full font-bold uppercase tracking-widest"
          >
            Siguiente ronda
          </button>
        </section>
      )}

      {/* Marcador rápido */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-[#5A5A40] font-bold mb-3">Marcador</h2>
        <div className="flex flex-wrap gap-4">
          {state.mesas.map((mesa) => (
            <div key={mesa} className="bg-white rounded-xl border border-[#D1CABF] px-5 py-3">
              <span className="font-bold text-[#283618]">{mesa}</span>{" "}
              <span className="text-[#BC6C25] font-black">{state.puntuacion[mesa] ?? 0}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
