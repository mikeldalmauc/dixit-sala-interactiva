import { useSearchParams } from "react-router-dom";
import { buildVotoUrl } from "../lib/gameEngine";

// Mano de cartas de voto de una mesa (?mesa=X&n=4). Aquí cada carta muestra
// su número; al tocarla se abre suelta en una pestaña nueva, siempre oculta,
// para enviarla sin que se vea el voto.
export default function VotosView() {
  const [params] = useSearchParams();
  const mesa = params.get("mesa") ?? "Mesa";
  const n = Math.max(0, Number(params.get("n") ?? 0));

  return (
    <div className="min-h-screen bg-[#1b1b1b] p-5 sm:p-8" style={{ minHeight: "100dvh" }}>
      <header className="mb-6">
        <h1 className="text-3xl font-serif font-bold text-white">{mesa} · cartas de voto</h1>
        <p className="text-sm text-white/60">
          Tocad la carta con el número que votáis: se abre en una pestaña nueva, oculta, lista para enviarla.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 max-w-6xl">
        {Array.from({ length: n }, (_, i) => i + 1).map((v) => (
          <button
            key={v}
            onClick={() => window.open(buildVotoUrl(mesa, v), "_blank")}
            className="relative w-full aspect-[3/4] rounded-2xl border-4 shadow-xl flex flex-col items-center justify-center active:scale-95 bg-[#F7F3EF] border-[#E9B872]"
          >
            <span className="absolute top-3 px-5 py-1.5 rounded-full text-2xl font-black bg-[#283618] text-white">{mesa}</span>
            <span className="text-9xl font-black text-[#283618]">{v}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
