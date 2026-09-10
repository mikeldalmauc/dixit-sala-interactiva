import { HashRouter, Routes, Route } from "react-router-dom";
import PanelProfesor from "./pages/PanelProfesor";
import ManoView from "./pages/ManoView";
import CartaView from "./pages/CartaView";
import TableroView from "./pages/TableroView";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<PanelProfesor />} />
        <Route path="/mano" element={<ManoView />} />
        <Route path="/carta/:id" element={<CartaView />} />
        <Route path="/tablero" element={<TableroView />} />
      </Routes>
    </HashRouter>
  );
}
