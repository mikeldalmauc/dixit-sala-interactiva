import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { cartaImg, LETRAS } from "../lib/utils";
import { buildCartaUrl } from "../lib/gameEngine";

// Mano inicial de una mesa (?mesa=X&cartas=id1,id2,...). Cada carta se abre
// en su propia pestaña para enviarla. Como aquí todas comparten ventana, la
// mesa puede eliminar de la mano la carta que ya ha usado; se recuerda en
// esta pantalla (por URL de mano).
export default function ManoView() {
  const [params] = useSearchParams();
  const mesa = params.get("mesa") ?? "Mesa";
  const cartas = (params.get("cartas") ?? "").split(",").filter(Boolean);
  const storageKey = `dixit_mano_eliminadas:${params.toString()}`;

  const [eliminadas, setEliminadas] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    } catch {
      return [];
    }
  });
  const [porConfirmar, setPorConfirmar] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(eliminadas));
    } catch {
      /* sin persistencia, no pasa nada */
    }
  }, [storageKey, eliminadas]);

  const enMano = cartas.filter((id) => !eliminadas.includes(id));

  return (
    <div className="min-h-screen bg-[#F7F3EF] p-5 sm:p-8" style={{ minHeight: "100dvh" }}>
      <header className="mb-6">
        <h1 className="text-3xl font-serif font-bold text-[#283618]">{mesa}</h1>
        <p className="text-sm text-[#5A5A40]">
          Tocad una carta para abrirla en una pestaña nueva. Cuando hayáis usado una carta, eliminadla de la mano con la ✕.
        </p>
      </header>

      {enMano.length === 0 ? (
        <p className="text-[#B5AE9E] italic">No quedan cartas en esta mano.</p>
      ) : (
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
          {enMano.map((id) => (
            <div key={id} className="relative">
              <button
                onClick={() => window.open(buildCartaUrl(id, mesa), "_blank")}
                className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl shadow-lg border-4 border-white transition-all hover:border-[#BC6C25] active:scale-95"
              >
                <img src={cartaImg(id)} alt="Carta" className="w-full h-full object-cover" draggable={false} />
                <span className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/60 text-white font-black flex items-center justify-center">
                  {LETRAS[cartas.indexOf(id)]}
                </span>
              </button>
              <button
                onClick={() => setPorConfirmar(id)}
                aria-label="Eliminar carta de la mano"
                className="absolute top-2 right-2 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-[#A33A1F] active:scale-90"
              >
                <X size={22} />
              </button>
              {porConfirmar === id && (
                <div className="absolute inset-0 rounded-2xl bg-black/80 flex flex-col items-center justify-center gap-3 p-3 text-center">
                  <p className="text-white font-bold">¿Eliminar esta carta de la mano?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEliminadas((prev) => [...prev, id]);
                        setPorConfirmar(null);
                      }}
                      className="px-4 py-2 rounded-full bg-[#A33A1F] text-white font-bold"
                    >
                      Eliminar
                    </button>
                    <button onClick={() => setPorConfirmar(null)} className="px-4 py-2 rounded-full bg-white/20 text-white font-bold">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {eliminadas.length > 0 && (
        <button
          onClick={() => setEliminadas((prev) => prev.slice(0, -1))}
          className="mt-8 px-4 py-2 rounded-full bg-white border border-[#D1CABF] text-[#5A5A40] text-sm font-bold"
        >
          Deshacer última eliminación ({eliminadas.length} eliminada{eliminadas.length > 1 ? "s" : ""})
        </button>
      )}
    </div>
  );
}
