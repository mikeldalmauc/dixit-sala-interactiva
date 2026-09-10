export interface LugarCard {
  id: string;
  nombre: string;
  comarca: string;
  imgUrl: string;
}

// Mazo de prueba (12 lugares) para validar el ciclo completo de una ronda.
// Las ilustraciones son placeholders abstractos: antes de jugar de verdad hay
// que sustituir imgUrl por ilustraciones ambiguas generadas para cada lugar.
export const LUGARES: LugarCard[] = [
  { id: "l1a2b3c4", nombre: "Playa de La Concha", comarca: "Gipuzkoa", imgUrl: "/lugar-costa.jpg" },
  { id: "l2b3c4d5", nombre: "Gorbeia", comarca: "Araba/Bizkaia", imgUrl: "/lugar-monte.jpg" },
  { id: "l3c4d5e6", nombre: "Bosque de Oma", comarca: "Bizkaia", imgUrl: "/lugar-bosque.jpg" },
  { id: "l4d5e6f7", nombre: "Ría de Bilbao", comarca: "Bizkaia", imgUrl: "/lugar-rio.jpg" },
  { id: "l5e6f7g8", nombre: "Casco Viejo de Vitoria-Gasteiz", comarca: "Araba", imgUrl: "/lugar-casco.jpg" },
  { id: "l6f7g8h9", nombre: "Puente Colgante de Bizkaia", comarca: "Bizkaia", imgUrl: "/lugar-puente.jpg" },
  { id: "l7g8h9i1", nombre: "Cuevas de Santimamiñe", comarca: "Bizkaia", imgUrl: "/lugar-cueva.jpg" },
  { id: "l8h9i1j2", nombre: "Puerto de Getaria", comarca: "Gipuzkoa", imgUrl: "/lugar-puerto.jpg" },
  { id: "l9i1j2k3", nombre: "Pradera de Gorbeialde", comarca: "Araba", imgUrl: "/lugar-pradera.jpg" },
  { id: "l1j2k3l4", nombre: "Acantilados de Zumaia (Flysch)", comarca: "Gipuzkoa", imgUrl: "/lugar-acantilado.jpg" },
  { id: "l2k3l4m5", nombre: "Ermita de San Juan de Gaztelugatxe", comarca: "Bizkaia", imgUrl: "/lugar-ermita.jpg" },
  { id: "l3l4m5n6", nombre: "Faro de Higer", comarca: "Gipuzkoa", imgUrl: "/lugar-faro.jpg" },
  { id: "m1n2o3p4", nombre: "Valle de Aramaio", comarca: "Araba", imgUrl: "/lugar-valle.jpg" },
  { id: "m2o3p4q5", nombre: "Dunas de Zarautz", comarca: "Gipuzkoa", imgUrl: "/lugar-dunas.jpg" },
  { id: "m3p4q5r6", nombre: "Laguna de Arreo", comarca: "Araba", imgUrl: "/lugar-lago.jpg" },
  { id: "m4q5r6s7", nombre: "Volcán de Jorrios", comarca: "Bizkaia", imgUrl: "/lugar-volcan.svg" },
  { id: "m5r6s7t8", nombre: "Salinas de Añana", comarca: "Araba", imgUrl: "/lugar-salinas.jpg" },
  { id: "m6s7t8u9", nombre: "Mirador del Ekainberri", comarca: "Gipuzkoa", imgUrl: "/lugar-mirador.jpg" },
  { id: "m7t8u9v1", nombre: "Viñedos de Rioja Alavesa", comarca: "Araba", imgUrl: "/lugar-vinedo.jpg" },
  { id: "m8u9v1w2", nombre: "Humedal de Salburua", comarca: "Araba", imgUrl: "/lugar-humedal.jpg" },
  { id: "m9v1w2x3", nombre: "Islote de Aketze", comarca: "Bizkaia", imgUrl: "/lugar-islote.jpg" },
  { id: "n1w2x3y4", nombre: "Torreón de Loizaga", comarca: "Bizkaia", imgUrl: "/lugar-torreon.jpg" },
  { id: "n2x3y4z5", nombre: "Molino de Mendraka", comarca: "Bizkaia", imgUrl: "/lugar-molino.svg" },
  { id: "n3y4z5a6", nombre: "Ermita de la Antigua", comarca: "Gipuzkoa", imgUrl: "/lugar-ermita2.jpg" },
  { id: "n4z5a6b7", nombre: "Desfiladero de Delika", comarca: "Araba", imgUrl: "/lugar-desfiladero.jpg" },
  { id: "n5a6b7c8", nombre: "Surco de Urkiola", comarca: "Bizkaia", imgUrl: "/lugar-surco.jpg" },
  { id: "n6b7c8d9", nombre: "Caserío de Igartubeiti", comarca: "Gipuzkoa", imgUrl: "/lugar-caserio.jpg" },
  { id: "n7c8d9e1", nombre: "Ferrería de Mirandaola", comarca: "Gipuzkoa", imgUrl: "/lugar-ferreria.jpg" },
  { id: "n8d9e1f2", nombre: "Estuario del Bidasoa", comarca: "Gipuzkoa", imgUrl: "/lugar-estuario.jpg" },
  { id: "n9e1f2g3", nombre: "Cantera de Meagas", comarca: "Gipuzkoa", imgUrl: "/lugar-cantera.svg" },
  { id: "o1f2g3h4", nombre: "Murallas de Hondarribia", comarca: "Gipuzkoa", imgUrl: "/lugar-muralla.jpg" },
];
