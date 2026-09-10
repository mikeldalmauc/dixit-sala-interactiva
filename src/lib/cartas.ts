export interface Carta {
  id: string;      // "c01" … "c48", must match the file name
  titulo: string;  // short evocative Spanish title; only the teacher sees it, never shown on cards
  autor: string;   // "Artist – Work title (year)" for credits
  imgUrl: string;  // "/cartas/c01.jpg" (root-relative, no base prefix)
}

// Mazo de 48 cartas: obras de dominio público (Wikimedia Commons).
// Créditos completos y URLs de origen en public/CREDITS.md.
export const CARTAS: Carta[] = [
  { id: "c01", titulo: "El barco de nubes", autor: "Odilon Redon – Flower Clouds (c. 1903)", imgUrl: "/cartas/c01.jpg" },
  { id: "c02", titulo: "El ojo globo", autor: "Odilon Redon – The Eye, Like a Strange Balloon Moves Towards Infinity (1882)", imgUrl: "/cartas/c02.jpg" },
  { id: "c03", titulo: "Sueño entre flores", autor: "Odilon Redon – Ophelia among the Flowers (1905–1908)", imgUrl: "/cartas/c03.jpg" },
  { id: "c04", titulo: "Tormenta en la selva", autor: "Henri Rousseau – Tiger in a Tropical Storm (Surprised!) (1891)", imgUrl: "/cartas/c04.jpg" },
  { id: "c05", titulo: "Los futbolistas", autor: "Henri Rousseau – The Football Players (1908)", imgUrl: "/cartas/c05.jpg" },
  { id: "c06", titulo: "El león y la gitana", autor: "Henri Rousseau – The Sleeping Gypsy (1897)", imgUrl: "/cartas/c06.jpg" },
  { id: "c07", titulo: "Noche de carnaval", autor: "Henri Rousseau – Carnival Evening (1886)", imgUrl: "/cartas/c07.jpg" },
  { id: "c08", titulo: "La isla silenciosa", autor: "Arnold Böcklin – Isle of the Dead, first version (1880)", imgUrl: "/cartas/c08.jpg" },
  { id: "c09", titulo: "El rostro de frutas", autor: "Giuseppe Arcimboldo – Vertumnus (1591)", imgUrl: "/cartas/c09.jpg" },
  { id: "c10", titulo: "Formas de colores", autor: "Hilma af Klint – The Ten Largest, No. 7, Adulthood (1907)", imgUrl: "/cartas/c10.jpg" },
  { id: "c11", titulo: "Círculos flotantes", autor: "Wassily Kandinsky – Several Circles (1926)", imgUrl: "/cartas/c11.jpg" },
  { id: "c12", titulo: "Magia de peces", autor: "Paul Klee – Fish Magic (1925)", imgUrl: "/cartas/c12.jpg" },
  { id: "c13", titulo: "El gato y el pájaro", autor: "Paul Klee – Cat and Bird (1928)", imgUrl: "/cartas/c13.jpg" },
  { id: "c14", titulo: "El caballo azul", autor: "Franz Marc – Blue Horse I (1911)", imgUrl: "/cartas/c14.jpg" },
  { id: "c15", titulo: "Noche en la costa", autor: "Edvard Munch – Starry Night (1893)", imgUrl: "/cartas/c15.jpg" },
  { id: "c16", titulo: "Vuelo con globos", autor: "Arthur Rackham – Peter Pan in Kensington Gardens (1906)", imgUrl: "/cartas/c16.jpg" },
  { id: "c17", titulo: "El charco de lágrimas", autor: "Arthur Rackham – Alice in Wonderland, The Pool of Tears (1907)", imgUrl: "/cartas/c17.jpg" },
  { id: "c18", titulo: "La princesa y los trols", autor: "John Bauer – The Princess and the Trolls (1913)", imgUrl: "/cartas/c18.jpg" },
  { id: "c19", titulo: "La bruja del mortero", autor: "Ivan Bilibin – Baba Yaga, from Vasilisa the Beautiful (1900)", imgUrl: "/cartas/c19.jpg" },
  { id: "c20", titulo: "Contra los molinos", autor: "Gustave Doré – Don Quixote and the windmills (1863)", imgUrl: "/cartas/c20.jpg" },
  { id: "c21", titulo: "La rosa de luz", autor: "Gustave Doré – Paradiso, Canto XXXI, the Celestial Rose (1868)", imgUrl: "/cartas/c21.jpg" },
  { id: "c22", titulo: "El esqueleto gigante", autor: "Utagawa Kuniyoshi – Takiyasha the Witch and the Skeleton Spectre (c. 1844)", imgUrl: "/cartas/c22.jpg" },
  { id: "c23", titulo: "Fuegos de zorro", autor: "Utagawa Hiroshige – New Year's Eve Foxfires at the Changing Tree, Ōji (1857)", imgUrl: "/cartas/c23.jpg" },
  { id: "c24", titulo: "Aguacero en el puente", autor: "Utagawa Hiroshige – Sudden Shower over Shin-Ōhashi Bridge and Atake (1857)", imgUrl: "/cartas/c24.jpg" },
  { id: "c25", titulo: "La gran ola", autor: "Katsushika Hokusai – Under the Wave off Kanagawa, The Great Wave (c. 1830–32)", imgUrl: "/cartas/c25.jpg" },
  { id: "c26", titulo: "Sobre el mar de niebla", autor: "Caspar David Friedrich – Wanderer above the Sea of Fog (c. 1817)", imgUrl: "/cartas/c26.jpg" },
  { id: "c27", titulo: "En busca del olvido", autor: "John Martin – Sadak in Search of the Waters of Oblivion (1812)", imgUrl: "/cartas/c27.jpg" },
  { id: "c28", titulo: "Polvo en la luz", autor: "Vilhelm Hammershøi – Dust Motes Dancing in the Sunbeams (1900)", imgUrl: "/cartas/c28.jpg" },
  { id: "c29", titulo: "Puentes imposibles", autor: "Giovanni Battista Piranesi – Carceri d'invenzione, plate VII, The Drawbridge (c. 1761)", imgUrl: "/cartas/c29.jpg" },
  { id: "c30", titulo: "La sonrisa en el árbol", autor: "John Tenniel – Alice and the Cheshire Cat, The Nursery Alice (1890)", imgUrl: "/cartas/c30.jpg" },
  { id: "c31", titulo: "El borde del cielo", autor: "Anonymous – Flammarion engraving, from L'atmosphère: météorologie populaire (1888)", imgUrl: "/cartas/c31.jpg" },
  { id: "c32", titulo: "Cohete en el ojo", autor: "Georges Méliès – Le Voyage dans la Lune, drawing (1902)", imgUrl: "/cartas/c32.jpg" },
  { id: "c33", titulo: "Ojos en el estanque", autor: "Theodor Kittelsen – Nøkken, The Water Sprite (1887–1892)", imgUrl: "/cartas/c33.jpg" },
  { id: "c34", titulo: "El palacio lejano", autor: "Theodor Kittelsen – Far, far away Soria Moria Palace shimmered like Gold (1900)", imgUrl: "/cartas/c34.jpg" },
  { id: "c35", titulo: "El trol pensativo", autor: "Theodor Kittelsen – The Troll Wondering How Old It Is (1911)", imgUrl: "/cartas/c35.jpg" },
  { id: "c36", titulo: "El ángel herido", autor: "Hugo Simberg – The Wounded Angel (1903)", imgUrl: "/cartas/c36.jpg" },
  { id: "c37", titulo: "El jardín de los huesos", autor: "Hugo Simberg – The Garden of Death (1896)", imgUrl: "/cartas/c37.jpg" },
  { id: "c38", titulo: "Los reyes del bosque", autor: "Mikalojus Konstantinas Čiurlionis – Fairy Tale of the Kings (1909)", imgUrl: "/cartas/c38.jpg" },
  { id: "c39", titulo: "Medusas de colores", autor: "Ernst Haeckel – Discomedusae, Kunstformen der Natur, plate 8 (1904)", imgUrl: "/cartas/c39.jpg" },
  { id: "c40", titulo: "Barcos de ultramar", autor: "Nicholas Roerich – Guests from Overseas (1901)", imgUrl: "/cartas/c40.jpg" },
  { id: "c41", titulo: "Vértigo", autor: "Léon Spilliaert – Vertigo, Magic Staircase (1908)", imgUrl: "/cartas/c41.jpg" },
  { id: "c42", titulo: "El compás del cielo", autor: "William Blake – Europe a Prophecy, frontispiece, The Ancient of Days (1794)", imgUrl: "/cartas/c42.jpg" },
  { id: "c43", titulo: "La torre infinita", autor: "Pieter Bruegel the Elder – The Tower of Babel (1563)", imgUrl: "/cartas/c43.jpg" },
  { id: "c44", titulo: "Castillo en el aire", autor: "Thomas Cole – The Voyage of Life: Youth (1842)", imgUrl: "/cartas/c44.jpg" },
  { id: "c45", titulo: "Tormenta de nieve", autor: "J. M. W. Turner – Snow Storm: Steam-Boat off a Harbour's Mouth (1842)", imgUrl: "/cartas/c45.jpg" },
  { id: "c46", titulo: "El reino en paz", autor: "Edward Hicks – Peaceable Kingdom (c. 1834)", imgUrl: "/cartas/c46.jpg" },
  { id: "c47", titulo: "El castillo de cristal", autor: "Virginia Frances Sterrett – Old French Fairy Tales, illustration (1920)", imgUrl: "/cartas/c47.jpg" },
  { id: "c48", titulo: "Estrellas sobre el río", autor: "Vincent van Gogh – Starry Night over the Rhône (1888)", imgUrl: "/cartas/c48.jpg" },
];
