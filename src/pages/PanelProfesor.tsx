import { useEffect, useState } from "react";
import { CARTAS } from "../lib/cartas";
import { cartaImg, cn, getCarta, LETRAS } from "../lib/utils";
import {
  GameState,
  getState,
  iniciarPartida,
  getPistero,
  cartasAJugar,
  siguienteRonda,
  sacarCarta,
  marcarRepartida,
  resetGame,
  buildManoUrl,
  buildCartaUrl,
  buildVotosUrl,
} from "../lib/gameEngine";

const NOMBRES_POR_DEFECTO = ["Mesa 1", "Mesa 2", "Mesa 3", "Mesa 4"];

function abrir(url: string) {
  window.open(url, "_blank");
}

function Configuracion() {
  const [numMesas, setNumMesas] = useState(4);
  const [nombres, setNombres] = useState(NOMBRES_POR_DEFECTO);
  const mazoCorto = CARTAS.length < numMesas * 7;

  const iniciar = () => {
    const mesas = nombres.slice(0, numMesas).map((n, i) => n.trim() || NOMBRES_POR_DEFECTO[i]);
    if (new Set(mesas).size !== mesas.length) {
      alert("Los nombres de las mesas tienen que ser distintos.");
      return;
    }
    iniciarPartida(mesas);
  };

  return (
    <div className="min-h-screen bg-[#F7F3EF] flex items-center justify-center p-6" style={{ minHeight: "100dvh" }}>
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full border border-[#E5E0D5]">
        <h1 className="text-2xl font-serif font-bold text-[#283618] mb-1">Dixit · Sala interactiva</h1>
        <p className="text-sm text-[#5A5A40] mb-6">Panel del manager. Cada mesa es un equipo con su propia pared táctil.</p>

        <label className="block text-xs uppercase tracking-widest text-[#5A5A40] font-bold mb-2">Número de mesas</label>
        <div className="flex gap-2 mb-2">
          {[3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setNumMesas(n)}
              className={cn(
                "px-5 py-2 rounded-full font-bold",
                numMesas === n ? "bg-[#4A5D4E] text-white" : "bg-[#F7F3EF] text-[#5A5A40] border border-[#D1CABF]",
              )}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#5A5A40] mb-6">
          {numMesas === 3
            ? "Con 3 mesas se aplica la variante oficial: 7 cartas en mano y cada mesa no pistera juega 2 cartas (5 en la mesa)."
            : "6 cartas en mano, cada mesa juega 1 carta (4 en la mesa)."}
        </p>

        <label className="block text-xs uppercase tracking-widest text-[#5A5A40] font-bold mb-2">Nombres de las mesas</label>
        <div className="flex flex-col gap-2 mb-6">
          {nombres.slice(0, numMesas).map((nombre, i) => (
            <input
              key={i}
              value={nombre}
              onChange={(e) => setNombres((prev) => prev.map((n, j) => (j === i ? e.target.value : n)))}
              className="border border-[#D1CABF] rounded-lg px-3 py-2"
              maxLength={20}
            />
          ))}
        </div>

        {mazoCorto && (
          <p className="text-xs text-[#BC6C25] mb-4">
            El mazo tiene {CARTAS.length} cartas: no da para repartir. Añade cartas en <code>src/lib/cartas.ts</code>.
          </p>
        )}
        <button
          onClick={iniciar}
          disabled={mazoCorto}
          className="w-full py-3 bg-[#BC6C25] hover:bg-[#A3591F] disabled:bg-[#D1CABF] text-white rounded-full font-bold uppercase tracking-widest transition-colors"
        >
          Iniciar partida
        </button>
      </div>
    </div>
  );
}

export default function PanelProfesor() {
  const [state, setState] = useState<GameState | null>(null);

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

  if (!state) return <Configuracion />;

  const pistero = getPistero(state);
  const mazoVacio = state.mazoRestante.length === 0;
  const hayPorRepartir = state.mesas.some((m) => (state.porRepartir[m]?.length ?? 0) > 0);
  const cartasPorRonda = state.mesas.reduce((acc, m) => acc + cartasAJugar(state, m), 0);

  const abrirYRepartir = (mesa: string, id: string) => {
    abrir(buildCartaUrl(id, mesa));
    marcarRepartida(mesa, id);
  };

  const sacarYAbrir = (mesa: string) => {
    const id = sacarCarta(mesa);
    if (id) abrirYRepartir(mesa, id);
  };

  return (
    <div className="min-h-screen bg-[#F7F3EF] p-6 sm:p-10" style={{ minHeight: "100dvh" }}>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#283618]">Dixit · Sala interactiva</h1>
          <p className="text-sm text-[#5A5A40]">
            Ronda {state.numRonda} · Mazo: {state.mazoRestante.length} cartas
            {mazoVacio && <b className="text-[#BC6C25]"> (agotado: última ronda)</b>} · Pistero: <b>{pistero}</b>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => siguienteRonda()}
            disabled={mazoVacio}
            className="px-5 py-2.5 bg-[#4A5D4E] hover:bg-[#3a4a3e] disabled:bg-[#D1CABF] text-white rounded-full text-sm font-bold uppercase tracking-widest"
          >
            Siguiente ronda: sacar {cartasPorRonda} cartas y pasar el pistero
          </button>
          <button
            onClick={() => confirm("¿Reiniciar la partida entera?") && resetGame()}
            className="px-4 py-2 bg-white border border-[#D1CABF] text-[#5A5A40] rounded-full text-sm font-bold"
          >
            Reiniciar
          </button>
        </div>
      </div>

      {hayPorRepartir && (
        <section className="mb-8 bg-[#FFF6EA] border border-[#E9B872] rounded-2xl p-5">
          <h2 className="text-xs uppercase tracking-widest text-[#BC6C25] font-bold mb-3">
            Cartas sacadas del mazo: abre cada una y envíala a la pared de su mesa
          </h2>
          <div className="flex flex-wrap gap-4">
            {state.mesas.flatMap((mesa) =>
              (state.porRepartir[mesa] ?? []).map((id) => (
                <div key={id} className="flex items-center gap-3 bg-white rounded-xl border border-[#D1CABF] p-2 pr-3">
                  <img src={cartaImg(id)} className="w-10 h-14 object-cover rounded" alt="" />
                  <div>
                    <p className="text-sm font-bold text-[#283618]">{mesa}</p>
                    <button
                      onClick={() => abrirYRepartir(mesa, id)}
                      className="text-xs px-3 py-1 bg-[#283618] text-white rounded-full font-bold"
                    >
                      Abrir carta
                    </button>
                  </div>
                </div>
              )),
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xs uppercase tracking-widest text-[#5A5A40] font-bold mb-2">Mesas</h2>
        <p className="text-sm text-[#5A5A40] mb-4">
          «Ver mano» abre la mano de una mesa y «Cartas de voto» sus cartas para votar en secreto; ambas se envían a su
          pared. Pulsar una miniatura abre esa carta en su propia página. Toda carta suelta se abre sin mostrar la mesa
          y se gira con el botón del ojo.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {state.mesas.map((mesa) => {
            const esPistero = mesa === pistero;
            return (
              <div
                key={mesa}
                className={cn("bg-white rounded-2xl border p-4", esPistero ? "border-[#BC6C25]" : "border-[#D1CABF]")}
              >
                <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-[#283618]">
                    {mesa} {esPistero && <span className="text-[#BC6C25]">· pistero</span>}
                  </span>
                  <span className="inline-flex gap-2">
                    <button
                      onClick={() => abrir(buildManoUrl(state, mesa))}
                      className="text-xs px-3 py-1.5 bg-[#F7F3EF] border border-[#D1CABF] rounded-full font-bold hover:bg-[#EBE7E0]"
                    >
                      Ver mano
                    </button>
                    <button
                      onClick={() => abrir(buildVotosUrl(state, mesa))}
                      className="text-xs px-3 py-1.5 bg-[#F7F3EF] border border-[#D1CABF] rounded-full font-bold hover:bg-[#EBE7E0]"
                    >
                      Cartas de voto
                    </button>
                    <button
                      onClick={() => sacarYAbrir(mesa)}
                      disabled={mazoVacio}
                      className="text-xs px-3 py-1.5 bg-[#283618] text-white rounded-full font-bold hover:bg-[#1c2611] disabled:bg-[#D1CABF]"
                    >
                      Sacar carta
                    </button>
                  </span>
                </div>
                <p className="text-xs text-[#5A5A40] mb-3">
                  {state.manos[mesa].length} cartas repartidas · juega {cartasAJugar(state, mesa)} por ronda
                </p>
                <div className="grid grid-cols-6 gap-1.5">
                  {state.manos[mesa].map((id, i) => (
                    <button
                      key={id}
                      onClick={() => abrir(buildCartaUrl(id, mesa))}
                      title={getCarta(id)?.titulo}
                      className="relative aspect-[3/4] rounded-md overflow-hidden border-2 border-transparent hover:border-[#BC6C25] transition-all"
                    >
                      <img src={cartaImg(id)} className="w-full h-full object-cover" alt="" />
                      <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-black/60 text-white text-[10px] font-black flex items-center justify-center">
                        {LETRAS[i] ?? i + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
