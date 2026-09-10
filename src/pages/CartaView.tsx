import { useParams } from "react-router-dom";
import { getCarta, cartaImg } from "../lib/utils";

// Una carta a pantalla completa, sin ningún texto que la identifique.
export default function CartaView() {
  const { id } = useParams<{ id: string }>();
  const carta = id ? getCarta(id) : undefined;

  if (!carta) {
    return (
      <div className="h-screen w-screen bg-[#1b1b1b] flex items-center justify-center">
        <p className="text-white/70 text-2xl font-serif">Carta no encontrada.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center overflow-hidden" style={{ height: "100dvh" }}>
      <img src={cartaImg(carta.id)} alt="Carta" className="w-full h-full object-contain select-none" draggable={false} />
    </div>
  );
}
