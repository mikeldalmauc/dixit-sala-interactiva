import { useParams } from "react-router-dom";
import { LUGARES } from "../lib/lugares";

// Vista de una carta suelta a pantalla completa. Deliberadamente no muestra
// nombre ni comarca: es la carta ambigua que se enseña en la sala.
export default function CartaView() {
  const { id } = useParams<{ id: string }>();
  const carta = LUGARES.find((l) => l.id === id);

  if (!carta) {
    return (
      <div className="h-screen w-screen bg-[#1b1b1b] flex items-center justify-center">
        <p className="text-white/70 text-2xl font-serif">Carta no encontrada.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center overflow-hidden" style={{ height: "100dvh" }}>
      <img
        src={`${import.meta.env.BASE_URL}${carta.imgUrl.replace(/^\//, "")}`}
        alt="Lugar"
        className="w-full h-full object-cover select-none"
        draggable={false}
      />
    </div>
  );
}
