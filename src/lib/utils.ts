import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CARTAS, Carta } from "./cartas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCarta(id: string): Carta | undefined {
  return CARTAS.find((c) => c.id === id);
}

export function cartaImg(id: string): string {
  const carta = getCarta(id);
  return carta ? `${import.meta.env.BASE_URL}${carta.imgUrl.replace(/^\//, "")}` : "";
}

export const LETRAS = "ABCDEFGHIJKLMNOP";
