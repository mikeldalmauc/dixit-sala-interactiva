import { Eye, EyeOff } from "lucide-react";
import { cn } from "../lib/utils";

export default function BotonOjo({
  visible,
  onClick,
  className,
  size = 40,
}: {
  visible: boolean;
  onClick: () => void;
  className?: string;
  size?: number;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={visible ? "Ocultar" : "Revelar"}
      className={cn(
        "rounded-full flex items-center justify-center shadow-xl border-2 active:scale-90",
        visible ? "bg-[#E9B872] border-[#E9B872] text-[#283618]" : "bg-black/60 border-white/40 text-white backdrop-blur",
        className,
      )}
    >
      {visible ? <EyeOff size={size} /> : <Eye size={size} />}
    </button>
  );
}
