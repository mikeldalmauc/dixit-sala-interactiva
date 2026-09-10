import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { cartaImg, cn, LETRAS } from "../lib/utils";

// Pantalla táctil de una mesa. Todo lo que necesita viaja en la URL
// (?mesa=X&cartas=id1,id2,...&ronda=N&jugar=1|2&n=<cartas en mesa>&rol=pistero)
// para poder enviarse a cualquier pared de la sala sin backend. Lo que la
// mesa decide (carta elegida, voto) se guarda solo en esta pantalla y se
// reinicia con cada URL nueva (cada ronda cambia la mano).

interface EstadoLocal {
  elegidas: string[];
  voto: number | null;
  votoVisible: boolean;
}

const VACIO: EstadoLocal = { elegidas: [], voto: null, votoVisible: false };

function leerLocal(key: string): EstadoLocal {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...VACIO, ...JSON.parse(raw) } : VACIO;
  } catch {
    return VACIO;
  }
}

// Cada URL de mano es una mano distinta (otra ronda): remontar el componente
// garantiza que la elección y el voto anteriores no se arrastren.
export default function ManoView() {
  const [params] = useSearchParams();
  return <Mano key={params.toString()} />;
}

function Mano() {
  const [params] = useSearchParams();
  const mesa = params.get("mesa") ?? "Mesa";
  const cartas = (params.get("cartas") ?? "").split(",").filter(Boolean);
  const ronda = params.get("ronda") ?? "";
  const jugar = Math.max(1, Number(params.get("jugar") ?? 1));
  const enMesa = Number(params.get("n") ?? 0);
  const esPistero = params.get("rol") === "pistero";

  const storageKey = `dixit_mano:${params.toString()}`;
  const [local, setLocal] = useState<EstadoLocal>(() => leerLocal(storageKey));
  const [ampliada, setAmpliada] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(local));
    } catch {
      /* sin persistencia, no pasa nada */
    }
  }, [storageKey, local]);

  const toggleElegida = (id: string) => {
    setLocal((s) => {
      if (s.elegidas.includes(id)) return { ...s, elegidas: s.elegidas.filter((x) => x !== id) };
      if (jugar === 1) return { ...s, elegidas: [id] };
      const base = s.elegidas.length >= jugar ? s.elegidas.slice(1) : s.elegidas;
      return { ...s, elegidas: [...base, id] };
    });
  };

  const letra = (id: string) => LETRAS[cartas.indexOf(id)] ?? "?";
  const eleccionCompleta = local.elegidas.length === jugar;

  return (
    <div className="min-h-screen bg-[#F7F3EF] p-5 sm:p-8" style={{ minHeight: "100dvh" }}>
      <header className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#283618]">{mesa}</h1>
          <p className="text-xs uppercase tracking-widest text-[#5A5A40] font-bold">
            {ronda && `Ronda ${ronda} · `}
            {esPistero ? "Esta ronda sois el pistero" : "Escuchad la pista del pistero"}
          </p>
        </div>
        <p className="text-sm text-[#5A5A40] max-w-md">
          {esPistero
            ? "Elegid una carta en secreto y decid una pista en voz alta: una palabra, una frase, un sonido..."
            : jugar === 2
              ? "Elegid en secreto las 2 cartas de vuestra mano que mejor encajen con la pista."
              : "Elegid en secreto la carta de vuestra mano que mejor encaje con la pista."}
        </p>
      </header>

      {cartas.length === 0 ? (
        <p className="text-[#B5AE9E] italic">No hay cartas en esta mano. Pedid al profesor un enlace nuevo.</p>
      ) : (
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
          {cartas.map((id) => {
            const elegida = local.elegidas.includes(id);
            return (
              <button
                key={id}
                onClick={() => setAmpliada(id)}
                className={cn(
                  "group relative aspect-[3/4] overflow-hidden rounded-2xl shadow-lg border-4 transition-all active:scale-95",
                  elegida ? "border-[#BC6C25] ring-4 ring-[#BC6C25]/30" : "border-white",
                )}
              >
                <img src={cartaImg(id)} alt={`Carta ${letra(id)}`} className="w-full h-full object-cover" draggable={false} />
                <span className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/60 text-white font-black flex items-center justify-center">
                  {letra(id)}
                </span>
                {elegida && (
                  <span className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-[#BC6C25] text-white text-xs font-bold">
                    Elegida
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <section className="mt-8 bg-white rounded-2xl border border-[#D1CABF] p-5">
        <h2 className="text-xs uppercase tracking-widest text-[#5A5A40] font-bold mb-2">Vuestra jugada</h2>
        {eleccionCompleta ? (
          <p className="text-[#283618] text-lg">
            Carta{jugar > 1 ? "s" : ""} elegida{jugar > 1 ? "s" : ""}:{" "}
            <b className="text-[#BC6C25] text-2xl">{local.elegidas.map(letra).join(" y ")}</b>
            <span className="block text-sm text-[#5A5A40] mt-1">Decid la letra al profesor para que la juegue a la mesa.</span>
          </p>
        ) : (
          <p className="text-[#5A5A40]">
            Tocad una carta para verla en grande y elegirla ({local.elegidas.length}/{jugar}).
          </p>
        )}
      </section>

      {!esPistero && enMesa > 0 && (
        <section className="mt-5 bg-white rounded-2xl border border-[#D1CABF] p-5">
          <h2 className="text-xs uppercase tracking-widest text-[#5A5A40] font-bold mb-1">Votación</h2>
          <p className="text-sm text-[#5A5A40] mb-4">
            Cuando las cartas estén en la mesa, votad en secreto cuál es la del pistero. No podéis votar vuestra propia
            carta. Mostrad el voto solo cuando lo pida el profesor.
          </p>
          {local.voto === null ? (
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: enMesa }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setLocal((s) => ({ ...s, voto: i, votoVisible: false }))}
                  className="w-16 h-16 rounded-2xl bg-[#F7F3EF] border-2 border-[#D1CABF] text-2xl font-black text-[#283618] hover:border-[#BC6C25] active:scale-95"
                >
                  {i + 1}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4">
              {local.votoVisible ? (
                <span className="w-24 h-24 rounded-3xl bg-[#283618] text-white text-5xl font-black flex items-center justify-center">
                  {local.voto + 1}
                </span>
              ) : (
                <span className="w-24 h-24 rounded-3xl bg-[#F7F3EF] border-2 border-dashed border-[#D1CABF] text-[#5A5A40] text-sm font-bold flex items-center justify-center text-center">
                  Voto guardado
                </span>
              )}
              <button
                onClick={() => setLocal((s) => ({ ...s, votoVisible: !s.votoVisible }))}
                className="px-5 py-3 rounded-full bg-[#BC6C25] text-white font-bold"
              >
                {local.votoVisible ? "Ocultar voto" : "Mostrar voto"}
              </button>
              <button
                onClick={() => setLocal((s) => ({ ...s, voto: null, votoVisible: false }))}
                className="px-5 py-3 rounded-full bg-white border border-[#D1CABF] text-[#5A5A40] font-bold"
              >
                Cambiar
              </button>
            </div>
          )}
        </section>
      )}

      {ampliada && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col" onClick={() => setAmpliada(null)}>
          <div className="flex-1 min-h-0 flex items-center justify-center p-4">
            <img src={cartaImg(ampliada)} alt="Carta ampliada" className="max-w-full max-h-full object-contain rounded-xl" draggable={false} />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 p-4 pb-6" onClick={(e) => e.stopPropagation()}>
            <span className="text-white/80 font-black text-2xl mr-2">Carta {letra(ampliada)}</span>
            <button
              onClick={() => {
                toggleElegida(ampliada);
                setAmpliada(null);
              }}
              className={cn(
                "px-6 py-3 rounded-full font-bold uppercase tracking-widest",
                local.elegidas.includes(ampliada) ? "bg-white text-[#283618]" : "bg-[#BC6C25] text-white",
              )}
            >
              {local.elegidas.includes(ampliada) ? "Quitar elección" : "Elegir esta carta"}
            </button>
            <button onClick={() => setAmpliada(null)} className="px-6 py-3 rounded-full bg-white/10 text-white font-bold">
              Volver a la mano
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
