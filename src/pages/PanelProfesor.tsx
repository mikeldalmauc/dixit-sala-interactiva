import { useEffect, useState, type ReactNode } from "react";
import { CARTAS } from "../lib/cartas";
import { cartaImg, cn, copiarTexto, getCarta, LETRAS } from "../lib/utils";
import {
  GameState,
  getState,
  iniciarPartida,
  getPistero,
  setPista,
  toggleCartaJugada,
  cartasAJugar,
  cartasEnMesa,
  todasLasMesasJugaron,
  montarMesa,
  slotsPropios,
  registrarVoto,
  votantes,
  todosVotaron,
  calcularPuntuacion,
  siguienteRonda,
  ranking,
  resetGame,
  buildManoUrl,
  buildTableroUrl,
} from "../lib/gameEngine";

const NOMBRES_POR_DEFECTO = ["Mesa 1", "Mesa 2", "Mesa 3", "Mesa 4"];

function limpiarNombre(nombre: string) {
  return nombre.replace(/[,:]/g, " ").trim();
}

function EnlaceEnviar({ url, abrirLabel = "Abrir" }: { url: string; abrirLabel?: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <span className="inline-flex gap-2">
      <button
        onClick={() => window.open(url, "_blank")}
        className="text-xs px-3 py-1.5 bg-[#283618] text-white rounded-full font-bold hover:bg-[#1c2611]"
      >
        {abrirLabel}
      </button>
      <button
        onClick={async () => {
          setCopiado(await copiarTexto(url));
          setTimeout(() => setCopiado(false), 1500);
        }}
        className="text-xs px-3 py-1.5 bg-[#F7F3EF] border border-[#D1CABF] rounded-full font-bold hover:bg-[#EBE7E0]"
      >
        {copiado ? "Copiado ✓" : "Copiar enlace"}
      </button>
    </span>
  );
}

function Paso({ n, titulo, children }: { n: string; titulo: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xs uppercase tracking-widest text-[#5A5A40] font-bold mb-3">
        <span className="inline-flex w-6 h-6 rounded-full bg-[#BC6C25] text-white items-center justify-center mr-2">{n}</span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Configuracion() {
  const [numMesas, setNumMesas] = useState(4);
  const [nombres, setNombres] = useState(NOMBRES_POR_DEFECTO);
  const mazoCorto = CARTAS.length < numMesas * 7;

  const iniciar = () => {
    const mesas = nombres.slice(0, numMesas).map((n, i) => limpiarNombre(n) || NOMBRES_POR_DEFECTO[i]);
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
        <p className="text-sm text-[#5A5A40] mb-6">Panel del profesor. Cada mesa es un equipo con su propia pared táctil.</p>

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

function FinDePartida({ state }: { state: GameState }) {
  const orden = ranking(state);
  return (
    <section className="mb-8 bg-[#283618] text-[#F7F3EF] rounded-3xl p-8">
      <h2 className="text-xs uppercase tracking-widest font-bold mb-1 text-[#E9B872]">Fin de la partida</h2>
      <p className="text-3xl font-serif font-bold mb-6">
        Gana <span className="text-[#E9B872]">{orden[0]}</span>
      </p>
      <ol className="flex flex-col gap-2 mb-6">
        {orden.map((mesa, i) => (
          <li key={mesa} className="flex justify-between bg-white/10 rounded-xl px-5 py-3">
            <span className="font-bold">
              {i + 1}. {mesa}
            </span>
            <span className="text-[#E9B872] font-black text-xl">{state.puntuacion[mesa]}</span>
          </li>
        ))}
      </ol>
      <button
        onClick={() => confirm("¿Empezar una partida nueva? Se borra el marcador.") && resetGame()}
        className="px-6 py-3 bg-[#BC6C25] hover:bg-[#A3591F] text-white rounded-full font-bold uppercase tracking-widest"
      >
        Nueva partida
      </button>
    </section>
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
  const ronda = state.ronda;
  const mesaMontada = Boolean(ronda?.orden);
  const revelado = Boolean(ronda?.resultado);
  const tableroUrl = buildTableroUrl(state);
  const nCartasMesa = cartasEnMesa(state);

  return (
    <div className="min-h-screen bg-[#F7F3EF] p-6 sm:p-10" style={{ minHeight: "100dvh" }}>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#283618]">Dixit · Sala interactiva</h1>
          <p className="text-sm text-[#5A5A40]">
            Ronda {state.numRonda}
            {state.ultimaRonda && !state.finalizada && <b className="text-[#BC6C25]"> (última: el mazo se ha agotado)</b>} · Mazo:{" "}
            {state.mazoRestante.length} cartas · Pistero: <b>{pistero}</b>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {state.mesas.map((mesa) => (
            <div key={mesa} className="bg-white rounded-xl border border-[#D1CABF] px-4 py-2 text-sm">
              <span className="font-bold text-[#283618]">{mesa}</span>{" "}
              <span className="text-[#BC6C25] font-black">{state.puntuacion[mesa] ?? 0}</span>
            </div>
          ))}
          <button
            onClick={() => confirm("¿Reiniciar la partida entera?") && resetGame()}
            className="px-4 py-2 bg-white border border-[#D1CABF] text-[#5A5A40] rounded-full text-sm font-bold"
          >
            Reiniciar
          </button>
        </div>
      </div>

      {state.finalizada && <FinDePartida state={state} />}

      {/* 1. Manos: enviar a cada pared y marcar la carta jugada */}
      <Paso n="1" titulo={mesaMontada ? "Manos de las mesas" : "Envía cada mano a su pared y marca la carta que juega cada mesa"}>
        {!mesaMontada && (
          <p className="text-sm text-[#5A5A40] mb-4">
            El pistero elige una carta y dice la pista en voz alta. El resto elige en secreto. Cada mesa ve en su pared
            la letra de su carta: pulsa esa miniatura aquí para jugarla.
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {state.mesas.map((mesa) => {
            const jugadas = ronda?.cartasJugadas[mesa] ?? [];
            const necesarias = cartasAJugar(state, mesa);
            const esPistero = mesa === pistero;
            return (
              <div
                key={mesa}
                className={cn("bg-white rounded-2xl border p-4", esPistero ? "border-[#BC6C25]" : "border-[#D1CABF]")}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-[#283618]">
                    {mesa} {esPistero && <span className="text-[#BC6C25]">· pistero</span>}
                  </span>
                  <EnlaceEnviar url={buildManoUrl(state, mesa)} abrirLabel="Abrir mano" />
                </div>
                <p className="text-xs text-[#5A5A40] mb-3">
                  {mesaMontada
                    ? `Jugó: ${jugadas.map((id) => LETRAS[state.manos[mesa].indexOf(id)]).join(" y ")}`
                    : `Juega ${necesarias} carta${necesarias > 1 ? "s" : ""} · ${jugadas.length}/${necesarias}`}
                </p>
                <div className="grid grid-cols-6 gap-1.5">
                  {state.manos[mesa].map((id, i) => {
                    const jugada = jugadas.includes(id);
                    return (
                      <button
                        key={id}
                        disabled={mesaMontada}
                        onClick={() => toggleCartaJugada(mesa, id)}
                        title={getCarta(id)?.titulo}
                        className={cn(
                          "relative aspect-[3/4] rounded-md overflow-hidden border-2 transition-all",
                          jugada ? "border-[#BC6C25] ring-2 ring-[#BC6C25]/40" : "border-transparent",
                          !mesaMontada && "hover:border-[#BC6C25]",
                          mesaMontada && !jugada && "opacity-40",
                        )}
                      >
                        <img src={cartaImg(id)} className="w-full h-full object-cover" alt="" />
                        <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-black/60 text-white text-[10px] font-black flex items-center justify-center">
                          {LETRAS[i]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Paso>

      {/* 2. Pista y montar la mesa */}
      {!mesaMontada && !state.finalizada && (
        <Paso n="2" titulo="Pista y mesa">
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={ronda?.pista ?? ""}
              onChange={(e) => setPista(e.target.value)}
              placeholder="Pista del pistero (opcional, se verá en la pantalla central)"
              className="flex-1 min-w-64 border border-[#D1CABF] rounded-lg px-3 py-2 bg-white"
              maxLength={80}
            />
            <button
              disabled={!todasLasMesasJugaron(state)}
              onClick={() => montarMesa()}
              className="px-6 py-3 bg-[#BC6C25] hover:bg-[#A3591F] disabled:bg-[#D1CABF] disabled:cursor-not-allowed text-white rounded-full font-bold uppercase tracking-widest"
            >
              Mezclar y montar la mesa
            </button>
          </div>
        </Paso>
      )}

      {/* 3. Tablero en la pantalla central y votación */}
      {mesaMontada && !revelado && tableroUrl && (
        <Paso n="3" titulo="Envía la mesa a la pantalla central y recoge los votos">
          <div className="bg-white rounded-2xl border border-[#D1CABF] p-4 mb-4 flex flex-wrap items-center gap-3">
            <span className="text-sm text-[#283618]">
              Las {nCartasMesa} cartas mezcladas{ronda?.pista && <> con la pista «{ronda.pista}»</>}:
            </span>
            <EnlaceEnviar url={tableroUrl} abrirLabel="Abrir tablero" />
          </div>
          <p className="text-sm text-[#5A5A40] mb-4">
            Cada mesa vota en secreto en su pared. Cuando todas hayan votado, pídeles que muestren el voto y anótalo
            aquí. Los números tachados son la propia carta de esa mesa (no puede votarse).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
            {votantes(state).map((mesa) => {
              const propios = slotsPropios(state, mesa);
              return (
                <div key={mesa} className="bg-white rounded-2xl border border-[#D1CABF] p-4">
                  <p className="font-bold text-[#283618] mb-3">{mesa}</p>
                  <div className="flex flex-wrap gap-2">
                    {ronda!.orden!.map((_, i) => {
                      const propio = propios.includes(i);
                      const votado = ronda!.votos[mesa] === i;
                      return (
                        <button
                          key={i}
                          disabled={propio}
                          onClick={() => registrarVoto(mesa, i)}
                          className={cn(
                            "w-11 h-11 rounded-xl font-black border-2",
                            votado
                              ? "bg-[#283618] text-white border-[#283618]"
                              : propio
                                ? "bg-[#F7F3EF] text-[#B5AE9E] border-[#EBE7E0] line-through cursor-not-allowed"
                                : "bg-white text-[#283618] border-[#D1CABF] hover:border-[#BC6C25]",
                          )}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <button
            disabled={!todosVotaron(state)}
            onClick={() => calcularPuntuacion()}
            className="px-6 py-3 bg-[#BC6C25] hover:bg-[#A3591F] disabled:bg-[#D1CABF] disabled:cursor-not-allowed text-white rounded-full font-bold uppercase tracking-widest"
          >
            Revelar y puntuar
          </button>
        </Paso>
      )}

      {/* 4. Resultado */}
      {revelado && ronda?.resultado && tableroUrl && (
        <Paso n="4" titulo="Resultado de la ronda">
          <div className="bg-white rounded-2xl border border-[#D1CABF] p-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-sm text-[#283618]">Revelado con votos y puntos para la pantalla central:</span>
              <EnlaceEnviar url={tableroUrl} abrirLabel="Abrir revelado" />
            </div>
            <p className="mb-1">
              La carta del pistero ({pistero}) era la <b>número {ronda.resultado.slotPistero + 1}</b>
              <span className="text-[#5A5A40]"> · «{getCarta(ronda.resultado.cartaPistero)?.titulo}»</span>
            </p>
            <p className="mb-1 text-[#4A5D4E]">Acertaron: {ronda.resultado.acertaron.join(", ") || "nadie"}</p>
            <p className="mb-4 text-[#5A5A40]">Fallaron: {ronda.resultado.fallaron.join(", ") || "nadie"}</p>
            <ul className="mb-5 flex flex-wrap gap-3 text-sm">
              {state.mesas.map((mesa) => (
                <li key={mesa} className="bg-[#F7F3EF] rounded-xl px-4 py-2">
                  {mesa}: <b className="text-[#BC6C25]">+{ronda.resultado!.puntosGanados[mesa]}</b>
                </li>
              ))}
            </ul>
            {!state.finalizada && (
              <button
                onClick={() => siguienteRonda()}
                className="px-6 py-3 bg-[#4A5D4E] hover:bg-[#3a4a3e] text-white rounded-full font-bold uppercase tracking-widest"
              >
                Siguiente ronda: reponer cartas y pasar el turno
              </button>
            )}
          </div>
        </Paso>
      )}
    </div>
  );
}
