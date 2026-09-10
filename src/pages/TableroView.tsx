import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { cartaImg, cn } from "../lib/utils";

// Pantalla central de la sala: las cartas jugadas, mezcladas y numeradas.
// Es una función pura de la URL para poder enviarla a la pantalla grande:
//   votación: /tablero?c=id1,id2,...&p=<pista>&r=<ronda>&pistero=<mesa>
//   revelado: ...&s=<índice carta pistero>&v=Mesa 1:2,Mesa 2:0&pts=Mesa 1:3,...&total=Mesa 1:9,...

function parsePares(raw: string | null): Record<string, number> {
  const out: Record<string, number> = {};
  for (const par of (raw ?? "").split(",").filter(Boolean)) {
    const i = par.lastIndexOf(":");
    if (i > 0) out[par.slice(0, i)] = Number(par.slice(i + 1));
  }
  return out;
}

export default function TableroView() {
  const [params] = useSearchParams();
  const cartas = (params.get("c") ?? "").split(",").filter(Boolean);
  const pista = params.get("p") ?? "";
  const ronda = params.get("r");
  const pistero = params.get("pistero") ?? "";
  const slotPistero = params.has("s") ? Number(params.get("s")) : null;
  const revelado = slotPistero !== null;
  const votos = parsePares(params.get("v"));
  const puntos = parsePares(params.get("pts"));
  const total = parsePares(params.get("total"));
  const [ampliada, setAmpliada] = useState<number | null>(null);

  const votosPorSlot = (i: number) => Object.entries(votos).filter(([, s]) => s === i).map(([m]) => m);

  if (cartas.length === 0) {
    return (
      <div className="h-screen w-screen bg-[#1b1b1b] flex items-center justify-center" style={{ height: "100dvh" }}>
        <p className="text-white/60 text-2xl font-serif">Esperando a que se monte la mesa...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1b1b1b] p-6 sm:p-10 flex flex-col items-center" style={{ minHeight: "100dvh" }}>
      <header className="text-center mb-8">
        <p className="text-white/50 text-sm uppercase tracking-widest font-bold">
          {ronda && `Ronda ${ronda} · `}Pistero: {pistero}
        </p>
        {pista && <h1 className="text-white text-3xl sm:text-5xl font-serif mt-2">«{pista}»</h1>}
        <p className="text-white/70 mt-3 text-lg">
          {revelado ? "La carta del pistero era la número " : "¿Cuál es la carta del pistero?"}
          {revelado && <b className="text-[#E9B872] text-2xl">{slotPistero! + 1}</b>}
        </p>
      </header>

      <div className="flex flex-wrap gap-6 justify-center w-full max-w-7xl">
        {cartas.map((id, i) => {
          const esPistero = revelado && i === slotPistero;
          const quienVoto = revelado ? votosPorSlot(i) : [];
          return (
            <div key={id} className="flex flex-col items-center gap-3 w-[42%] sm:w-52 lg:w-64">
              <button
                onClick={() => setAmpliada(i)}
                className={cn(
                  "relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-4 shadow-2xl transition-transform active:scale-95",
                  esPistero ? "border-[#E9B872] ring-8 ring-[#E9B872]/30" : revelado ? "border-white/10 opacity-80" : "border-white/20",
                )}
              >
                <img src={cartaImg(id)} alt={`Carta ${i + 1}`} className="w-full h-full object-cover" draggable={false} />
                <span className="absolute top-3 left-3 w-12 h-12 rounded-full bg-black/70 text-white text-2xl font-black flex items-center justify-center">
                  {i + 1}
                </span>
                {esPistero && (
                  <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-[#E9B872] text-[#283618] text-sm font-black">
                    ★ Pistero
                  </span>
                )}
              </button>
              {revelado && (
                <div className="flex flex-wrap justify-center gap-1 min-h-7">
                  {quienVoto.map((m) => (
                    <span
                      key={m}
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-bold",
                        esPistero ? "bg-[#E9B872] text-[#283618]" : "bg-white/15 text-white",
                      )}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {revelado && Object.keys(puntos).length > 0 && (
        <footer className="mt-10 w-full max-w-4xl">
          <div className="flex flex-wrap justify-center gap-4">
            {Object.entries(total).map(([m, t]) => (
              <div key={m} className="bg-white/10 rounded-2xl px-6 py-4 text-center min-w-36">
                <p className="text-white font-bold">{m}</p>
                <p className="text-[#E9B872] text-3xl font-black">
                  {t}
                  <span className="text-base text-white/60 font-bold ml-2">+{puntos[m] ?? 0}</span>
                </p>
              </div>
            ))}
          </div>
        </footer>
      )}

      {ampliada !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={() => setAmpliada(null)}>
          <div className="flex-1 min-h-0 flex items-center justify-center p-4">
            <img src={cartaImg(cartas[ampliada])} alt={`Carta ${ampliada + 1}`} className="max-w-full max-h-full object-contain rounded-xl" draggable={false} />
          </div>
          <p className="text-center text-white/80 text-2xl font-black pb-6">
            Carta {ampliada + 1} <span className="text-white/40 text-base font-normal ml-3">toca para volver</span>
          </p>
        </div>
      )}
    </div>
  );
}
