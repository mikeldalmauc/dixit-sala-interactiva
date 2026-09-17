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

// La mesa y el voto viajan en la URL de cada carta; se codifican para que no
// se lean a simple vista en la barra de direcciones ni en el manager.
export function codificar(texto: string): string {
  const bytes = new TextEncoder().encode(texto);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodificar(token: string): string {
  try {
    const bin = atob(token.replace(/-/g, "+").replace(/_/g, "/"));
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  } catch {
    return "";
  }
}
