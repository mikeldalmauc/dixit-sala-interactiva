import { useState } from "react";
import { useParams } from "react-router-dom";
import { cn, decodificar } from "../lib/utils";
import BotonOjo from "../components/BotonOjo";

// Carta de voto suelta. Siempre se ve la mesa; el voto se abre oculto y el
// botón del ojo le da la vuelta para revelarlo u ocultarlo en cualquier momento.
export default function VotoView() {
  const { token } = useParams<{ token: string }>();
  const [voto, ...resto] = decodificar(token ?? "").split("|");
  const mesa = resto.join("|");
  const [revelado, setRevelado] = useState(false);

  if (!voto || !mesa) {
    return (
      <div className="h-screen w-screen bg-[#1b1b1b] flex items-center justify-center">
        <p className="text-white/70 text-2xl font-serif">Carta de voto no válida.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#1b1b1b] flex flex-col items-center justify-center gap-6 p-6" style={{ height: "100dvh" }}>
      <div
        className={cn(
          "relative flex-1 min-h-0 aspect-[3/4] max-w-full rounded-3xl border-8 shadow-2xl flex flex-col items-center justify-center",
          revelado ? "bg-[#F7F3EF] border-[#E9B872]" : "bg-[#283618] border-[#4A5D4E]",
        )}
      >
        <span
          className={cn(
            "absolute top-6 px-8 py-3 rounded-full text-4xl sm:text-6xl font-black",
            revelado ? "bg-[#283618] text-white" : "bg-[#E9B872] text-[#283618]",
          )}
        >
          {mesa}
        </span>
        {revelado ? (
          <>
            <span className="text-xs uppercase tracking-widest text-[#5A5A40] font-bold">Vota la carta</span>
            <span className="text-[min(40vh,40vw)] leading-none font-black text-[#283618]">{voto}</span>
          </>
        ) : (
          <span className="text-[min(30vh,30vw)] leading-none font-serif text-[#E9B872]/70">?</span>
        )}
      </div>
      <BotonOjo visible={revelado} onClick={() => setRevelado((v) => !v)} size={72} className="w-36 h-36 shrink-0" />
    </div>
  );
}
