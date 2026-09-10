import { useSearchParams } from "react-router-dom";
import { cartaImg, LETRAS } from "../lib/utils";
import { buildCartaUrl } from "../lib/gameEngine";

// Ayuda de reparto para el manager: muestra las cartas de una mesa y cada
// una se abre en su propia pestaña (/carta/:id) para enviarla individualmente
// a la pared de esa mesa. Esta página no se envía a las paredes.
export default function ManoView() {
  const [params] = useSearchParams();
  const mesa = params.get("mesa") ?? "Mesa";
  const cartas = (params.get("cartas") ?? "").split(",").filter(Boolean);

  return (
    <div className="min-h-screen bg-[#F7F3EF] p-5 sm:p-8" style={{ minHeight: "100dvh" }}>
      <header className="mb-6">
        <h1 className="text-3xl font-serif font-bold text-[#283618]">{mesa}</h1>
        <p className="text-sm text-[#5A5A40]">
          Toca cada carta para abrirla en una pestaña nueva y enviarla a la pared de esta mesa.
        </p>
      </header>

      {cartas.length === 0 ? (
        <p className="text-[#B5AE9E] italic">No hay cartas en esta mano.</p>
      ) : (
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
          {cartas.map((id, i) => (
            <button
              key={id}
              onClick={() => window.open(buildCartaUrl(id), "_blank")}
              className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-lg border-4 border-white transition-all hover:border-[#BC6C25] active:scale-95"
            >
              <img src={cartaImg(id)} alt={`Carta ${LETRAS[i]}`} className="w-full h-full object-cover" draggable={false} />
              <span className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/60 text-white font-black flex items-center justify-center">
                {LETRAS[i]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
