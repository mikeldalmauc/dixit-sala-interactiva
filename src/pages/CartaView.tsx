import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getCarta, cartaImg, decodificar } from "../lib/utils";
import BotonOjo from "../components/BotonOjo";

// Una carta a pantalla completa. Se abre siempre sin indicar de qué mesa es;
// el botón del ojo le da la vuelta para mostrar la mesa (y volver a ocultarla).
export default function CartaView() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const mesa = decodificar(params.get("m") ?? "");
  const [revelada, setRevelada] = useState(false);
  const carta = id ? getCarta(id) : undefined;

  if (!carta) {
    return (
      <div className="h-screen w-screen bg-[#1b1b1b] flex items-center justify-center">
        <p className="text-white/70 text-2xl font-serif">Carta no encontrada.</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-black flex items-center justify-center overflow-hidden" style={{ height: "100dvh" }}>
      <img src={cartaImg(carta.id)} alt="Carta" className="w-full h-full object-contain select-none" draggable={false} />
      {mesa && revelada && (
        <div className="absolute top-6 inset-x-0 flex justify-center pointer-events-none">
          <span className="px-8 py-3 rounded-full bg-[#E9B872] text-[#283618] text-4xl font-black shadow-2xl">{mesa}</span>
        </div>
      )}
      {mesa && (
        <BotonOjo
          visible={revelada}
          onClick={() => setRevelada((v) => !v)}
          size={44}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-24 h-24"
        />
      )}
    </div>
  );
}
