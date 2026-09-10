import { useSearchParams } from "react-router-dom";
import { LUGARES } from "../lib/lugares";

// Pantalla de mano privada de una mesa. Recibe la lista de cartas por query
// string (?mesa=X&cartas=id1,id2,...) para poder abrirse en cualquier
// dispositivo físico de la sala sin depender de localStorage compartido.
export default function ManoView() {
  const [params] = useSearchParams();
  const mesa = params.get("mesa") ?? "Mesa";
  const cartasIds = (params.get("cartas") ?? "").split(",").filter(Boolean);
  const cartas = cartasIds
    .map((id) => LUGARES.find((l) => l.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const handleAbrir = (id: string) => {
    const url = `${import.meta.env.BASE_URL}#/carta/${id}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F7F3EF] p-6 sm:p-10" style={{ minHeight: "100dvh" }}>
      <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#283618] mb-1">{mesa}</h1>
      <p className="text-sm text-[#5A5A40] mb-8 font-sans uppercase tracking-widest">
        Tu mano — toca una carta para abrirla en una pestaña nueva y llevarla a la pared
      </p>

      {cartas.length === 0 ? (
        <p className="text-[#B5AE9E] italic">No hay cartas en esta mano. Pide al profesor un enlace nuevo.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl">
          {cartas.map((carta) => (
            <button
              key={carta.id}
              onClick={() => handleAbrir(carta.id)}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl shadow-lg border-2 border-[#D1CABF] hover:border-[#BC6C25] transition-all hover:scale-[1.02] active:scale-95"
            >
              <img
                src={`${import.meta.env.BASE_URL}${carta.imgUrl.replace(/^\//, "")}`}
                alt="Carta de tu mano"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
