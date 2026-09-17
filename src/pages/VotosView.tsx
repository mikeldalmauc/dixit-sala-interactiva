import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "../lib/utils";
import { buildVotoUrl } from "../lib/gameEngine";
import BotonOjo from "../components/BotonOjo";

// Mano de cartas de voto de una mesa (?mesa=X&n=4). Todas empiezan boca
// abajo; el ojo de cada una la gira para ver qué número es. Al tocar una
// carta se abre suelta en una pestaña nueva (siempre oculta) y, si estaba
// girada, vuelve a ocultarse sola para que la mano no delate el voto.
export default function VotosView() {
  const [params] = useSearchParams();
  const mesa = params.get("mesa") ?? "Mesa";
  const n = Math.max(0, Number(params.get("n") ?? 0));
  const [visibles, setVisibles] = useState<number[]>([]);

  const alternar = (v: number) => setVisibles((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  const abrir = (v: number) => {
    window.open(buildVotoUrl(mesa, v), "_blank");
    setVisibles((prev) => prev.filter((x) => x !== v));
  };

  return (
    <div className="min-h-screen bg-[#1b1b1b] p-5 sm:p-8" style={{ minHeight: "100dvh" }}>
      <header className="mb-6">
        <h1 className="text-3xl font-serif font-bold text-white">{mesa} · cartas de voto</h1>
        <p className="text-sm text-white/60">
          Girad una carta con el ojo para ver su número. Tocad la carta elegida para abrirla en una pestaña nueva
          (saldrá oculta) y enviarla.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 max-w-6xl">
        {Array.from({ length: n }, (_, i) => i + 1).map((v) => {
          const visible = visibles.includes(v);
          return (
            <div key={v} className="relative">
              <button
                onClick={() => abrir(v)}
                className={cn(
                  "relative w-full aspect-[3/4] rounded-2xl border-4 shadow-xl flex flex-col items-center justify-center active:scale-95",
                  visible ? "bg-[#F7F3EF] border-[#E9B872]" : "bg-[#283618] border-[#4A5D4E]",
                )}
              >
                <span
                  className={cn(
                    "absolute top-3 px-3 py-1 rounded-full text-sm font-black",
                    visible ? "bg-[#283618] text-white" : "bg-[#E9B872] text-[#283618]",
                  )}
                >
                  {mesa}
                </span>
                {visible ? (
                  <span className="text-8xl font-black text-[#283618]">{v}</span>
                ) : (
                  <span className="text-7xl font-serif text-[#E9B872]/70">?</span>
                )}
              </button>
              <BotonOjo
                visible={visible}
                onClick={() => alternar(v)}
                size={26}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 w-14 h-14"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
